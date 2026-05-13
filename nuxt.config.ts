export default defineNuxtConfig({
  extends: ['@wlth/design-system'],

  // Keep Nitro server alive (needed for server/api routes) but render all pages as SPA
  ssr: false,

  nitro: {
    preset: 'node-server',
  },

  routeRules: {
    '/**': { ssr: false },
  },

  colorMode: {
    preference: 'light'
  },

  srcDir: '.',

  compatibilityDate: '2026-04-13',

  runtimeConfig: {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    public: {
      directusUrl: process.env.DIRECTUS_URL,
      directusToken: process.env.DIRECTUS_TOKEN,
      adminPassphrase: process.env.ADMIN_PASSPHRASE,
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
