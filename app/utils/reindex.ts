export interface ReindexResult {
  success: boolean;
  message: string;
}

export interface TriggerReindexOptions {
  websiteId: string;
  shop: string;
  apiUrl: string;
  serviceToken: string | undefined;
  fetch?: typeof globalThis.fetch;
}

/**
 * Trigger a remote re-index of a Shopify store's content.
 * Extracted from the route action so the network call and error handling can be unit-tested.
 */
export async function triggerReindex({
  websiteId,
  shop,
  apiUrl,
  serviceToken,
  fetch: fetchImpl = fetch,
}: TriggerReindexOptions): Promise<ReindexResult> {
  if (!serviceToken) {
    return { success: false, message: "AIML service token is not configured." };
  }

  try {
    const response = await fetchImpl(`${apiUrl}/v1/websites/${websiteId}/ingest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceToken}`,
      },
      body: JSON.stringify({ startUrl: `https://${shop}` }),
    });

    if (!response.ok) {
      return { success: false, message: `Indexing request failed (${response.status}).` };
    }

    return { success: true, message: "Re-indexing started." };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, message: `Indexing request failed: ${message}` };
  }
}
