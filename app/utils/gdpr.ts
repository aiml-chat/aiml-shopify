/**
 * Build the AIML API URL to redact a customer's lead data.
 * Extracted so the GDPR webhook action can be unit-tested without Remix/Shopify machinery.
 */
export function buildRedactUrl(apiUrl: string, email: string, shop?: string | null): string {
  const url = new URL("/v1/leads", apiUrl);
  url.searchParams.set("email", email);
  if (shop) {
    url.searchParams.set("shop", shop);
  }
  return url.toString();
}
