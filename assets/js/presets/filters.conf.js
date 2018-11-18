module.exports = [
  {
    name: 'Боевые сайты',
    q: 'prod=1',
    groups: ['main']
  },
  {
    name: 'Приоритетные клиенты',
    q: 'prod=1&meta_client_priority<3',
    groups: ['main']
  },
  {
    name: 'Bitrix',
    q: 'engine=bitrix&prod=1',
    groups: ['bitrix']
  },
  {
    name: 'Drupal',
    q: 'engine=drupal&prod=1',
    groups: ['modules']
  },
  {
    name: 'Без cron',
    q: 'engine=drupal&prod=1&cron=0',
    groups: ['cron']
  },
  {
    name: 'Без git',
    q: 'prod=1&git=0',
    groups: ['git']
  },
  {
    name: 'Грязный git',
    q: 'prod=1&git=1&git_clean=0',
    groups: ['git']
  },
  {
    name: 'h1 > 1',
    q: 'h1_count>1&prod=1',
    groups: ['seo']
  },
  {
    name: 'Без HTTPS',
    q: 'https=0&prod=1',
    groups: ['service']
  },
  {
    name: 'Drupal без кэша анонимов',
    q: 'engine=drupal&prod=1&cache=0&boost=0',
    groups: ['cache']
  },
  {
    name: 'Drupal без js min',
    q: 'engine=drupal&prod=1&preprocess_js=0',
    groups: ['cache']
  },
  {
    name: 'Яндекс.карты на главке',
    q: 'yandex_maps=1',
    groups: ['perf']
  },
  {
    name: 'Быстрый PageSpeed',
    q: 'prod=1&lighthouse_performance>50',
    groups: ['perf', 'lighthouse']
  },
  {
    name: 'Кликабельные телефоны',
    q: 'prod=1&tel_links>0',
    groups: ['service']
  },
  {
    name: 'Продан PageSpeed',
    q: 'prod=1&meta_pagespeed>0',
    groups: ['service', 'lighthouse']
  }
];
