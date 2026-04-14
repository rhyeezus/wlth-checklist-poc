/**
 * Duplicate a checklist template in Directus.
 *
 * Usage:
 *   node scripts/duplicate-template.mjs <source-id> "New Title" <header_variant>
 *
 * Example:
 *   node scripts/duplicate-template.mjs abc123 "SMSF Easy Refinance" mortgage_mart
 *
 * header_variant options: wlth | mortgage_mart
 */

import { createDirectus, rest, staticToken, readItem, createItem } from '@directus/sdk'

const [,, sourceId, newTitle, headerVariant = 'wlth'] = process.argv

if (!sourceId || !newTitle) {
  console.error('Usage: node scripts/duplicate-template.mjs <source-id> "New Title" <header_variant>')
  process.exit(1)
}

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055'
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || ''

const client = createDirectus(DIRECTUS_URL)
  .with(staticToken(DIRECTUS_TOKEN))
  .with(rest())

async function duplicate() {
  console.log(`\nFetching template ${sourceId}...`)

  const source = await client.request(
    readItem('checklist_templates', sourceId, {
      fields: ['*', 'items.*', 'header_fields.*']
    })
  )

  console.log(`Found: "${source.title}"`)
  console.log(`Items: ${source.items?.length ?? 0}`)
  console.log(`Header fields: ${source.header_fields?.length ?? 0}`)

  // Strip IDs from nested repeater items so Directus creates fresh ones
  const items = (source.items ?? []).map(({ id, checklist_templates_id, ...item }) => item)
  const headerFields = (source.header_fields ?? []).map(({ id, checklist_templates_id, ...field }) => field)

  const payload = {
    title: newTitle,
    loan_type: source.loan_type,
    file_type: source.file_type,
    status: 'draft', // start as draft so you can review before publishing
    header_variant: headerVariant,
    items,
    header_fields: headerFields,
  }

  console.log(`\nCreating duplicate as "${newTitle}" with variant "${headerVariant}"...`)

  const created = await client.request(
    createItem('checklist_templates', payload)
  )

  console.log(`\n✓ Done! New template ID: ${created.id}`)
  console.log(`  Open in Directus: ${DIRECTUS_URL}/admin/content/checklist_templates/${created.id}`)
}

duplicate().catch(err => {
  console.error('\n✗ Error:', err.message ?? err)
  process.exit(1)
})
