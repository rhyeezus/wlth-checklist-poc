/**
 * Seed all checklist templates into Directus.
 * Run once to populate all WLTH templates.
 *
 * Usage:
 *   DIRECTUS_URL=http://localhost:8055 DIRECTUS_TOKEN=$(grep DIRECTUS_TOKEN .env | cut -d= -f2) node scripts/seed-templates.mjs
 */

import { createDirectus, rest, staticToken, createItem } from '@directus/sdk'

const DIRECTUS_URL  = process.env.DIRECTUS_URL  || 'http://localhost:8055'
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || ''

const client = createDirectus(DIRECTUS_URL)
  .with(staticToken(DIRECTUS_TOKEN))
  .with(rest())

const BOTTOM_BANNER = 'Contact scenarios@wlth.com if you are unable to provide any of the requirements before submitting the application.'
const LEGAL = 'WLTH Lend Pty Ltd (ACN 641 398 816 | CRN 525 783) as authorised by WLTH Pty Ltd (ACN 639 591 245 | ACL 525 752)'

const templates = [

  // ── 1. Easy Refinance (Residential & Commercial) ─────────────────────────
  {
    title: 'Easy Refinance (Residential & Commercial)',
    loan_type: 'residential',
    file_type: 'broker',
    status: 'published',
    header_variant: 'wlth',
    header_fields: [
      { label: 'Applicants Name',        field_key: 'applicant_name',    width: 'half' },
      { label: 'LoanApp Reference Number', field_key: 'loanapp_reference', width: 'half' },
    ],
    items: [
      { item_type: 'section_header', label: 'Refinancing Liability (Existing Mortgage)' },
      { item_type: 'checklist_item', label: 'If individual names, most Recent 3 Months Home Loan Statements <30 Days old', connector: 'or' },
      { item_type: 'checklist_item', label: 'If company name, most recent 12 months Home Loan statements' },
      { item_type: 'banner',         label: 'If you are unable to provide any of the requirements above, please proceed to a full document Application' },
      { item_type: 'section_header', label: 'Income' },
      { item_type: 'sub_section_header', label: 'Rental Income' },
      { item_type: 'checklist_item', label: 'Most Recent rental income statement <30 days old', connector: 'and' },
      { item_type: 'checklist_item', label: 'Current Tenancy Agreement (If Commercial)', connector: 'and' },
      { item_type: 'checklist_item', label: 'Valuation Report  <60 Days Old' },
      { item_type: 'sub_section_header', label: 'For all Easy Refinance Applications' },
      { item_type: 'checklist_item', label: 'Signed WLTH Application Form (Inclusive of cash out, fees and charges) - Generated in LoanApp' },
      { item_type: 'checklist_item', label: 'Electronic Signature Certificate of Completion/Audit Trail' },
      { item_type: 'checklist_item', label: 'Privacy Consent form Signed by applicants', note: 'WLTH Broker Portal' },
      { item_type: 'checklist_item', label: 'Signed Broker Declaration' },
      { item_type: 'checklist_item', label: 'WLTH Easy Refinance Servicing Calculator', note: 'WLTH Broker Portal' },
      { item_type: 'checklist_item', label: 'Broker Submission Notes' },
      { item_type: 'checklist_item', label: 'WLTH Verification of Identity form completed in full', note: 'WLTH Broker Portal' },
      { item_type: 'checklist_item', label: 'Most recent Council Rates Notice for security property', note: 'All Commercial Properties are GST Exclusive for the purposes of calculating LVR' },
      { item_type: 'checklist_item', label: 'Most recent Rental Statement (if investment)' },
      { item_type: 'checklist_item', label: 'Exit Strategy - If any applicant is 55 or older, please provide an applicant signed and dated exit strategy' },
      { item_type: 'bottom_banner',  label: BOTTOM_BANNER },
      { item_type: 'footer',         label: `WLTH-V2.00 | WLTH Easy Refinance Supporting Document Checklist | ${LEGAL}` },
    ],
  },

  // ── 2. WLTH SMSF Supporting Document Checklist ───────────────────────────
  {
    title: 'WLTH SMSF',
    loan_type: 'smsf',
    file_type: 'broker',
    status: 'published',
    header_variant: 'wlth',
    header_fields: [
      { label: 'SMSF Trustee Name (Corporate Trustees Only)', field_key: 'trustee_name',      width: 'full' },
      { label: 'LoanApp Reference Number',                    field_key: 'loanapp_reference',  width: 'full' },
    ],
    items: [
      { item_type: 'section_header', label: 'For all SMSF Applications' },
      { item_type: 'checklist_item', label: 'Signed WLTH Application Form' },
      { item_type: 'checklist_item', label: 'Signed Broker Declaration', note: 'See WLTH Broker Portal' },
      { item_type: 'checklist_item', label: 'Privacy Consent Form' },
      { item_type: 'checklist_item', label: 'WLTH Servicing Calculator' },
      { item_type: 'checklist_item', label: 'Broker Submission Notes' },
      { item_type: 'checklist_item', label: 'WLTH Verification of Identity form completed in full' },
      { item_type: 'checklist_item', label: 'Most Recent years SMSF Auditor Reports', note: 'Established SMSF Only' },
      { item_type: 'checklist_item', label: 'Most Recent Financial Years Audited SMSF Trust Tax Returns & Full Financial Statements', note: 'Established SMSF Only' },
      { item_type: 'checklist_item', label: 'Proposed Superannuation Declaration Form – if Applicable' },
      { item_type: 'checklist_item', label: 'Certified Copy of Bare Trust' },
      { item_type: 'checklist_item', label: 'Certified Copy of SMSF Trust Deed' },
      { item_type: 'checklist_item', label: 'Exit Strategy - If any applicant is 55 or older, please provide an applicant signed and dated exit strategy' },

      { item_type: 'section_header', label: 'SMSF Purchase' },
      { item_type: 'checklist_item', label: 'Signed & Dated Contract of sale' },
      { item_type: 'checklist_item', label: 'Evidence of Funds to complete' },
      { item_type: 'checklist_item', label: 'Valuation Report' },

      { item_type: 'section_header', label: 'SMSF Refinance' },
      { item_type: 'checklist_item', label: 'Most Recent 3 Months Loan Statements' },
      { item_type: 'checklist_item', label: 'Most Recent Council Rates Notice' },
      { item_type: 'checklist_item', label: 'Valuation Report' },
      { item_type: 'checklist_item', label: 'Signed Discharge Form', note: 'Noting Green Mortgage Lawyers — Phone: +61 7 3052 9000 Email: newlending@greenmortgagelawyers.com' },

      { item_type: 'section_header', label: 'Income' },
      { item_type: 'sub_section_header', label: 'PAYG Employment' },
      { item_type: 'checklist_item', label: '2 Most Recent Payslips <30 Days old', connector: 'and' },
      { item_type: 'checklist_item', label: 'Latest 3 months Salary Credit Statements <30 days old', connector: 'and' },
      { item_type: 'checklist_item', label: 'Most recent ATO Payment Summary' },
      { item_type: 'checklist_item', label: 'If SGC Contributions are not being paid to the SMSF already, email from applicant(s) stating that all future SGC payments will be directed to the SMSF' },

      { item_type: 'sub_section_header', label: 'Self Employed / Company / Trust' },
      { item_type: 'checklist_item', label: 'Latest Personal Tax Return', connector: 'and' },
      { item_type: 'checklist_item', label: 'Latest Personal ATO notice of assessment', connector: 'and' },
      { item_type: 'checklist_item', label: 'Latest Tax Return & Financial Statement for Company, Partnership or Trust', connector: 'and' },
      { item_type: 'checklist_item', label: 'Current ATO Portal Confirming Any or No Liabilities' },
      { item_type: 'checklist_item', label: 'If SGC payments currently directed to industry super fund, Provide the latest 12 months of industry superannuation fund contributions' },

      { item_type: 'sub_section_header', label: 'Commercial Security' },
      { item_type: 'checklist_item', label: 'Most Recent 6 Months Rental Statements', connector: 'and' },
      { item_type: 'checklist_item', label: 'Commercial Valuation Report <60 Days Old', connector: 'and' },
      { item_type: 'checklist_item', label: 'If Vacant, Real Estate Rental Appraisal letter including details related to the outgoing expenses' },

      { item_type: 'sub_section_header', label: 'Residential Security' },
      { item_type: 'checklist_item', label: 'Most recent Rental Income Statement <30 days old', connector: 'or' },
      { item_type: 'checklist_item', label: 'Signed Lease Agreement' },

      { item_type: 'sub_section_header', label: 'Pre-Approval Application' },
      { item_type: 'checklist_item', label: 'SMSF Pre-Approval Income Declaration' },

      { item_type: 'bottom_banner', label: BOTTOM_BANNER },
      { item_type: 'footer',        label: `WLTH-V2.00 | WLTH SMSF Supporting Document Checklist | ${LEGAL}` },
    ],
  },

  // ── 3. WLTH Residential Supporting Document Checklist ────────────────────
  {
    title: 'WLTH Residential',
    loan_type: 'residential',
    file_type: 'broker',
    status: 'published',
    header_variant: 'wlth',
    header_fields: [
      { label: 'Applicants Name',          field_key: 'applicant_name',    width: 'half' },
      { label: 'LoanApp Reference Number', field_key: 'loanapp_reference', width: 'half' },
    ],
    items: [
      { item_type: 'section_header', label: 'For all Applications' },
      { item_type: 'checklist_item', label: 'Signed Loan Application Form - Generated in LoanApp' },
      { item_type: 'checklist_item', label: 'Signed Customers Needs Analysis - Generated in LoanApp OR Signed Broker Declaration (WLTH Broker Portal)' },
      { item_type: 'checklist_item', label: 'Signed Privacy Consent Form', note: 'WLTH Broker Portal' },
      { item_type: 'checklist_item', label: 'Broker Submission Notes (Detailed)' },
      { item_type: 'checklist_item', label: 'WLTH Verification of Identity form completed in full with all required Documents', note: 'WLTH Broker Portal' },
      { item_type: 'checklist_item', label: 'Exit Strategy - If any applicant is 55 or older, please provide an applicant signed and dated exit strategy' },

      { item_type: 'banner', label: 'PAYG — Please refer to all income types — additional items required when not servicing solely on base Income. Please ensure all Tax Returns have been obtained.' },

      { item_type: 'sub_section_header', label: 'Bonus / Commissions' },
      { item_type: 'checklist_item', label: 'Most Recent Financial Year ATO Income Statement', connector: 'or' },
      { item_type: 'checklist_item', label: 'Most Recent Payslip With YTD Bonus Amount', connector: 'or' },
      { item_type: 'checklist_item', label: 'Most Recent Payslip With YTD Figure' },

      { item_type: 'sub_section_header', label: 'Casual - Income assessed over 48 weeks' },
      { item_type: 'checklist_item', label: 'Most Recent Financial Year ATO Income Statement' },

      { item_type: 'sub_section_header', label: 'Regular Overtime / Shift allowance' },
      { item_type: 'checklist_item', label: 'Most Recent Financial Year ATO Income Statement <365 days old', connector: 'or' },
      { item_type: 'checklist_item', label: 'Full Short-Term Valuation Report <60 Days Old' },
      { item_type: 'checklist_item', label: 'Statutory Declaration / Ongoing Income - Bond Stay in it (Reg 2.04ABB)' },

      { item_type: 'sub_section_header', label: 'Portfolio Income' },
      { item_type: 'checklist_item', label: 'Most Recent rental income statement <365 days old', connector: 'or' },
      { item_type: 'checklist_item', label: 'Full Short Term Valuation Report <60 Days Old' },
      { item_type: 'checklist_item', label: 'Statutory Declaration / Ongoing Income - Bond Stay in it (Reg 2.04ABB)' },

      { item_type: 'sub_section_header', label: 'Self Employed - Continues / Contractor' },
      { item_type: 'checklist_item', label: 'Latest Personal and Business Tax Returns', connector: 'and' },
      { item_type: 'checklist_item', label: 'Latest ATO Notice of Assessments for each applicant / entity', connector: 'and' },
      { item_type: 'checklist_item', label: 'Latest individual tax returns are ATO Notice of Assessment for each applicant', connector: 'and' },
      { item_type: 'checklist_item', label: 'Current ATO Portal Confirming Any or No Liabilities' },

      { item_type: 'sub_section_header', label: 'Company Security' },
      { item_type: 'checklist_item', label: 'Latest Company + Trust Net Worth & Financial Statements (a Profit and Loss and Balance Sheet)', connector: 'and' },
      { item_type: 'checklist_item', label: 'Latest individual tax returns are ATO Notice of Assessment for each applicant', connector: 'and' },
      { item_type: 'checklist_item', label: 'Current ATO Portal Confirming Any or No Liabilities' },

      { item_type: 'section_header', label: 'Loan Purpose' },
      { item_type: 'sub_section_header', label: 'Purchase' },
      { item_type: 'checklist_item', label: 'Fully Signed and Dated contract of sale', connector: 'and' },
      { item_type: 'checklist_item', label: 'Evidence of payment of deposit', connector: 'and' },
      { item_type: 'checklist_item', label: 'Evidence of other funds to complete - receipt for deposit paid, latest statement, proceeds from new estate sale, etc' },
      { item_type: 'checklist_item', label: 'WLTH Gift Statutory Declaration + Proof of funds to gift or giftees account may be requested' },

      { item_type: 'sub_section_header', label: 'Refinance & Debt Consolidation' },
      { item_type: 'checklist_item', label: 'Most Recent 3 Months Statements for all facilities being consolidated <30 Days old', connector: 'and' },
      { item_type: 'checklist_item', label: 'Copy of WLTH Valuation', connector: 'and' },
      { item_type: 'checklist_item', label: 'Current Rates Notice' },
      { item_type: 'checklist_item', label: 'Signed Discharge form', note: 'Noting Green Mortgage Lawyers — Phone: +61 7 3052 9000 Email: newlending@greenmortgagelawyers.com' },

      { item_type: 'sub_section_header', label: 'Construction' },
      { item_type: 'checklist_item', label: 'Signed & Dated Land Contract' },
      { item_type: 'checklist_item', label: 'Stamped/Signed Fixed Price Off Building Contract (DA/BA) including Building Specifications & Building Plans (Council approved required prior to settlement)', connector: 'and' },
      { item_type: 'checklist_item', label: 'Evidence of Deposit Paid at least in full' },

      { item_type: 'sub_section_header', label: 'Loans being refinanced' },
      { item_type: 'checklist_item', label: 'Statement for all facilities not being refinanced: This needs to confirm Interest Rate, Balance, and Repayment' },

      { item_type: 'bottom_banner', label: BOTTOM_BANNER },
      { item_type: 'footer',        label: `WLTH-V2.00 | WLTH Residential Supporting Document Checklist | ${LEGAL}` },
    ],
  },

  // ── 4. Fixed Rate Lock In Request ─────────────────────────────────────────
  {
    title: 'Fixed Rate Lock In Request',
    loan_type: 'residential',
    file_type: 'customer',
    status: 'published',
    header_variant: 'wlth',
    header_fields: [
      { label: 'Applicant Name(s)',                              field_key: 'applicant_name',        width: 'full' },
      { label: 'Reference Number',                               field_key: 'loanapp_reference',     width: 'full' },
      { label: 'Loan Specialist Name',                           field_key: 'loan_specialist_name',  width: 'full' },
      { label: 'Agreed Fixed Interest Rate',                     field_key: 'agreed_fixed_rate',     width: 'half' },
      { label: 'Fixed Rate Lock Start Date',                     field_key: 'rate_lock_start_date',  width: 'half' },
      { label: 'Fixed Rate Expiry Date (90 days from start date)', field_key: 'rate_expiry_date',   width: 'full' },
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
      { item_type: 'banner',         label: 'WARNING: You may have to pay fees if you repay your loan early. Significant fees (called \'break costs\') may be payable if you repay all or part of a fixed rate loan early, or you make additional payments of $20,000 or more in an anniversary year, or you ask us to change your loan type or fixed interest period. Break costs may be substantial, particularly if market interest rates have reduced during the fixed rate period. Ask us for an estimate of break costs before you arrange to repay a fixed rate loan early. Any additional payments or advanced funds are not available for redraw during the fixed terms. You will receive Terms and Conditions with your Loan Agreement which will have additional details.' },
      { item_type: 'section_header', label: 'Borrower Signatures' },
      { item_type: 'signature_row',  label: 'Borrower 1' },
      { item_type: 'signature_row',  label: 'Borrower 2' },
      { item_type: 'signature_row',  label: 'Borrower 3' },
      { item_type: 'signature_row',  label: 'Borrower 4' },
      { item_type: 'footer',         label: `WLTH-V1.00 | WLTH Fixed Rate Lock In Request | ${LEGAL}` },
    ],
  },
]

async function seed() {
  for (const template of templates) {
    console.log(`\nCreating: "${template.title}"...`)
    const created = await client.request(createItem('checklist_templates', template))
    console.log(`✓ Created ID: ${created.id}`)

    // Now duplicate for Mortgage Mart
    console.log(`  Duplicating for Mortgage Mart...`)
    const mmaCopy = {
      ...template,
      header_variant: 'mortgage_mart',
      status: 'published',
    }
    const mma = await client.request(createItem('checklist_templates', mmaCopy))
    console.log(`✓ Mortgage Mart ID: ${mma.id}`)
  }
  console.log('\n✓ All templates seeded.')
}

seed().catch(err => {
  console.error('\n✗ Error:', err.message ?? err)
  process.exit(1)
})
