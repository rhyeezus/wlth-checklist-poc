import Anthropic from '@anthropic-ai/sdk'

const EXTRACTION_PROMPT = `Extract this checklist document into a structured JSON template.

Return ONLY a single valid JSON object matching this exact schema — no prose, no markdown fences:

{
  "title": "string — the document title",
  "loan_type": "one of: residential | investment | smsf",
  "file_type": "one of: broker | customer",
  "header_fields": [
    { "label": "string", "field_key": "string (snake_case)", "width": "full or half" }
  ],
  "items": [
    {
      "item_type": "one of: section_header | sub_section_header | checklist_item | list_item | banner | bottom_banner | signature_row | footer",
      "label": "string",
      "note": "string or omit if empty",
      "connector": "none | and | or — omit if not applicable",
      "required": "boolean — omit if not applicable"
    }
  ]
}

Mapping rules:
- Major section titles → section_header
- Sub-section titles → sub_section_header
- Every document requirement checkbox → checklist_item
- Bullet point lists of terms/conditions → list_item
- Mid-document info/warning boxes → banner
- Final warning box above footer → bottom_banner
- Signature lines → signature_row (label = role e.g. "Borrower 1")
- Legal boilerplate at the very bottom → footer
- Header fields: capture any fillable fields shown at the top (applicant name, reference number, date, etc.)
- For header fields, use snake_case field_key derived from the label (e.g. "Applicant Name" → "applicant_name")
- Use width "half" for short fields (dates, references) and "full" for long fields (names, addresses)

Loan type inference:
- "smsf" if the document mentions SMSF, superannuation, self-managed super fund, or trustee
- "investment" if the document is explicitly for an investment property loan (not owner-occupied)
- "residential" for all other cases (standard home loans, refinances, fixed rate, construction)

File type inference:
- "broker" if addressed to a broker, broker portal, or contains broker-specific instructions
- "customer" if it is a form to be signed or completed by the borrower/applicant directly`

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  if (!config.anthropicApiKey) {
    throw createError({ statusCode: 500, message: 'ANTHROPIC_API_KEY is not configured' })
  }

  const form = await readFormData(event)
  const file = form.get('pdf') as File | null

  if (!file || file.type !== 'application/pdf') {
    throw createError({ statusCode: 400, message: 'A PDF file is required' })
  }

  const buffer = await file.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')

  const client = new Anthropic({ apiKey: config.anthropicApiKey })

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: base64,
            },
          },
          {
            type: 'text',
            text: EXTRACTION_PROMPT,
          },
        ],
      },
    ],
  })

  const text = response.content[0]?.type === 'text' ? response.content[0].text : ''

  // Extract JSON — handle both bare JSON and any accidental markdown fences
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) ?? text.match(/(\{[\s\S]*\})/)
  const jsonStr = match ? (match[1] ?? match[0]) : text.trim()

  try {
    return JSON.parse(jsonStr)
  } catch {
    throw createError({
      statusCode: 502,
      message: `Claude returned invalid JSON. Raw response: ${text.slice(0, 300)}`,
    })
  }
})
