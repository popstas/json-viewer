module.exports = [
  {
    name: 'Боевые сайты',
    q: 'prod=1',
    groups: ['main']
  },
  {
    name: 'Приоритетные клиенты',
    q: 'meta_client_priority<3',
    groups: ['main']
  },
  {
    name: 'Битриксы',
    q: 'engine=bitrix',
    groups: ['info', 'bitrix']
  },
  {
    name: 'Drupal',
    q: 'engine=drupal',
    groups: ['info']
  },
  {
    name: 'Визитки',
    q: 'group~/(visitkaplus|snormal)/',
    groups: ['info']
  },
  {
    name: 'Vcorp',
    q: 'group=vcorp',
    groups: ['info']
  },
  {
    name: 'Аспро',
    q: 'bitrix_aspro=1',
    groups: ['info', 'bitrix']
  },
  {
    name: 'Без cron',
    q: 'engine=drupal&cron=0',
    groups: ['cron']
  },
  {
    name: 'Без git',
    q: 'git=0',
    groups: ['git']
  },
  {
    name: 'Грязный git',
    q: 'git=1&git_clean=0',
    groups: ['git']
  },
  {
    name: 'h1 > 1',
    q: 'h1_count>1',
    groups: ['seo']
  },
  {
    name: 'Без HTTPS',
    q: 'https=0',
    groups: ['service']
  },
  {
    name: 'Drupal без кэша анонимов',
    q: 'engine=drupal&cache=0&boost=0',
    groups: ['cache']
  },
  {
    name: 'Drupal без js min',
    q: 'engine=drupal&preprocess_js=0',
    groups: ['cache']
  },
  {
    name: 'Яндекс.карты на главке',
    q: 'yandex_maps=1',
    groups: ['perf']
  },
  {
    name: 'Быстрый PageSpeed',
    q: 'lighthouse_performance>50',
    groups: ['perf', 'lighthouse']
  },
  {
    name: 'Кликабельные телефоны',
    q: 'tel_links>0',
    groups: ['service']
  },
  {
    name: 'Продан PageSpeed',
    q: 'meta_pagespeed>0',
    groups: ['service', 'lighthouse']
  }
];
