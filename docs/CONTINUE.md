# Development handoff — 2026-09-10

## Requested product

Build a Persian RTL React website for موسسه حفاظتی مراقبتی موثق, inspired by https://harimimen.com/, with reusable components, all main public page types, an admin content panel, a self-defence equipment store, and courses/certificates related to پلیس یار. The supplied regulation is in `public/regulations.txt`.

## Current implementation

- React routes and reusable components are in `src/`; navy/gold responsive styles are in `src/styles.css`.
- Express routes, administrator authentication, SQLite storage and seed content are in `server/`.
- Public workflows include services, training, store/cart, applications, tracking and certificate verification.
- Orders use manual review; no payment provider is configured.
- The original build task was interrupted while resolving dependency installation problems. Do not assume the application is fully tested or production-ready.

## Next work

1. Install dependencies successfully and commit the resulting package lockfile.
2. Build and run the app; investigate any installation or compilation errors.
3. Check desktop and mobile pages, admin login/editing, store/cart/orders, applications, tracking and certificates.
4. Add meaningful workflow tests. The `test` script currently targets `tests/*.test.js`, but no tests were present at handoff.
5. Check placeholder content and images, then complete the remaining implementation with the user.

## Chat continuity

The two project conversations are “Build Movassaq security website” and the GitHub/device-transfer task. `docs/chat-archive/Movasaq-Windows-Transfer.zip` contains their readable user/assistant transcripts as a point-in-time snapshot, published to this public repository at the user's request. Extract it under `.device-transfer/` in this project. The snapshot predates the final GitHub push confirmation and the request to publish the archive.

In Codex on the new computer, open the cloned folder and send:

> Read docs/CONTINUE.md and all chat transcripts in .device-transfer/. Continue the Movasaq website from its saved state, beginning with dependency installation, build verification, and checking the unfinished workflows.

The transcript archive supplies context to a new task; it is not a native sidebar-history import. Running processes and the active agent session have not been moved. Start the development server on the new computer using the README commands.
