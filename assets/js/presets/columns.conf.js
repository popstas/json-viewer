module.exports = {
  default: {
    name: 'default',
    columns: [
      'domain_idn',
      'host',
      'prod',
      'engine',
      'meta_year',
      'meta_visitors',
      'yandex_tcy',
      'files_size',
      'errors'
    ]
  },
  cron: {
    name: 'cron',
    columns: ['domain_idn', 'host', 'prod', 'cron']
  },
  bitrix: {
    name: 'bitrix',
    columns: [
      'domain_idn',
      'host',
      'prod',
      'email',
      'engine_version',
      'bitrix_image_quality',
      'bitrix_total_mark_value',
      'files_count',
      'files_size',
      'git_clean',
      'yandex_tcy',
      'h1_count'
    ]
  },
  pagespeed_performance: {
    name: 'pagespeed_performance',
    columns: [
      'domain_idn',
      'engine',
      'lighthouse_performance',
      'lighthouse_interactive',
      'lighthouse_speed_index',
      'lighthouse_first_contentful_paint',
      'lighthouse_first_cpu_idle',
      'lighthouse_first_meaningful_paint',
      'lighthouse_input_latency'
    ]
  },
  pagespeed_score: {
    name: 'pagespeed_score',
    columns: [
      'domain_idn',
      'engine',
      'lighthouse_all',
      'lighthouse_performance',
      'lighthouse_pwa',
      'lighthouse_accessibility',
      'lighthouse_best_practices',
      'lighthouse_seo'
    ]
  },
  https: {
    name: 'https',
    columns: ['domain_idn', 'https', 'email']
  }
};
