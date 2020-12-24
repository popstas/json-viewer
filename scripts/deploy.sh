#!/bin/bash
set -eu

rm -rf dist
SERVER_URL="https://site-audit-server.popstas.ru" npm run generate
cd dist
git init
git add -A
git commit -m "deploy"
git remote add origin git@github.com:viasite/site-audit-seo-viewer.git
git push --force origin master:gh-pages
cd ..
