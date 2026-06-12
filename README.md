# Public tools directory

A catch-all repo for vibe-coded tools that can be public. These are the ones that contain no confidential information and are fine for anyone to see. (Private tools live in the sibling `tools-private` repo, behind Cloudflare Access.)

## Projects
- `world-cup-2026` — FIFA World Cup 2026 group stage schedule, with my-teams highlighting and filters by team, group, and venue. React, Vite.

## Deployment

All projects are built into a single static site and deployed to Cloudflare Pages at `tools.really.lol`. The site is **public** — no Cloudflare Access.

```
bun run build    # builds all subprojects into dist/
```

Each project is served at its own path: `tools.really.lol/<project-name>/`.

**Cloudflare config:**
- Build command: `bash build.sh`
- Output directory: `dist`
- Auth: none (public)
