import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  DeliveryMethod,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  apiVersion: ApiVersion.July24,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL!,
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
      callback: async (topic, shop) => {
        await prisma.aimlInstall.updateMany({
          where: { shop },
          data: { uninstalledAt: new Date() },
        });
      },
    },
  },
  hooks: {
    afterAuth: async ({ session }) => {
      shopify.registerWebhooks({ session });
      // Auto-register the store and trigger ingestion
      await registerStoreWithAiml(session.shop);
    },
  },
  future: {
    unstable_newEmbeddedAuthStrategy: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

async function registerStoreWithAiml(shop: string) {
  const apiUrl = process.env.AIML_API_URL ?? "https://api.aiml.chat";
  const serviceToken = process.env.AIML_SERVICE_TOKEN;
  if (!serviceToken) return;

  try {
    // Register website in AIML
    const regRes = await fetch(`${apiUrl}/v1/websites`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceToken}`,
      },
      body: JSON.stringify({ domain: shop }),
    });

    if (!regRes.ok) return;
    const { id: websiteId, apiKey } = await regRes.json();

    // Store API key for the shop
    await prisma.aimlInstall.upsert({
      where: { shop },
      create: { shop, websiteId, apiKey },
      update: { websiteId, apiKey, uninstalledAt: null },
    });

    // Trigger ingestion of storefront pages
    await fetch(`${apiUrl}/v1/websites/${websiteId}/ingest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceToken}`,
      },
      body: JSON.stringify({ startUrl: `https://${shop}` }),
    });
  } catch (err) {
    console.error("[AIML] Failed to register store:", shop, err);
  }
}

export default shopify;
export const apiVersion = ApiVersion.July24;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
