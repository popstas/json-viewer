const baseConfig = require('./nuxt.config');
baseConfig.router.base = '/site-audit-seo-viewer/';
module.exports = {
  ...baseConfig,
  ...{
    router: {
      base: '/site-audit-seo-viewer/'
    }
  }
};
