import { createDirectus, rest, readItems, readItem, createItem } from '@directus/sdk'

export const useDirectus = () => {
  const config = useRuntimeConfig()

  const client = createDirectus(config.public.directusUrl)
    .with(rest())

  const getTemplates = () =>
    client.request(readItems('checklist_templates', {
      filter: { status: { _eq: 'published' } },
      fields: ['id', 'title', 'loan_type', 'file_type', 'header_variant']
    }))

  const getTemplate = (id: string) =>
    client.request(readItem('checklist_templates', id, {
      fields: ['*', 'items.*', 'header_fields.*']
    }))

  const submitResponse = (payload: Record<string, any>) =>
    client.request(createItem('checklist_responses', payload))

  return { getTemplates, getTemplate, submitResponse }
}
