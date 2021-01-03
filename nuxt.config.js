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
    '@/plugins/vue-fontawesome',
    '@/plugins/vue-awesome',
    '@/plugins/vue-material',
    '@/plugins/vue-chat-scroll',
    '@/plugins/vue-tour',
    '@/plugins/vue-input-tag',
    { src: '@/plugins/vue-tables', ssr: false },
  ],

  router: {
    base: process.env.PREFIX_BASE_URL || '/'
  },

  env: {
    JSON_URL: process.env.JSON_URL,
    SERVER_URL: process.env.SERVER_URL,
    SCAN_DEFAULT_MAX_REQUESTS: parseInt(process.env.SCAN_DEFAULT_MAX_REQUESTS),
  },

  io: {
    sockets: [{
      name: 'main',
      url: 'https://metrix.evolutive.group', // process.env.SERVER_URL || 'http://localhost:5301',
    }]
  },

  axios: {
    baseURL: process.env.SERVER_URL, // Used as fallback if no runtime config is provided
  },

  /*
  ** Headers of the page
  */
  pwa: {
    meta: {
      name: 'site-audit-seo',
      ogHost: process.env.FRONTEND_URL || '/',
      ogImage: '/og_image.png',
      favicon: false,
    }
  },

  head: {
    link: [
      // { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://stackpath.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css' },
      { rel: 'stylesheet', href: '//fonts.googleapis.com/css?family=Roboto:400,500,700,400italic|Material+Icons' },
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
