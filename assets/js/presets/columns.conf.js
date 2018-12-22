module.exports = {
  default: {
    name: 'default',
    groups: ['main'],
    columns: [
      'domain_idn',
      'host',
      'prod',
      'engine',
      'meta_year',
      'meta_visitors',
      'meta_client_priority',
    ]
  },
  cron: {
    name: 'cron',
    groups: ['cron'],
    columns: ['domain_idn', 'host', 'prod', 'cron']
  },
  bitrix: {
    name: 'bitrix',
    groups: ['bitrix'],
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
      'h1_count'
    ]
  },
  pagespeed_performance: {
    name: 'pagespeed_performance',
    groups: ['lighthouse', 'perf'],
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
    groups: ['lighthouse', 'perf'],
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
    groups: ['service'],
    columns: ['domain_idn', 'https', 'email']
  },
  clients: {
    name: 'клиенты',
    groups: ['main'],
    columns: ['domain_idn', 'meta_title', 'meta_category', 'meta_type', 'meta_client_priority']
  }
};
