#!/bin/bash
# deprecated, now using github actions for deploy
set -eu

rm -rf dist

NUXT_PUBLIC_SERVER_URL="https://site-audit-server-public.popstas.pro" \
NUXT_PUBLIC_SCAN_DEFAULT_MAX_REQUESTS=0 \
npm run generate

cd dist
git init
echo "json-viewer.popstas.pro" > CNAME
git add -A
git commit -m "deploy"
git remote add origin git@github.com:popstas/json-viewer.git
git push --force origin master:gh-pages
cd ..
