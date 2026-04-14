<template>
  <div class="min-h-screen bg-lightgrey-100 py-8 px-5">
    <div class="max-w-2xl mx-auto">

      <NuxtLink to="/" class="inline-flex items-center gap-1.5 text-xs text-lightgrey-700 hover:text-darkblue-500 mb-6 transition-colors">
        <UIcon name="i-heroicons-arrow-left" class="w-3.5 h-3.5" />
        All checklists
      </NuxtLink>

      <div v-if="pending" class="text-sm text-lightgrey-700">Loading checklist...</div>
      <div v-else-if="error" class="text-sm text-red-500">Failed to load checklist.</div>

      <template v-else-if="template">

        <!-- Card wrapper -->
        <div class="bg-white rounded-2xl overflow-hidden">

          <!-- Header banner -->
          <ChecklistHeader :title="template.title" :variant-key="template.header_variant" />

          <!-- Header fields -->
          <div v-if="template.header_fields?.length" class="px-5 pt-5 pb-4 border-b border-lightgrey-200">
            <div class="text-[11px] font-medium text-lightgrey-700 uppercase tracking-widest mb-3">
              Application details
            </div>
            <div class="flex flex-wrap gap-3">
              <div
                v-for="field in template.header_fields"
                :key="field.field_key"
                :class="field.width === 'half' ? 'flex-1 min-w-[160px]' : 'w-full'"
              >
                <label class="block text-[11px] font-medium text-lightgrey-700 mb-1">
                  {{ field.label }}
                </label>
                <input
                  v-model="headerValues[field.field_key]"
                  type="text"
                  class="w-full text-[13px] text-darkblue-500 bg-lightgrey-50 border border-lightgrey-300 rounded-lg px-3 py-2 outline-none focus:border-royalblue-500 focus:ring-1 focus:ring-royalblue-100 transition-all placeholder:text-lightgrey-500"
                  :placeholder="field.label"
                />
              </div>
            </div>
          </div>

          <!-- Items -->
          <div class="px-5 pt-5 pb-3">
            <div class="text-[11px] font-medium text-lightgrey-700 uppercase tracking-widest mb-4">
              Document checklist
            </div>

            <template v-for="(item, i) in template.items" :key="i">

              <!-- Section header -->
              <div
                v-if="item.item_type === 'section_header'"
                class="flex items-center gap-3 mt-5 mb-3 first:mt-0"
              >
                <div class="w-1 h-4 rounded-full flex-shrink-0" :style="accentBgStyle" />
                <span class="text-[13px] font-semibold tracking-tight" :style="accentStyle">{{ item.label }}</span>
              </div>

              <!-- Sub-section header -->
              <div
                v-else-if="item.item_type === 'sub_section_header'"
                class="text-[12px] font-semibold text-lightgrey-800 uppercase tracking-wider mt-4 mb-2 px-0.5"
              >
                {{ item.label }}
              </div>

              <!-- Banner -->
              <div
                v-else-if="item.item_type === 'banner'"
                class="bg-lightgrey-100 border border-lightgrey-300 rounded-lg px-4 py-3 my-3 text-[12px] text-lightgrey-800 leading-relaxed"
              >
                {{ item.label }}
              </div>

              <!-- Bottom banner / footer — rendered separately outside the loop, skip here -->
              <template v-else-if="item.item_type === 'bottom_banner' || item.item_type === 'footer'" />

              <!-- Checklist item -->
              <template v-else>
                <div
                  class="flex items-start gap-3 px-3.5 py-3 rounded-xl mb-1 cursor-pointer transition-all duration-150 select-none hover:bg-lightgrey-50"
                  @click="toggleCheck(i)"
                >
                  <!-- Checkbox -->
                  <div
                    class="w-[18px] h-[18px] min-w-[18px] rounded-[5px] border-[1.5px] flex items-center justify-center flex-shrink-0 mt-[2px] transition-all duration-150"
                    :class="checkedMap[i] ? '' : 'border-lightgrey-500 bg-white'"
                    :style="checkedMap[i] ? accentBorderBgStyle : {}"
                  >
                    <UIcon v-if="checkedMap[i]" name="i-heroicons-check-20-solid" class="text-white w-3 h-3" />
                  </div>

                  <!-- Info -->
                  <div class="flex-1 min-w-0">
                    <div class="text-[13px] font-medium leading-snug text-darkblue-500">
                      {{ item.label }}
                    </div>
                    <div v-if="item.note" class="text-[11.5px] mt-1 leading-relaxed text-lightgrey-700">
                      {{ item.note }}
                    </div>
                  </div>

                  <!-- Tag -->
                  <UBadge
                    v-if="item.tag"
                    :label="tagLabel(item.tag)"
                    :color="theme.badgeColor"
                    :variant="theme.badgeVariant"
                    size="sm"
                    class="flex-shrink-0 mt-[2px]"
                  />
                </div>

                <!-- AND / OR connector -->
                <div
                  v-if="item.connector && item.connector !== 'none'"
                  class="flex items-center gap-2 px-3.5 py-1 mb-1"
                >
                  <span class="text-[10px] font-semibold uppercase tracking-widest" :style="accentStyle">
                    {{ item.connector }}
                  </span>
                  <div class="h-px flex-1 bg-lightgrey-200" />
                </div>
              </template>

            </template>
          </div>

          <!-- Bottom banner -->
          <div v-if="bottomBannerItem" class="px-5 pb-4">
            <div class="rounded-lg px-4 py-3 text-[12px] text-white leading-relaxed" :style="{ backgroundColor: theme.accentColor }">
              {{ bottomBannerItem.label }}
            </div>
          </div>

          <!-- Footer -->
          <div v-if="footerItem" class="px-5 pb-5 text-[10px] text-lightgrey-500 leading-relaxed">
            {{ footerItem.label }}
          </div>

          <!-- Divider -->
          <div class="h-px bg-lightgrey-200 mx-5" />

          <!-- Progress -->
          <div class="px-5 pb-5 pt-2">
            <div class="h-[3px] bg-lightgrey-200 rounded-full overflow-hidden mb-2.5">
              <div
                class="h-full bg-green-500 rounded-full transition-all duration-500 ease-out"
                :style="{ width: progressWidth }"
              />
            </div>
            <p class="text-[12px] text-lightgrey-700">
              <span class="font-semibold" :class="doneCount === checklistItems.length && doneCount > 0 ? 'text-green-500' : ''" :style="doneCount === checklistItems.length && doneCount > 0 ? {} : accentStyle">
                {{ doneCount }} of {{ checklistItems.length }}
              </span>
              {{ doneCount === checklistItems.length && doneCount > 0 ? ' — all documents ready' : ' documents ready' }}
            </p>
          </div>

          <!-- Divider -->
          <div class="h-px bg-lightgrey-200 mx-5" />

          <!-- Submit -->
          <div class="px-5 py-4 flex flex-col gap-3">
            <UButton
              :disabled="doneCount === 0 || submitting"
              :loading="submitting"
              :color="theme.buttonColor"
              class="w-full justify-center"
              @click="submit"
            >
              {{ submitted ? 'Submitted!' : 'Submit checklist' }}
            </UButton>
            <UButton
              variant="outline"
              :color="theme.buttonColor"
              class="w-full justify-center"
              :loading="generatingPdf"
              @click="downloadPdfFile"
            >
              <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4 mr-1.5" />
              Download blank checklist
            </UButton>
            <p v-if="submitted" class="text-xs text-green-600 text-center">
              Response saved successfully.
            </p>
            <p v-else class="text-[11px] text-lightgrey-600 text-center leading-relaxed">
              Not ready? That's fine — you can return to this checklist at any time.
            </p>
          </div>

        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { getTemplate, submitResponse } = useDirectus()

const { data: template, pending, error } = await useAsyncData(
  `template-${route.params.id}`,
  () => getTemplate(route.params.id as string)
)

const variantKey = computed(() => template.value?.header_variant ?? 'wlth')
const { theme, accentStyle, accentBgStyle, accentBorderBgStyle } = useVariantTheme(variantKey)

const checkedMap = ref<Record<number, boolean>>({})
const headerValues = ref<Record<string, string>>({})
const submitting = ref(false)
const submitted = ref(false)
const generatingPdf = ref(false)

const checklistItems = computed(() =>
  (template.value?.items ?? []).filter((item: any) => item.item_type === 'checklist_item')
)

const bottomBannerItem = computed(() =>
  (template.value?.items ?? []).find((item: any) => item.item_type === 'bottom_banner')
)

const footerItem = computed(() =>
  (template.value?.items ?? []).find((item: any) => item.item_type === 'footer')
)

const doneCount = computed(() => Object.values(checkedMap.value).filter(Boolean).length)
const progressWidth = computed(() => {
  const total = checklistItems.value.length || 1
  return `${(doneCount.value / total) * 100}%`
})

function toggleCheck(i: number) {
  checkedMap.value[i] = !checkedMap.value[i]
}

const tagLabels: Record<string, string> = {
  rate_check: 'Rate Check',
  repayment_history: 'Repayment History',
  security_check: 'Security Check',
  fund_compliance: 'Fund Compliance',
  fund_liquidity: 'Fund Liquidity',
}

function tagLabel(tag: string) {
  return tagLabels[tag] ?? tag
}


async function downloadPdfFile() {
  if (!template.value) return
  generatingPdf.value = true
  try {
    const bytes = await generateChecklistPdf(template.value, variantKey.value)
    const filename = `${template.value.title.replace(/\s+/g, '_')}_Checklist.pdf`
    downloadPdf(bytes, filename)
  } catch (e) {
    console.error('PDF generation failed:', e)
    alert('PDF generation failed — check the console for details.')
  } finally {
    generatingPdf.value = false
  }
}

async function submit() {
  submitting.value = true
  try {
    await submitResponse({
      template_id: route.params.id,
      applicant_name: headerValues.value['trustee_name'] ?? headerValues.value['applicant_name'] ?? '',
      loanapp_reference: headerValues.value['loanapp_reference'] ?? '',
      completed_items: Object.entries(checkedMap.value)
        .filter(([, v]) => v)
        .map(([i]) => template.value!.items[Number(i)].label),
      submitted_at: new Date().toISOString()
    })
    submitted.value = true
  } finally {
    submitting.value = false
  }
}
</script>
