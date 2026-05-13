<template>
  <AdminShell title="How to use" subtitle="Checklist Template Manager" back-label="All templates" back-to="/admin/templates">
    <div class="px-5 pt-5 pb-8 space-y-8">

      <!-- Intro -->
      <p class="text-[13px] text-lightgrey-700 leading-relaxed">
        This tool lets you create and manage checklist templates without touching any code. Templates are stored centrally and can be previewed, edited, or exported as branded PDFs at any time.
      </p>

      <!-- Step cards -->
      <div class="space-y-4">

        <div class="bg-white border border-lightgrey-200 rounded-xl p-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-6 h-6 rounded-full bg-royalblue-500 text-white text-[11px] font-semibold flex items-center justify-center flex-shrink-0">1</div>
            <div class="text-[13px] font-semibold text-darkblue-500">Import a template from an existing PDF</div>
          </div>
          <p class="text-[12px] text-lightgrey-600 leading-relaxed ml-9">
            Click <strong>Import from PDF</strong> on the template list. Drop one or more PDF checklists — Claude will read each one and extract the structure automatically. Review the result, adjust anything that looks off, then click <strong>Save</strong>. You can drop multiple PDFs at once and they'll all process in parallel.
          </p>
        </div>

        <div class="bg-white border border-lightgrey-200 rounded-xl p-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-6 h-6 rounded-full bg-royalblue-500 text-white text-[11px] font-semibold flex items-center justify-center flex-shrink-0">2</div>
            <div class="text-[13px] font-semibold text-darkblue-500">Create a template from scratch</div>
          </div>
          <p class="text-[12px] text-lightgrey-600 leading-relaxed ml-9">
            Click <strong>New template</strong>. Fill in the title, loan type, brand, and status. Add header fields (the fillable fields shown at the top of the form, e.g. Applicant Name). Then build the checklist body by adding items — use <strong>Section header</strong> to group items, <strong>Checklist item</strong> for each document requirement, and <strong>Banner</strong> for important notes. Drag the handle on the left to reorder. Click <strong>Create template</strong> when done.
          </p>
        </div>

        <div class="bg-white border border-lightgrey-200 rounded-xl p-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-6 h-6 rounded-full bg-royalblue-500 text-white text-[11px] font-semibold flex items-center justify-center flex-shrink-0">3</div>
            <div class="text-[13px] font-semibold text-darkblue-500">Preview, edit, or delete a template</div>
          </div>
          <p class="text-[12px] text-lightgrey-600 leading-relaxed ml-9">
            Click any template in the list to open it in preview mode — this is exactly how it will appear to a broker. From there, use the action bar at the top to <strong>Edit</strong> (make changes), <strong>Duplicate</strong> (create a copy, e.g. for a second brand), or <strong>Delete</strong> (permanently remove it).
          </p>
        </div>

        <div class="bg-white border border-lightgrey-200 rounded-xl p-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-6 h-6 rounded-full bg-royalblue-500 text-white text-[11px] font-semibold flex items-center justify-center flex-shrink-0">4</div>
            <div class="text-[13px] font-semibold text-darkblue-500">Filter the template list</div>
          </div>
          <p class="text-[12px] text-lightgrey-600 leading-relaxed ml-9">
            Use the pills at the top of the list to filter by brand (WLTH or Mortgage Mart) and loan type (Residential, Investment, SMSF). You can select multiple filters at once — they combine. Click <strong>Clear</strong> to reset.
          </p>
        </div>

      </div>

      <!-- Item types reference -->
      <div>
        <div class="text-[11px] font-semibold uppercase tracking-widest text-lightgrey-500 mb-3">Item type reference</div>
        <div class="bg-white border border-lightgrey-200 rounded-xl overflow-hidden">
          <div
            v-for="(desc, type) in ITEM_TYPES"
            :key="type"
            class="flex items-start gap-4 px-4 py-3 border-b border-lightgrey-100 last:border-0"
          >
            <div class="w-36 flex-shrink-0 text-[11px] font-semibold text-royalblue-500 font-mono pt-0.5">{{ type }}</div>
            <div class="text-[12px] text-lightgrey-600">{{ desc }}</div>
          </div>
        </div>
      </div>

      <!-- Status reference -->
      <div>
        <div class="text-[11px] font-semibold uppercase tracking-widest text-lightgrey-500 mb-3">Template status</div>
        <div class="bg-white border border-lightgrey-200 rounded-xl overflow-hidden">
          <div class="flex items-start gap-4 px-4 py-3 border-b border-lightgrey-100">
            <div class="flex items-center gap-1.5 w-24 flex-shrink-0"><div class="w-1.5 h-1.5 rounded-full bg-amber-400"></div><span class="text-[12px] font-medium text-darkblue-500">Draft</span></div>
            <div class="text-[12px] text-lightgrey-600">Work in progress — not visible in production.</div>
          </div>
          <div class="flex items-start gap-4 px-4 py-3 border-b border-lightgrey-100">
            <div class="flex items-center gap-1.5 w-24 flex-shrink-0"><div class="w-1.5 h-1.5 rounded-full bg-green-400"></div><span class="text-[12px] font-medium text-darkblue-500">Published</span></div>
            <div class="text-[12px] text-lightgrey-600">Live and visible to brokers.</div>
          </div>
          <div class="flex items-start gap-4 px-4 py-3">
            <div class="flex items-center gap-1.5 w-24 flex-shrink-0"><div class="w-1.5 h-1.5 rounded-full bg-lightgrey-400"></div><span class="text-[12px] font-medium text-darkblue-500">Archived</span></div>
            <div class="text-[12px] text-lightgrey-600">Retired — kept for reference but not shown to brokers.</div>
          </div>
        </div>
      </div>

    </div>
  </AdminShell>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin-auth' })

const ITEM_TYPES: Record<string, string> = {
  section_header: 'A bold coloured heading that starts a new section.',
  sub_section_header: 'A smaller heading within a section (e.g. "Casual", "Purchase").',
  checklist_item: 'A checkbox requirement — brokers tick these off. Counts toward progress.',
  list_item: 'A plain bullet point with no checkbox (e.g. agreement terms, declarations).',
  banner: 'A grey info or warning box for important notes mid-document.',
  bottom_banner: 'A coloured notice pinned just above the footer.',
  signature_row: 'A name + signature + date row for the bottom of customer forms.',
  footer: 'Small legal text at the very bottom of the document.',
}
</script>
