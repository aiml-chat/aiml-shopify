# aiml-shopify — Contributor Reference

Shopify app for the AIML.chat AI assistant. Built with Remix + `@shopify/shopify-app-remix`.

## Setup

```bash
npm install
cp .env.example .env
# Fill in SHOPIFY_API_KEY, SHOPIFY_API_SECRET from your Shopify Partner dashboard
npx prisma migrate dev
npm run dev
```

## Key files

| File | Purpose |
|------|---------|
| `app/shopify.server.ts` | Shopify app setup, `afterAuth` hook |
| `app/routes/app._index.tsx` | Dashboard UI (Polaris) |
| `app/routes/webhooks.tsx` | APP_UNINSTALLED |
| `app/routes/webhooks.gdpr.*.tsx` | 3 GDPR compliance webhooks |
| `extensions/aiml-widget/blocks/aiml-widget.liquid` | Theme App Extension block |
| `prisma/schema.prisma` | Session + AimlInstall tables |

## GDPR webhooks (mandatory)

All three must be implemented for App Store submission:
- `customers/data_request` — return `{ data: [] }`
- `customers/redact` — forward erasure to AIML API
- `shop/redact` — delete session + forward to AIML API

## Theme App Extension

`extensions/aiml-widget/` — merchants enable the widget via the Shopify theme editor, no code required.

## Environment variables

See `.env.example`. You need a Shopify Partner account and a dev store.

## Contributing

Standard Remix + Shopify App Remix conventions. Run `npm run lint` before submitting a PR.
