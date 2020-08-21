#!/bin/bash
set -eu

rm -rf dist
base=/site-audit-seo/ npm run generate
cd dist
git init
git add -A
git commit -m "deploy"
git remote add origin git@github.com:viasite/site-audit-seo.git
git push --force origin master:gh-pages
cd ..
