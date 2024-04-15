#!/bin/bash
set -eu

rm -rf dist

SERVER_URL="https://site-audit-server-stable.popstas.ru" \
FRONTEND_URL="https://popstas.github.io/json-viewer" \
SCAN_DEFAULT_MAX_REQUESTS=50 \
npm run generate

cd dist
git init
git add -A
git commit -m "deploy"
git remote add origin git@github.com:popstas/json-viewer.git
git push --force origin master:gh-pages
cd ..
