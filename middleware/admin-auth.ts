export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return

  const config = useRuntimeConfig()
  const stored = localStorage.getItem('admin_unlocked')

  if (!stored || stored !== config.public.adminPassphrase) {
    return navigateTo('/admin')
  }
})
