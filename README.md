# viasite-projects-list

> Display sites.json as table

## Возможности:
- Доступна онлайн по адресу https://dev.viasite.ru/viasite-projects/
- Читает данные из https://dev.viasite.ru/viasite-projects/site-info/sites.json
- Читаемая таблица по умолчанию (входит по ширине в экран)
- Возможность вывести в таблицу любое интересующее поле (всего их около 70)
- Фильтрация по любому полю, сохранение фильтров в урле
- Быстрый фильтр по домену
- Сортировка по любому полю
- Подсветка результатов валидации site-info (каждая колонка)
- Пресеты колонок и фильтров

## Полезные фильтры:
- [Друпалы без кронов](https://dev.viasite.ru/viasite-projects/?q=site_info.engine%3Adrupal%20site_info.cron%3A0%20prod%3A1)

## Сопутствующие проекты
- [https://git.viasite.ru/servers/viasite-projects](viasite-projects) - основной репозиторий проекта
- [site-discovery](https://github.com/viasite/site-discovery) - site-info, сбор данных одного сайта
- [ansible-server](https://git.viasite.ru/ansible/ansible-server) - первоначальный sites.json формируется из ansible дерева скриптом [ansible-sites-list](https://git.viasite.ru/ansible/ansible-server/blob/master/scripts/ansible-sites-list)


## Build Setup

``` bash
# install dependencies
$ npm install # Or yarn install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm start

# generate static project
$ npm run generate
```

Проект собран, чтобы запускаться на https://dev.viasite.ru/viasite-projects/

## TODO:
- запоминание выбранных фильтров
- менять в урле фильтр
