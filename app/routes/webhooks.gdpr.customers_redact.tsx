import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../../shopify.server";

// GDPR: Customer data erasure — Shopify sends this to erase a customer's data.
// Required for App Store approval.
export const action = async ({ request }: ActionFunctionArgs) => {
  const { payload } = await authenticate.webhook(request);
  // In production: delete any Lead records associated with the customer's email address.
  // Lead email is the only customer PII stored.
  // Forward to AIML API: DELETE /v1/leads?email=...&shop=...
  const apiUrl = process.env.AIML_API_URL ?? "https://api.aiml.chat";
  const serviceToken = process.env.AIML_SERVICE_TOKEN;
  if (serviceToken && payload?.customer?.email) {
    await fetch(`${apiUrl}/v1/leads?email=${encodeURIComponent(payload.customer.email)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${serviceToken}` },
    }).catch(() => {});
  }
  return new Response(null, { status: 200 });
};
