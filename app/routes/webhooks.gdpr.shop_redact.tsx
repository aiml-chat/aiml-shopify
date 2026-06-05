import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GDPR: Shop data erasure — Shopify sends this 48 hours after a shop uninstalls the app.
// Required for App Store approval.
export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop } = await authenticate.webhook(request);

  // Delete the Prisma session + install record
  await prisma.session.deleteMany({ where: { shop } });
  await prisma.aimlInstall.deleteMany({ where: { shop } });

  // Forward account deletion to AIML API
  const apiUrl = process.env.AIML_API_URL ?? "https://api.aiml.chat";
  const serviceToken = process.env.AIML_SERVICE_TOKEN;
  if (serviceToken) {
    // Find the website by shop domain and delete it
    await fetch(`${apiUrl}/v1/websites/by-domain/${encodeURIComponent(shop)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${serviceToken}` },
    }).catch(() => {});
  }

  return new Response(null, { status: 200 });
};
