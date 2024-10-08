import { httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import superjson from "superjson";

import { type AppRouter } from "../server/trpc/router/_app";

const getBaseUrl = () => {
  if (typeof window !== "undefined") return ""; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      queryClientConfig: {
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      },
      transformer: superjson,
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === "development" ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
    };
  },
  ssr: false,
});

/**
 * Inference helper for inputs
 * @example type HelloInput = RouterInputs['example']['hello']
 **/
export type RouterInputs = inferRouterInputs<AppRouter>;
/**
 * Inference helper for outputs
 * @example type HelloOutput = RouterOutputs['example']['hello']
 **/
export type RouterOutputs = inferRouterOutputs<AppRouter>;
// listings
export type GetAllListingsAdminOutput =
  RouterOutputs["listings"]["getAllAdmin"][0];

export type GetAllSubCategoriesQuery =
  RouterOutputs["categories"]["getAllSubCategories"][0];

export type AllPartDetailsQuery = RouterOutputs["partDetails"]["getAll"][0];

export type AllPartsQuery = RouterOutputs["parts"]["getAll"][0];

export type QueryDonorGetAllDashboard =
  RouterOutputs["donors"]["getAllDashboard"][0];

export type QueryListingsGetAllAdmin =
  RouterOutputs["listings"]["getAllAdmin"][0];

export type QueryListingsGetAllAvailable =
  RouterOutputs["listings"]["getAllAvailable"];

export type QueryOrderGetAllAdmin = RouterOutputs["order"]["getAllAdmin"][0];

export type OrderWithItems = RouterOutputs["order"]["getOrder"];

export type AdminSearchCounts = RouterOutputs["admin"]["adminSearchCounts"];

export type ListingsGetListing = RouterOutputs["listings"]["getListing"]

// export type AdminSearchListings =
//   RouterOutputs["admin"]["adminSearch"]["listings"];
// export type AdminSearchCars = RouterOutputs["admin"]["adminSearch"]["cars"];
// export type AdminSearchParts =
//   RouterOutputs["admin"]["adminSearch"]["inventory"];
