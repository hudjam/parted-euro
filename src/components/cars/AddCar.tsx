import { useState } from "react";
import { trpc } from "../../utils/trpc";
import FormSection from "../FormSection";
import type { Car } from "@prisma/client";
import Modal from "../modals/Modal";

interface AddCarProps {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  success: (message: string) => void;
  error: (message: string) => void;
  car?: Car | null;
  refetch: () => void;
}

const AddCar: React.FC<AddCarProps> = ({
  showModal,
  setShowModal,
  success,
  error,
  car,
  refetch,
}) => {
  const [make, setMake] = useState<string>(car?.make || "BMW");
  const [series, setSeries] = useState<string>(car?.series || "");
  const [generation, setGeneration] = useState<string>(car?.generation || "");
  const [model, setModel] = useState<string>(car?.model || "");
  const [showBody, setShowBody] = useState<boolean>(false);
  const [body, setBody] = useState<string>(car?.body || "");

  const cars = trpc.cars.getAll.useQuery();
  const saveCar = trpc.cars.createCar.useMutation();

  const onSave = async (exit: boolean) => {
    const result = await saveCar.mutateAsync(
      {
        make: make,
        series: series,
        generation: generation,
        model: model,
        body: body || null,
      },
      {
        onSuccess: (data) => {
          success(`${generation} ${model} added successfully`);
          refetch();
          if (exit) {
            setShowModal(false);
          }
          setSeries("");
          setGeneration("");
          setModel("");
          setBody("");
        },
        onError: (err) => {
          error(err.message);
        },
      }
    );
  };

  return (
    <Modal isOpen={showModal} setIsOpen={setShowModal} title="Add Car">
      <div className="space-y-6 p-6">
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Make
          </label>
          <select
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            disabled={true}
          >
            <option value="BMW">BMW</option>
          </select>
        </div>
        <FormSection
          title="Series"
          data={[...new Set(cars.data?.map((car) => car.series))]}
          value={series}
          setValue={setSeries}
        />
        <FormSection
          title="Generation"
          data={[...new Set(cars.data?.map((car) => car.generation))]}
          value={generation}
          setValue={setGeneration}
        />
        <FormSection
          title="Model"
          data={[...new Set(cars.data?.map((car) => car.model))]}
          value={model}
          setValue={setModel}
        />
        <p
          className="cursor-pointer text-blue-600"
          onClick={() => setShowBody(!showBody)}
        >
          There are multiple bodies for this model
        </p>
        {showBody ? (
          <FormSection
            title="Body"
            data={[
              ...new Set(
                cars.data
                  ?.filter((car: Car) => car.body !== null)
                  .map((car) => car.body)
              ),
            ]}
            value={body}
            setValue={setBody}
          />
        ) : null}
      </div>
      <div className="flex items-center space-x-2 rounded-b border-t border-gray-200 p-6 dark:border-gray-600">
        <button
          onClick={() => onSave(true)}
          data-modal-toggle="defaultModal"
          type="button"
          className="rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Save and Exit
        </button>
        <button
          onClick={() => onSave(false)}
          data-modal-toggle="defaultModal"
          type="button"
          className="rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Save
        </button>
      </div>
    </Modal>
  );
};

export default AddCar;
