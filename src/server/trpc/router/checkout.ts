import { z } from "zod";
import { publicProcedure, router } from "../trpc";

type ShippingCountryResponse = {
  countries: Record<"country", AusPostShippingCodes[]>;
};

type AusPostShippingCodes = {
  code: string;
  name: string;
};

type AvailableShippingServicesResponse = {
  services: {
    service: AusPostShippingService[];
  };
};

type AusPostShippingService = {
  code: string;
  name: string;
  price: string;
  max_extra_cover: number;
  options: {
    option: {
      code: string;
      name: string;
    }[];
  };
};

export type StripeShippingOption = {
  shipping_rate_data: {
    type: string;
    display_name: string;
    fixed_amount: {
      amount: number;
      currency: string;
    };
  };
};

type InterparcelShippingServicesResponse = {
  status: number;
  errorMessage: string;
  services: InterparcelShippingService[];
  invalidServices: never[];
};

type InterparcelShippingService = {
  id: string;
  service: string;
  type: string;
  rapid: {
    quote: string;
    pickup: string;
    transitTimes: string;
  };
};

type InterparcelShippingQuote = {
  status: number;
  shipment: {
    collCountry: string;
    delCountry: string;
  };
  services: {
    id: string;
    service: string;
    carrier: string;
    name: string;
    displayCarrier: string;
    displayName: string;
    realCarrier: string;
    bulkCarrier: string;
    logoImage: string;
    carrierDescription: string;
    description: string;
    warning: string;
    type: string;
    category: string;
    transitCover: number;
    maxTransitCover: number;
    transitCoverPercent: number;
    collAddressType: string;
    delAddressType: string;
    ofdNotifications: string;
    delNotifications: string;
    signature: string;
    signatureSell: number;
    printInStore: null;
    manifestRequired: boolean;
    volumetricWeights: string[];
    printerRequired: boolean;
    maxWeight: number;
    maxLength: number;
    sellPrice: number;
    taxable: string;
    invoiceRequired: string;
    hsCodeRequired: string;
    remote: {
      collection: {
        remote: boolean;
        message: string;
      };
      delivery: {
        remote: boolean;
        price: number;
      };
    };
    pickupDates: {
      status: number;
      pickupType: string;
      dateNow: string;
      timeNow: string;
      cutoffDate: string;
      cutoffTime: string;
      dates: string[];
      window: {
        earliestFrom: string;
        earliestTo: string;
        latestFrom: string;
        latestTo: string;
        minimumWindow: number;
      };
      cached: boolean;
    };
    timeElapsed: number;
  }[];
  invalidServices: never[];
};

const filterInterparcelShippingServices = (
  service: InterparcelShippingService,
) => {
  return !service.service.includes("Hunter");
};

const getShippingServicesInputSchema = z.object({
  weight: z.number(),
  length: z.number(),
  width: z.number(),
  height: z.number(),
  destinationPostcode: z.string(),
  destinationCountry: z.string(),
  destinationCity: z.string().optional(),
  destinationState: z.string().optional(),
});

type ShippingServicesInput = z.infer<typeof getShippingServicesInputSchema>;

// auspost vatiables
const auspostBaseUrl = "https://digitalapi.auspost.com.au";
const supportedShippingMethods = ["Standard", "Express"];

// interparcel variables
const interparcelBaseUrl = "https://au.interparcel.com/api";

const partedEuroAddress = {
  postcode: "3180",
  city: "Knoxfield",
  state: "VIC",
  country: "AU",
};

const getDomesticShippingServices = async (input: ShippingServicesInput) => {
  const { weight, length, width, height, destinationPostcode } = input;
  const ausPostRes = await fetch(
    `https://digitalapi.auspost.com.au/postage/parcel/domestic/service.json?length=${length}&width=${width}&height=${height}&weight=${weight}&from_postcode=${partedEuroAddress.postcode}&to_postcode=${destinationPostcode}`,
    {
      method: "GET",
      headers: {
        "AUTH-KEY": process.env.AUSPOST_API_KEY as string,
      },
    },
  );
  const data = (await ausPostRes.json()) as AvailableShippingServicesResponse;
  const express = data.services.service.find(
    (service) => service.code === "AUS_PARCEL_EXPRESS",
  )?.price;
  const regular = data.services.service.find(
    (service) => service.code === "AUS_PARCEL_REGULAR",
  )?.price;
  if (!express || !regular) throw new Error("Shipping not available");
  return [
    {
      shipping_rate_data: {
        type: "fixed_amount",
        fixed_amount: {
          amount: Math.ceil(Number(regular) * 100),
          currency: "AUD",
        },
        display_name: "AusPost Regular",
      },
    },
    {
      shipping_rate_data: {
        type: "fixed_amount",
        fixed_amount: {
          amount: Math.ceil(Number(express) * 100),
          currency: "AUD",
        },
        display_name: "AusPost Express",
      },
    },
  ];
};

const getAusPostInternationalShippingServices = async (
  input: ShippingServicesInput,
) => {
  const { destinationCountry, weight } = input;
  const res = await fetch(
    `${auspostBaseUrl}/postage/parcel/international/service.json?country_code=${destinationCountry}&weight=${weight}`,
    {
      headers: {
        "AUTH-KEY": process.env.AUSPOST_API_KEY as string,
      },
    },
  );
  const data = (await res.json()) as AvailableShippingServicesResponse;
  return data.services.service
    .map((service) => {
      return {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount: Math.ceil(Number(service.price) * 100),
            currency: "AUD",
          },
          display_name: service.name,
        },
      };
    })
    .filter((service) =>
      supportedShippingMethods.includes(
        service.shipping_rate_data.display_name,
      ),
    );
};

const getInterparcelShippingServices = async (input: ShippingServicesInput) => {
  const {
    length,
    width,
    height,
    destinationPostcode,
    destinationCountry,
    destinationCity,
    destinationState,
    weight,
  } = input;
  if (weight > 35) throw new Error("Weight is too heavy");
  const interparcelParams = {
    source: "booking",
    coll_country: "Australia",
    coll_state: partedEuroAddress.state,
    coll_city: partedEuroAddress.city,
    coll_postcode: partedEuroAddress.postcode,
    del_postcode: destinationPostcode,
    del_city: destinationCity!,
    del_state: destinationState!,
    del_country: "Australia",
    "pkg[0][0]": weight.toString(),
    "pkg[0][1]": length.toString(),
    "pkg[0][2]": width.toString(),
    "pkg[0][3]": height.toString(),
  };
  const searchParams = new URLSearchParams({
    ...interparcelParams,
    type: "parcel",
  });
  const shippingServicesAvailableResponse = await fetch(
    `${interparcelBaseUrl}/quote/availability?${searchParams}`,
  );
  const shippingServicesAvailableData =
    (await shippingServicesAvailableResponse.json()) as InterparcelShippingServicesResponse;
  if (shippingServicesAvailableData.errorMessage) {
    throw new Error(shippingServicesAvailableData.errorMessage);
  }
  const requests = shippingServicesAvailableData.services
    .filter(filterInterparcelShippingServices)
    .map(async (service) => {
      const searchParams = new URLSearchParams({
        ...interparcelParams,
        service: service.id,
      });
      const response = await fetch(
        `${interparcelBaseUrl}/quote/quote?${searchParams}`,
        {
          headers: {
            Cookie: "PHPSESSID=f",
          },
        },
      );
      const data = (await response.json()) as InterparcelShippingQuote;
      console.log(JSON.stringify(data, null, 2));
      return {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount: Math.ceil(Number(data.services[0]!.sellPrice) * 100),
            currency: "AUD",
          },
          display_name: `${data.services[0]!.carrier} - ${
            data.services[0]!.name
          }`,
        },
      };
    });
  const availableServices = await Promise.all(requests);
  return availableServices.slice(0, 4);
};

export const checkoutRouter = router({
  getShippingCountries: publicProcedure.query(async () => {
    const res = await fetch(`${auspostBaseUrl}/postage/country.json`, {
      headers: {
        "AUTH-KEY": process.env.AUSPOST_API_KEY as string,
      },
    });
    const data = (await res.json()) as ShippingCountryResponse;
    return data.countries.country;
  }),
  getShippingServices: publicProcedure
    .input(getShippingServicesInputSchema)
    .query(async ({ input }): Promise<StripeShippingOption[]> => {
      const { weight, destinationCountry } = input;
      if (weight >= 20) {
        const shippingServices = await getInterparcelShippingServices(input);
        return shippingServices;
      }
      if (destinationCountry !== "AU") {
        const shippingServices =
          await getAusPostInternationalShippingServices(input);
        return shippingServices;
      }
      const shippingServices = await getDomesticShippingServices(input);
      return shippingServices;
    }),
});
