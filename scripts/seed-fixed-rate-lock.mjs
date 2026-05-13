/**
 * Seeds only the Fixed Rate Lock In Request template (WLTH + Mortgage Mart).
 * Safe to run against an already-seeded instance — won't touch existing templates.
 *
 * Usage:
 *   DIRECTUS_URL=http://localhost:8055 DIRECTUS_TOKEN=TgmfbCAZhCBxNu79yqNKKei21Glh_Kzs node scripts/seed-fixed-rate-lock.mjs
 */

import { createDirectus, rest, staticToken, createItem } from '@directus/sdk'

const DIRECTUS_URL   = process.env.DIRECTUS_URL   || 'http://localhost:8055'
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || ''

const client = createDirectus(DIRECTUS_URL)
  .with(staticToken(DIRECTUS_TOKEN))
  .with(rest())

const LEGAL = 'WLTH Lend Pty Ltd (ACN 641 398 816 | CRN 525 783) as authorised by WLTH Pty Ltd (ACN 639 591 245 | ACL 525 752)'

const template = {
  title: 'Fixed Rate Lock In Request',
  loan_type: 'residential',
  file_type: 'customer',
  status: 'published',
  header_variant: 'wlth',
  header_fields: [
    { label: 'Applicant Name(s)',                                field_key: 'applicant_name',       width: 'full' },
    { label: 'Reference Number',                                 field_key: 'loanapp_reference',    width: 'full' },
    { label: 'Loan Specialist Name',                             field_key: 'loan_specialist_name', width: 'full' },
    { label: 'Agreed Fixed Interest Rate',                       field_key: 'agreed_fixed_rate',    width: 'half' },
    { label: 'Fixed Rate Lock Start Date',                       field_key: 'rate_lock_start_date', width: 'half' },
    { label: 'Fixed Rate Expiry Date (90 days from start date)', field_key: 'rate_expiry_date',     width: 'full' },
  ],
  items: [
    { item_type: 'section_header', label: 'By signing below, I/we understand and agree that:' },
    { item_type: 'list_item', label: 'A fee of $495.00 will be deducted at settlement for each loan application where a Fixed Rate interest rate lock-in is requested' },
    { item_type: 'list_item', label: 'The interest rate will only be locked in once WLTH receives the completed Fixed Rate Lock-in form and is conditional on your loan application being approved' },
    { item_type: 'list_item', label: 'If WLTH accepts this request, the interest rate will be locked in for 90 days from the start date (date on which we receive this Rate Lock In Request)' },
    { item_type: 'list_item', label: 'If I/we request to rate lock after the Letter of Offer has been issued and before the settlement date, I/we understand that a new Letter of Offer will be required and a re-documentation fee of $150 will be payable' },
    { item_type: 'list_item', label: 'If the settlement date of my/our loan is no later than 90 days from the start date, the interest rate that will apply to my/our fixed rate loan will be the lower of the locked in rate or the WLTH fixed rate applicable on the settlement date' },
    { item_type: 'list_item', label: 'If the settlement date for the loan does not occur within the 90 days period, the interest rate that will apply to my/our loan will be the WLTH Fixed Rate on the settlement date' },
    { item_type: 'list_item', label: 'The Rate Lock In fee is non-refundable' },
    { item_type: 'list_item', label: 'WLTH reserves the right to not accept this request, including if your application form was not submitted on or before the start date' },
    { item_type: 'banner',         label: "WARNING: You may have to pay fees if you repay your loan early. Significant fees (called 'break costs') may be payable if you repay all or part of a fixed rate loan early, or you make additional payments of $20,000 or more in an anniversary year, or you ask us to change your loan type or fixed interest period. Break costs may be substantial, particularly if market interest rates have reduced during the fixed rate period. Ask us for an estimate of break costs before you arrange to repay a fixed rate loan early. Any additional payments or advanced funds are not available for redraw during the fixed terms. You will receive Terms and Conditions with your Loan Agreement which will have additional details." },
    { item_type: 'section_header', label: 'Borrower Signatures' },
    { item_type: 'signature_row',  label: 'Borrower 1' },
    { item_type: 'signature_row',  label: 'Borrower 2' },
    { item_type: 'signature_row',  label: 'Borrower 3' },
    { item_type: 'signature_row',  label: 'Borrower 4' },
    { item_type: 'footer',         label: `WLTH-V1.00 | WLTH Fixed Rate Lock In Request | ${LEGAL}` },
  ],
}

async function seed() {
  console.log('\nCreating: "Fixed Rate Lock In Request" (WLTH)...')
  const wlth = await client.request(createItem('checklist_templates', template))
  console.log(`✓ Created WLTH ID: ${wlth.id}`)

  console.log('  Duplicating for Mortgage Mart...')
  const mma = await client.request(createItem('checklist_templates', {
    ...template,
    header_variant: 'mortgage_mart',
  }))
  console.log(`✓ Created Mortgage Mart ID: ${mma.id}`)

  console.log('\n✓ Done.')
}

seed().catch(err => {
  console.error('\n✗ Error:', err.message ?? err)
  process.exit(1)
})
