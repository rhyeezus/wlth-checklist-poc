<template>
  <div class="min-h-screen bg-lightgrey-100 py-8 px-5">
    <div class="max-w-2xl mx-auto">

      <!-- Page heading -->
      <div class="flex items-center justify-between mb-1">
        <h1 class="text-2xl font-semibold text-darkblue-500">Checklist Templates</h1>
        <div class="flex items-center gap-4">
          <NuxtLink to="/admin/help" class="inline-flex items-center gap-1.5 text-xs text-royalblue-500 hover:text-royalblue-600 transition-colors">
            <UIcon name="i-heroicons-question-mark-circle" class="w-3.5 h-3.5" />
            How to use
          </NuxtLink>
          <button class="text-xs text-lightgrey-500 hover:text-darkblue-500 transition-colors" @click="logout">
            Lock admin
          </button>
        </div>
      </div>
      <p class="text-sm text-lightgrey-700 mb-6">Manage all templates. Click any checklist to preview, edit, or delete.</p>

      <!-- Actions row -->
      <div class="flex gap-2 mb-6">
        <UButton color="primary" size="sm" @click="navigateTo('/admin/templates/new')">
          <UIcon name="i-heroicons-plus" class="w-3.5 h-3.5 mr-1.5" />
          New template
        </UButton>
        <UButton variant="outline" color="primary" size="sm" @click="navigateTo('/admin/templates/upload')">
          <UIcon name="i-heroicons-arrow-up-tray" class="w-3.5 h-3.5 mr-1.5" />
          Import from PDF
        </UButton>
      </div>

      <!-- Filter pills -->
      <div class="flex flex-wrap items-center gap-2 mb-6">
        <!-- Brand pills -->
        <button
          v-for="brand in BRAND_FILTERS"
          :key="brand.value"
          class="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
          :class="activeFilters.includes(brand.value)
            ? 'bg-darkblue-500 border-darkblue-500 text-white'
            : 'bg-lightgrey-200 border-lightgrey-200 text-lightgrey-600 hover:border-lightgrey-400 hover:text-darkblue-500'"
          @click="toggleFilter(brand.value)"
        >
          {{ brand.label }}
        </button>

        <!-- Divider dot -->
        <span class="text-lightgrey-300 text-xs select-none">·</span>

        <!-- Loan type pills -->
        <button
          v-for="loan in LOAN_FILTERS"
          :key="loan.value"
          class="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
          :class="activeFilters.includes(loan.value)
            ? 'bg-darkblue-500 border-darkblue-500 text-white'
            : 'bg-lightgrey-200 border-lightgrey-200 text-lightgrey-600 hover:border-lightgrey-400 hover:text-darkblue-500'"
          @click="toggleFilter(loan.value)"
        >
          {{ loan.label }}
        </button>

        <!-- Clear button — only when filters active -->
        <button
          v-if="activeFilters.length"
          class="px-3 py-1 rounded-full text-xs font-medium border border-lightgrey-300 bg-white text-lightgrey-500 hover:text-red-500 hover:border-red-300 transition-colors"
          @click="activeFilters.length = 0"
        >
          Clear
        </button>
      </div>

      <div v-if="pending" class="text-sm text-lightgrey-700">Loading...</div>
      <div v-else-if="error" class="text-sm text-red-500">Could not connect to Directus. Is it running?</div>

      <template v-else>
        <div v-if="!filtered.length" class="text-sm text-lightgrey-600">No templates match the selected filters.</div>

        <div class="flex flex-col gap-3">
          <NuxtLink
            v-for="tpl in filtered"
            :key="tpl.id"
            :to="`/checklist/${tpl.id}`"
            class="block bg-white border border-lightgrey-300 rounded-xl overflow-hidden hover:border-lightgrey-500 transition-colors"
          >
            <div class="flex items-stretch">
              <!-- Brand logomark strip -->
              <div
                class="flex items-center justify-center w-12 flex-shrink-0"
                :style="{ backgroundColor: tpl.header_variant === 'mortgage_mart' ? '#292e3a' : '#2f54eb' }"
              >
                <!-- WLTH mark -->
                <svg v-if="tpl.header_variant === 'wlth'" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-5 h-auto">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M2.96933 0L7.56963 14.5863L9.96647 6.98899H12.9345L8.83166 20H6.3076L0 0H2.96933ZM12.3099 0L18.6187 20H21.5881L15.2792 0H12.3099ZM25.0307 0L20.9265 13.011H23.8959L28 0H25.0307Z" fill="#F4F4F4"/>
                </svg>
                <!-- Mortgage Mart mark -->
                <svg v-else-if="tpl.header_variant === 'mortgage_mart'" viewBox="0 0 41 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-7 h-auto">
                  <g clip-path="url(#clip0_mma)">
                    <path d="M38.2144 0C36.6785 0 35.4289 1.23465 35.4289 2.75206C35.4289 4.26947 36.6785 5.50271 38.2144 5.50271C39.7503 5.50271 41 4.26807 41 2.75206C41 1.23605 39.7503 0 38.2144 0ZM38.2144 5.24794C36.8216 5.24794 35.6867 4.12808 35.6867 2.75066C35.6867 1.37323 36.8202 0.253368 38.2144 0.253368C39.6086 0.253368 40.7421 1.37323 40.7421 2.75066C40.7421 4.12808 39.6086 5.24794 38.2144 5.24794ZM39.5562 1.55801H39.9175L39.4188 3.11041H39.0575L39.5562 1.55801ZM38.3703 1.55801L39.1368 3.94471H38.7755L38.009 1.55801H38.3703ZM37.7242 2.3923H38.0855L37.5868 3.94471H37.2793L36.5128 1.55801H36.8741L37.4337 3.29939L37.7256 2.3923H37.7242ZM34.7573 0.00279965H30.348L26.4346 12.4416L22.4914 0.00279965H18.0821V16.0014H20.8578V3.03622L24.9681 16H27.8557L31.9816 3.03622L31.9887 15.9986H33.4183L34.7587 12.4444V0.00279965H34.7573ZM0 5.53071H2.85216L2.76857 16H0V5.53071ZM16.6397 0.00279965V16.0014H13.7536L13.7507 3.05162L9.61347 16.0014H7.03477L1.90144 0.00279965H4.3087L8.30003 12.4444H8.3142L12.3112 0.00979878L16.6397 0.00279965Z" fill="white"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_mma">
                      <rect width="41" height="16" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>
              </div>

              <!-- Card content -->
              <div class="flex items-center justify-between gap-4 flex-1 p-4">
                <div class="flex items-start gap-3 min-w-0">
                  <!-- Status dot -->
                  <div
                    class="w-1.5 h-1.5 rounded-full mt-[5px] flex-shrink-0"
                    :class="{
                      'bg-green-400': tpl.status === 'published',
                      'bg-amber-400': tpl.status === 'draft',
                      'bg-lightgrey-400': tpl.status === 'archived',
                    }"
                  />
                  <div class="min-w-0">
                    <div class="text-sm font-medium text-darkblue-500 truncate">{{ tpl.title }}</div>
                    <div class="text-xs text-lightgrey-600 mt-0.5 capitalize">
                      {{ tpl.file_type }} · {{ tpl.loan_type }} ·
                      <span
                        :class="{
                          'text-green-600': tpl.status === 'published',
                          'text-amber-600': tpl.status === 'draft',
                          'text-lightgrey-500': tpl.status === 'archived',
                        }"
                      >{{ tpl.status }}</span>
                    </div>
                  </div>
                </div>
                <UIcon name="i-heroicons-chevron-right" class="text-lightgrey-500 flex-shrink-0" />
              </div>
            </div>
          </NuxtLink>
        </div>
      </template>

    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin-auth' })

const { getAllTemplates } = useDirectus()
const { data: templates, pending, error } = await useAsyncData('admin-templates', getAllTemplates)

const BRAND_FILTERS = [
  { value: 'wlth', label: 'WLTH', color: '#2f54eb' },
  { value: 'mortgage_mart', label: 'Mortgage Mart', color: '#292e3a' },
]

const LOAN_FILTERS = [
  { value: 'residential', label: 'Residential' },
  { value: 'investment', label: 'Investment' },
  { value: 'smsf', label: 'SMSF' },
]

const activeFilters = ref<string[]>([])

function toggleFilter(value: string) {
  const idx = activeFilters.value.indexOf(value)
  if (idx === -1) {
    activeFilters.value.push(value)
  } else {
    activeFilters.value.splice(idx, 1)
  }
}

const filtered = computed(() => {
  const all = templates.value ?? []
  if (!activeFilters.value.length) return all

  const brandFilters = BRAND_FILTERS.map(b => b.value).filter(v => activeFilters.value.includes(v))
  const loanFilters = LOAN_FILTERS.map(l => l.value).filter(v => activeFilters.value.includes(v))

  return all.filter((tpl: any) => {
    const brandMatch = brandFilters.length === 0 || brandFilters.includes(tpl.header_variant)
    const loanMatch = loanFilters.length === 0 || loanFilters.includes(tpl.loan_type)
    return brandMatch && loanMatch
  })
})

function logout() {
  localStorage.removeItem('admin_unlocked')
  navigateTo('/admin')
}
</script>
