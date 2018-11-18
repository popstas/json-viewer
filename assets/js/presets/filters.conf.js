module.exports = [
  {
    name: 'prod',
    q: 'prod=1'
  },
  {
    name: 'приоритетные клиенты',
    q: 'prod=1&meta_client_priority<3'
  },
  {
    name: 'bitrix',
    q: 'engine=bitrix&prod=1'
  },
  {
    name: 'drupal',
    q: 'engine=drupal&prod=1'
  },
  {
    name: 'without cron',
    q: 'engine=drupal&prod=1&cron=0'
  },
  {
    name: 'without git',
    q: 'prod=1&git=0'
  },
  {
    name: 'dirty git',
    q: 'prod=1&git=1&git_clean=0'
  },
  {
    name: 'h1 > 1',
    q: 'h1_count>1&prod=1'
  },
  {
    name: 'without https',
    q: 'https=0&prod=1'
  },
  {
    name: 'drupal without cache',
    q: 'engine=drupal&prod=1&cache=0&boost=0'
  },
  {
    name: 'drupal without js min',
    q: 'engine=drupal&prod=1&preprocess_js=0'
  },
  {
    name: 'yandex_maps',
    q: 'yandex_maps=1'
  },
  {
    name: 'lighthouse_performance',
    q: 'prod=1&lighthouse_performance>50'
  },
  {
    name: 'кликабельные телефоны',
    q: 'prod=1&tel_links>0'
  },
  {
    name: 'продан pagespeed',
    q: 'prod=1&meta_pagespeed>0'
  }
];
