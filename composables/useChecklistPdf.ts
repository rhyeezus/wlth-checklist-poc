import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'

async function fetchFont(path: string): Promise<ArrayBuffer | null> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 4000)
    const res = await fetch(path, { signal: controller.signal })
    clearTimeout(timer)
    if (!res.ok) return null
    return res.arrayBuffer()
  } catch (e) {
    console.warn('Font fetch failed, falling back to Helvetica:', path, e)
    return null
  }
}

// ── colours ──────────────────────────────────────────────────────────────────
const WLTH_ACCENT = rgb(0.184, 0.329, 0.922)
const MMA_ACCENT  = rgb(0.161, 0.180, 0.227)
const LIGHT_GREY  = rgb(0.933, 0.933, 0.941)
const MUTED       = rgb(0.502, 0.522, 0.565)
const DARK        = rgb(0.133, 0.133, 0.133)
const WHITE       = rgb(1, 1, 1)
const LINE_GREY   = rgb(0.855, 0.855, 0.863)
const LOGO_FILL   = rgb(0.957, 0.957, 0.957)

// ── SVG paths ─────────────────────────────────────────────────────────────────
const WLTH_PATH = 'M2.96933 0L7.56963 14.5863L9.96647 6.98899H12.9345L8.83166 20H6.3076L0 0H2.96933ZM12.3099 0L18.6187 20H21.5881L15.2792 0H12.3099ZM25.0307 0L20.9265 13.011H23.8959L28 0H25.0307Z'
const MMA_PATH  = 'M38.2144 0C36.6785 0 35.4289 1.23465 35.4289 2.75206C35.4289 4.26947 36.6785 5.50271 38.2144 5.50271C39.7503 5.50271 41 4.26807 41 2.75206C41 1.23605 39.7503 0 38.2144 0ZM38.2144 5.24794C36.8216 5.24794 35.6867 4.12808 35.6867 2.75066C35.6867 1.37323 36.8202 0.253368 38.2144 0.253368C39.6086 0.253368 40.7421 1.37323 40.7421 2.75066C40.7421 4.12808 39.6086 5.24794 38.2144 5.24794ZM39.5562 1.55801H39.9175L39.4188 3.11041H39.0575L39.5562 1.55801ZM38.3703 1.55801L39.1368 3.94471H38.7755L38.009 1.55801H38.3703ZM37.7242 2.3923H38.0855L37.5868 3.94471H37.2793L36.5128 1.55801H36.8741L37.4337 3.29939L37.7256 2.3923H37.7242ZM34.7573 0.00279965H30.348L26.4346 12.4416L22.4914 0.00279965H18.0821V16.0014H20.8578V3.03622L24.9681 16H27.8557L31.9816 3.03622L31.9887 15.9986H33.4183L34.7587 12.4444V0.00279965H34.7573ZM0 5.53071H2.85216L2.76857 16H0V5.53071ZM16.6397 0.00279965V16.0014H13.7536L13.7507 3.05162L9.61347 16.0014H7.03477L1.90144 0.00279965H4.3087L8.30003 12.4444H8.3142L12.3112 0.00979878L16.6397 0.00279965Z'

// ── page constants ────────────────────────────────────────────────────────────
const PAGE_W     = 595.28
const PAGE_H     = 841.89
const MARGIN     = 40
const CONTENT    = PAGE_W - MARGIN * 2
const HEADER_H   = 80
const WEDGE_W    = 110
const WEDGE_DIAG = 31
const BANNER_H        = 36
const FOOTER_H        = 20
const BOTTOM_RESERVED = BANNER_H + FOOTER_H + 8

// Available vertical space between header and page footer on a single page
const CONTENT_TOP    = PAGE_H - HEADER_H - 24
const CONTENT_BOTTOM = MARGIN + BOTTOM_RESERVED
const AVAILABLE_H    = CONTENT_TOP - CONTENT_BOTTOM

// ── layout measurement helpers ────────────────────────────────────────────────

function estimateLines(text: string, font: any, size: number, maxWidth: number): number {
  const words = text.split(' ')
  let line = '', count = 0
  for (const w of words) {
    const t = line ? `${line} ${w}` : w
    if (font.widthOfTextAtSize(t, size) > maxWidth && line) { count++; line = w }
    else { line = t }
  }
  return line ? count + 1 : count
}

/**
 * Split the template's content height into:
 *   fixed    — text lines and input fields (scale with fontScale)
 *   flexible — inter-item gaps, padding, leading (scale with gapScale)
 *
 * This lets us compress both when over a page, or expand only the gaps
 * to fill the page when under — keeping fonts readable at their natural size.
 */
function measureSplit(template: any, regular: any): { fixed: number, flexible: number } {
  let fixed = 0
  let flexible = 0

  // ── Application details section ──
  if (template.header_fields?.length) {
    flexible += 14  // "APPLICATION DETAILS" label + spacing
    const fields = template.header_fields as any[]
    let i = 0
    while (i < fields.length) {
      fixed    += 18  // input field height
      flexible += 24  // field label (12) + gap below field (12)
      if (fields[i].width === 'half' && fields[i + 1]?.width === 'half') i += 2
      else i++
    }
    flexible += 28  // divider + "DOCUMENT CHECKLIST" spacing
  }
  flexible += 18  // "DOCUMENT CHECKLIST" label

  for (const item of template.items ?? []) {
    if (item.item_type === 'bottom_banner' || item.item_type === 'footer') continue

    if (item.item_type === 'section_header') {
      fixed    += 10  // text line
      flexible += 26  // pre-gap (6) + post-gap (20)

    } else if (item.item_type === 'sub_section_header') {
      fixed    += 8
      flexible += 20

    } else if (item.item_type === 'list_item') {
      const lines = estimateLines(item.label ?? '', regular, 9, CONTENT - 14)
      fixed    += lines * 9   // font height
      flexible += lines * 4   // leading between lines
      flexible += 6           // bottom gap
      if (item.note) {
        const nLines = estimateLines(item.note, regular, 8, CONTENT - 14)
        fixed    += nLines * 8
        flexible += nLines * 3
      }

    } else if (item.item_type === 'checklist_item') {
      const lines = estimateLines(item.label ?? '', regular, 9, CONTENT - 18)
      fixed    += lines * 9
      flexible += lines * 4
      flexible += 10
      if (item.note) {
        const nLines = estimateLines(item.note, regular, 8, CONTENT - 18)
        fixed    += nLines * 8
        flexible += nLines * 3
      }
      if (item.connector && item.connector !== 'none') flexible += 13

    } else if (item.item_type === 'banner') {
      const lines = estimateLines(item.label ?? '', regular, 8, CONTENT - 16)
      fixed    += lines * 8 + 16  // text lines + fixed padding
      flexible += lines * 3 + 12  // leading + external gaps

    } else if (item.item_type === 'signature_row') {
      fixed    += 18  // input field height
      flexible += 14  // gaps around the row
    }
  }

  return { fixed, flexible }
}

// ── main export ───────────────────────────────────────────────────────────────

export async function generateChecklistPdf(template: any, variantKey: string) {
  const accent = variantKey === 'mortgage_mart' ? MMA_ACCENT : WLTH_ACCENT

  const pdfDoc = await PDFDocument.create()
  pdfDoc.registerFontkit(fontkit)

  const [regularBytes, mediumBytes] = await Promise.all([
    fetchFont('/fonts/SuisseIntl-Regular.ttf'),
    fetchFont('/fonts/SuisseIntl-Medium.ttf'),
  ])
  const regular = regularBytes
    ? await pdfDoc.embedFont(regularBytes)
    : await pdfDoc.embedFont(StandardFonts.Helvetica)
  const bold = mediumBytes
    ? await pdfDoc.embedFont(mediumBytes)
    : await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const form = pdfDoc.getForm()

  const bottomBannerItem = (template.items ?? []).find((i: any) => i.item_type === 'bottom_banner')
  const footerItem       = (template.items ?? []).find((i: any) => i.item_type === 'footer')
  const bannerText = bottomBannerItem?.label ?? ''
  const footerText = footerItem?.label ?? ''

  // ── Responsive layout: measure → compute scales ───────────────────────────
  //
  // fontScale — applied to font sizes and input field heights.
  //             Only goes below 1.0 (when compressing to fit one page).
  //
  // gapScale  — applied to all spacing, padding, and leading.
  //             Goes below 1.0 to compress, or above 1.0 to fill the page.
  //
  // One page, under:   fontScale=1.0,  gapScale=(available-fixed)/flexible  → fills page
  // One page, over:    fontScale=s,    gapScale=s  where s<1.0              → compresses to fit
  // Multi-page forms:  fontScale=1.0,  gapScale=1.0                         → natural layout

  const { fixed, flexible } = measureSplit(template, regular)
  const total = fixed + flexible

  let fontScale: number
  let gapScale: number

  if (total > AVAILABLE_H) {
    // Content overflows — compress everything to fit on one page (min scale 0.72)
    const compress = Math.max(0.72, AVAILABLE_H / total)
    fontScale = compress
    gapScale  = compress
  } else if (flexible > 0 && total < AVAILABLE_H) {
    // Content fits with room to spare — keep fonts natural, expand gaps to fill
    fontScale = 1.0
    gapScale  = Math.min(3.0, (AVAILABLE_H - fixed) / flexible)
  } else {
    fontScale = 1.0
    gapScale  = 1.0
  }

  /** Scale a font size or field height (never expands above natural size). */
  const fs = (n: number) => n * fontScale
  /** Scale a gap, padding, or leading value (can expand or compress). */
  const sc = (n: number) => n * gapScale

  // ── page / pagination helpers ─────────────────────────────────────────────

  let page = pdfDoc.addPage([PAGE_W, PAGE_H])
  let y    = PAGE_H - MARGIN
  let idx  = 0

  function drawPageFooter(p: ReturnType<typeof pdfDoc.addPage>) {
    if (bannerText) {
      p.drawRectangle({ x: 0, y: FOOTER_H, width: PAGE_W, height: BANNER_H, color: accent })
      p.drawText(bannerText, { x: MARGIN, y: FOOTER_H + 13, size: 8, font: regular, color: WHITE, maxWidth: CONTENT })
    }
    if (footerText) {
      p.drawText(footerText, { x: MARGIN, y: 6, size: 6, font: regular, color: MUTED, maxWidth: CONTENT })
    }
  }

  drawPageFooter(page)

  function addPage() {
    page = pdfDoc.addPage([PAGE_W, PAGE_H])
    drawPageFooter(page)
    y = PAGE_H - MARGIN
  }

  function guard(need: number) {
    if (y - need < MARGIN + BOTTOM_RESERVED) addPage()
  }

  /**
   * Word-wrapping text draw.
   * Font size uses fs() so it stays natural when expanding.
   * Line leading uses sc() so it breathes when expanding.
   */
  function drawWrappedText(text: string, x: number, opts: {
    size?: number, font?: any, color?: any, maxWidth?: number
  } = {}) {
    const { size = fs(9), font = regular, color = DARK, maxWidth = CONTENT } = opts
    const lh    = size + sc(4)   // font height (fixed) + leading (flexible)
    const words = text.split(' ')
    let line    = ''
    let used    = 0

    for (const word of words) {
      const test = line ? `${line} ${word}` : word
      if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
        page.drawText(line, { x, y: y - used, size, font, color })
        used += lh
        line  = word
      } else {
        line = test
      }
    }
    if (line) {
      page.drawText(line, { x, y: y - used, size, font, color })
      used += lh
    }
    return used
  }

  // ── header banner (always fixed size — never scaled) ─────────────────────

  page.drawRectangle({ x: 0, y: PAGE_H - HEADER_H, width: PAGE_W, height: HEADER_H, color: LIGHT_GREY })

  const wedgePath = [
    `M ${PAGE_W - WEDGE_W + WEDGE_DIAG} 0`,
    `L ${PAGE_W} 0`,
    `L ${PAGE_W} ${HEADER_H}`,
    `L ${PAGE_W - WEDGE_W} ${HEADER_H}`,
    'Z',
  ].join(' ')
  page.drawSvgPath(wedgePath, { x: 0, y: PAGE_H, color: accent })

  page.drawText(template.title ?? '', { x: MARGIN, y: PAGE_H - 32, size: 14, font: bold, color: accent })
  page.drawText('Supporting Document Checklist', { x: MARGIN, y: PAGE_H - 52, size: 9, font: regular, color: MUTED })

  if (variantKey === 'mortgage_mart') {
    const ls = 1.4
    page.drawSvgPath(MMA_PATH, { x: PAGE_W - 47 - (41 * ls) / 2, y: PAGE_H - HEADER_H / 2 + (16 * ls) / 2, scale: ls, color: LOGO_FILL })
  } else {
    const ls = 1.4
    page.drawSvgPath(WLTH_PATH, { x: PAGE_W - 47 - (28 * ls) / 2, y: PAGE_H - HEADER_H / 2 + (20 * ls) / 2, scale: ls, color: LOGO_FILL })
  }

  y = PAGE_H - HEADER_H - 24

  // ── application details ───────────────────────────────────────────────────

  if (template.header_fields?.length) {
    page.drawText('APPLICATION DETAILS', { x: MARGIN, y, size: fs(7), font: bold, color: MUTED })
    y -= sc(14)

    const fields = template.header_fields as any[]
    let i = 0

    while (i < fields.length) {
      const field    = fields[i]
      const isHalf   = field.width === 'half'
      const next     = fields[i + 1]
      const nextHalf = next?.width === 'half'

      if (isHalf && nextHalf) {
        const fw = (CONTENT - 8) / 2
        page.drawText(field.label, { x: MARGIN,          y, size: fs(7), font: bold, color: MUTED })
        page.drawText(next.label,  { x: MARGIN + fw + 8, y, size: fs(7), font: bold, color: MUTED })
        y -= sc(12)

        const tf1 = form.createTextField(`hf_${idx++}`)
        tf1.addToPage(page, { x: MARGIN,          y: y - fs(18), width: fw, height: fs(18), borderWidth: 0, backgroundColor: WHITE })
        tf1.updateAppearances(regular)

        const tf2 = form.createTextField(`hf_${idx++}`)
        tf2.addToPage(page, { x: MARGIN + fw + 8, y: y - fs(18), width: fw, height: fs(18), borderWidth: 0, backgroundColor: WHITE })
        tf2.updateAppearances(regular)

        y -= fs(18) + sc(12)
        i += 2
      } else {
        page.drawText(field.label, { x: MARGIN, y, size: fs(7), font: bold, color: MUTED })
        y -= sc(12)

        const tf = form.createTextField(`hf_${idx++}`)
        tf.addToPage(page, { x: MARGIN, y: y - fs(18), width: CONTENT, height: fs(18), borderWidth: 0, backgroundColor: WHITE })
        tf.updateAppearances(regular)

        y -= fs(18) + sc(12)
        i++
      }
    }

    y -= sc(10)
    page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.5, color: LINE_GREY })
    y -= sc(18)
  }

  // ── body items ────────────────────────────────────────────────────────────

  page.drawText('DOCUMENT CHECKLIST', { x: MARGIN, y, size: fs(7), font: bold, color: MUTED })
  y -= sc(18)

  for (const item of template.items ?? []) {

    if (item.item_type === 'section_header') {
      guard(fs(10) + sc(32))
      y -= sc(6)
      page.drawText(item.label ?? '', { x: MARGIN, y, size: fs(10), font: bold, color: accent })
      y -= fs(10) + sc(16)

    } else if (item.item_type === 'banner') {
      const bText = item.label ?? ''
      const bSize = fs(8)
      const bLead = sc(3)
      const bPad  = sc(8)
      const bMaxW = CONTENT - bPad * 2
      // Pre-calculate line count
      const bWords = bText.split(' ')
      let bLine = '', bLineCount = 0
      for (const bw of bWords) {
        const t = bLine ? `${bLine} ${bw}` : bw
        if (regular.widthOfTextAtSize(t, bSize) > bMaxW && bLine) { bLineCount++; bLine = bw }
        else { bLine = t }
      }
      if (bLine) bLineCount++
      const bannerBoxH = bLineCount * (bSize + bLead) + bPad * 2
      guard(bannerBoxH + sc(12))
      y -= sc(6)
      page.drawRectangle({ x: MARGIN, y: y - bannerBoxH, width: CONTENT, height: bannerBoxH, color: LIGHT_GREY })
      y -= bPad
      drawWrappedText(bText, MARGIN + bPad, { size: bSize, font: regular, color: DARK, maxWidth: bMaxW })
      y = (y + bPad) - bannerBoxH - sc(6)

    } else if (item.item_type === 'sub_section_header') {
      guard(fs(8) + sc(20))
      y -= sc(4)
      page.drawText((item.label ?? '').toUpperCase(), { x: MARGIN, y, size: fs(8), font: bold, color: DARK })
      y -= fs(8) + sc(12)

    } else if (item.item_type === 'list_item') {
      guard(fs(9) + sc(10))
      page.drawText('•', { x: MARGIN, y, size: fs(9), font: regular, color: DARK })
      const listLabelH = drawWrappedText(item.label ?? '', MARGIN + 14, {
        size: fs(9), font: regular, color: DARK, maxWidth: CONTENT - 14,
      })
      y -= listLabelH
      if (item.note) {
        y -= drawWrappedText(item.note, MARGIN + 14, {
          size: fs(8), font: regular, color: MUTED, maxWidth: CONTENT - 14,
        })
      }
      y -= sc(6)

    } else if (item.item_type === 'checklist_item') {
      guard(fs(9) + sc(14))

      const cb = form.createCheckBox(`cb_${idx++}`)
      cb.addToPage(page, {
        x: MARGIN, y: y - sc(2),
        width: fs(11), height: fs(11),
        borderWidth: 0, backgroundColor: WHITE,
      })

      y -= drawWrappedText(item.label ?? '', MARGIN + fs(18), {
        size: fs(9), font: regular, color: DARK, maxWidth: CONTENT - fs(18),
      })

      if (item.note) {
        y -= drawWrappedText(item.note, MARGIN + fs(18), {
          size: fs(8), font: regular, color: MUTED, maxWidth: CONTENT - fs(18),
        })
      }
      y -= sc(10)

      if (item.connector && item.connector !== 'none') {
        guard(sc(14))
        page.drawText(item.connector.toUpperCase(), { x: MARGIN, y, size: fs(7), font: bold, color: accent })
        page.drawLine({ start: { x: MARGIN + sc(22), y: y + sc(3) }, end: { x: PAGE_W - MARGIN, y: y + sc(3) }, thickness: 0.5, color: LINE_GREY })
        y -= sc(13)
      }

    } else if (item.item_type === 'signature_row') {
      guard(fs(18) + sc(20))
      const labelW = 75, nameW = 160, sigW = 125, dateW = 95, gap = 8
      const rowY = y - sc(6)

      page.drawText(item.label ?? '', { x: MARGIN, y: rowY + fs(4), size: fs(9), font: bold, color: DARK })

      const nameTf = form.createTextField(`sig_name_${idx++}`)
      nameTf.addToPage(page, {
        x: MARGIN + labelW, y: rowY - fs(10),
        width: nameW, height: fs(18),
        borderWidth: 0.5, borderColor: LINE_GREY, backgroundColor: WHITE,
      })
      nameTf.updateAppearances(regular)

      const sigX = MARGIN + labelW + nameW + gap
      page.drawText('Signature', { x: sigX, y: rowY + fs(4), size: fs(7), font: regular, color: MUTED })
      page.drawLine({
        start: { x: sigX, y: rowY - fs(10) },
        end:   { x: sigX + sigW, y: rowY - fs(10) },
        thickness: 0.5, color: LINE_GREY,
      })

      const dateTf = form.createTextField(`sig_date_${idx++}`)
      dateTf.addToPage(page, {
        x: MARGIN + labelW + nameW + gap + sigW + gap, y: rowY - fs(10),
        width: dateW, height: fs(18),
        borderWidth: 0.5, borderColor: LINE_GREY, backgroundColor: WHITE,
      })
      dateTf.setText('DD / MM / YYYY')
      dateTf.updateAppearances(regular)

      y -= fs(18) + sc(14)
    }
  }

  return await pdfDoc.save()
}

export function downloadPdf(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes], { type: 'application/pdf' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
