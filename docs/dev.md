# Checklist POC — Developer Documentation

This POC replaces the static PDF checklist workflow with live, Directus-driven interactive forms. It is built as a standalone Nuxt 4 app extending the WLTH design system, intended to be integrated into the broker portal.

---

## Stack

- **Nuxt 4** (SSR disabled — client-side only, required for CORS)
- **Directus 11** (local SQLite instance for POC, broker portal instance for production)
- **WLTH Design System** (`@wlth/design-system` Nuxt layer)
- **Tailwind v4** via the design system
- **pdf-lib** + **@pdf-lib/fontkit** for interactive PDF generation

---

## Environment setup

Create a `.env` file in the project root:

```
DIRECTUS_URL=http://localhost:8055
DIRECTUS_TOKEN=your_token_here
```

The token must belong to an admin user in Directus. Generate it via **Settings → Users → (admin user) → Token**.

The Nuxt app does not use the token for API requests — Directus collections are set to **public read access**. The token is only used by the duplicate script.

---

## Directus schema

### `checklist_templates` collection

| Field | Type | Notes |
|---|---|---|
| `id` | Integer | Auto, primary key |
| `status` | Dropdown | `draft`, `published`, `archived` |
| `title` | String | Template name shown in header and footer |
| `loan_type` | Dropdown | `residential`, `investment`, `smsf` |
| `file_type` | Dropdown | `broker`, `customer` |
| `header_variant` | Dropdown | `wlth`, `mortgage_mart` |
| `items` | Repeater | See sub-fields below |
| `header_fields` | Repeater | See sub-fields below |

#### `items` repeater sub-fields

| Field | Type | Notes |
|---|---|---|
| `item_type` | Dropdown | `section_header`, `sub_section_header`, `checklist_item`, `banner`, `bottom_banner`, `footer` |
| `label` | String | Primary text shown |
| `note` | String | Helper text below label (checklist_item only) |
| `connector` | Dropdown | `none`, `and`, `or` — shown after this item |
| `required` | Boolean | Whether item is mandatory |
| `tag` | Dropdown | `rate_check`, `repayment_history`, `security_check`, `fund_compliance`, `fund_liquidity` |

#### `header_fields` repeater sub-fields

| Field | Type | Notes |
|---|---|---|
| `label` | String | Field label shown above the input |
| `field_key` | String | Unique key used to identify the field value (e.g. `applicant_name`, `loanapp_reference`) |
| `width` | Dropdown | `full`, `half` — half fields render side by side |

### `checklist_responses` collection

| Field | Type | Notes |
|---|---|---|
| `id` | Integer | Auto |
| `template_id` | String | ID of the template this response belongs to |
| `applicant_name` | String | From header field `trustee_name` or `applicant_name` |
| `loanapp_reference` | String | From header field `loanapp_reference` |
| `completed_items` | JSON | Array of label strings for checked items |
| `submitted_at` | Datetime | ISO timestamp |

### `documentation` collection

Singleton collection with a single `content` WYSIWYG field. Used for user-facing documentation inside Directus. Accessible via **Content → Documentation** in the sidebar.

---

## Directus access policy

For the Nuxt app to fetch data without authentication, the following collections need **public read access**:

- `checklist_templates`
- `checklist_responses` (public create access for submissions)

Set via **Settings → Access Policies → Public → add permission for each collection**.

---

## Project structure

```
pages/
  index.vue               # Template list page
  checklist/[id].vue      # Checklist form renderer

components/
  ChecklistHeader.vue     # Branded header banner (title, subtitle, wedge, logomark)

composables/
  useDirectus.ts          # API calls (getTemplates, getTemplate, submitResponse)
  useVariantTheme.ts      # Brand theme config (colours, badge/button variants)
  useChecklistPdf.ts      # PDF generation and download

scripts/
  duplicate-template.mjs  # CLI script to duplicate a Directus template

public/
  fonts/
    SuisseIntl-Regular.ttf
    SuisseIntl-Medium.ttf
  WLTH_Marque.svg
  MMA_Marque.svg

docs/
  dev.md                  # This file
```

---

## Key files explained

### `useDirectus.ts`
Initialises the Directus SDK client with no auth (public access). Exports:
- `getTemplates()` — fetches all published templates for the index page
- `getTemplate(id)` — fetches a single template with all items and header fields
- `submitResponse(payload)` — creates a record in `checklist_responses`

### `useVariantTheme.ts`
Takes a `variantKey` ref (`wlth` or `mortgage_mart`) and returns a reactive theme object used to drive colours throughout the form:
- `accentColor` — hex colour for section headers, checkboxes, connectors, progress count
- `badgeColor` / `badgeVariant` — Nuxt UI UBadge props
- `buttonColor` — Nuxt UI UButton color prop
- `accentStyle` / `accentBgStyle` / `accentBorderBgStyle` — inline style objects

To add a new brand, add a new entry to the `themes` object in this file and add the corresponding SVG logomark to `ChecklistHeader.vue`.

### `ChecklistHeader.vue`
Renders the form header banner. Props:
- `title` — the template title
- `variantKey` — `wlth` or `mortgage_mart`

Contains inlined SVG paths for both logomarks. The diagonal wedge is drawn using CSS `clip-path`.

### `useChecklistPdf.ts`
Generates an interactive PDF from template data using `pdf-lib`. The PDF includes:
- Branded header with diagonal wedge and logomark (drawn as SVG paths)
- Application detail text fields (AcroForm)
- Checkbox rows for each checklist item (AcroForm)
- Section/sub-section headers and banners
- Bottom banner and footer drawn on every page

Fonts are fetched from `/fonts/` at generation time and embedded into the PDF. SuisseIntl Regular and Medium are used.

### `duplicate-template.mjs`
Node script that clones a Directus template record including all items and header fields. Strips repeater IDs so Directus creates fresh ones on the copy.

Usage:
```bash
DIRECTUS_URL=http://localhost:8055 DIRECTUS_TOKEN=$(grep DIRECTUS_TOKEN .env | cut -d= -f2) node scripts/duplicate-template.mjs <source-id> "New Title" <wlth|mortgage_mart>
```

---

## Adding a new brand variant

1. Add a new entry to the `themes` object in `composables/useVariantTheme.ts`:
```ts
new_brand: {
  accentColor: '#hex',
  badgeColor: 'primary',   // or any Nuxt UI color token
  badgeVariant: 'subtle',
  buttonColor: 'primary',
}
```

2. Add the logomark SVG path to `components/ChecklistHeader.vue` as a new `v-else-if` block inside the wedge div.

3. Add `new_brand` as a choice in the `header_variant` dropdown field in **Directus → Settings → Data Model → checklist_templates**.

---

## Integrating into the broker portal

This POC is designed to be a direct lift-and-shift:

1. Copy `pages/checklist/[id].vue` and `pages/index.vue` into the portal pages directory
2. Copy `components/ChecklistHeader.vue` into the portal components directory
3. Copy `composables/useDirectus.ts`, `useVariantTheme.ts`, `useChecklistPdf.ts` into composables
4. Copy `scripts/duplicate-template.mjs` into scripts
5. Copy `public/fonts/` into the portal public directory
6. Create the `checklist_templates`, `checklist_responses`, and `documentation` collections in the portal's Directus instance using the schema above
7. Set public read/create access on those collections
8. Add `pdf-lib` and `@pdf-lib/fontkit` to the portal's `package.json`

The design system and Tailwind tokens are already present in the portal so no additional styling setup is needed.

---

## Known limitations (POC)

- No authentication — checklists are publicly accessible by URL
- No session persistence — progress is lost on page refresh
- PDF logomark is drawn as SVG path text, not a true image embed
- SuisseIntl SemiBold is not available on the CDN — Medium weight is used instead
- The duplicate script requires a valid admin token and direct terminal access
