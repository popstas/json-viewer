module.exports = {
  lighthouse_interactive: {
    warn: { min: 3000, max: 8000 }, // ps: 3900 warn
    error: { min: 8001 }
  },
  lighthouse_speed_index: {
    warn: { min: 3500, max: 8000 }, // ps: 3200 ok, 3900 warn, 8500 fail
    error: { min: 8001 }
  },
  lighthouse_first_contentful_paint: {
    warn: { min: 3000, max: 5000 }, // ps: 2400 warn, lh: 2700 ok
    error: { min: 5001 }
  },
  lighthouse_first_cpu_idle: {
    warn: { min: 3000, max: 5000 },
    error: { min: 5001 }
  },
  lighthouse_first_meaningful_paint: {
    warn: { min: 2000, max: 4999 }, // ps: 5000 fail
    error: { min: 5000 }
  },
  lighthouse_input_latency: {
    warn: { min: 50, max: 100 },
    error: { min: 101 }
  },
  lighthouse_performance: {
    warn: { min: 50, max: 79 },
    error: { max: 50 }
  },
  lighthouse_pwa: {
    warn: { min: 50, max: 79 },
    error: { max: 50 }
  },
  lighthouse_accessibility: {
    warn: { min: 50, max: 79 },
    error: { max: 50 }
  },
  lighthouse_best_practices: {
    warn: { min: 50, max: 79 },
    error: { max: 50 }
  },
  lighthouse_seo: {
    warn: { min: 50, max: 79 },
    error: { max: 50 }
  },
  lighthouse_all: {
    warn: { min: 50, max: 79 },
    error: { max: 50 }
  },
  lighthouse_errors_in_console: {
    warn: { min: 1, max: 2 },
    error: { min: 3 }
  },
  lighthouse_metwork_requests: {
    warn: { min: 50, max: 100 },
    error: { min: 100 }
  },
  lighthouse_mainthread_work_breakdown: {
    warn: { min: 2000, max: 4999 },
    error: { min: 5000 }
  },
  lighthouse_total_byte_weight: {
    warn: { min: 2000, max: 4999 },
    error: { min: 5000 }
  },
  yandex_maps: {
    error: { min: 1 }
  },
  envy: {
    warn: { min: 1 }
  },
  jivosite: {
    warn: { min: 1 }
  },
  meta_client_priority: {
    warn: { min: 2 },
    error: { min: 3 }
  },
  https: {
    warn: { max: 0 }
  },
  meta_visitors: {
    warn: { max: 499 },
    error: { max: 99 }
  },
  meta_year: {
    warn: {
      min: new Date().getFullYear() - 4,
      max: new Date().getFullYear() - 2
    },
    error: {
      max: new Date().getFullYear() - 5
    }
  },
  meta_yandex_sqi: {
    warn: { max: 100 },
    error: { max: 50 }
  }
};