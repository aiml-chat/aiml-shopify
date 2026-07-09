import { describe, it, expect } from "vitest";
import { buildRedactUrl } from "../app/utils/gdpr";

describe("buildRedactUrl", () => {
  it("includes email and shop query params", () => {
    const url = buildRedactUrl("https://api.aiml.chat", "user@example.com", "store.myshopify.com");
    expect(url).toBe(
      "https://api.aiml.chat/v1/leads?email=user%40example.com&shop=store.myshopify.com"
    );
  });

  it("omits shop param when not provided", () => {
    const url = buildRedactUrl("https://api.aiml.chat", "user@example.com");
    expect(url).toBe("https://api.aiml.chat/v1/leads?email=user%40example.com");
  });

  it("omits shop param when shop is empty", () => {
    const url = buildRedactUrl("https://api.aiml.chat", "user@example.com", "");
    expect(url).toBe("https://api.aiml.chat/v1/leads?email=user%40example.com");
  });

  it("handles custom AIML API base URLs", () => {
    const url = buildRedactUrl("http://localhost:5001", "a@b.c", "shop.example");
    expect(url).toBe("http://localhost:5001/v1/leads?email=a%40b.c&shop=shop.example");
  });
});
