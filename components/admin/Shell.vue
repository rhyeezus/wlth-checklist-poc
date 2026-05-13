<template>
  <div class="min-h-screen bg-lightgrey-100 py-8 px-5">
    <div class="max-w-2xl mx-auto">

      <!-- Back nav -->
      <NuxtLink
        :to="backTo"
        class="inline-flex items-center gap-1.5 text-xs text-lightgrey-700 hover:text-darkblue-500 mb-6 transition-colors"
      >
        <UIcon name="i-heroicons-arrow-left" class="w-3.5 h-3.5" />
        {{ backLabel }}
      </NuxtLink>

      <!-- Card — same shell as the checklist form -->
      <div class="bg-white rounded-2xl overflow-hidden">

        <!-- Header banner — exact same pattern as ChecklistHeader -->
        <div class="flex items-stretch overflow-hidden border-b border-lightgrey-300" style="min-height:88px; background-color:#eeeef0;">
          <div class="flex-1 px-6 py-5 flex flex-col justify-center">
            <div class="text-lg font-semibold leading-snug" style="color:#2f54eb;">{{ title }}</div>
            <div class="text-sm font-medium mt-0.5" style="color:#6b7280;">{{ subtitle }}</div>
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

        <slot />

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string
  subtitle?: string
  backTo?: string
  backLabel?: string
}>(), {
  subtitle: 'Template management',
  backTo: '/admin/templates',
  backLabel: 'All templates',
})
</script>
