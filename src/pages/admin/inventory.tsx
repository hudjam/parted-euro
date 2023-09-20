import { type NextPage } from "next";
import Head from "next/head";
import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { trpc } from "../../utils/trpc";
import AddPart from "../../components/parts/EditInventory";
import type { Column } from "react-table";
import AdminTable from "../../components/tables/AdminTable";
import type { Part } from "@prisma/client";
import ConfirmDelete from "../../components/modals/ConfirmDelete";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import FilterInput from "../../components/tables/FilterInput";
import { Button } from "../../components/ui/button";
import BreadCrumbs from "../../components/BreadCrumbs";
import AddInventory from "../../components/parts/AddInventory";
import EditInventoryModal from "../../components/parts/EditInventory";

const Inventory: NextPage = () => {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      window.location.href = "/";
    },
  });
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selected, setSelected] = useState<Part | undefined>();
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>("");
  const [selectedPartToEdit, setSelectedPartToEdit] = useState<
    Part | undefined
  >();

  const router = useRouter();

  const { vin } = router.query;

  const success = (message: string) => toast.success(message);
  const error = (message: string) => toast.error(message);

  const parts = trpc.parts.getAll.useQuery({ vin: (vin as string) || "" });
  const deletePart = trpc.parts.deletePart.useMutation();

  const columns = useMemo<Array<Column<any>>>(
    () => [
      {
        Header: "Part",
        accessor: "partDetails.name",
      },
      {
        Header: "Partno",
        accessor: "partDetails.partNo",
      },
      {
        Header: "Location",
        accessor: "inventoryLocation.name",
      },
      {
        Header: "Quantity",
        accessor: "quantity",
      },
      {
        Header: "Variant",
        accessor: "variant",
      },
      {
        Header: "Donor",
        accessor: "donorVin",
      },
      {
        Header: "Edit",
        accessor: (d: Part) => (
          <Button
            onClick={() => {
              setSelectedPartToEdit(d);
            }}
          >
            Edit Part
          </Button>
        ),
      },
      {
        Header: "Delete",
        accessor: (d: Part) => (
          <Button
            variant={"destructive"}
            onClick={() => {
              setSelected(d);
              setShowDeleteModal(true);
            }}
          >
            Delete Part
          </Button>
        ),
      },
    ],
    []
  );

  const deletePartFunc = async () => {
    if (!selected) return;
    await deletePart.mutateAsync({ id: selected.id });
    success("Part deleted successfully");
    parts.refetch();
    setShowDeleteModal(false);
    setSelected(undefined);
  };

  return (
    <>
      <Head>
        <title>Parts</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="m-20 flex min-h-screen flex-col bg-white">
        <BreadCrumbs />
        {showModal ? (
          <AddInventory
            isOpen={showModal}
            onClose={() => {
              parts.refetch();
              setSelected(undefined);
              setShowModal(false);
            }}
            inventoryItem={selected}
          />
        ) : null}
        {selectedPartToEdit && (
          <EditInventoryModal
            isOpen={!!selectedPartToEdit}
            onClose={() => setSelectedPartToEdit(undefined)}
            inventoryItem={selectedPartToEdit}
            existingDonor={selectedPartToEdit.donorVin as string}
          />
        )}
        <ConfirmDelete
          deleteFunction={deletePartFunc}
          setShowModal={setShowDeleteModal}
          showModal={showDeleteModal}
        />
        <div className="flex items-center justify-between bg-white py-4 dark:bg-gray-800">
          <div>
            <Button onClick={() => setShowModal(true)}>
              Add Inventory Item
            </Button>
          </div>
          <FilterInput
            filter={filter}
            setFilter={setFilter}
            placeholder="Search for parts..."
          />
        </div>
        <AdminTable
          columns={columns}
          filter={filter}
          setFilter={setFilter}
          data={parts}
        />
      </main>
    </>
  );
};

export default Inventory;
