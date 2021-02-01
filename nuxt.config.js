export default {
  // Disable server-side rendering (https://go.nuxtjs.dev/ssr-mode)
  ssr: false,

  // Target (https://go.nuxtjs.dev/config-target)
  target: 'static',

  // Global page headers (https://go.nuxtjs.dev/config-head)
  head: {
    title: 'Item Tracking',
    meta: [{
        charset: 'utf-8'
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=0.8'
      },
      {
        hid: 'description',
        name: 'description',
        content: 'PWA for tracking items'
      }
    ],
    link: [
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.png',
      }
    ]
  },

  // Global CSS (https://go.nuxtjs.dev/config-css)
  css: [
    'element-ui/lib/theme-chalk/index.css'
  ],

  // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
  plugins: [
    '@/plugins/element-ui',
    '@/plugins/filters'
  ],

  // Auto import components (https://go.nuxtjs.dev/config-components)
  components: true,

  // Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
  buildModules: [
    '@nuxtjs/dotenv'
  ],

  // Modules (https://go.nuxtjs.dev/config-modules)
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://go.nuxtjs.dev/pwa
    // '@nuxtjs/onesignal',
    '@nuxtjs/pwa',
    [
      '@nuxtjs/firebase',
      {
        config: {
          apiKey: '<apiKey>',
          authDomain: '<authDomain>',
          databaseURL: process.env.DATABASE_URL || null,
          projectId: '<projectId>',
          storageBucket: '<storageBucket>',
          messagingSenderId: '<messagingSenderId>',
          appId: '<appId>',
          measurementId: '<measurementId>'
        },
        services: {
          realtimeDb: true,
        }
      }
    ]
  ],

  // Axios module configuration (https://go.nuxtjs.dev/config-axios)
  axios: {},

  // Build Configuration (https://go.nuxtjs.dev/config-build)
  build: {
    transpile: [/^element-ui/],
  },

  pwa: {
    meta: {
      title: 'Item Tracking',
      author: 'commee',
    },
    manifest: {
      name: 'Item Tracking',
      lang: 'en',
    },
  },

  // Options
  // oneSignal: {
  //   init: {
  //     appId: process.env.ONESIGNAL_APP_ID || null,
  //   }
  // }

}
