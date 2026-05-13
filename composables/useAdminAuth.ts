export const useAdminAuth = () => {
  const config = useRuntimeConfig()
  const isAdmin = ref(false)

  onMounted(() => {
    isAdmin.value = localStorage.getItem('admin_unlocked') === config.public.adminPassphrase
  })

  return { isAdmin }
}
