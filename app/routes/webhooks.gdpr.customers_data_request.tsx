import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../../shopify.server";

// GDPR: Customer data request — Shopify sends this when a customer requests their data.
// Required for App Store approval.
export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.webhook(request);
  // AIML.chat stores only: visitor conversation messages (sessionStorage on client,
  // not persisted server-side beyond tenant-scoped analytics).
  // No personally identifiable customer data is stored beyond email if a lead was captured.
  // In production: query Leads table by shop domain and email, return as JSON.
  return new Response(JSON.stringify({ data: [] }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
