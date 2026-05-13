<template>
  <AdminShell title="Import from PDF" subtitle="Supporting Document Checklist" back-label="All templates">
    <div class="px-5 pt-5 pb-5">

      <!-- Drop zone -->
      <label
        class="flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl px-6 py-8 cursor-pointer transition-colors mb-4"
        :class="dragging
          ? 'border-royalblue-400 bg-royalblue-50'
          : 'border-lightgrey-300 hover:border-royalblue-300 hover:bg-lightgrey-50'"
        @dragover.prevent="dragging = true"
        @dragleave.prevent="dragging = false"
        @drop.prevent="onDrop"
      >
        <UIcon name="i-heroicons-document-arrow-up" class="w-8 h-8 text-lightgrey-400" />
        <div class="text-center">
          <p class="text-[13px] font-medium text-darkblue-500">Drop PDFs here, or click to browse</p>
          <p class="text-[11px] text-lightgrey-500 mt-1">Multiple files supported · PDF only · max 10 MB each</p>
        </div>
        <input ref="fileInput" type="file" accept="application/pdf" multiple class="hidden" @change="onFileChange" />
      </label>

      <!-- File queue -->
      <div v-if="queue.length" class="flex flex-col gap-3">
        <div
          v-for="item in queue"
          :key="item.id"
          class="bg-white border rounded-xl overflow-hidden transition-colors"
          :class="item.expanded ? 'border-royalblue-300' : 'border-lightgrey-300'"
        >
          <!-- Row header -->
          <div class="flex items-center gap-3 px-4 py-3">
            <!-- Status icon -->
            <div class="flex-shrink-0 w-6 flex items-center justify-center">
              <UIcon v-if="item.status === 'queued'" name="i-heroicons-clock" class="w-4 h-4 text-lightgrey-400" />
              <svg v-else-if="item.status === 'extracting'" class="w-4 h-4 animate-spin text-royalblue-500" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
              </svg>
              <UIcon v-else-if="item.status === 'done'" name="i-heroicons-check-circle" class="w-4 h-4 text-green-500" />
              <UIcon v-else-if="item.status === 'error'" name="i-heroicons-x-circle" class="w-4 h-4 text-red-400" />
            </div>

            <!-- File name + meta -->
            <div class="flex-1 min-w-0">
              <div class="text-[13px] font-medium text-darkblue-500 truncate">{{ item.file.name }}</div>
              <div class="text-[11px] text-lightgrey-500 mt-0.5">
                <span v-if="item.status === 'queued'">Waiting…</span>
                <span v-else-if="item.status === 'extracting'" class="text-royalblue-500">Extracting with Claude…</span>
                <span v-else-if="item.status === 'done'" class="text-green-600">
                  {{ item.extracted?.items?.length ?? 0 }} items · {{ item.extracted?.loan_type }} · {{ item.extracted?.file_type }}
                  <span v-if="item.saved" class="ml-1 text-green-600 font-medium">· Saved</span>
                </span>
                <span v-else-if="item.status === 'error'" class="text-red-500">{{ item.error }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 flex-shrink-0">
              <button
                v-if="item.status === 'done' && !item.saved"
                class="text-[11px] font-medium text-royalblue-500 hover:text-royalblue-600 transition-colors"
                @click="item.expanded = !item.expanded"
              >
                {{ item.expanded ? 'Collapse' : 'Review & save' }}
              </button>
              <button
                class="p-1 text-lightgrey-300 hover:text-red-400 transition-colors"
                @click="removeItem(item.id)"
              >
                <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Duplicate warning -->
          <div v-if="item.duplicate && !item.saved" class="mx-4 mb-3 mt-0 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-[12px] text-amber-800 flex items-start gap-2">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <span>
              A template named <strong>{{ item.duplicate.title }}</strong> already exists.
              <NuxtLink :to="`/admin/templates/${item.duplicate.id}`" class="underline hover:text-amber-900 ml-1">View existing</NuxtLink>
            </span>
          </div>

          <!-- Inline editor -->
          <div v-if="item.expanded && item.extracted" class="border-t border-lightgrey-200">
            <TemplateEditor
              :model-value="item.extracted"
              :is-new="true"
              :saving="item.saving"
              :saved="item.saved"
              :save-error="item.saveError"
              @save="(payload) => handleSave(item, payload)"
            />
          </div>
        </div>
      </div>

    </div>
  </AdminShell>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin-auth' })

const { createTemplate, getAllTemplates } = useDirectus()

const { data: existingTemplates } = await useAsyncData('upload-existing', getAllTemplates)

interface QueueItem {
  id: string
  file: File
  status: 'queued' | 'extracting' | 'done' | 'error'
  extracted: Record<string, any> | null
  duplicate: { id: number | string, title: string } | null
  error: string
  expanded: boolean
  saving: boolean
  saved: boolean
  saveError: boolean
}

const fileInput = ref<HTMLInputElement | null>(null)
const dragging = ref(false)
const queue = ref<QueueItem[]>([])

function makeItem(file: File): QueueItem {
  return {
    id: Math.random().toString(36).slice(2),
    file,
    status: 'queued',
    extracted: null,
    duplicate: null,
    error: '',
    expanded: false,
    saving: false,
    saved: false,
    saveError: false,
  }
}

function findDuplicate(title: string) {
  if (!title || !existingTemplates.value) return null
  const needle = title.trim().toLowerCase()
  const match = (existingTemplates.value as any[]).find(
    t => t.title?.trim().toLowerCase() === needle
  )
  return match ? { id: match.id, title: match.title } : null
}

function addFiles(files: FileList | File[]) {
  const newItems: QueueItem[] = []
  for (const f of Array.from(files)) {
    if (f.type !== 'application/pdf') continue
    if (f.size > 10 * 1024 * 1024) continue
    newItems.push(makeItem(f))
  }
  queue.value.push(...newItems)
  newItems.forEach(extractItem)
}

function onFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files) addFiles(files)
  if (fileInput.value) fileInput.value.value = ''
}

function onDrop(e: DragEvent) {
  dragging.value = false
  if (e.dataTransfer?.files) addFiles(e.dataTransfer.files)
}

async function extractItem(item: QueueItem) {
  item.status = 'extracting'
  try {
    const form = new FormData()
    form.append('pdf', item.file)
    const result = await $fetch<Record<string, any>>('/api/extract-pdf', { method: 'POST', body: form })
    if (result.items) {
      result.items.forEach((i: any) => { i._uid = Math.random().toString(36).slice(2) })
    }
    item.extracted = { loan_type: 'residential', file_type: 'broker', header_variant: 'wlth', status: 'draft', ...result }
    item.duplicate = findDuplicate(item.extracted.title)
    item.status = 'done'
  } catch (e: any) {
    item.error = e?.data?.message ?? e?.message ?? 'Extraction failed'
    item.status = 'error'
  }
}

async function handleSave(item: QueueItem, payload: Record<string, any>) {
  item.saving = true
  item.saveError = false
  try {
    const clean = { ...payload, items: (payload.items ?? []).map(({ _uid, ...i }: any) => i) }
    await createTemplate(clean)
    item.saved = true
    item.expanded = false
  } catch (e) {
    console.error('Save failed:', e)
    item.saveError = true
  } finally {
    item.saving = false
  }
}

function removeItem(id: string) {
  queue.value = queue.value.filter(i => i.id !== id)
}
</script>
