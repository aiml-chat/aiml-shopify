# Changelog

## [Unreleased]

### Added
- **API Key now shown in the app dashboard** next to the Website ID, with instructions for pasting both
  into the theme-editor app embed. The embed's settings said "Find your API key in the AIML Chat app",
  but the app never displayed it — merchants could not complete setup.

### Fixed
- Type error: `afterAuth` passed `session.accessToken` (possibly `undefined`) to a parameter the
  function never used — parameter removed.

### Changed
- **Position and Colour theme now default to "Default (use dashboard setting)"** — appearance configured
  centrally in the AIML.chat dashboard (colours, avatar, launcher, greeting, auto-open…) applies unless
  explicitly overridden per store. Previously the block always emitted `data-position`/`data-theme`,
  permanently overriding the dashboard.

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
