<!-- .github/copilot-instructions.md for kwp-doconline -->
# Copilot / AI Agent Instructions — kwp-doconline

This file contains concise, actionable guidance to help an AI coding agent be productive in this repository.

Summary (big picture)
- Frontend: React app built with Vite in `src/` (entry: `src/main.jsx`). Uses Ant Design, Radix, and Tailwind utilities.
- Backend: Google Apps Script (GAS) code lives in `gas/` (not a typical Node server). Primary server-side logic is in `gas/api.js` and interacts with Google Sheets & Drive.
- Deploy flow: `vite build` → `inline.js` (embeds built JS/CSS into `gas/js.html` & `gas/css.html`) → `clasp push` (pushes GAS project). See `package.json` `deploy` script.

Key commands
- `npm run dev` — start Vite dev server (local frontend development, HMR).
- `npm run build` — produce production build into `dist/`.
- `npm run deploy` — runs `vite build && node inline.js && clasp push`. Requires `clasp` authenticated.
- `npm run lint` — run ESLint across the project.

Important files to inspect when making changes
- `package.json` — npm scripts and dependency list (see `deploy` script).
- `inline.js` — critical: takes assets from `dist/assets` and writes `gas/js.html` and `gas/css.html` used by GAS.
- `gas/api.js` — GAS server-side functions that read/write Google Sheets and Drive. Many functions return JSON strings (e.g. `getSheetData`, `putTeachMem`). Be careful: folder IDs and sheet names are often hard-coded.
- `gas/appsscript.json` — GAS project config (timeZone, webapp access).
- `src/main.jsx`, `src/routes.js` — app entry and routing; useful to understand navigation and page components.
- `src/pages/*` — page components (React + some TSX components). Example: `src/pages/TabsTechMem.jsx` composes Ant Design Tabs and imports `TechMem`, `ViewTMem`, etc.
- `vite.config.ts` — sets `@` alias to `src/` (use `@/` when suggesting imports).

Project-specific conventions & patterns
- GAS functions: server code is not a Node backend — it's Apps Script. Many functions return serialized JSON strings (e.g. `JSON.stringify(obj)`). When changing GAS endpoints, update the client calls accordingly.
- Deployment embeds assets into `gas/*.html`: the deploy process expects the latest hashed `dist/assets/*.js` and `*.css` — `inline.js` picks the latest asset file by name. Do not change asset filename patterns without updating `inline.js`.
- Hard-coded Drive/Sheet IDs: `gas/api.js` contains fixed folder IDs and sheet names. Treat these as sensitive/hard-to-change values — verify before edits.
- Mixed filetypes: codebase mixes `.jsx`, `.tsx`, and `.js`. Be cautious about types and default imports when editing.
- UI library patterns: uses Ant Design components and Radix/utility components in `src/components/ui/` — follow existing component props and naming conventions.
- Import alias: use `@/path/to/file` when proposing imports (configured in `vite.config.ts`).

Integration points & external deps
- Google Apps Script (GAS) — deployed via `clasp` (CLI). Ensure `clasp` is installed and authenticated before running deploy.
- `gas-client` is present in `package.json`; frontend may rely on client wrappers for calling GAS endpoints.
- Spreadsheet & Drive APIs are used inside `gas/api.js` via `SpreadsheetApp`, `DriveApp`, `Utilities`.

Developer workflow notes for agents
- Local dev: `npm run dev` — iterate on UI. GAS changes are not live until you `npm run deploy` (build + inline + clasp push).
- To test an integrated change (frontend ↔ GAS): build (`npm run build`), run `node inline.js` and then `clasp push` (or use `npm run deploy`).
- Linting: keep code consistent with existing ESLint config. Run `npm run lint` before proposing broad changes.

Examples to reference in PRs/changes
- When adding a new frontend page, update `src/routes.js` and place page component in `src/pages/`.
- When adding a new GAS endpoint, add function to `gas/api.js` and ensure any client code calls the correct function name. Keep JSON stringification consistent.
- If you change asset generation or filenames (Vite config), update `inline.js` to find and inline the correct files.

Safety & non-obvious cautions
- DO NOT remove or modify `gas/` folder layout without confirming deploy implications — changes affect the deployed webapp.
- Sensitive IDs: `gas/api.js` contains folder IDs. Avoid committing real secrets into the repo if they should be rotated.
- There is no separate Node server — do not introduce server-only Node APIs expecting server runtime on deployment.

If something is ambiguous
- Ask for clarification about which GAS project / Drive folder IDs are safe to change.
- If proposing changes to the deploy flow, run the build + inline locally and verify `gas/js.html` and `gas/css.html` are created.

Next step
- I created/updated this file from the repo snapshot. Tell me which sections you want expanded (examples, more file references, or a developer checklist) and I will iterate.
