<template>
  <div class="min-h-screen bg-lightgrey-100 p-8">
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center justify-between mb-1">
        <h1 class="text-2xl font-semibold text-darkblue-500">Checklist Templates</h1>
        <a
          href="http://localhost:8055/admin/content/documentation"
          target="_blank"
          class="inline-flex items-center gap-1.5 text-xs text-royalblue-500 hover:text-royalblue-600 transition-colors"
        >
          <UIcon name="i-heroicons-book-open" class="w-3.5 h-3.5" />
          How to manage forms
        </a>
      </div>
      <p class="text-sm text-lightgrey-700 mb-8">Select a checklist to begin document collection.</p>

      <div v-if="pending" class="text-sm text-lightgrey-700">Loading...</div>

      <div v-else-if="error" class="text-sm text-red-500">
        Could not connect to Directus. Check your .env settings.
      </div>

      <template v-else>
        <div v-for="(group, brand) in groupedTemplates" :key="brand" class="mb-8">
          <!-- Brand heading -->
          <div class="flex items-center gap-3 mb-3">
            <div class="text-[11px] font-semibold uppercase tracking-widest" :class="brand === 'wlth' ? 'text-royalblue-500' : 'text-darkblue-500'">
              {{ brand === 'wlth' ? 'WLTH' : 'Mortgage Mart' }}
            </div>
            <div class="h-px flex-1 bg-lightgrey-300" />
          </div>

          <!-- Templates -->
          <div class="flex flex-col gap-3">
            <NuxtLink
              v-for="t in group"
              :key="t.id"
              :to="`/checklist/${t.id}`"
              class="block bg-white border border-lightgrey-300 rounded-xl p-4 hover:border-lightgrey-500 transition-colors"
            >
              <div class="flex items-center justify-between gap-4">
                <div>
                  <div class="text-sm font-medium text-darkblue-500">{{ t.title }}</div>
                  <div class="text-xs text-lightgrey-600 mt-0.5 capitalize">{{ t.file_type }} · {{ t.loan_type }}</div>
                </div>
                <UIcon name="i-heroicons-chevron-right" class="text-lightgrey-500 flex-shrink-0" />
              </div>
            </NuxtLink>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const { getTemplates } = useDirectus()
const { data: templates, pending, error } = await useAsyncData('templates', getTemplates)

const groupedTemplates = computed(() => {
  const groups: Record<string, any[]> = { wlth: [], mortgage_mart: [] }
  for (const t of templates.value ?? []) {
    const key = t.header_variant ?? 'wlth'
    if (!groups[key]) groups[key] = []
    groups[key].push(t)
  }
  return groups
})
</script>
