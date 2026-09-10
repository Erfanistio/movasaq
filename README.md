# Movasaq / موثق

Persian RTL website for موسسه حفاظتی مراقبتی موثق, built with React, Vite, Express and SQLite. Includes public content, services, training, a store with manually reviewed orders, request tracking, certificate verification and an admin CMS.

## Continue on another Windows computer

Install Git and Node.js 24 or newer (the server uses `node:sqlite`). In PowerShell:

```powershell
git clone https://github.com/Erfanistio/movasaq.git
cd movasaq
npm.cmd ci
Copy-Item .env.example .env
notepad .env
```

Set `ADMIN_PASSWORD` to a unique password of at least 12 characters, then run:

```powershell
npm.cmd run dev
```

Open http://localhost:5173. The API runs on port 3001. Administrator login is at `/admin`, using `ADMIN_USERNAME` and `ADMIN_PASSWORD` from `.env`. To reset the stored password after initial setup, run `npm.cmd run admin:password`.

For a production build, run `npm.cmd run build`, then `npm.cmd start`. The production build and automated API/browser workflows have been checked. Deployment configuration and official company content remain to be completed.

## Working context

Read `docs/CONTINUE.md` before continuing development. The project chat archive is published at `docs/chat-archive/Movasaq-Windows-Transfer.zip`. Extract it to `.device-transfer/` in this checkout so Codex can read the transcripts.

Local secrets, dependencies and the `data/` SQLite directory are excluded from Git. A new checkout starts with seeded content. Existing live data must be transferred separately with the server stopped. No local database or `.env` was present when this handoff was prepared.

## Tests

Run `npm.cmd test` for isolated API workflow tests. After `npm.cmd run build`, run `npm.cmd run test:browser` for desktop and mobile checks using installed Google Chrome. Browser tests start a temporary server on port 3101 with an in-memory database and generated credentials.
