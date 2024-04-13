# [7.0.0](https://github.com/viasite/site-audit-seo-viewer/compare/v6.0.0...v7.0.0) (2024-04-13)


### Bug Fixes

* add lighthouse_scores_performance to Stats ([505f562](https://github.com/viasite/site-audit-seo-viewer/commit/505f56269572a926f33d1f30cee8ecb2d066d994))
* better scan start/stop indication ([f375ad9](https://github.com/viasite/site-audit-seo-viewer/commit/f375ad997bdff14e71c4a7c5d64b93cac2be4596))
* change url when change fields list ([6ba3e4a](https://github.com/viasite/site-audit-seo-viewer/commit/6ba3e4aad3f88a9d0bcaf4e0e03cb16ad9b5e9f3))
* extend perPageValues, add 10k, 20k ([af94c97](https://github.com/viasite/site-audit-seo-viewer/commit/af94c97dea82855ea82ffc0fec296d57e46d7958))
* fix empty table when click "remove all columns" just after page open ([d92dd1f](https://github.com/viasite/site-audit-seo-viewer/commit/d92dd1fa2fa6e2b221cc542e26d6b92d9e3f3bb7))
* limit url column to 300px ([489ee95](https://github.com/viasite/site-audit-seo-viewer/commit/489ee957b21031219f9d978a13603fcce4f4fa4e))


### Features

* featureScreenshot, onlyDomains, serverLoadPercent, node 14 -> 18, SCAN_DEFAULT_URL, fix: better finish scan, better scan form ([82b0190](https://github.com/viasite/site-audit-seo-viewer/commit/82b0190f848395d8b52192b051bab7aa83b32873))
* **report:** add accent validate, clean xlsx export, better fields formatting: numbers, dates, arrays, show scan date ([556f35e](https://github.com/viasite/site-audit-seo-viewer/commit/556f35ee63e338d32da23fc52b798891a127b657))
* **report:** rescan all urls in report ([8545e9a](https://github.com/viasite/site-audit-seo-viewer/commit/8545e9a07e41f29346c6a7227fa1ca3fdf56b061))
* **scan:** add items count, add Screenshot one page, update reports in while scanning ([1a221b1](https://github.com/viasite/site-audit-seo-viewer/commit/1a221b1eea999465cb52559b7c48eeca35a27492))
* **scan:** continue from partial report ([1ae59cd](https://github.com/viasite/site-audit-seo-viewer/commit/1ae59cd3c131bd7619899e4b95382fc3c4b3d0d2))
* rescanFiltered, remove monaco ([b25904b](https://github.com/viasite/site-audit-seo-viewer/commit/b25904bffa235424d0e179d6913be7bba4558ef6))
* urls_list: parse urls from json url. fix: limit urls in GET args ([a1cc681](https://github.com/viasite/site-audit-seo-viewer/commit/a1cc681198d52e48878cdfd66a85c9ee74801962))



# [6.0.0](https://github.com/viasite/site-audit-seo-viewer/compare/v5.2.0...v6.0.0) (2022-05-21)


### Bug Fixes

* disable open row on click ([6cc6312](https://github.com/viasite/site-audit-seo-viewer/commit/6cc63124d596ee12b6a50ed47921012cd57b5c6e))
* flags code ([c5b13ff](https://github.com/viasite/site-audit-seo-viewer/commit/c5b13ff2fd29b6d3a28e5c578bee05eb15e2425e))
* safe defaults for json fields, reportName, field.format=ago, defaultSort ([162841d](https://github.com/viasite/site-audit-seo-viewer/commit/162841d692d8b89e895d4559dbd9999078bc0563))
* working relative url for images ([ec85f7a](https://github.com/viasite/site-audit-seo-viewer/commit/ec85f7acb65a2ba23b8ce792d470d3f623b5e368))


### Features

* button for full navigation when flags.navigation == false ([d619664](https://github.com/viasite/site-audit-seo-viewer/commit/d619664746e8e5ccc42dc8bf266a448ef5f895ef))
* direct input json for table ([404f53b](https://github.com/viasite/site-audit-seo-viewer/commit/404f53b97f1c69bedd32f244be4c7926516eb149))
* favicon ([f958e2d](https://github.com/viasite/site-audit-seo-viewer/commit/f958e2dfbe29f4d84ea95a7eaef6e3950544af67))
* feature flags, disable interface parts ([a65de65](https://github.com/viasite/site-audit-seo-viewer/commit/a65de656ae9cb28f79fa7f82f361e929bc07e0b2))
* field.href attr that point to href field, default row.href ([50efccd](https://github.com/viasite/site-audit-seo-viewer/commit/50efccdc44335609d4990d50eab58d0aa3626e78))
* field.type = date ([171a038](https://github.com/viasite/site-audit-seo-viewer/commit/171a03801139d36c8b237ba2891a0e8efc1caae6))
* field.type = url ([57ec1c4](https://github.com/viasite/site-audit-seo-viewer/commit/57ec1c42b6357d7f7512a93a0c4a94617ee19b2a))
* filtered stats: type = 'sum' ([8dedc24](https://github.com/viasite/site-audit-seo-viewer/commit/8dedc246103a5dd58652f2988a071e5f2d9c5147))
* filters for columns, types: email, phone, domain ([42d9661](https://github.com/viasite/site-audit-seo-viewer/commit/42d96611bb5114699b0d812752bd186780aea1fc))
* rename site-audit-seo-viewer to json-viewer ([78ed024](https://github.com/viasite/site-audit-seo-viewer/commit/78ed024cd7a462ce509c9d58a2564a838574ec6e))
* treat json array as table ([2a7b9a7](https://github.com/viasite/site-audit-seo-viewer/commit/2a7b9a7ba0be328350f5a947cd1c80b9eabd227c))



# [5.2.0](https://github.com/viasite/site-audit-seo-viewer/compare/v5.1.2...v5.2.0) (2021-05-21)


### Bug Fixes

* **reports:** table was freezed after change columns, add indicator ([e0a2fec](https://github.com/viasite/site-audit-seo-viewer/commit/e0a2fec4464aeb7c3b8b6a7717d2e258307b5e06))
* **scan:** show item history with user timezone ([ff3e422](https://github.com/viasite/site-audit-seo-viewer/commit/ff3e422adfde241d68e00aa054942398c27961e0))


### Features

* column controls above columns ([038b079](https://github.com/viasite/site-audit-seo-viewer/commit/038b079453b7d9fa55ba821d918d910ee766b409))
* connection state, cancel indicator, better reconnection ([816f6d9](https://github.com/viasite/site-audit-seo-viewer/commit/816f6d9eca1f06217e9d5f7058d196f22d7462e2))



## [5.1.2](https://github.com/viasite/site-audit-seo-viewer/compare/v5.1.1...v5.1.2) (2021-04-21)


### Bug Fixes

* remove test history items ([dcdf196](https://github.com/viasite/site-audit-seo-viewer/commit/dcdf196ec78f5849c78f3a599a55ea8f722676da))



## [5.1.1](https://github.com/viasite/site-audit-seo-viewer/compare/v5.1.0...v5.1.1) (2021-04-21)


### Features

* show server version ([cfc3e35](https://github.com/viasite/site-audit-seo-viewer/commit/cfc3e35e5b90afe150b716ba8dc591e54e82658d))



# [5.1.0](https://github.com/viasite/site-audit-seo-viewer/compare/v5.0.0...v5.1.0) (2021-04-21)


### Features

* run=1, autoscan url ([6124238](https://github.com/viasite/site-audit-seo-viewer/commit/61242387e1fca369be7f834201ea44442fb2e191))
* scan history list ([de91246](https://github.com/viasite/site-audit-seo-viewer/commit/de912465b7606a88c8d914984ed0a121ada0def5))
* show report scan time ([dd082a2](https://github.com/viasite/site-audit-seo-viewer/commit/dd082a27ac3cefe8ebcd970f770f0b7366f1d044))
* **scan:** scan presets, you can save settings to localStorage ([1f81b58](https://github.com/viasite/site-audit-seo-viewer/commit/1f81b585836f495323c195d04aee6f128cefbc22))



# [5.0.0](https://github.com/viasite/site-audit-seo-viewer/compare/v4.3.0...v5.0.0) (2021-03-13)


### Bug Fixes

* fixed table of contents menu in item details ([26ceff3](https://github.com/viasite/site-audit-seo-viewer/commit/26ceff36991a3beec243a46cd84e3a447fe32d03))
* human names in "current columns" panel ([5c117e2](https://github.com/viasite/site-audit-seo-viewer/commit/5c117e2e854d329acfe33b2e0afe9d3e22997bcb))
* item details max width 800px ([518ba80](https://github.com/viasite/site-audit-seo-viewer/commit/518ba805c11a5807613b255dc68870c3f26300d1))


### Features

* **reports:** interactive item details navigation ([670af9c](https://github.com/viasite/site-audit-seo-viewer/commit/670af9c127c71f3612aeda102985c0725d062a1a))
* **reports:** link for rescan with report options ([acba625](https://github.com/viasite/site-audit-seo-viewer/commit/acba625199acba86fe3bcaa77f60fd16a718719a))
* **reports:** new item details design, manual groups order ([5483445](https://github.com/viasite/site-audit-seo-viewer/commit/54834450b8cc6775cc647e3c5dda94fbf81d2b8f))
* **reports:** type "ranges" for "filtered stats" panel ([fd290cd](https://github.com/viasite/site-audit-seo-viewer/commit/fd290cd5b9d825f2be9fd33f922a9fbf7fbe2452))



# [4.3.0](https://github.com/viasite/site-audit-seo-viewer/compare/v4.2.0...v4.3.0) (2021-03-11)


### Bug Fixes

* **filters:** change url when toggle column in table ([7001632](https://github.com/viasite/site-audit-seo-viewer/commit/70016329b1475da044013f7cf734d83e598df564))
* **reports:** better field presets work while change report ([06b1eee](https://github.com/viasite/site-audit-seo-viewer/commit/06b1eee644412d394e01831ed1bc528fdb6bfa6e))


### Features

* **scan:** add "Report fields", override default fields in report ([87cddf7](https://github.com/viasite/site-audit-seo-viewer/commit/87cddf72d524ed332bb7063da56ce000ee1ec2d6))
* **scan:** add "Report query", override default query in report ([e7533de](https://github.com/viasite/site-audit-seo-viewer/commit/e7533ded047a6039a536fff462d96ac081043637))
* **scan:** add controls for --url-list, --out-name ([f542bfa](https://github.com/viasite/site-audit-seo-viewer/commit/f542bfadc64d4cb5fa298afa848f19ca8a7d2941))



# [4.2.0](https://github.com/viasite/site-audit-seo-viewer/compare/v4.1.0...v4.2.0) (2021-03-10)


### Bug Fixes

* add css for readability_text ([18a52a6](https://github.com/viasite/site-audit-seo-viewer/commit/18a52a6ce060c71da546ce06011ab283dec951de))
* fix queue displey count ([b5e8229](https://github.com/viasite/site-audit-seo-viewer/commit/b5e822905d67a2ff33223e42c2d1b2fc86458091))
* **reports:** rearrange panels: explorer, current columns, stats, presets ([adc3fb1](https://github.com/viasite/site-audit-seo-viewer/commit/adc3fb1cfb92bf9f3be91b503a1bf70c168f76e3))
* **scan:** remove color from url/urls switch ([8d26d47](https://github.com/viasite/site-audit-seo-viewer/commit/8d26d4767870e3c58ca127f3414e72fc6e963b1b))
* **scan:** switch to site-audit-server-stable.popstas.ru ([60c9051](https://github.com/viasite/site-audit-seo-viewer/commit/60c9051ef64e0684a7979fa3f4607ffcc3767d03))
* focus on scan button, then on report button ([2f1596a](https://github.com/viasite/site-audit-seo-viewer/commit/2f1596a42c36c9800757f8b11d9dbaa63695ed0e))


### Features

* cancel command ([1431bf3](https://github.com/viasite/site-audit-seo-viewer/commit/1431bf346b8d9ea0153310d77aca82b9f13cf823))
* restore connection with running scan job ([8e676de](https://github.com/viasite/site-audit-seo-viewer/commit/8e676de7dfc2a2c5a7b2b2c4ef4eae218158f6ff))
* show animated loader ([74a82a0](https://github.com/viasite/site-audit-seo-viewer/commit/74a82a07b3a7338848a5a7c7d3718ac4ca2b5fe8))
* **scan:** loader spinner while scan ([251bc88](https://github.com/viasite/site-audit-seo-viewer/commit/251bc88b45f5909f4798da81064a78bae99e9449))



# [4.1.0](https://github.com/viasite/site-audit-seo-viewer/compare/v4.0.0...v4.1.0) (2020-12-29)


### Bug Fixes

* monospace font for args input ([02c0399](https://github.com/viasite/site-audit-seo-viewer/commit/02c039912cb6608a01b160e15f380566f6b8875b))
* **reports:** fix sticky table header ([9ea05bd](https://github.com/viasite/site-audit-seo-viewer/commit/9ea05bd8c30ea66fff8d95ac9ee39acfe0460a05))
* **reports:** remove og:image column on mobile by default ([6863da7](https://github.com/viasite/site-audit-seo-viewer/commit/6863da7de4185f3edc132875d34db5cb34c02304))
* **scan:** fix mobile styles ([81a6be2](https://github.com/viasite/site-audit-seo-viewer/commit/81a6be2d373f2952857fb99ddf03aa0b371c6bce))


### Features

* **reports:** show item details when 1 item in table ([f257109](https://github.com/viasite/site-audit-seo-viewer/commit/f257109008bc68fbcf342c62b70705308a4ee76b))
* **scan:** add secondary scan buttons after settings ([277d96a](https://github.com/viasite/site-audit-seo-viewer/commit/277d96ac77c2731138d22c990ed4d96235ecf1ca))
* **scan:** show pending status in progress ([a3df690](https://github.com/viasite/site-audit-seo-viewer/commit/a3df690b145983745267a02d0bc92ecbccd413de))



# [4.0.0](https://github.com/viasite/site-audit-seo-viewer/compare/v3.2.3...v4.0.0) (2020-12-29)


### Features

* **scan:** new UI, more user friendly ([3aaf219](https://github.com/viasite/site-audit-seo-viewer/commit/3aaf219d9f8dc3ce2786ecf33ab584f94f6220b4))



## [3.2.3](https://github.com/viasite/site-audit-seo-viewer/compare/v3.2.2...v3.2.3) (2020-12-28)


### Features

* **scan:** show last report link, fix titles ([ff9b854](https://github.com/viasite/site-audit-seo-viewer/commit/ff9b854bb24a52b69583813d4b9cbfacef62bbdb))



## [3.2.2](https://github.com/viasite/site-audit-seo-viewer/compare/v3.2.1...v3.2.2) (2020-12-28)


### Features

* show not default args ([17e4441](https://github.com/viasite/site-audit-seo-viewer/commit/17e44419519d0881b7533a1dc46e34e401f5e759))



## [3.2.1](https://github.com/viasite/site-audit-seo-viewer/compare/v3.1.1...v3.2.1) (2020-12-27)


### Bug Fixes

* change favicon (remove paddings) and big icon (add paddings) ([bca740e](https://github.com/viasite/site-audit-seo-viewer/commit/bca740e4b70c90301a9122bebbeb0478d1d509a6))


### Features

* **scan:** autocomplete url from history ([d2bb1e0](https://github.com/viasite/site-audit-seo-viewer/commit/d2bb1e0facca901d1954a28f05a9992938382883))
* PWA, change icon and meta ([6e53596](https://github.com/viasite/site-audit-seo-viewer/commit/6e535960114ce4de0b7038a5e12083d5226634cb))
* **scan:** "Lighthouse one page" button ([685401f](https://github.com/viasite/site-audit-seo-viewer/commit/685401fba5f73012a1938f7b6dcde2e797ec1be6))
* **scan:** connections stats ([0b9203a](https://github.com/viasite/site-audit-seo-viewer/commit/0b9203aa04eb84e124f29edbe6c8e47e99de592b))



## [3.1.1](https://github.com/viasite/site-audit-seo-viewer/compare/v3.1.0...v3.1.1) (2020-12-26)


### Features

* **scan:** more server stats: reboots, uptime, all time scans, pages ([abeef2e](https://github.com/viasite/site-audit-seo-viewer/commit/abeef2ee8d3f30d1942e935a4ebbb95cac9187cc))



# [3.1.0](https://github.com/viasite/site-audit-seo-viewer/compare/v3.0.2...v3.1.0) (2020-12-26)


### Bug Fixes

* **scan:** close settings on scan ([e29880a](https://github.com/viasite/site-audit-seo-viewer/commit/e29880a7ad42c5c2f7814fc8f20db5f9743fce4b))



## [3.0.2](https://github.com/viasite/site-audit-seo-viewer/compare/v3.0.1...v3.0.2) (2020-12-25)


### Bug Fixes

* link to changelog in footer, fix login link, fix header on mobile ([5b6d4ed](https://github.com/viasite/site-audit-seo-viewer/commit/5b6d4ed3c8c3a7b01f9fc62c402cf79bc9e11981))
* persistent scan log ([32b4841](https://github.com/viasite/site-audit-seo-viewer/commit/32b4841505be90edd81eaf2309a04d02fa401a4c))


### Features

* **scan:** add main scan settings to ui ([fc41d6f](https://github.com/viasite/site-audit-seo-viewer/commit/fc41d6fbfc2735eec886552a7bc7c547a8c8b9cf))
* **scan:** scan url list, --urls ([d2db4a3](https://github.com/viasite/site-audit-seo-viewer/commit/d2db4a36b26cbdba83316e10be7c8e6f3906e62d))



## [3.0.1](https://github.com/viasite/site-audit-seo-viewer/compare/v3.0.0...v3.0.1) (2020-12-24)


### Bug Fixes

* **reports:** show report history when 1 result, shorten current report name ([d156307](https://github.com/viasite/site-audit-seo-viewer/commit/d1563072a6ce537caef6c593cd52d969c46d38b9))
* don't add default filter inGET params ([5f6a15d](https://github.com/viasite/site-audit-seo-viewer/commit/5f6a15d7956259a13cc0a475a869bb7cc28f7139))



# [3.0.0](https://github.com/viasite/site-audit-seo-viewer/compare/v2.7.2...v3.0.0) (2020-12-24)


### Bug Fixes

* **view:** remove default json url from GET params ([512b67d](https://github.com/viasite/site-audit-seo-viewer/commit/512b67d65f45763fb28cff51c7f33535be5ce7f0))
* better report filename ([ab3c892](https://github.com/viasite/site-audit-seo-viewer/commit/ab3c892a3996eefb51db55f79117258d086d0337))
* **scan:** better auth on connect/reconnect ([5771a27](https://github.com/viasite/site-audit-seo-viewer/commit/5771a27344ce67487708d12f1a4d9f1b53e88cef))
* footer paddings ([9b98c0a](https://github.com/viasite/site-audit-seo-viewer/commit/9b98c0a49c0316faaffb0ca0f8400fc6becb5b13))
* terminal output not always autoscroll ([2b33ae6](https://github.com/viasite/site-audit-seo-viewer/commit/2b33ae64280623e2c5d408157b4463ea9093ab30))


### Features

* Multiple UI improvements ([e630fb5](https://github.com/viasite/site-audit-seo-viewer/commit/e630fb5b8c6b028ef300cc14eb6580cb18df486b))
* **scan:** autoreconnect to server ([09ed24d](https://github.com/viasite/site-audit-seo-viewer/commit/09ed24d43771917d3e289decc5f8c78e58774eb2))
* better url history for viewer and scan ([7aef86d](https://github.com/viasite/site-audit-seo-viewer/commit/7aef86d2734091dff418ac9e9f94fbc969f844e5))
* save reports to user directories ([9a39031](https://github.com/viasite/site-audit-seo-viewer/commit/9a39031d381506a71dd675ac708f374b59e95974))
* **scan:** add menu, add scanned results to history ([923edc0](https://github.com/viasite/site-audit-seo-viewer/commit/923edc01e08179e085a9a54577c7e58711d34713))
* **scan:** add server url to form ([150b4c7](https://github.com/viasite/site-audit-seo-viewer/commit/150b4c7122f60fc86604bc0c133f74507895193d))
* **scan:** google auth, server state ([992c687](https://github.com/viasite/site-audit-seo-viewer/commit/992c687172cdb169714ad65492c2527489a64013))
* **scan:** SERVER_URL env ([60ea490](https://github.com/viasite/site-audit-seo-viewer/commit/60ea490d422742588009b1804056b8cdf1625d9e))
* **scan:** store form values in local storage ([030e30d](https://github.com/viasite/site-audit-seo-viewer/commit/030e30dbfabea4746ceac7c18afaf08033a18ca9))
* **scan:** total scanned ([13070de](https://github.com/viasite/site-audit-seo-viewer/commit/13070de12138d382c7f2b86b1e85b9cd6957b9d0))
* scan: autoscroll chat, oneline form ([47185fb](https://github.com/viasite/site-audit-seo-viewer/commit/47185fb89cde4461774f4d11b4430242b9c8b645))
* working docker-compose ([87a1faa](https://github.com/viasite/site-audit-seo-viewer/commit/87a1faaf0df8b21e778f3c23e2214ea883ac4803))



## [2.7.2](https://github.com/viasite/site-audit-seo-viewer/compare/v2.7.1...v2.7.2) (2020-11-10)


### Bug Fixes

* hide report history if < 2 in history ([31f478e](https://github.com/viasite/site-audit-seo-viewer/commit/31f478e75e4108fa191064548d4ec6e740573204))


### Features

* add icons to panels ([ef65fb6](https://github.com/viasite/site-audit-seo-viewer/commit/ef65fb645f7e05c735254bdbd632c320a4c48a6e))
* default filter ([5f2bca0](https://github.com/viasite/site-audit-seo-viewer/commit/5f2bca0dd8b62536e579540424cd1e2659253418))
* store sort in filter preset.sort ([689f0e9](https://github.com/viasite/site-audit-seo-viewer/commit/689f0e9419a5fd7c68a90c6a50821752af461494))



## [2.7.1](https://github.com/viasite/site-audit-seo-viewer/compare/v2.7.0...v2.7.1) (2020-10-09)


### Bug Fixes

* view mode fixes ([ffe27f7](https://github.com/viasite/site-audit-seo-viewer/commit/ffe27f78f4b08b055b62c50169395c82057a86d8))


### Features

* store json url and sort in url ([1540ee4](https://github.com/viasite/site-audit-seo-viewer/commit/1540ee44e8847ff2e7524572f1fe3c6f392973d5))



# [2.7.0](https://github.com/viasite/site-audit-seo-viewer/compare/v2.6.0...v2.7.0) (2020-10-09)


### Features

* collaplible panel, for filtered stats and current columns ([7e4b9f7](https://github.com/viasite/site-audit-seo-viewer/commit/7e4b9f78db29e1506fa272f6890c0b395b747166))
* define sort with url: &sort=request_time,- ([3b37002](https://github.com/viasite/site-audit-seo-viewer/commit/3b37002a161c257e87d87c4200f33df14913a21d))
* hyperlinks for 'url' fields ('url' in field name) ([c7f18b2](https://github.com/viasite/site-audit-seo-viewer/commit/c7f18b29e5e5d4cc3b99a25007c526b4177c4037))
* move all to collapsible panels ([1f2bc38](https://github.com/viasite/site-audit-seo-viewer/commit/1f2bc38855015b310d4072042b11d4103fa127b0))



# [2.6.0](https://github.com/viasite/site-audit-seo-viewer/compare/v2.5.0...v2.6.0) (2020-09-23)


### Bug Fixes

* limit width of first column (url) ([af2ee72](https://github.com/viasite/site-audit-seo-viewer/commit/af2ee728be6f626e524566a5db046ed29916e49a))
* view mode fixes ([a2f673c](https://github.com/viasite/site-audit-seo-viewer/commit/a2f673c22a69fedc75d812686a77f65e4d14e65d))


### Features

* display mode: view (without fields list) ([ef880e6](https://github.com/viasite/site-audit-seo-viewer/commit/ef880e60b51e8bd146888f7526d4f4f5e9f684d5))



# [2.5.0](https://github.com/viasite/site-audit-seo-viewer/compare/v2.4.0...v2.5.0) (2020-09-03)


### Bug Fixes

* don't show counter on filters in table stats ([e6a7f48](https://github.com/viasite/site-audit-seo-viewer/commit/e6a7f489a1baba11f05d1e2e4038efe376224d3f))
* format 12345 as 12 345 ([6c5f594](https://github.com/viasite/site-audit-seo-viewer/commit/6c5f594c73c3849e3f32c0229901cb65feb580d0))
* items in report history as links, for open in new tab ([e3a18e0](https://github.com/viasite/site-audit-seo-viewer/commit/e3a18e090ed766378a30d8fc41bdefd3fcc7d086))
* move current columns after table stats ([3409e77](https://github.com/viasite/site-audit-seo-viewer/commit/3409e773bf708cb4c4abe2fc1c2b0c13c9236c43))
* never validate empty cells (except zero) ([e07b95a](https://github.com/viasite/site-audit-seo-viewer/commit/e07b95a71312697d9a59be3bce39b7521badce87))
* pretty stats table: filters and alerts by grid ([d59baf3](https://github.com/viasite/site-audit-seo-viewer/commit/d59baf303262d2dfd6843039dfb3ee455a50afe6))
* yes/no in table stats for boolean fields ([8214c0c](https://github.com/viasite/site-audit-seo-viewer/commit/8214c0ce4c46ee50776e3ca84e35e8751575e502))


### Features

* filterable report select ([e39d868](https://github.com/viasite/site-audit-seo-viewer/commit/e39d8681bfc3763b6b211aefd868bac7a3a96939))
* filters in table stats enum values ([bacb32c](https://github.com/viasite/site-audit-seo-viewer/commit/bacb32ca2a3352f39bb16566b68e4e1b2bbe9ab4))
* hide duplicated fields in ItemDetails ([6005cbd](https://github.com/viasite/site-audit-seo-viewer/commit/6005cbd6c0a2a7ceaeb630fe5cfbfe6c0ac8e288))
* show human columns ([08d41c8](https://github.com/viasite/site-audit-seo-viewer/commit/08d41c8d62afb87d65cce6f4a59f36f675b16082))



# [2.4.0](https://github.com/viasite/site-audit-seo-viewer/compare/v2.3.0...v2.4.0) (2020-08-24)


### Bug Fixes

* add table stats to tour ([aec3b1a](https://github.com/viasite/site-audit-seo-viewer/commit/aec3b1afe04ff4c54b0c950f4b0ad53106713d0f))
* remove button after delete current report from history ([e197a38](https://github.com/viasite/site-audit-seo-viewer/commit/e197a383ebf7e790924aba16ba4966e13ac0a83e))


### Features

* highlight help tour for new users ([d0a1f26](https://github.com/viasite/site-audit-seo-viewer/commit/d0a1f26e000d9096965c5746e783916472026adf))
* reports history: sort by name/added/used ([c04b544](https://github.com/viasite/site-audit-seo-viewer/commit/c04b544a022bb82dd9101201be28c753c9f390ff))
* sort last reports by url (was by added date) ([df6105e](https://github.com/viasite/site-audit-seo-viewer/commit/df6105e28c605e36ec8c34044f38fe3d0b9db7e8))
* **table stats:** average, non-unique, enum values for some fieldsfield names hardcoded ([d171498](https://github.com/viasite/site-audit-seo-viewer/commit/d171498603239fee0f6cc9fa513cd4f5bdb972c4))
* help tour ([892e3ce](https://github.com/viasite/site-audit-seo-viewer/commit/892e3cebabd41a48c5682ab734ea7ef76a4b5b0e))



# [2.3.0](https://github.com/viasite/site-audit-seo-viewer/compare/v2.2.2...v2.3.0) (2020-08-23)


### Bug Fixes

* align right for 'title' and all fields with align = right ([0a8b79b](https://github.com/viasite/site-audit-seo-viewer/commit/0a8b79bb04ae89a228903676e054c441a26cd0ea))
* better json loading ux ([2d6ec72](https://github.com/viasite/site-audit-seo-viewer/commit/2d6ec725c416fe26f8f0a44406e7a9f7d096bd24))
* better og_image view, use type = image for og_image ([7380b71](https://github.com/viasite/site-audit-seo-viewer/commit/7380b71594383a2d902e641270bc5c2e0bcef7c5))
* field names was broken ([bc0d2d8](https://github.com/viasite/site-audit-seo-viewer/commit/bc0d2d8d60b3a656ee1507f37f4e59889ed8332f))
* fix validate empty boolean fields (was as false) ([b261a37](https://github.com/viasite/site-audit-seo-viewer/commit/b261a370c098a0a3d4f9bb82dab3ec3360ed303a))
* icons for column operations buttons ([03cd719](https://github.com/viasite/site-audit-seo-viewer/commit/03cd7194b8b71e2beb7fa8a72755b7a20d71276d))


### Features

* better validation in ItemDetails ([4e8675e](https://github.com/viasite/site-audit-seo-viewer/commit/4e8675e848ab5f022ac11197522cb1f768ccd6a4))
* boolean in table, images in ItemDetails ([fddc9ea](https://github.com/viasite/site-audit-seo-viewer/commit/fddc9ea224ac70cc6980def672d1568f94e7925b))
* inactive filter when result is 0 ([0a27e65](https://github.com/viasite/site-audit-seo-viewer/commit/0a27e6589e5e0e0f7f4e0ff396a4bb7bea850534))
* mark filters as unique in SiteDetails ([a4384ca](https://github.com/viasite/site-audit-seo-viewer/commit/a4384cad11bac7c8dde3ae5a12bd65d25b6e83e1))
* share link to view current report ([c9d833f](https://github.com/viasite/site-audit-seo-viewer/commit/c9d833f3bd1e707d18713ab37a972810d7786a22))
* show current columns ([b9f01c7](https://github.com/viasite/site-audit-seo-viewer/commit/b9f01c774cb33c21eb1b1a0d4a8370ee5283fab7))
* show images as images ([9a5c538](https://github.com/viasite/site-audit-seo-viewer/commit/9a5c53889ce2f4f92ec3c854efd1c8e59ac85573))
* show ItemDetails on row click ([d0baf29](https://github.com/viasite/site-audit-seo-viewer/commit/d0baf292700b4fde35a798d0554a6fd9f7be6b75))



## [2.2.2](https://github.com/viasite/site-audit-seo-viewer/compare/v2.2.1...v2.2.2) (2020-08-23)


### Bug Fixes

* default table rows limit to 1000 (was too slow) ([20d7ed8](https://github.com/viasite/site-audit-seo-viewer/commit/20d7ed8bdfcd49e13bde4614e556a5fa463748d7))
* enable templates for all columns ([3f234c0](https://github.com/viasite/site-audit-seo-viewer/commit/3f234c039cebbc26c4211d8dec56c8a7d853fbcd))
* ignore non-string (legacy) field validate ([f443c74](https://github.com/viasite/site-audit-seo-viewer/commit/f443c746c4d63a967ca347bbcff941ad809411fe))
* value convert for fields with type = timestamp ([5440176](https://github.com/viasite/site-audit-seo-viewer/commit/544017648fb5a20284644a0739aa77900e6211ee))


### Features

* add all columns ([940f4f5](https://github.com/viasite/site-audit-seo-viewer/commit/940f4f5ef5e19ec687135aad48dc62f56145842c))



## [2.2.1](https://github.com/viasite/site-audit-seo-viewer/compare/v2.2.0...v2.2.1) (2020-08-22)


### Bug Fixes

* don't validate empty cells as success ([4089f00](https://github.com/viasite/site-audit-seo-viewer/commit/4089f00eda45119a716c152030286f046a847461))


### Features

* default column preset by field default: true ([10d6d69](https://github.com/viasite/site-audit-seo-viewer/commit/10d6d6926a9e8dbbc57684943bb9cf9bf1c0e41f))



# [2.2.0](https://github.com/viasite/site-audit-seo-viewer/compare/v2.1.0...v2.2.0) (2020-08-22)


### Bug Fixes

* reset columns to default preset when change json ([6199540](https://github.com/viasite/site-audit-seo-viewer/commit/619954061969acacf841c11b28cc2c1c1a24bcb8))
* translate interface to English ([cd7eccb](https://github.com/viasite/site-audit-seo-viewer/commit/cd7eccba909847da970618a1f722590572fde044))


### Features

* json url history ([f0566ab](https://github.com/viasite/site-audit-seo-viewer/commit/f0566ab72070ff3fa3a4233e13ccb83172de2d12))



# [2.1.0](https://github.com/viasite/site-audit-seo-viewer/compare/v2.0.0...v2.1.0) (2020-08-21)


### Bug Fixes

* better field group open ([78d5b8b](https://github.com/viasite/site-audit-seo-viewer/commit/78d5b8be1a0273de50346b9d22484b9861d7d522))
* correct default id after default field set ([e1a56f8](https://github.com/viasite/site-audit-seo-viewer/commit/e1a56f828fb3a6d7c8255a99d88909cf4f9f0025))
* ssh-link from viasite-projects-list ([4700287](https://github.com/viasite/site-audit-seo-viewer/commit/470028761c3b8a4292f5316e0e4980bd45aaee71))


### Features

* add filters to all fields in ItemDetails ([203ba5f](https://github.com/viasite/site-audit-seo-viewer/commit/203ba5f8fa9604b3820cb55abf3e2e4b84c5a753))
* align left for strings, align center for numbers, default: string ([f12c5cd](https://github.com/viasite/site-audit-seo-viewer/commit/f12c5cdff247298fc6f164dad2d9969f2cb2aa02))
* persistent always open field groups ([cd0b665](https://github.com/viasite/site-audit-seo-viewer/commit/cd0b66520ad8a1bb6306b47f8e93c87204aeea5e))



# [2.0.0](https://github.com/viasite/site-audit-seo-viewer/compare/v1.0.1...v2.0.0) (2020-08-21)


### Bug Fixes

* add "total" before table ([e29e0e9](https://github.com/viasite/site-audit-seo-viewer/commit/e29e0e904bd412c134a6aa241be06fa56f7e801f))


### Features

* column and filter presets from json ([f7f20ce](https://github.com/viasite/site-audit-seo-viewer/commit/f7f20cefe88ee7a3bf9f9217017bd6742683dc66))
* create universal site-audit-seo-viewer from viasite-projects-list ([f1c556c](https://github.com/viasite/site-audit-seo-viewer/commit/f1c556c47485dacc5d7035d04b809d8f69419d67))



## [1.0.1](https://github.com/viasite/site-audit-seo-viewer/compare/v1.0.0...v1.0.1) (2020-04-17)


### Bug Fixes

* css xls button position ([5a64ed6](https://github.com/viasite/site-audit-seo-viewer/commit/5a64ed6658666302b2a9892de2ba95fe04ba5dca))



# [1.0.0](https://github.com/viasite/site-audit-seo-viewer/compare/v0.10.0...v1.0.0) (2020-04-17)


### Bug Fixes

* bitrix_aspro фильтр ([5287d58](https://github.com/viasite/site-audit-seo-viewer/commit/5287d586d40a030ae6567cbd3ea57dbcbef97c35))
* content_last_changed time to date, vscode_link draft ([54853a2](https://github.com/viasite/site-audit-seo-viewer/commit/54853a218f3e1ebbf265f5f89c1df7761194b528))
* node_last_changed time to date ([5a988fa](https://github.com/viasite/site-audit-seo-viewer/commit/5a988fa5e9a5b8943b5000a7b083befbe85fdf8d))
* validate for string ([f5b134e](https://github.com/viasite/site-audit-seo-viewer/commit/f5b134e9d88c412bb852b416b83936fb9668d83d))


### Features

* meta_mail_domain filter preset ([712de2e](https://github.com/viasite/site-audit-seo-viewer/commit/712de2ed98eb78f8ba063d25790a4b331339cf58))
* ssh:// link in site_idn column ([1634cbd](https://github.com/viasite/site-audit-seo-viewer/commit/1634cbdf6cb4a1213490515076f82a1c3dac148d))
* xlsx export ([214b8ea](https://github.com/viasite/site-audit-seo-viewer/commit/214b8ea106ab2285a7ca11c0c568d03b79e6ffa9))



# [0.10.0](https://github.com/viasite/site-audit-seo-viewer/compare/v0.9.0...v0.10.0) (2020-03-03)


### Bug Fixes

* remove console.log ([cbac03e](https://github.com/viasite/site-audit-seo-viewer/commit/cbac03ea3272363597e65d10f2d4035ca6671e48))


### Features

* пресет колонок "для рассылки" ([5137375](https://github.com/viasite/site-audit-seo-viewer/commit/51373750773583763ab1e6b00e445c44cb90d72e))
* фильтры Визитки, Vcorp, Аспро ([81b74a7](https://github.com/viasite/site-audit-seo-viewer/commit/81b74a79ab3c2b503242003ee6dbab6122d00c14))



# [0.9.0](https://github.com/viasite/site-audit-seo-viewer/compare/v0.8.0...v0.9.0) (2020-03-02)


### Bug Fixes

* фильтр по умолчанию prod=1 ([c304879](https://github.com/viasite/site-audit-seo-viewer/commit/c3048797603336b9c475aa45e89febe01453c6dc))


### Features

* простой вывод csv ([9932603](https://github.com/viasite/site-audit-seo-viewer/commit/99326032340529849b59a5c78da196be89adc8d4))
* ссылка с domain_idn ([181f716](https://github.com/viasite/site-audit-seo-viewer/commit/181f7160934d19c2d07e18967899a0916788513c))



# [0.8.0](https://github.com/viasite/site-audit-seo-viewer/compare/v0.7.1...v0.8.0) (2019-01-21)


### Bug Fixes

* сайты с одинаковыми доменами, но с разными хостами теперь нормально выводятся ([ba9f519](https://github.com/viasite/site-audit-seo-viewer/commit/ba9f51949b82ff06405ff9dd5df976b8c353ce4f))
* domain_idn выровнен по левому краю ([1130dfe](https://github.com/viasite/site-audit-seo-viewer/commit/1130dfef34f3c5e5766edc553fa93305f31aabde))


### Features

* в domain_idn добавлены favicons ([054f5c1](https://github.com/viasite/site-audit-seo-viewer/commit/054f5c160e3710e72b37e6efb9f743a882255cbf))
* по умолчанию показывать приоритетные сайты ([647b786](https://github.com/viasite/site-audit-seo-viewer/commit/647b78684088c5ae049483ef31916b1ed144f92d))
* поиск по колонкам, быстрое добавление колонки ([1f96b35](https://github.com/viasite/site-audit-seo-viewer/commit/1f96b35a9ab50f07d5b19c5e96e9f04bfbe46817))
* favicon ([dacadd0](https://github.com/viasite/site-audit-seo-viewer/commit/dacadd0f51178659249e098de85f1b65ae8ba5d8))



## [0.7.1](https://github.com/viasite/site-audit-seo-viewer/compare/v0.7.0...v0.7.1) (2019-01-12)


### Bug Fixes

* изменилась модель в sites.json, теперь boolean идут с правильным типом ([8ea385b](https://github.com/viasite/site-audit-seo-viewer/commit/8ea385b840e1463ad720c2e76d62c490a38b5ad1))
* input не всегда доступен для фокуса ([e541b23](https://github.com/viasite/site-audit-seo-viewer/commit/e541b23b3455d53dffbfcd170435c3cecb018937))


### Features

* активная ссылка для поля url ([5b955f0](https://github.com/viasite/site-audit-seo-viewer/commit/5b955f0e58f3030e8e67b77ecd51a63a69642255))
* быстрые фильтры в деталях сайта у boolean типов ([843c30b](https://github.com/viasite/site-audit-seo-viewer/commit/843c30b3b4d01af88b1e62e3d0df38a9f9e06e91))
* ссылка на страницу проекта ([8afb28f](https://github.com/viasite/site-audit-seo-viewer/commit/8afb28fb055a5bb094ef0b601ab15ef223da7ca3))



# [0.7.0](https://github.com/viasite/site-audit-seo-viewer/compare/v0.6.0...v0.7.0) (2018-12-23)


### Bug Fixes

* добавлялись дубли колонок ([13d95fa](https://github.com/viasite/site-audit-seo-viewer/commit/13d95fa3adb9526ea17a3d48f237bb450ad20f61))
* нормальная работа одиночных фильтров, очистка запроса по кнопке ([39f534f](https://github.com/viasite/site-audit-seo-viewer/commit/39f534f6fed4528fa670e0216f7c6f7944a69182))
* решены проблемы с фокусом на строке запроса, когда надо и когда не надо ([00abd7f](https://github.com/viasite/site-audit-seo-viewer/commit/00abd7f91f8101048e7ba77ca2837bb7ff8b623b))
* filters in FieldGroup working ([8f45ba7](https://github.com/viasite/site-audit-seo-viewer/commit/8f45ba74c93c4f85ef72fe872495bea8c54033a4))


### Features

* автодополнение для фильтра ([10caa05](https://github.com/viasite/site-audit-seo-viewer/commit/10caa05915fca9000f25c7e1917d703509b5a62e))
* валидация SiteDetails, правки валидации ([e9b583b](https://github.com/viasite/site-audit-seo-viewer/commit/e9b583b0fdecd8a5b3216fa2d50bb80b63d31137))
* детали сайта на русском, SiteDetails component ([b96bcac](https://github.com/viasite/site-audit-seo-viewer/commit/b96bcac9e599a1171dc667decd32ee1c26d92045))
* дополнение: подсказка значений, переводы, css ([11e581e](https://github.com/viasite/site-audit-seo-viewer/commit/11e581e603182ed7d6cd33ee0a2951851577d26d))
* оглавление для деталей сайта ([56dd64d](https://github.com/viasite/site-audit-seo-viewer/commit/56dd64dbe1081a57f9aa7e15cbca1e12c11539ed))
* перевод названий полей в тегах выбранных фильтров ([b02b38c](https://github.com/viasite/site-audit-seo-viewer/commit/b02b38c362e78e11cf6871dbd6e09b383981d246))
* поправлена валидация, sitesProcessing перенесен в store ([71b7cf3](https://github.com/viasite/site-audit-seo-viewer/commit/71b7cf3cd97480606bc10c2ab998f3f9fe8a7948))
* правильное автодополнение, когда выдается нулевой результат ([e2695fb](https://github.com/viasite/site-audit-seo-viewer/commit/e2695fb2e4016e5526eb363be81593eeb89b4a33))
* ускоренная фильтрация по полю ([64b302a](https://github.com/viasite/site-audit-seo-viewer/commit/64b302ab9cf28fb5b93580a7662f14bf88caa859))
* фильтры-выключатели ([74dfd4c](https://github.com/viasite/site-audit-seo-viewer/commit/74dfd4ce16daa7c4c2a2337bffd5fdb83a32f6b3))
* части запроса в виде тегов, легкое удаление одной части ([9ef6db6](https://github.com/viasite/site-audit-seo-viewer/commit/9ef6db6ecb2d8abdc44819d2acbcf5d556d88b55))



# [0.6.0](https://github.com/viasite/site-audit-seo-viewer/compare/v0.5.0...v0.6.0) (2018-12-09)


### Bug Fixes

* в заголовках таблиц части переменной разделяются пробелами ([6be15b0](https://github.com/viasite/site-audit-seo-viewer/commit/6be15b08c010d8c546d324daa25cd4143a8ec731))
* вернул пресеты в развернутые меню ([9a4ae13](https://github.com/viasite/site-audit-seo-viewer/commit/9a4ae131c8e2ebdcc11d262edeaf71e82ef29523))
* не раскрашивать пустые ячейки ([e6d6534](https://github.com/viasite/site-audit-seo-viewer/commit/e6d65348c820a4ed71169683e1689578fa0f7e56))
* поправлены цвета lighthouse ([f27b601](https://github.com/viasite/site-audit-seo-viewer/commit/f27b601d59811c647d8b24c4b7875543b3cc8af5))
* растягивание раскраски ячеек на всю высоту ([a537dcf](https://github.com/viasite/site-audit-seo-viewer/commit/a537dcfb60aaa650d392bf4d97f9c45435747fa0))
* фильтры переведены, прибран css, добавлены подсказки ([3d30dcd](https://github.com/viasite/site-audit-seo-viewer/commit/3d30dcddddd660a14276aaea4dd0e8eb3679e689))
* check for field exists before add to fields ([8410886](https://github.com/viasite/site-audit-seo-viewer/commit/8410886baa7e8fab6b6261b8f420b19c998eaaca))
* css, прибраны группы полей, верстка под мобильники ([1804410](https://github.com/viasite/site-audit-seo-viewer/commit/1804410233ac92843b8958e3b077c3c5a6f15ae0))
* previous commit was not completed ([924111c](https://github.com/viasite/site-audit-seo-viewer/commit/924111c53903f17abecf3cd603e1f683c27c9722))


### Features

* группы полей из tests ([a0987f4](https://github.com/viasite/site-audit-seo-viewer/commit/a0987f48dc74c18491e7bee02046438cf541af43))
* группы фильтров, пресетов колонок ([76987cb](https://github.com/viasite/site-audit-seo-viewer/commit/76987cbc702805e4237eddd7a5da3444df5931bc))
* добавлены пресеты drupal, dirty git ([9cd72f1](https://github.com/viasite/site-audit-seo-viewer/commit/9cd72f1ff72a96e7c569595140e9a10a249dbe68))
* индикация клика по чекбоксу колонки ([103f1b7](https://github.com/viasite/site-audit-seo-viewer/commit/103f1b7751bbab39db0af7b6a21d7614d71d95b6))
* категории для meta и lighthouse, правки для git_size, time ([51e5136](https://github.com/viasite/site-audit-seo-viewer/commit/51e5136770f7b5cec2bbac61723dbb1388ff90eb))
* кнопка all у каждой группы колонок, прибрана верстка css ([7cf35b1](https://github.com/viasite/site-audit-seo-viewer/commit/7cf35b15dc0795975a4607bd0ec58f87865095e9))
* названия полей на русском в фильтре ([46f4177](https://github.com/viasite/site-audit-seo-viewer/commit/46f4177d98a06b0cd7620fae35222aaeb7a150b3))
* начальный css под мобильные ([be7c378](https://github.com/viasite/site-audit-seo-viewer/commit/be7c378f816a3c040cd9df87c5b0fb8da3039381))
* переделана панель управления, добавлен element ui ([cc61840](https://github.com/viasite/site-audit-seo-viewer/commit/cc618402a7d02d457ec3a818c54fab10d15171db))
* пресеты изменены на json query, добавлен https фильтр ([0abf6cd](https://github.com/viasite/site-audit-seo-viewer/commit/0abf6cdaee05309e7cfd7fe2c188a3d904db50b0))
* сворачивание групп колонок ([24d3b57](https://github.com/viasite/site-audit-seo-viewer/commit/24d3b5769ef41d4c10dd1ee2f60a1a1ed9c28bfd))
* теперь колонки автоматически добавляются, если выбирается фильтр, где они участвуют в условии ([f3150e1](https://github.com/viasite/site-audit-seo-viewer/commit/f3150e10f7c40728d4a9f6e8a31500eb4ca27534))
* убрать все колонки ([7c5c151](https://github.com/viasite/site-audit-seo-viewer/commit/7c5c151775ac1435af1fd874971faa7a9add9747))
* client_priority ([ab871be](https://github.com/viasite/site-audit-seo-viewer/commit/ab871be7c15bda0759ca194ddac08526d9b4a439))
* **filter:** tel_links>0, meta_pagespeed>0 ([a06f328](https://github.com/viasite/site-audit-seo-viewer/commit/a06f328e8d8799d0b58c169b5a1dec13551fa216))
* фильтры drupal without cache, drupal without js min ([7003d7f](https://github.com/viasite/site-audit-seo-viewer/commit/7003d7f5da4fc8345e980d7db0e09c147b399666))
* envy, jivosite ([b0d8a39](https://github.com/viasite/site-audit-seo-viewer/commit/b0d8a39eb6a7c57c579abe3ffe58131059f36f5b))
* lighthouse ([ff317d9](https://github.com/viasite/site-audit-seo-viewer/commit/ff317d923842b1185a7671a8a8532e2fb0861b4c))
* lighthouse итоговые очки по категориям (scores) ([d8900f3](https://github.com/viasite/site-audit-seo-viewer/commit/d8900f3c7a538beff15d797696f7fd869c94a123))
* lighthouse_all метрика по всем оценкам ([a640a04](https://github.com/viasite/site-audit-seo-viewer/commit/a640a04e52c7042e53344a6eb460bf41a1ee2a0b))
* updated_time ([c889d34](https://github.com/viasite/site-audit-seo-viewer/commit/c889d343733cafa7fd676c5423156b45f877a0dd))



# [0.5.0](https://github.com/viasite/site-audit-seo-viewer/compare/v0.4.0...v0.5.0) (2018-09-22)


### Bug Fixes

* ошибка при неправильном фильтре, https, ([167d179](https://github.com/viasite/site-audit-seo-viewer/commit/167d179dc8e9f8e28bf81d2ad6f03f24e52dfc7c))


### Features

* поддержка Назад в браузере, фильтры в title ([acd676b](https://github.com/viasite/site-audit-seo-viewer/commit/acd676ba3dc2903f1bb6374e3d0db901bfc60d62))
* сохранение набора колонок в url ([58dc751](https://github.com/viasite/site-audit-seo-viewer/commit/58dc751ac8f58244ce896f86b39998380cb03098))
* сохранение q в url ([3d3329d](https://github.com/viasite/site-audit-seo-viewer/commit/3d3329dd6c74f7894f057ac6062b5a4de5cb4133))



# [0.4.0](https://github.com/viasite/site-audit-seo-viewer/compare/v0.3.0...v0.4.0) (2018-09-06)


### Features

* задержка перед поиском (debounce) ([de6b99c](https://github.com/viasite/site-audit-seo-viewer/commit/de6b99cb2052e6023e1d3d0fb90d12ff3f32dfce))
* формат запросов json-query ([1ca7db3](https://github.com/viasite/site-audit-seo-viewer/commit/1ca7db35b3dd0aa7bb156fb0d76bcc0f88b6125e))



# [0.3.0](https://github.com/viasite/site-audit-seo-viewer/compare/v0.2.0...v0.3.0) (2018-09-06)


### Features

* вывод доп. инфы по колонкам из sites.info.yml ([c8663f6](https://github.com/viasite/site-audit-seo-viewer/commit/c8663f68285b2a9b4fcc0d88ce3653213e5f7b59))
* **columns:** шаблон полей для Битрикса ([cd580c3](https://github.com/viasite/site-audit-seo-viewer/commit/cd580c314c8077cf6e691becff96e933914be1be))
* **filter:** пресеты полей ([74bcf16](https://github.com/viasite/site-audit-seo-viewer/commit/74bcf162a1ae6e590fb20e80a05d912eafc1ad5b))
* **filter:** пресеты фильтров ([66020ed](https://github.com/viasite/site-audit-seo-viewer/commit/66020edb6643e320a24e8c224cc844db919cca4f))
* add version number to footer ([6cd9d91](https://github.com/viasite/site-audit-seo-viewer/commit/6cd9d910f801fa5b69353443c07e1b7134a0e6d0))



# [0.2.0](https://github.com/viasite/site-audit-seo-viewer/compare/v0.1.0...v0.2.0) (2018-09-06)


### Features

* подсветка результатов валидации site-info (каждая колонка) ([3d69478](https://github.com/viasite/site-audit-seo-viewer/commit/3d69478432836e905fb5acc3fa5dcc6fde11df81))



# [0.1.0](https://github.com/viasite/site-audit-seo-viewer/compare/16863d0b84f22c13f18478e56efe0287c93be328...v0.1.0) (2018-09-05)


### Bug Fixes

* **list:** правильная работа нескольких фильтров (работал только последний) ([5e5e9ec](https://github.com/viasite/site-audit-seo-viewer/commit/5e5e9ec8a6c5d4fe8cc1e3ab67a68452b53b5e95))
* не отрабатывал files_size ([1ccac16](https://github.com/viasite/site-audit-seo-viewer/commit/1ccac1623f3abf07ad1917a848e491bfbdfdcc0e))


### Features

* **list:** доступны для выбора все поля всех сайтов ([27a3803](https://github.com/viasite/site-audit-seo-viewer/commit/27a38039dbad2e8a9e4a226734559b5eb4951c22))
* **list:** показывать поля в зависимости от отфильтрованных сайтов ([89cd18d](https://github.com/viasite/site-audit-seo-viewer/commit/89cd18d3c0d8247af5319725718ca980ddee86e6))
* **list:** фильтр по любому полю на точное соответствие ([ae5ae38](https://github.com/viasite/site-audit-seo-viewer/commit/ae5ae3807cc94b56b28e065283647247f21fcb86))
* вес сайта, site_info.files_size ([ce1e0fe](https://github.com/viasite/site-audit-seo-viewer/commit/ce1e0fed0d260e2b999cccb2dd7495e0181b5d0a))
* возможность включить любое поле как колонку ([ec2ac7b](https://github.com/viasite/site-audit-seo-viewer/commit/ec2ac7bbf06584b3c74a11532d78ce9072650f20))
* добавлен ТИЦ ([7719330](https://github.com/viasite/site-audit-seo-viewer/commit/7719330a254bf7c6a5642d896c28f465c0467a82))
* **info:** вывод ошибок запуска site-info в site.site_info ([cc9235f](https://github.com/viasite/site-audit-seo-viewer/commit/cc9235f09b665e478c0b5a75e936846e678ea7b7))
* **info:** add not scannable message to site_info ([157c4db](https://github.com/viasite/site-audit-seo-viewer/commit/157c4dbfd3900fcbcdf55c07490e550eb86a893a))
* **list:** подсвечены ряды без site_info ([586bc43](https://github.com/viasite/site-audit-seo-viewer/commit/586bc4315910df0cf83c1efb4547d56927197797))
* **list:** add engine from ansible if not detected (for services) ([2ac1bd2](https://github.com/viasite/site-audit-seo-viewer/commit/2ac1bd2ef5a6bc15f2f42cb9107b247a85cdf5f4))
* **list:** add error column ([ba38ca0](https://github.com/viasite/site-audit-seo-viewer/commit/ba38ca027c7f3bd908af24f8d39ce3191f649bdc))
* **list:** add visitors ([ae52e29](https://github.com/viasite/site-audit-seo-viewer/commit/ae52e2984f6ee01aafa4ee47f8d5ecc7e9368a24))
* **list:** starter template of list app ([16863d0](https://github.com/viasite/site-audit-seo-viewer/commit/16863d0b84f22c13f18478e56efe0287c93be328))
* **list:** vuetable-2 -> vue-tables-2 ([7690242](https://github.com/viasite/site-audit-seo-viewer/commit/7690242c8b66559a850560967323a5dcaee4ba4a))
* **list:** year ([36d10da](https://github.com/viasite/site-audit-seo-viewer/commit/36d10da13d86d5a017dd39aa49d9358b8e0b9725))
* viasite-projects-list ([8827e32](https://github.com/viasite/site-audit-seo-viewer/commit/8827e32d5a706c195b4c9146c85792b9997b526e))



