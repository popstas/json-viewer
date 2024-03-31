# json-viewer

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

## Environment variables:
- NUXT_PUBLIC_JSON_URL
- NUXT_PUBLIC_SERVER_URL
- NUXT_PUBLIC_SCAN_DEFAULT_MAX_REQUESTS
- NUXT_PUBLIC_NO_FOOTER
- NUXT_PUBLIC_NO_LOGIN
- NUXT_PUBLIC_NO_FILTERS
- NUXT_PUBLIC_NO_TOUR
- NUXT_PUBLIC_NO_NAVIGATION

## TODO:
- show diff between reports
- Don't show empty fields
- Scan server don't really change, due websockets server in nuxt.config.js
