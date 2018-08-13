module.exports = {
  mode: 'spa',

  modules: [
    'semantic-ui-vue/nuxt',
    '@nuxtjs/axios'
  ],

  plugins: [
    { src: '@/plugins/vuetable', ssr: false },
  ],

  router: {
    base: '/viasite-projects/'
  },

  /*
  ** Headers of the page
  */
  head: {
    title: 'viasite-projects-list',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Display sites.json as table' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
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

