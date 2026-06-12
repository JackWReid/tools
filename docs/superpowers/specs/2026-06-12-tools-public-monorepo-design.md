# tools/ — public vibecoded tools monorepo

**Date:** 2026-06-12

## Purpose

Create a public counterpart to the existing `tools-private` repo. `tools/` is a monorepo of vibe-coded static tools deployed to `tools.really.lol`, with **no Cloudflare Access** — everything here is world-readable. The first tool is a deployed version of a Claude artefact: the FIFA World Cup 2026 group stage schedule.

## Architecture

Mirrors `tools-private`: a monorepo where each tool is an independent buildable subproject. `build.sh` builds each subproject and copies its output into a unified `dist/`, alongside a root landing page. The result is deployed to Cloudflare Pages.

Key difference from `tools-private`: this site is **public**, not gated by Cloudflare Access. Documented in CLAUDE.md and README so nothing confidential lands here.

## Root files

- `package.json` — `"build": "bash build.sh"`
- `build.sh` — builds `world-cup-2026`, copies its `dist/` → `dist/world-cup-2026`, copies root `index.html`
- `index.html` — public landing page linking to each tool, titled `tools`
- `wrangler.toml` — `name = "tools"`, assets dir `./dist`
- `.gitignore`, `CLAUDE.md`, `README.md`

## world-cup-2026 subproject

React + Vite (the first non-Svelte tool; per-project dependencies make mixed stacks fine in this monorepo model).

- `vite.config.js` — `@vitejs/plugin-react`, `base: '/world-cup-2026/'`
- `package.json` — react, react-dom, vite, @vitejs/plugin-react
- `index.html` → `src/main.jsx` → renders `App.jsx` into `#root`
- `src/App.jsx` — the artefact verbatim; its default export (`WorldCup`) is the app
- `src/main.jsx` — `createRoot` mount under `StrictMode`

The artefact is self-contained (inline styles, no external deps), so it ports without modification.

## Deployment

Cloudflare Pages:
- Build command: `bash build.sh`
- Output directory: `dist`
- Auth: none (public)

Each tool served at `tools.really.lol/<project-name>/`.

## Verification

- `bun install` + `bun run build` in `world-cup-2026/` succeeds
- Root `bun run build` produces `dist/world-cup-2026/index.html`
- Built asset paths resolve under the `/world-cup-2026/` base
