import { describe, it, expect, vi } from "vitest";
import { triggerReindex } from "../app/utils/reindex";

function mockFetch(response: { ok: boolean; status: number; body?: unknown }) {
  return vi.fn(async () =>
    new Response(response.body ? JSON.stringify(response.body) : null, { status: response.status })
  );
}

describe("triggerReindex", () => {
  it("returns success when the API accepts the request", async () => {
    const fetch = mockFetch({ ok: true, status: 202 });
    const result = await triggerReindex({
      websiteId: "site-123",
      shop: "store.myshopify.com",
      apiUrl: "https://api.aiml.chat",
      serviceToken: "token",
      fetch,
    });

    expect(result).toEqual({ success: true, message: "Re-indexing started." });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.aiml.chat/v1/websites/site-123/ingest",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer token",
        }),
        body: JSON.stringify({ startUrl: "https://store.myshopify.com" }),
      })
    );
  });

  it("returns failure when the service token is missing", async () => {
    const result = await triggerReindex({
      websiteId: "site-123",
      shop: "store.myshopify.com",
      apiUrl: "https://api.aiml.chat",
      serviceToken: undefined,
      fetch: mockFetch({ ok: true, status: 200 }),
    });

    expect(result).toEqual({ success: false, message: "AIML service token is not configured." });
  });

  it("returns failure when the API responds with an error", async () => {
    const fetch = mockFetch({ ok: false, status: 500 });
    const result = await triggerReindex({
      websiteId: "site-123",
      shop: "store.myshopify.com",
      apiUrl: "https://api.aiml.chat",
      serviceToken: "token",
      fetch,
    });

    expect(result).toEqual({ success: false, message: "Indexing request failed (500)." });
  });

  it("uses a custom AIML API base URL when provided", async () => {
    const fetch = mockFetch({ ok: true, status: 202 });
    await triggerReindex({
      websiteId: "site-123",
      shop: "store.myshopify.com",
      apiUrl: "http://localhost:5001",
      serviceToken: "token",
      fetch,
    });

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:5001/v1/websites/site-123/ingest",
      expect.any(Object)
    );
  });

  it("returns failure when the network request throws", async () => {
    const fetch = vi.fn(async () => {
      throw new Error("fetch failed");
    });
    const result = await triggerReindex({
      websiteId: "site-123",
      shop: "store.myshopify.com",
      apiUrl: "https://api.aiml.chat",
      serviceToken: "token",
      fetch,
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain("fetch failed");
  });
});
