export default defineNuxtConfig({
  extends: ['@wlth/design-system'],

  ssr: false,

  colorMode: {
    preference: 'light'
  },

  srcDir: '.',

  compatibilityDate: '2026-04-13',

  runtimeConfig: {
    public: {
      directusUrl: process.env.DIRECTUS_URL,
      directusToken: process.env.DIRECTUS_TOKEN
    }
  },

  vite: {
    server: {
      proxy: {
        '/directus-api': {
          target: 'http://localhost:8055',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/directus-api/, '')
        }
      },
      watch: {
        ignored: ['**/directus/**']
      }
    }
  }
})
