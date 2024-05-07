import { useSession } from "next-auth/react";
import type { OrderWithItems, QueryOrderGetAllAdmin } from "../../utils/trpc";
import { trpc } from "../../utils/trpc";
import AdminTable from "../../components/tables/AdminTable";
import { useMemo, useState } from "react";
import Head from "next/head";
import Spacer from "../../components/Spacer";
import BreadCrumbs from "../../components/admin/BreadCrumbs";
import FilterInput from "../../components/tables/FilterInput";
import { Button } from "../../components/ui/button";
import Link from "next/link";
import type { Column } from "react-table";
import type { Order } from "@prisma/client";
import {
  DialogContent,
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { File, Mail } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { DialogClose } from "@radix-ui/react-dialog";

const Orders = () => {
  const [filter, setFilter] = useState<string>("");
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      window.location.href = "/";
    },
  });

  const orders = trpc.order.getAllAdmin.useQuery();

  const regenerateInvoice = trpc.order.regenerateInvoice.useMutation();

  const columns = useMemo<Array<Column<QueryOrderGetAllAdmin>>>(
    () => [
      {
        Header: "ID",
        accessor: "xeroInvoiceId",
        Cell: ({ row, value }) => {
          return (
            <Link
              className="text-blue-500"
              target="_blank"
              href={`https://go.xero.com/AccountsReceivable/View.aspx?InvoiceID=${row.original.xeroInvoiceRef}`}
            >
              {value}
            </Link>
          );
        },
      },
      {
        Header: "Order date",
        accessor: (d) => new Date(d.createdAt).toLocaleDateString(),
      },
      {
        Header: "Name",
        accessor: "name",
      },
      {
        Header: "Email",
        accessor: "email",
      },
      {
        Header: "Status",
        accessor: "status",
      },
      {
        Header: "Type",
        accessor: (d) => (d.shipping ? "Shipped" : "Pickup"),
      },
      {
        Header: "Shipping Address",
        accessor: "shippingAddress",
      },
      {
        Header: "Total",
        accessor: (d) =>
          (Number(d.subtotal / 100) + Number(d.shipping)).toLocaleString(
            "en-AU",
            {
              style: "currency",
              currency: "AUD",
            },
          ),
      },
      {
        Header: "Tracking number ",
        accessor: (d) => <TrackingNumberModal order={d} />,
      },
      {
        Header: "Regenerate invoice",
        accessor: (d) => (
          <>
            {!!d.FailedOrder.length && (
              <File
                onClick={() => {
                  regenerateInvoice.mutateAsync({ id: d.id });
                }}
                className="cursor-pointer text-center"
              />
            )}
          </>
        ),
      },
    ],
    [],
  );

  return (
    <>
      <Head>
        <title>Listings</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="m-20 flex min-h-screen flex-col bg-white">
        <BreadCrumbs />
        <Spacer amount="2" />
        <div className="flex items-center justify-between bg-white py-4 dark:bg-gray-800">
          <FilterInput
            filter={filter}
            setFilter={setFilter}
            placeholder="Search for orders..."
          />
        </div>
        <AdminTable
          filter={filter}
          setFilter={setFilter}
          columns={columns}
          data={orders}
        />
      </main>
    </>
  );
};

export default Orders;

type TrackingNumberModalProps = {
  order: OrderWithItems;
};

const TrackingNumberModal = ({ order }: TrackingNumberModalProps) => {
  const [trackingNumber, setTrackingNumber] = useState<string>(
    order?.trackingNumber ?? "",
  );

  const updateOrder = trpc.order.updateOrder.useMutation();

  const onSave = async () => {
    if (!order) return;
    await updateOrder.mutateAsync({
      id: order.id,
      trackingNumber: trackingNumber,
    });
    fetch("/api/resend/orderShipped", {
      method: "POST",
      body: JSON.stringify({
        order: {
          ...order,
          trackingNumber,
        },
      }),
    });
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Mail className="text-center" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send tracking</DialogTitle>
        </DialogHeader>
        <Label>Tracking number</Label>
        <Input
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
        />
        <div className="flex w-full justify-end">
          <DialogClose>
            <Button onClick={onSave}>Send</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};
