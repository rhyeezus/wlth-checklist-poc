<template>
  <AdminShell title="New template" subtitle="Supporting Document Checklist">
    <TemplateEditor
      :is-new="true"
      :saving="saving"
      :saved="saved"
      :save-error="saveError"
      @save="handleSave"
    />
  </AdminShell>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin-auth' })

const { createTemplate } = useDirectus()
const router = useRouter()
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
    const result: any = await createTemplate(clean)
    router.replace(`/admin/templates/${result.id}`)
  } catch (e) {
    console.error('Create failed:', e)
    saveError.value = true
  } finally {
    saving.value = false
  }
}
</script>
