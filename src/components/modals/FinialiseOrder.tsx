import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { CheckoutItem } from "@/pages/api/checkout";
import { trpc } from "../../utils/trpc";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";

// Define the form schema using Zod
const formSchema = z.object({
  shippingMethod: z.string().min(1, "Shipping method is required"),
  postageCost: z.number().min(0, "Postage cost must be 0 or greater"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  countryCode: z.string().min(1, "Country is required"),
});

type FormData = z.infer<typeof formSchema>;

type FinializeOrderProps = {
  order: CheckoutItem[];
  setOrder: (order: CheckoutItem[]) => void;
};

const FinializeOrder = ({ order, setOrder }: FinializeOrderProps) => {
  const { control, handleSubmit, watch } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      shippingMethod: "",
      postageCost: 0,
      name: "",
      email: "",
      countryCode: "",
    },
  });

  const ausPostShippingCountries =
    trpc.checkout.getShippingCountries.useQuery();

  const createCheckout = trpc.checkout.getAdminCheckoutSession.useQuery(
    {
      name: watch("name"),
      email: watch("email"),
      shippingOptions: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: watch("postageCost") * 100,
              currency: "AUD",
            },
            display_name: watch("shippingMethod"),
          },
        },
      ],
      countryCode: watch("countryCode"),
      items: order,
    },
    {
      enabled: false,
    },
  );

  const onSubmit = async (data: FormData) => {
    await createCheckout.refetch();
  };

  useEffect(() => {
    if (!createCheckout.data) return;
    void navigator.clipboard.writeText(createCheckout.data.url!);
    toast.success("Copied to clipboard");
  }, [createCheckout.data]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid gap-4 border p-4">
        <h4 className="text-lg font-bold">Items</h4>
        {order.map((checkoutItem) => (
          <ItemsByListing
            order={order}
            setOrder={setOrder}
            key={checkoutItem.itemId}
            checkoutItem={checkoutItem}
          />
        ))}
        <div className="gap-2">
          <p className="font-bold">Total</p>
          <p>
            ${order.reduce((acc, cur) => acc + cur.price! * cur.quantity, 0)}
          </p>
        </div>
      </div>
      <div className="z-50 grid grid-cols-2 gap-4 p-4">
        <p>Shipping Method:</p>
        <Controller
          name="shippingMethod"
          control={control}
          render={({ field }) => <Input {...field} className="w-full" />}
        />
        <p>Postage Cost:</p>
        <Controller
          name="postageCost"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="number"
              onChange={(e) => field.onChange(Number(e.target.value))}
            />
          )}
        />
        <p>Name</p>
        <Controller
          name="name"
          control={control}
          render={({ field }) => <Input {...field} />}
        />
        <p>Email</p>
        <Controller
          name="email"
          control={control}
          render={({ field }) => <Input {...field} />}
        />
        <p>Country</p>
        <Controller
          name="countryCode"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger id="country" className="w-full">
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AU">Australia</SelectItem>
                {ausPostShippingCountries.data?.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
      <div className="flex w-full justify-end">
        <Button type="submit" loading={createCheckout.isFetching}>
          Get Stripe URL
        </Button>
      </div>
    </form>
  );
};

export default FinializeOrder;

type ItemsByListingProps = {
  checkoutItem: CheckoutItem;
  order: CheckoutItem[];
  setOrder: (order: CheckoutItem[]) => void;
};

const ItemsByListing = ({
  checkoutItem,
  order,
  setOrder,
}: ItemsByListingProps) => {
  const listing = trpc.listings.getListing.useQuery({
    id: checkoutItem.itemId,
  });

  const inventoryItems = trpc.parts.getInventoryDetailsByListingId.useQuery(
    checkoutItem.itemId,
  );

  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-lg font-bold">{listing.data?.title}</h4>
      {inventoryItems.data?.map((item) => (
        <>
          <p className="flex">{item.partDetails.name}</p>
          <div className="flex items-center gap-4">
            <p>VIN:</p>
            <span>${item.donorVin}</span>
          </div>
          <div className="flex items-center gap-4">
            <p>Price:</p>
            <span>${checkoutItem.price}</span>
          </div>
          <div className="flex items-center gap-4">
            <p>Quantity:</p>
            <p>{checkoutItem.quantity}</p>
          </div>
        </>
      ))}
    </div>
  );
};
