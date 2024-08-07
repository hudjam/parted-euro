import { z } from "zod";

/**
 * Specify your server-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 */
export const serverSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "test", "production"]),
  NEXTAUTH_SECRET:
    process.env.NODE_ENV === "production"
      ? z.string().min(1)
      : z.string().min(1).optional(),
  NEXTAUTH_URL: z.preprocess(
    // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
    // Since NextAuth.js automatically uses the VERCEL_URL if present.
    (str) => process.env.VERCEL_URL ?? str,
    // VERCEL_URL doesn't include `https` so it cant be validated as a URL
    process.env.VERCEL ? z.string() : z.string().url(),
  ),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  CLOUDINARY_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  STRIPE_PUBLIC: z.string(),
  STRIPE_SECRET: z.string(),
  AUSPOST_API_KEY: z.string(),
  XERO_CLIENT_ID: z.string(),
  XERO_CLIENT_SECRET: z.string(),
  XERO_REDIRECT_URI: z.string(),
  XERO_SCOPES: z.string(),
  XERO_BANK_ACCOUNT: z.string(),
  EBAY_APP_ID: z.string(),
  EBAY_CERT_ID: z.string(),
  EBAY_RU_NAME: z.string(),
  EBAY_SCOPES: z.string(),
  EBAY_SITE_ID: z.string(),
  RESEND_API_KEY: z.string(),
  //   EBAY_PAYMENT_ID: z.string(),
  //   EBAY_RETURN_ID: z.string(),
  //   EBAY_MERCHANT_KEY: z.string(),
});

/**
 * Specify your client-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 * To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
export const clientSchema = z.object({
  NEXT_PUBLIC_GOOGLE_MAPS_KEY: z.string(),
});

/**
 * You can't destruct `process.env` as a regular object, so you have to do
 * it manually here. This is because Next.js evaluates this at build time,
 * and only used environment variables are included in the build.
 * @type {{ [k in keyof z.infer<typeof clientSchema>]: z.infer<typeof clientSchema>[k] | undefined }}
 */
export const clientEnv = {
  NEXT_PUBLIC_GOOGLE_MAPS_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY,
};
