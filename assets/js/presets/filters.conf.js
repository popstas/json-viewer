module.exports = [
  {
    name: 'prod',
    q: 'prod=1',
    groups: ['main']
  },
  {
    name: 'приоритетные клиенты',
    q: 'prod=1&meta_client_priority<3',
    groups: ['main']
  },
  {
    name: 'bitrix',
    q: 'engine=bitrix&prod=1',
    groups: ['bitrix']
  },
  {
    name: 'drupal',
    q: 'engine=drupal&prod=1',
    groups: ['modules']
  },
  {
    name: 'without cron',
    q: 'engine=drupal&prod=1&cron=0',
    groups: ['cron']
  },
  {
    name: 'without git',
    q: 'prod=1&git=0',
    groups: ['git']
  },
  {
    name: 'dirty git',
    q: 'prod=1&git=1&git_clean=0',
    groups: ['git']
  },
  {
    name: 'h1 > 1',
    q: 'h1_count>1&prod=1',
    groups: ['seo']
  },
  {
    name: 'without https',
    q: 'https=0&prod=1',
    groups: ['service']
  },
  {
    name: 'drupal without cache',
    q: 'engine=drupal&prod=1&cache=0&boost=0',
    groups: ['cache']
  },
  {
    name: 'drupal without js min',
    q: 'engine=drupal&prod=1&preprocess_js=0',
    groups: ['cache']
  },
  {
    name: 'yandex_maps',
    q: 'yandex_maps=1',
    groups: ['perf']
  },
  {
    name: 'lighthouse_performance',
    q: 'prod=1&lighthouse_performance>50',
    groups: ['perf', 'lighthouse']
  },
  {
    name: 'кликабельные телефоны',
    q: 'prod=1&tel_links>0',
    groups: ['service']
  },
  {
    name: 'продан pagespeed',
    q: 'prod=1&meta_pagespeed>0',
    groups: ['service', 'lighthouse']
  }
];
