<template>
  <div class="min-h-screen bg-lightgrey-100 py-8 px-5 flex flex-col items-center justify-center">
    <div class="w-full max-w-2xl">

      <!-- Card — same shell as the checklists -->
      <div class="bg-white rounded-2xl overflow-hidden">

        <!-- Header banner -->
        <div class="flex items-stretch overflow-hidden border-b border-lightgrey-300" style="min-height:88px; background-color:#eeeef0;">
          <div class="flex-1 px-6 py-5 flex flex-col justify-center">
            <div class="text-lg font-semibold leading-snug" style="color:#2f54eb;">WLTH Admin</div>
            <div class="text-sm font-medium mt-0.5" style="color:#6b7280;">Template management portal</div>
          </div>
          <div
            class="flex items-center justify-center pl-10 pr-5 min-w-[96px]"
            style="background-color:#2f54eb; clip-path:polygon(28% 0%, 100% 0%, 100% 100%, 0% 100%);"
          >
            <svg viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-[28px] w-auto">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M2.96933 0L7.56963 14.5863L9.96647 6.98899H12.9345L8.83166 20H6.3076L0 0H2.96933ZM12.3099 0L18.6187 20H21.5881L15.2792 0H12.3099ZM25.0307 0L20.9265 13.011H23.8959L28 0H25.0307Z" fill="#f4f4f4"/>
            </svg>
          </div>
        </div>

        <!-- Gate form -->
        <div class="px-5 py-6">
          <div class="text-[11px] font-medium text-lightgrey-700 uppercase tracking-widest mb-4">Admin access</div>

          <form @submit.prevent="unlock">
            <div class="mb-4">
              <label class="block text-[11px] font-medium text-lightgrey-700 mb-1">Passphrase</label>
              <input
                v-model="passphrase"
                type="password"
                autocomplete="current-password"
                autofocus
                class="w-full text-[13px] text-darkblue-500 bg-lightgrey-50 border border-lightgrey-300 rounded-lg px-3 py-2 outline-none focus:border-royalblue-500 focus:ring-1 focus:ring-royalblue-100 transition-all placeholder:text-lightgrey-500"
                placeholder="Enter passphrase"
              />
              <p v-if="error" class="text-[11px] text-red-500 mt-1.5">Incorrect passphrase — try again.</p>
            </div>
            <UButton type="submit" color="primary" class="w-full justify-center">
              Unlock admin
            </UButton>
          </form>
        </div>

      </div>

      <p class="text-center text-[11px] text-lightgrey-500 mt-4">WLTH staff only.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const router = useRouter()
const passphrase = ref('')
const error = ref(false)

onMounted(() => {
  if (localStorage.getItem('admin_unlocked') === config.public.adminPassphrase) {
    router.replace('/admin/templates')
  }
})

function unlock() {
  if (passphrase.value === config.public.adminPassphrase) {
    localStorage.setItem('admin_unlocked', passphrase.value)
    router.push('/admin/templates')
  } else {
    error.value = true
  }
}
</script>
