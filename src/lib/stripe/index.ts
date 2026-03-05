import { Stripe } from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing Stripe secret key in environment variables");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia" as any, // Bypass TS validation for the latest API version or change to what TS wants
  appInfo: {
    name: "NaskahAI",
    version: "0.1.0",
  },
});
