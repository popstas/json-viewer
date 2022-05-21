// import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';

module.exports = {
  ssr: false,

  modules: [
    'semantic-ui-vue/nuxt',
    '@nuxtjs/axios',
    '@nuxtjs/pwa',
    'nuxt-socket-io',
    '@nuxtjs/style-resources',
  ],

  css: [
    'element-ui/lib/theme-chalk/index.css'
  ],

  styleResources: {
    scss: [
        '~/pages/index.scss',
    ]
  },

  plugins: [
    '@/plugins/element-ui',
    '@/plugins/localStorage',
    '@/plugins/vue-awesome',
    '@/plugins/vue-chat-scroll',
    '@/plugins/vue-tour',
    { src: '@/plugins/vue-tables', ssr: false },
    { src: '@/plugins/yametrika', ssr: false },
  ],

  router: {
    base: '/'
  },

  env: {
    JSON_URL: process.env.JSON_URL,
    SERVER_URL: process.env.SERVER_URL,
    SCAN_DEFAULT_MAX_REQUESTS: parseInt(process.env.SCAN_DEFAULT_MAX_REQUESTS),
    NO_FOOTER: process.env.NO_FOOTER,
    NO_LOGIN: process.env.NO_LOGIN,
    NO_FILTERS: process.env.NO_FILTERS,
    NO_TOUR: process.env.NO_TOUR,
    NO_NAVIGATION: process.env.NO_NAVIGATION,
  },

  io: {
    sockets: [{
      name: 'main',
      url: process.env.SERVER_URL || 'http://localhost:5301'
    }]
  },

  /*
  ** Headers of the page
  */
  pwa: {
    meta: {
      name: 'json-viewer',
      ogHost: process.env.FRONTEND_URL || '/',
      ogImage: '/og_image.png',
      favicon: false,
    }
  },

  head: {
    link: [
      { rel: 'icon', type: 'image/x-icon', href: process.env.FAVICON || '/favicon.ico' },
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
    /*plugins: [
      new MonacoWebpackPlugin({
        languages: ['json']
      }),
    ]*/
    /*
    ** Run ESLint on save
    */
    /* extend (config, { isDev, isClient }) {
      if (isDev && isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    } */
  }
}
