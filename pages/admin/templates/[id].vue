<template>
  <AdminShell :title="template?.title || 'Edit template'" subtitle="Supporting Document Checklist">
    <div v-if="pending" class="px-5 py-6 text-sm text-lightgrey-700">Loading template...</div>
    <div v-else-if="error" class="px-5 py-6 text-sm text-red-500">Failed to load template.</div>
    <TemplateEditor
      v-else-if="template"
      :model-value="template"
      :saving="saving"
      :saved="saved"
      :save-error="saveError"
      @save="handleSave"
    />
  </AdminShell>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin-auth' })

const route = useRoute()
const { getTemplate, updateTemplate } = useDirectus()

const { data: template, pending, error } = await useAsyncData(
  `admin-template-${route.params.id}`,
  () => getTemplate(route.params.id as string)
)

const saving = ref(false)
const saved = ref(false)
const saveError = ref(false)

async function handleSave(payload: Record<string, any>) {
  saving.value = true
  saved.value = false
  saveError.value = false
  try {
    const clean = {
      ...payload,
      items: (payload.items ?? []).map(({ _uid, ...item }: any) => item),
    }
    await updateTemplate(route.params.id as string, clean)
    saved.value = true
    setTimeout(() => { saved.value = false }, 3000)
  } catch (e) {
    console.error('Save failed:', e)
    saveError.value = true
  } finally {
    saving.value = false
  }
}
</script>
