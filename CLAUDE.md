# CLAUDE.md — wlth-checklist-poc

## What this project is

A Nuxt 4 admin tool for creating and managing interactive checklist templates, backed by Directus. Templates are stored in Directus and can be exported to branded PDFs. Built as a POC — the templates will be consumed by the WLTH broker portal in production.

## Quick start (for non-technical staff)

1. Start both servers (see below)
2. Go to **http://localhost:3000** — you'll be asked for the admin passphrase
3. Once logged in you'll see the template list

**To create a template from an existing PDF:**
- Click **Import from PDF** → drop one or more PDFs → wait for Claude to extract → review the result → click **Save**

**To create a template from scratch:**
- Click **New template** → fill in the details → add items → click **Create template**

**To edit an existing template:**
- Click any template in the list → click **Edit** in the top-right action bar

**To preview a template as it will appear to a broker:**
- Click any template in the list — the form opens in preview mode

---

## Stack

- **Nuxt 4** (pinned to 4.3.0) — SSR disabled (client-side only, required for CORS)
- **Directus 11** — local SQLite instance (broker portal Directus in production)
- **@wlth/design-system** — Nuxt layer providing Tailwind v4 tokens and components
- **pdf-lib + @pdf-lib/fontkit** — interactive PDF generation
- **@anthropic-ai/sdk** — Claude Haiku PDF extraction via Nuxt server route

## Day-to-day running

Two terminals required:

```bash
# Terminal 1 — Directus
cd ~/directus-poc && nvm use 22 && npx directus start

# Terminal 2 — Nuxt
cd ~/path/to/wlth-checklist-poc && nvm use 22 && npm run dev
```

- App + admin: http://localhost:3000
- Directus admin: http://localhost:8055/admin (admin@wlth.com / admin123)

**Always use Node 22 via nvm** — Directus does not support Node 24.

## Key files

| File | Purpose |
|---|---|
| `pages/index.vue` | Redirects to `/admin/templates` |
| `pages/admin/index.vue` | Passphrase gate |
| `pages/admin/templates/index.vue` | Template list with pill filters |
| `pages/admin/templates/new.vue` | Create template form |
| `pages/admin/templates/[id].vue` | Edit template form |
| `pages/admin/templates/upload.vue` | Multi-PDF upload + Claude extraction |
| `pages/checklist/[id].vue` | Checklist preview/form renderer |
| `components/TemplateEditor.vue` | Shared editor used by new + edit pages |
| `components/ItemEditorRow.vue` | Single item row in the editor |
| `components/admin/Shell.vue` | Admin page wrapper with branded header |
| `components/ChecklistHeader.vue` | Branded header banner on checklist pages |
| `composables/useDirectus.ts` | All Directus API calls |
| `composables/useAdminAuth.ts` | Passphrase auth composable |
| `composables/useVariantTheme.ts` | Brand theme config per header_variant |
| `composables/useChecklistPdf.ts` | PDF generation via pdf-lib |
| `middleware/admin-auth.ts` | Redirects unauthenticated users to gate |
| `server/api/extract-pdf.post.ts` | Claude Haiku PDF extraction endpoint |
| `scripts/seed-templates.mjs` | Seeds templates into Directus (dev use) |
| `scripts/duplicate-template.mjs` | CLI tool to clone a Directus template |

## Admin auth

Protected by a passphrase stored in `.env` as `ADMIN_PASSPHRASE`. The value is saved to `localStorage` on login and checked on every admin page load. No sessions or tokens — this is intentionally simple for a POC.

## Template schema

### `checklist_templates` collection

| Field | Type | Notes |
|---|---|---|
| `title` | String | Shown in header and PDF |
| `loan_type` | String | `residential`, `investment`, `smsf` |
| `file_type` | String | `broker`, `customer` |
| `status` | String | `draft`, `published`, `archived` |
| `header_variant` | String | `wlth`, `mortgage_mart` |
| `header_fields` | JSON | Array of `{ label, field_key, width: 'full'|'half' }` |
| `items` | JSON | Array of item objects (see item types below) |

### Item types

| `item_type` | Renders as |
|---|---|
| `section_header` | Accent-coloured heading with left bar |
| `sub_section_header` | Small uppercase heading |
| `checklist_item` | Checkbox row (interactive, counts toward progress) |
| `banner` | Light grey info box — supports long/wrapped text |
| `bottom_banner` | Accent-coloured banner pinned above footer |
| `footer` | Small legal text at the bottom |
| `list_item` | Plain bullet point — non-interactive, no checkbox |
| `signature_row` | Name input + Signature line + Date input row |

### Checklist item sub-fields

| Field | Notes |
|---|---|
| `label` | Primary text |
| `note` | Helper text below label |
| `connector` | `none`, `and`, `or` — displayed after the item |
| `required` | Boolean |
| `tag` | `rate_check`, `repayment_history`, `security_check`, `fund_compliance`, `fund_liquidity` |

## PDF extraction (Claude)

The upload page sends PDFs to `server/api/extract-pdf.post.ts`, which calls Claude Haiku with the PDF as a base64 document. Claude infers:
- `loan_type` — smsf if SMSF/superannuation mentioned, investment if explicit, residential otherwise
- `file_type` — broker if addressed to a broker, customer if borrower-facing

Multiple PDFs can be dropped at once — extractions run in parallel. After extraction, duplicate detection compares the extracted title against existing templates (case-insensitive exact match).

## Adding a new item type

Three places need updating:

1. **`pages/checklist/[id].vue`** — add a `v-else-if="item.item_type === 'your_type'"` block inside the items loop
2. **`composables/useChecklistPdf.ts`** — add an `else if` branch inside the items loop
3. **`components/ItemEditorRow.vue`** — add to the `TYPE_LABELS` map

If the new type should be interactive (checked off), also add it to the `checklistItems` computed filter in `[id].vue`.

## Adding a new brand variant

1. Add an entry to `composables/useVariantTheme.ts`
2. Add the logomark SVG to `components/ChecklistHeader.vue` and `components/admin/Shell.vue`
3. Add `new_brand` as a choice in the `header_variant` dropdown in Directus → Settings → Data Model → checklist_templates
4. Add the SVG path and render branch in `composables/useChecklistPdf.ts`
5. Add to `BRAND_FILTERS` in `pages/admin/templates/index.vue`

## Environment variables

```
DIRECTUS_URL=http://localhost:8055
DIRECTUS_TOKEN=TgmfbCAZhCBxNu79yqNKKei21Glh_Kzs   # admin write access
ANTHROPIC_API_KEY=sk-ant-...                         # Claude PDF extraction
ADMIN_PASSPHRASE=...                                 # admin UI gate
```

`DIRECTUS_TOKEN` is used by seed scripts and the admin UI (write operations). `ANTHROPIC_API_KEY` is server-side only (never exposed to the browser).

## Legal constants (used in footer/bottom_banner items)

```
Contact scenarios@wlth.com if you are unable to provide any of the requirements before submitting the application.
WLTH Lend Pty Ltd (ACN 641 398 816 | CRN 525 783) as authorised by WLTH Pty Ltd (ACN 639 591 245 | ACL 525 752)
```

## Known limitations (POC)

- No session persistence — checklist progress is lost on page refresh
- Admin passphrase is stored in `localStorage` (acceptable for internal tool)
- PDF logomark drawn as SVG path, not a true image embed
- SuisseIntl SemiBold unavailable — Medium weight used instead
- Nuxt pinned to 4.3.0 — 4.4.5 has a regression with `ssr: false` + server routes
