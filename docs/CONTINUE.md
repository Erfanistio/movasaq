# Development handoff — 2026-09-11

## Product and recovered context

Persian RTL React website for موسسه حفاظتی مراقبتی موثق with public services, company pages, training, equipment store, applications, tracking, certificates and an admin CMS. The original conversations have been extracted to ignored `.device-transfer/chats/`. Their source archive remains in `docs/chat-archive/`.

## Completed in this checkout

- Cloned `main` at `46e4110` and read both project transcripts.
- Installed dependencies and generated `package-lock.json`; Node.js 24 or newer is required for SQLite.
- Updated the old baseline-browser-mapping override; installation audit reports zero vulnerabilities.
- Production build passes.
- Added seven isolated API workflow tests covering authentication/logout, CMS publication/deletion, applications/tracking, server-calculated order prices, stock transitions and rollback, certificate issuance/revocation, and malformed inputs.
- Fixed content type validation, malformed order lines, request body errors, invalid origin handling, certificate date validation and whitespace in certificate names.
- Added Chrome browser tests for desktop (1440px) and mobile (390px), covering 26 routes, images, horizontal overflow, checkout/tracking, enrollment/careers, admin publication and certificate verification. Tests use an in-memory database and generated temporary credentials.

## Run and verify

On Windows use `npm.cmd` if PowerShell blocks the unsigned npm.ps1 wrapper.

```powershell
npm.cmd ci
npm.cmd test
npm.cmd run build
npm.cmd run test:browser
npm.cmd run dev
```

Browser tests require Google Chrome installed. Screenshots and failure traces are written to ignored `test-results/`. Browser tests use port 3101; the normal API uses 3001 and Vite uses 5173. The in-app browser was unavailable in this session, so automated checks used headless Chrome.

## Remaining product work

- Obtain actual contact details, official company history/director text, license documents, gallery photos, and the confirmed product catalog/prices. Seed content includes illustrative photos and sample products/prices; licenses and gallery are empty.
- Orders currently use manual review. Stock is deducted when an admin approves an order and restored on cancellation. No payment provider is configured.
- Choose hosting and configure production HTTPS, persistent SQLite storage, backups and production credentials before deployment.
- Keep `.env`, `data/`, dependencies and extracted chat copies out of Git. Tests do not use the working database.
