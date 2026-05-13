<template>
  <div>

    <!-- Template details section -->
    <div class="px-5 pt-5 pb-4 border-b border-lightgrey-200">
      <div class="text-[11px] font-medium text-lightgrey-700 uppercase tracking-widest mb-4">Template details</div>
      <div class="grid grid-cols-2 gap-3">

        <div class="col-span-2">
          <label class="block text-[11px] font-medium text-lightgrey-700 mb-1">Title</label>
          <input v-model="local.title" type="text" class="w-full text-[13px] text-darkblue-500 bg-lightgrey-50 border border-lightgrey-300 rounded-lg px-3 py-2 outline-none focus:border-royalblue-500 focus:ring-1 focus:ring-royalblue-100 transition-all placeholder:text-lightgrey-500" placeholder="e.g. WLTH Residential Broker" />
        </div>

        <div>
          <label class="block text-[11px] font-medium text-lightgrey-700 mb-1">Loan type</label>
          <select v-model="local.loan_type" class="w-full text-[13px] text-darkblue-500 bg-lightgrey-50 border border-lightgrey-300 rounded-lg px-3 py-2 outline-none focus:border-royalblue-500 transition-all">
            <option value="residential">Residential</option>
            <option value="investment">Investment</option>
            <option value="smsf">SMSF</option>
          </select>
        </div>

        <div>
          <label class="block text-[11px] font-medium text-lightgrey-700 mb-1">File type</label>
          <select v-model="local.file_type" class="w-full text-[13px] text-darkblue-500 bg-lightgrey-50 border border-lightgrey-300 rounded-lg px-3 py-2 outline-none focus:border-royalblue-500 transition-all">
            <option value="broker">Broker</option>
            <option value="customer">Customer</option>
          </select>
        </div>

        <div>
          <label class="block text-[11px] font-medium text-lightgrey-700 mb-1">Brand</label>
          <select v-model="local.header_variant" class="w-full text-[13px] text-darkblue-500 bg-lightgrey-50 border border-lightgrey-300 rounded-lg px-3 py-2 outline-none focus:border-royalblue-500 transition-all">
            <option value="wlth">WLTH</option>
            <option value="mortgage_mart">Mortgage Mart</option>
          </select>
        </div>

        <div>
          <label class="block text-[11px] font-medium text-lightgrey-700 mb-1">Status</label>
          <select v-model="local.status" class="w-full text-[13px] text-darkblue-500 bg-lightgrey-50 border border-lightgrey-300 rounded-lg px-3 py-2 outline-none focus:border-royalblue-500 transition-all">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

      </div>
    </div>

    <!-- Application detail fields section -->
    <div class="px-5 pt-5 pb-4 border-b border-lightgrey-200">
      <div class="flex items-center justify-between mb-1">
        <div class="text-[11px] font-medium text-lightgrey-700 uppercase tracking-widest">Application detail fields</div>
        <button
          class="inline-flex items-center gap-1 text-[11px] text-royalblue-500 hover:text-royalblue-600 transition-colors"
          @click="addHeaderField"
        >
          <UIcon name="i-heroicons-plus" class="w-3 h-3" />
          Add field
        </button>
      </div>
      <p class="text-[12px] text-lightgrey-600 mb-3">Fillable fields shown at the top of the checklist (e.g. Applicant Name, Reference Number).</p>

      <div v-if="!local.header_fields?.length" class="text-[12px] text-lightgrey-500 italic py-1">No fields yet.</div>

      <div
        v-for="(field, i) in local.header_fields"
        :key="i"
        class="flex items-end gap-2 mb-2"
      >
        <div class="flex-1">
          <label class="block text-[11px] font-medium text-lightgrey-700 mb-1">Label</label>
          <input v-model="field.label" type="text" class="w-full text-[13px] text-darkblue-500 bg-lightgrey-50 border border-lightgrey-300 rounded-lg px-3 py-2 outline-none focus:border-royalblue-500 focus:ring-1 focus:ring-royalblue-100 transition-all placeholder:text-lightgrey-500" placeholder="e.g. Applicant Name" />
        </div>
        <div class="flex-1">
          <label class="block text-[11px] font-medium text-lightgrey-700 mb-1">Field key</label>
          <input v-model="field.field_key" type="text" class="w-full text-[13px] text-darkblue-500 bg-lightgrey-50 border border-lightgrey-300 rounded-lg px-3 py-2 outline-none focus:border-royalblue-500 focus:ring-1 focus:ring-royalblue-100 transition-all placeholder:text-lightgrey-500" placeholder="e.g. applicant_name" />
        </div>
        <div class="w-24">
          <label class="block text-[11px] font-medium text-lightgrey-700 mb-1">Width</label>
          <select v-model="field.width" class="w-full text-[13px] text-darkblue-500 bg-lightgrey-50 border border-lightgrey-300 rounded-lg px-3 py-2 outline-none focus:border-royalblue-500 transition-all">
            <option value="full">Full</option>
            <option value="half">Half</option>
          </select>
        </div>
        <button
          class="pb-0.5 p-1.5 text-lightgrey-400 hover:text-red-500 transition-colors flex-shrink-0"
          @click="local.header_fields.splice(i, 1)"
        >
          <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Checklist items section -->
    <div class="px-5 pt-5 pb-4 border-b border-lightgrey-200">
      <div class="flex items-center justify-between mb-1">
        <div class="text-[11px] font-medium text-lightgrey-700 uppercase tracking-widest">Document checklist</div>
        <button
          class="inline-flex items-center gap-1 text-[11px] text-royalblue-500 hover:text-royalblue-600 transition-colors"
          @click="addItem"
        >
          <UIcon name="i-heroicons-plus" class="w-3 h-3" />
          Add item
        </button>
      </div>
      <p class="text-[12px] text-lightgrey-600 mb-3">Build the checklist body. Drag the handle to reorder.</p>

      <div v-if="!local.items?.length" class="text-[12px] text-lightgrey-500 italic py-1">No items yet — add a section header to get started.</div>

      <div ref="itemsContainer">
        <ItemEditorRow
          v-for="(item, i) in local.items"
          :key="item._uid"
          :item="item"
          @remove="local.items.splice(i, 1)"
        />
      </div>
    </div>

    <!-- Save bar — same bottom action style as checklist submit area -->
    <div class="px-5 py-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <transition name="fade">
          <span v-if="saved" class="inline-flex items-center gap-1.5 text-[12px] text-green-600">
            <UIcon name="i-heroicons-check-circle" class="w-4 h-4" /> Saved
          </span>
          <span v-else-if="saveError" class="text-[12px] text-red-500">Save failed — check console.</span>
        </transition>
      </div>
      <UButton color="primary" :loading="saving" @click="$emit('save', local)">
        {{ isNew ? 'Create template' : 'Save changes' }}
      </UButton>
    </div>

  </div>
</template>

<script setup lang="ts">
import { useSortable } from '@vueuse/integrations/useSortable'

const props = defineProps<{
  modelValue?: Record<string, any>
  isNew?: boolean
  saving?: boolean
  saved?: boolean
  saveError?: boolean
}>()

defineEmits<{ save: [payload: Record<string, any>] }>()

const EMPTY_TEMPLATE = {
  title: '',
  loan_type: 'residential',
  file_type: 'broker',
  header_variant: 'wlth',
  status: 'draft',
  header_fields: [],
  items: [],
}

const local = ref<Record<string, any>>(
  props.modelValue
    ? JSON.parse(JSON.stringify(props.modelValue))
    : { ...EMPTY_TEMPLATE }
)

watch(() => local.value.items, (items) => {
  items?.forEach((item: any) => {
    if (!item._uid) item._uid = Math.random().toString(36).slice(2)
  })
}, { immediate: true, deep: false })

watch(() => props.modelValue, (val) => {
  if (val) {
    local.value = JSON.parse(JSON.stringify(val))
    local.value.items?.forEach((item: any) => {
      if (!item._uid) item._uid = Math.random().toString(36).slice(2)
    })
  }
})

const itemsContainer = ref<HTMLElement | null>(null)
useSortable(itemsContainer, local.value.items ?? [], {
  handle: '.drag-handle',
  animation: 150,
})

function addHeaderField() {
  if (!local.value.header_fields) local.value.header_fields = []
  local.value.header_fields.push({ label: '', field_key: '', width: 'full' })
}

function addItem() {
  if (!local.value.items) local.value.items = []
  local.value.items.push({
    _uid: Math.random().toString(36).slice(2),
    item_type: 'checklist_item',
    label: '',
    note: '',
    connector: 'none',
    required: false,
    tag: '',
  })
}
</script>
