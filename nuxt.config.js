module.exports = {
  mode: 'spa',

  modules: [
    'semantic-ui-vue/nuxt',
    '@nuxtjs/axios',
    /* 'nuxt-i18n',
    {
      locales: ['en', 'ru'],
      defaultLocale: 'ru',
      vueI18n: {
        fallbackLocale: 'en',
        messages: {
          en: {
            total: 'total'
          },
          ru: {
            total: 'всего'
          }
        }
      }
    } */
  ],

  css: [
    'element-ui/lib/theme-chalk/index.css'
  ],

  plugins: [
    '@/plugins/element-ui',
    '@/plugins/localStorage',
    '@/plugins/vue-awesome',
    { src: '@/plugins/vue-tables', ssr: false },
  ],

  router: {
    // base: '/site-audit-seo-viewer/'
    base: '/'
  },

  /*
  ** Headers of the page
  */
  head: {
    title: 'site-audit-seo viewer',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Display json as table' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://stackpath.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css' }
    ]
  },
  /*
  ** Customize the progress bar color
  */
  loading: { color: '#3B8070' },
  /*
  ** Build configuration
  */
  build: {
    /*
    ** Run ESLint on save
    */
    extend (config, { isDev, isClient }) {
      if (isDev && isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  }
}

