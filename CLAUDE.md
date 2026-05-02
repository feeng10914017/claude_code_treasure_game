# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # install dependencies
npm run dev       # start dev server at http://localhost:3000 (auto-opens browser)
npm run build     # production build → build/ directory
```

There is no test runner configured.

## Architecture

This is a single-page React 18 + TypeScript game built with Vite. All game logic lives in `src/App.tsx` — there are no routes, no global state library, and no backend.

**Rendering flow**: `main.tsx` wraps `<App>` in `<AuthProvider>`. On load, the app waits for the SQLite DB to initialize (`isDbReady`), then shows `<AuthScreen>` if no user/guest session exists, then shows the game.

**Game mechanics**: Three treasure chests are rendered; one randomly holds treasure. Opening the treasure chest scores +$75; opening a skeleton chest scores -$50. The game ends when the treasure is found or all boxes are opened.

**Auth & database layer** (`src/contexts/AuthContext.tsx`, `src/db/database.ts`): SQLite runs entirely in-browser via sql.js (WASM). The `sql-wasm.wasm` file must be served from the server root (`/`) — this is already handled by Vite's `publicDir`. The database (tables: `users`, `game_scores`) is serialized to `localStorage` under the key `treasure_game_db` as base64 on every write. Passwords are hashed with SHA-256 via the Web Crypto API. Guest mode skips auth and never saves scores.

**Components**:
- `src/components/AuthScreen.tsx` — sign in / sign up tabs + guest mode entry
- `src/components/ScoreHistoryModal.tsx` — shows last 10 scores for the signed-in user
- `src/components/figma/ImageWithFallback.tsx` — image component with fallback for Figma-exported assets

**UI components**: `src/components/ui/` contains shadcn/ui-style wrappers around Radix UI primitives. These are pre-generated and should not need modification for game features.

**Styling**: Tailwind CSS v4 is pre-compiled into `src/index.css`. Design tokens (CSS custom properties) are defined in `src/styles/globals.css`. Use Tailwind utility classes directly in JSX; do not edit `src/index.css` by hand.

**Animations**: Uses `motion/react` (not `framer-motion`) — import as `import { motion } from 'motion/react'`.

**Assets**:
- `src/assets/` — chest images (`treasure_closed.png`, `treasure_opened.png`, `treasure_opened_skeleton.png`, `key.png`)
- `src/audios/` — sound effects (`chest_open.mp3`, `chest_open_with_evil_laugh.mp3`)
- `src/results/` — additional UI images (`key_hover.png`)

**Path alias**: `@` resolves to `src/` (configured in `vite.config.ts`).

**Build output**: `build/` (not the default `dist/`).

## Non-obvious quirks

**Vite version aliases**: `vite.config.ts` contains a large block of `'package@version': 'package'` aliases. These exist because the project was scaffolded with versioned import paths and the aliases normalize them. Do not remove them.

**WASM loading**: `sql.js` locates its WASM file via a `locateFile` callback that prepends `/`. Both `public/sql-wasm.wasm` and `public/sql-wasm-browser.wasm` must remain in `public/` to be served from the root.
