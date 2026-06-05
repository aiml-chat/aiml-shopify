# Changelog

## [Unreleased]

## [0.2.0] — 2026-06

### Added
- Admin dashboard "What your assistant can do" card — surfaces source citations, lead capture, suggested-question/FAQ, and analytics
- README now documents lead capture, citations, and FAQ capabilities

### Notes
- The Theme App Extension already passes `website_id` and `primary_color` to the widget, so lead capture and brand-colour theming work out of the box once configured in the theme customiser.

## [0.1.0] — 2026-05

### Added
- Initial Remix app with `@shopify/shopify-app-remix`
- Prisma session storage + `AimlInstall` table
- `afterAuth` hook: auto-registers store + triggers ingestion via AIML API
- Dashboard page: status card + manual re-index button (Polaris UI)
- Theme App Extension: `blocks/aiml-widget.liquid` with full settings schema
- 4 mandatory GDPR webhooks: `app/uninstalled`, `customers/data_request`, `customers/redact`, `shop/redact`
- `.env.example`, `shopify.app.toml`, `README.md`
