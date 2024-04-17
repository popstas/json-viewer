import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  ssr: false,

  modules: [
    "@element-plus/nuxt",
    "nuxt-socket-io",
    "@pinia/nuxt",
    "@pinia-plugin-persistedstate/nuxt",
    // '@nuxtjs/i18n',
  ],

  css: [
    "element-plus/dist/index.css",
  ],

  router: {
    base: "/",
  },

  runtimeConfig: {
    public: {
      jsonUrl: "",
      serverUrl: "http://localhost:5301",
      favicon: "/favicon.ico",
      scanDefaultMaxRequests: 0,
      noFooter: false,
      noLogin: false,
      noFilters: false,
      noTour: true, // TODO2: vue-tour
      noNavigation: false,
    },
  },

  io: {
    sockets: [{
      name: "main",
      url: process.env.NUXT_PUBLIC_SERVER_URL || "http://localhost:5301",
    }],
  },

  /*
  ** Headers of the page
  */
  /*pwa: {
    meta: {
      name: 'json-viewer',
      ogHost: process.env.FRONTEND_URL || '/',
      ogImage: '/og_image.png',
      favicon: false,
    }
  },*/

  app: {
    head: {
      link: [
        { rel: "icon", type: "image/x-icon", href: process.env.NUXT_PUBLIC_FAVICON || "/favicon.ico" },
        {
          rel: "stylesheet",
          href: "https://cdn.jsdelivr.net/npm/bootstrap@3.4.1/dist/css/bootstrap.min.css",
          crossorigin: "anonymous",
        },
        // { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css', crossorigin: 'anonymous' }
      ],
    },
  },
  /*
  * <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
  * */
  /*
  ** Customize the progress bar color
  */
  loading: { color: "#3B8070" },
});
