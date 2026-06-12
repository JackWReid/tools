# CLAUDE.md

## What this is

A monorepo of public vibe-coded tools, deployed as a single static site to Cloudflare Pages at `tools.really.lol`. Each subproject lives in its own directory and is served at `/<project-name>/`.

## Access

This site is **public** — it is NOT behind Cloudflare Access. Anything deployed here is world-readable, so do not put confidential information here. (For private tools, use the sibling `tools-private` repo, which is gated by Cloudflare Access.)

## Build

```
bun run build
```

This runs `build.sh`, which builds each subproject and copies outputs into a unified `dist/` directory. The root `index.html` is a simple landing page linking to each project.

## Stack conventions

- **bun** for package management and scripts
- Each subproject has its own `package.json` and dependencies, so stacks can differ per tool
- Existing tools: React + Vite. Svelte 5 + Vite is also fine if preferred (see `tools-private`)

## Adding a new project

1. Create the project directory at the repo root (e.g. `my-tool/`)
2. Set the Vite `base` option to `/<project-name>/` so asset paths resolve correctly:
   - Plain Vite: `base: '/my-tool/'` in `vite.config.js`
   - SvelteKit: `paths: { base: '/my-tool' }` in `svelte.config.js`
3. Add a build step in `build.sh`:
   ```bash
   echo "Building my-tool..."
   (cd my-tool && bun install --frozen-lockfile && bun run build)
   cp -r my-tool/dist dist/my-tool   # use build/ instead of dist/ for SvelteKit
   ```
4. Add a link in `index.html`
5. Add a line to the Projects section in `README.md`
