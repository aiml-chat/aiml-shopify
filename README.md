# aiml-shopify

Official Shopify app for [AIML.chat](https://aiml.chat) — AI documentation & website assistant.

**License:** MIT

---

## What it does

- Installs a floating AI chat widget on your Shopify storefront via a Theme App Extension
- Auto-indexes your products, pages, and policies on install
- Answers customer questions grounded in your store's own content, with clickable source citations
- Captures a customer's email as a lead when the assistant can't answer
- Shows suggested questions / an auto-generated FAQ when the chat opens
- Fully configurable in the Shopify theme customiser (position, theme, brand colour)

---

## Tech stack

| Layer | Tech |
|-------|------|
| Framework | Remix + Shopify App Remix |
| UI | Polaris (Shopify design system) |
| Auth | Session tokens (embedded app, not cookies) |
| DB | SQLite via Prisma (sessions + install records) |
| Widget injection | Theme App Extension (Liquid block) |

---

## Local development

### Prerequisites

- Node 18+
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli) — `npm install -g @shopify/cli`
- A Shopify Partner account + development store

### Setup

```bash
cp .env.example .env
# Fill in SHOPIFY_API_KEY, SHOPIFY_API_SECRET, AIML_SERVICE_TOKEN

npm install
npx prisma generate && npx prisma migrate dev

shopify app dev
```

The Shopify CLI will open a tunnel and your app will be available at the printed URL.

---

## GDPR webhooks

Shopify requires these 4 webhooks for App Store approval. All are implemented:

| Webhook | Route | Purpose |
|---------|-------|---------|
| `app/uninstalled` | `/webhooks` | Mark install record as uninstalled |
| `customers/data_request` | `/webhooks/gdpr/customers_data_request` | Return customer data (leads by email) |
| `customers/redact` | `/webhooks/gdpr/customers_redact` | Delete customer leads by email |
| `shop/redact` | `/webhooks/gdpr/shop_redact` | Delete all shop data after 48h |

---

## Deployment

```bash
shopify app deploy
```

This deploys the Theme App Extension and registers webhooks. The Remix app itself is deployed separately (Railway, Fly.io, etc.).

---

## Environment variables

| Variable | Description |
|----------|-------------|
| `SHOPIFY_API_KEY` | From Shopify Partners dashboard |
| `SHOPIFY_API_SECRET` | From Shopify Partners dashboard |
| `SHOPIFY_APP_URL` | Public URL of this app (e.g. `https://shopify.aiml.chat`) |
| `SCOPES` | Comma-separated Shopify access scopes |
| `AIML_API_URL` | AIML.chat API base URL |
| `AIML_SERVICE_TOKEN` | Service JWT for AIML API (auto-registers stores) |
