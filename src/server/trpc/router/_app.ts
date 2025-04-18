import { donorRouter } from "./donors";
import { router } from "../trpc";
import { authRouter } from "./auth";
import { carRouter } from "./car";
import { listingRouter } from "./listings";
import { partRouter } from "./inventory";
import { imagesRouter } from "./images";
import { partDetailsRouter } from "./partDetails";
import { xeroRouter } from "./xero";
import { ebayRouter } from "./ebay";
import { categoryRouter } from "./categories";
import { orderRouter } from "./order";
import { orderItemsRouter } from "./orderItems";
import { checkoutRouter } from "./checkout";
import { adminRouter } from "./admin";
import { homepageImagesRouter } from "./homepageImages";
import { inventoryLocationsRouter } from "./inventoryLocations";
import { usersRouter } from "./users";

export const appRouter = router({
  cars: carRouter,
  donors: donorRouter,
  listings: listingRouter,
  parts: partRouter,
  images: imagesRouter,
  auth: authRouter,
  partDetails: partDetailsRouter,
  xero: xeroRouter,
  ebay: ebayRouter,
  inventoryLocations: inventoryLocationsRouter,
  categories: categoryRouter,
  order: orderRouter,
  orderItems: orderItemsRouter,
  checkout: checkoutRouter,
  admin: adminRouter,
  homepageImages: homepageImagesRouter,
  users: usersRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
