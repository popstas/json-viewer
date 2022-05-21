const baseConfig = require('./nuxt.config');
baseConfig.router.base = '/json-viewer/';
module.exports = {
  ...baseConfig,
  ...{
    router: {
      base: '/json-viewer/'
    }
  }
};
