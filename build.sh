#!/usr/bin/env bash
set -euo pipefail

rm -rf dist
mkdir -p dist

# world-cup-2026 (Vite — outputs to dist/)
echo "Building world-cup-2026..."
(cd world-cup-2026 && bun install --frozen-lockfile && bun run build)
cp -r world-cup-2026/dist dist/world-cup-2026

# Root index page
cp index.html dist/index.html

echo "Build complete — output in dist/"
