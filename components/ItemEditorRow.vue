<template>
  <div class="mb-1">
    <!-- Collapsed row — styled like a checklist item -->
    <div
      class="flex items-start gap-3 px-3.5 py-3 rounded-xl cursor-pointer transition-all duration-150 select-none hover:bg-lightgrey-50"
      @click="open = !open"
    >
      <!-- Drag handle -->
      <UIcon name="i-heroicons-bars-2" class="w-4 h-4 text-lightgrey-300 flex-shrink-0 mt-[2px] drag-handle cursor-grab hover:text-lightgrey-500 transition-colors" />

      <!-- Type badge -->
      <div class="flex-shrink-0 mt-[2px]">
        <span class="text-[10px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded bg-lightgrey-100 text-lightgrey-600">
          {{ TYPE_LABELS[item.item_type] ?? item.item_type }}
        </span>
      </div>

      <!-- Label preview -->
      <div class="flex-1 min-w-0">
        <div class="text-[13px] font-medium leading-snug text-darkblue-500 truncate">
          {{ item.label || '(no label)' }}
        </div>
      </div>

      <!-- Expand icon -->
      <UIcon
        :name="open ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
        class="w-4 h-4 text-lightgrey-400 flex-shrink-0 mt-[2px]"
      />

      <!-- Remove -->
      <button
        class="p-0.5 text-lightgrey-300 hover:text-red-400 transition-colors flex-shrink-0 mt-[1px]"
        title="Remove"
        @click.stop="$emit('remove')"
      >
        <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
      </button>
    </div>

    <!-- Expanded fields -->
    <div v-if="open" class="mx-3.5 mb-3 bg-lightgrey-50 rounded-xl px-4 py-4 grid grid-cols-2 gap-3">

      <div class="col-span-2">
        <label class="block text-[11px] font-medium text-lightgrey-700 mb-1">Type</label>
        <select v-model="item.item_type" class="w-full text-[13px] text-darkblue-500 bg-white border border-lightgrey-300 rounded-lg px-3 py-2 outline-none focus:border-royalblue-500 transition-all">
          <option v-for="(label, val) in TYPE_LABELS" :key="val" :value="val">{{ label }}</option>
        </select>
      </div>

      <div class="col-span-2">
        <label class="block text-[11px] font-medium text-lightgrey-700 mb-1">Label</label>
        <textarea v-model="item.label" rows="2" class="w-full text-[13px] text-darkblue-500 bg-white border border-lightgrey-300 rounded-lg px-3 py-2 outline-none focus:border-royalblue-500 transition-all resize-none" />
      </div>

      <div v-if="item.item_type === 'checklist_item' || item.item_type === 'list_item'" class="col-span-2">
        <label class="block text-[11px] font-medium text-lightgrey-700 mb-1">Note <span class="text-lightgrey-400 font-normal">(optional)</span></label>
        <input v-model="item.note" type="text" class="w-full text-[13px] text-darkblue-500 bg-white border border-lightgrey-300 rounded-lg px-3 py-2 outline-none focus:border-royalblue-500 transition-all" />
      </div>

      <div v-if="item.item_type === 'checklist_item'">
        <label class="block text-[11px] font-medium text-lightgrey-700 mb-1">Connector</label>
        <select v-model="item.connector" class="w-full text-[13px] text-darkblue-500 bg-white border border-lightgrey-300 rounded-lg px-3 py-2 outline-none focus:border-royalblue-500 transition-all">
          <option value="none">None</option>
          <option value="and">AND</option>
          <option value="or">OR</option>
        </select>
      </div>

      <div v-if="item.item_type === 'checklist_item'" class="flex items-center gap-2 pt-4">
        <input :id="`req-${uid}`" v-model="item.required" type="checkbox" class="rounded" />
        <label :for="`req-${uid}`" class="text-[12px] text-darkblue-500">Required</label>
      </div>

      <div v-if="item.item_type === 'checklist_item'" class="col-span-2">
        <label class="block text-[11px] font-medium text-lightgrey-700 mb-1">Tag <span class="text-lightgrey-400 font-normal">(optional)</span></label>
        <select v-model="item.tag" class="w-full text-[13px] text-darkblue-500 bg-white border border-lightgrey-300 rounded-lg px-3 py-2 outline-none focus:border-royalblue-500 transition-all">
          <option value="">None</option>
          <option value="rate_check">Rate Check</option>
          <option value="repayment_history">Repayment History</option>
          <option value="security_check">Security Check</option>
          <option value="fund_compliance">Fund Compliance</option>
          <option value="fund_liquidity">Fund Liquidity</option>
        </select>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ item: Record<string, any> }>()
defineEmits<{ remove: [] }>()

const open = ref(false)
const uid = Math.random().toString(36).slice(2)

const TYPE_LABELS: Record<string, string> = {
  section_header:     'Section header',
  sub_section_header: 'Sub-section',
  checklist_item:     'Checklist item',
  list_item:          'List item',
  banner:             'Banner',
  bottom_banner:      'Bottom banner',
  signature_row:      'Signature row',
  footer:             'Footer',
}
</script>
