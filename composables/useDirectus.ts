import {
  createDirectus,
  rest,
  staticToken,
  readItems,
  readItem,
  createItem,
  updateItem,
  deleteItem,
} from '@directus/sdk'

export const useDirectus = () => {
  const config = useRuntimeConfig()

  // Public client — no auth, for checklist viewer
  const client = createDirectus(config.public.directusUrl)
    .with(rest())

  // Admin client — uses token, for template editor
  const adminClient = createDirectus(config.public.directusUrl)
    .with(staticToken(config.public.directusToken))
    .with(rest())

  const getTemplates = () =>
    client.request(readItems('checklist_templates', {
      filter: { status: { _eq: 'published' } },
      fields: ['id', 'title', 'loan_type', 'file_type', 'header_variant'],
    }))

  const getTemplate = (id: string) =>
    client.request(readItem('checklist_templates', id, {
      fields: ['*', 'items.*', 'header_fields.*'],
    }))

  const submitResponse = (payload: Record<string, any>) =>
    client.request(createItem('checklist_responses', payload))

  // ── Admin write methods ───────────────────────────────────────────────────

  const getAllTemplates = () =>
    adminClient.request(readItems('checklist_templates', {
      fields: ['id', 'title', 'loan_type', 'file_type', 'header_variant', 'status'],
      sort: ['-id'],
      limit: -1,
    }))

  const createTemplate = (payload: Record<string, any>) =>
    adminClient.request(createItem('checklist_templates', payload))

  const updateTemplate = (id: string | number, payload: Record<string, any>) =>
    adminClient.request(updateItem('checklist_templates', id, payload))

  const deleteTemplate = (id: string | number) =>
    adminClient.request(deleteItem('checklist_templates', id))

  const duplicateTemplate = async (id: string | number, newTitle: string, headerVariant: string) => {
    const source: any = await adminClient.request(readItem('checklist_templates', id, {
      fields: ['*', 'items.*', 'header_fields.*'],
    }))
    const { id: _id, ...rest } = source
    // Strip repeater IDs so Directus creates fresh ones
    const items = (source.items ?? []).map(({ id: _i, ...item }: any) => item)
    const headerFields = (source.header_fields ?? []).map(({ id: _i, ...f }: any) => f)
    return adminClient.request(createItem('checklist_templates', {
      ...rest,
      title: newTitle,
      header_variant: headerVariant,
      items,
      header_fields: headerFields,
    }))
  }

  return {
    getTemplates,
    getTemplate,
    submitResponse,
    getAllTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
  }
}
