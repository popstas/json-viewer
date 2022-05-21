# site-audit-seo-viewer

Web viewer for [site-audit-seo](https://github.com/viasite/site-audit-seo).

## Features:
- Show interactive table
- Focused on page info for site audit scans,
- But can prettify any table data in json format
- You can direct input json data into inline editor

## Demo:
- [Default report](https://viasite.github.io/json-viewer/?url=https://site-audit.viasite.ru/reports/blog.popstas.ru-default.json)
- [Lighthouse report](https://viasite.github.io/json-viewer/?url=https://site-audit.viasite.ru/reports/blog.popstas.ru-lighthouse.json)
- [Default + Basic Lighthouse report](https://viasite.github.io/json-viewer/?url=https://site-audit.viasite.ru/reports/blog.popstas.ru-default-plus-lighthouse.json)

## TODO
- show diff between reports
- Don't show empty fields
- Scan server don't really changing, due websockets server in nuxt.config.js
- Feature: cancel current scan
