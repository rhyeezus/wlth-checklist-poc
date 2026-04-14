import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'

async function fetchFont(path: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(path)
    if (!res.ok) return null
    return res.arrayBuffer()
  } catch (e) {
    console.warn('Font fetch failed, falling back to Helvetica:', path, e)
    return null
  }
}

// ── colours ──────────────────────────────────────────────────────────────────
const WLTH_ACCENT = rgb(0.184, 0.329, 0.922)  // #2f54eb
const MMA_ACCENT  = rgb(0.161, 0.180, 0.227)  // #292e3a
const LIGHT_GREY  = rgb(0.933, 0.933, 0.941)  // lightgrey-200
const MUTED       = rgb(0.502, 0.522, 0.565)  // lightgrey-600
const DARK        = rgb(0.133, 0.133, 0.133)  // near-black body text
const WHITE       = rgb(1, 1, 1)
const LINE_GREY   = rgb(0.855, 0.855, 0.863)
const LOGO_FILL   = rgb(0.957, 0.957, 0.957)  // #F4F4F4

// ── SVG paths (from the actual SVG files) ────────────────────────────────────
const WLTH_PATH = 'M2.96933 0L7.56963 14.5863L9.96647 6.98899H12.9345L8.83166 20H6.3076L0 0H2.96933ZM12.3099 0L18.6187 20H21.5881L15.2792 0H12.3099ZM25.0307 0L20.9265 13.011H23.8959L28 0H25.0307Z'

// MMA path (main letterform only, no clip wrapper needed)
const MMA_PATH = 'M38.2144 0C36.6785 0 35.4289 1.23465 35.4289 2.75206C35.4289 4.26947 36.6785 5.50271 38.2144 5.50271C39.7503 5.50271 41 4.26807 41 2.75206C41 1.23605 39.7503 0 38.2144 0ZM38.2144 5.24794C36.8216 5.24794 35.6867 4.12808 35.6867 2.75066C35.6867 1.37323 36.8202 0.253368 38.2144 0.253368C39.6086 0.253368 40.7421 1.37323 40.7421 2.75066C40.7421 4.12808 39.6086 5.24794 38.2144 5.24794ZM39.5562 1.55801H39.9175L39.4188 3.11041H39.0575L39.5562 1.55801ZM38.3703 1.55801L39.1368 3.94471H38.7755L38.009 1.55801H38.3703ZM37.7242 2.3923H38.0855L37.5868 3.94471H37.2793L36.5128 1.55801H36.8741L37.4337 3.29939L37.7256 2.3923H37.7242ZM34.7573 0.00279965H30.348L26.4346 12.4416L22.4914 0.00279965H18.0821V16.0014H20.8578V3.03622L24.9681 16H27.8557L31.9816 3.03622L31.9887 15.9986H33.4183L34.7587 12.4444V0.00279965H34.7573ZM0 5.53071H2.85216L2.76857 16H0V5.53071ZM16.6397 0.00279965V16.0014H13.7536L13.7507 3.05162L9.61347 16.0014H7.03477L1.90144 0.00279965H4.3087L8.30003 12.4444H8.3142L12.3112 0.00979878L16.6397 0.00279965Z'

// ── page constants ────────────────────────────────────────────────────────────
const PAGE_W  = 595.28
const PAGE_H  = 841.89
const MARGIN  = 40
const CONTENT = PAGE_W - MARGIN * 2

// ── header constants ──────────────────────────────────────────────────────────
const HEADER_H   = 80
const WEDGE_W    = 110
const WEDGE_DIAG = 31   // how far the diagonal cuts in at the top (px = 28% of WEDGE_W)

export async function generateChecklistPdf(template: any, variantKey: string) {
  const accent = variantKey === 'mortgage_mart' ? MMA_ACCENT : WLTH_ACCENT

  const pdfDoc = await PDFDocument.create()
  pdfDoc.registerFontkit(fontkit)

  // Embed SuisseIntl from local public/fonts (avoids CDN CORS)
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

  const form    = pdfDoc.getForm()

  const BANNER_H        = 36
  const FOOTER_H        = 20
  const BOTTOM_RESERVED = BANNER_H + FOOTER_H + 8

  // Pull bottom_banner and footer text from items
  const bottomBannerItem = (template.items ?? []).find((i: any) => i.item_type === 'bottom_banner')
  const footerItem       = (template.items ?? []).find((i: any) => i.item_type === 'footer')
  const bannerText = bottomBannerItem?.label ?? ''
  const footerText = footerItem?.label ?? ''

  let page = pdfDoc.addPage([PAGE_W, PAGE_H])
  let y    = PAGE_H - MARGIN
  let idx  = 0

  // ── helpers ──────────────────────────────────────────────────────────────────

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

  // Word-wrapping text draw — returns total height consumed
  function drawWrappedText(text: string, x: number, opts: {
    size?: number, font?: any, color?: any, maxWidth?: number
  } = {}) {
    const { size = 9, font = regular, color = DARK, maxWidth = CONTENT } = opts
    const lh    = size + 4
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

  // ── header banner ─────────────────────────────────────────────────────────

  // Background
  page.drawRectangle({ x: 0, y: PAGE_H - HEADER_H, width: PAGE_W, height: HEADER_H, color: LIGHT_GREY })

  // Diagonal wedge — polygon matching clip-path: polygon(28% 0%, 100% 0%, 100% 100%, 0% 100%)
  // In SVG coords (y down), origin at top-left of page
  const wedgePath = [
    `M ${PAGE_W - WEDGE_W + WEDGE_DIAG} 0`,
    `L ${PAGE_W} 0`,
    `L ${PAGE_W} ${HEADER_H}`,
    `L ${PAGE_W - WEDGE_W} ${HEADER_H}`,
    'Z',
  ].join(' ')
  page.drawSvgPath(wedgePath, { x: 0, y: PAGE_H, color: accent })

  // Title
  page.drawText(template.title ?? '', {
    x: MARGIN, y: PAGE_H - 32,
    size: 14, font: bold, color: accent,
  })

  // Subtitle
  page.drawText('Supporting Document Checklist', {
    x: MARGIN, y: PAGE_H - 52,
    size: 9, font: regular, color: MUTED,
  })

  // Logomark — positioned in the solid centre of the wedge
  // At the vertical midpoint the left edge of the wedge is ~PAGE_W - 94
  // So solid area centre ≈ PAGE_W - 47
  if (variantKey === 'mortgage_mart') {
    // MMA viewBox 0 0 41 16 — render at scale 1.4 → 57.4 × 22.4 pt
    const scale = 1.4
    const lw = 41 * scale
    const lh = 16 * scale
    const lx = PAGE_W - 47 - lw / 2
    const ly = PAGE_H - HEADER_H / 2 + lh / 2  // PDF y of SVG origin (top of logo)
    page.drawSvgPath(MMA_PATH, { x: lx, y: ly, scale, color: LOGO_FILL })
  } else {
    // WLTH viewBox 0 0 28 20 — render at scale 1.4 → 39.2 × 28 pt
    const scale = 1.4
    const lw = 28 * scale
    const lh = 20 * scale
    const lx = PAGE_W - 47 - lw / 2
    const ly = PAGE_H - HEADER_H / 2 + lh / 2
    page.drawSvgPath(WLTH_PATH, { x: lx, y: ly, scale, color: LOGO_FILL })
  }

  y = PAGE_H - HEADER_H - 24

  // ── application details ───────────────────────────────────────────────────

  if (template.header_fields?.length) {
    page.drawText('APPLICATION DETAILS', { x: MARGIN, y, size: 7, font: bold, color: MUTED })
    y -= 14

    const fields = template.header_fields as any[]
    let i = 0

    while (i < fields.length) {
      const field     = fields[i]
      const isHalf    = field.width === 'half'
      const next      = fields[i + 1]
      const nextHalf  = next?.width === 'half'

      if (isHalf && nextHalf) {
        const fw = (CONTENT - 8) / 2

        page.drawText(field.label, { x: MARGIN,          y, size: 7, font: bold, color: MUTED })
        page.drawText(next.label,  { x: MARGIN + fw + 8, y, size: 7, font: bold, color: MUTED })
        y -= 12

        const tf1 = form.createTextField(`hf_${idx++}`)
        tf1.addToPage(page, { x: MARGIN,          y: y - 18, width: fw, height: 18, borderWidth: 0, backgroundColor: WHITE })
        tf1.updateAppearances(regular)

        const tf2 = form.createTextField(`hf_${idx++}`)
        tf2.addToPage(page, { x: MARGIN + fw + 8, y: y - 18, width: fw, height: 18, borderWidth: 0, backgroundColor: WHITE })
        tf2.updateAppearances(regular)

        y -= 30
        i += 2
      } else {
        page.drawText(field.label, { x: MARGIN, y, size: 7, font: bold, color: MUTED })
        y -= 12

        const tf = form.createTextField(`hf_${idx++}`)
        tf.addToPage(page, { x: MARGIN, y: y - 18, width: CONTENT, height: 18, borderWidth: 0, backgroundColor: WHITE })
        tf.updateAppearances(regular)

        y -= 30
        i++
      }
    }

    y -= 10
    page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.5, color: LINE_GREY })
    y -= 18
  }

  // ── checklist items ───────────────────────────────────────────────────────

  page.drawText('DOCUMENT CHECKLIST', { x: MARGIN, y, size: 7, font: bold, color: MUTED })
  y -= 18

  for (const item of template.items ?? []) {

    if (item.item_type === 'section_header') {
      guard(30)
      y -= 6
      page.drawText(item.label ?? '', { x: MARGIN, y, size: 10, font: bold, color: accent })
      y -= 20

    } else if (item.item_type === 'banner') {
      guard(32)
      y -= 6
      page.drawRectangle({ x: MARGIN, y: y - 22, width: CONTENT, height: 26, color: LIGHT_GREY })
      page.drawText(item.label ?? '', { x: MARGIN + 8, y: y - 13, size: 8, font: regular, color: DARK })
      y -= 34

    } else if (item.item_type === 'sub_section_header') {
      guard(22)
      y -= 4
      page.drawText((item.label ?? '').toUpperCase(), { x: MARGIN, y, size: 8, font: bold, color: DARK })
      y -= 16

    } else if (item.item_type === 'checklist_item') {
      guard(24)

      // Checkbox — vertically centred with first line of label text (baseline y, ascender ~+7pt)
      const cb = form.createCheckBox(`cb_${idx++}`)
      cb.addToPage(page, {
        x: MARGIN, y: y - 2,
        width: 11, height: 11,
        borderWidth: 0,
        backgroundColor: WHITE,
      })

      // Label (word-wrapped)
      const labelH = drawWrappedText(item.label ?? '', MARGIN + 18, {
        size: 9, font: regular, color: DARK,
        maxWidth: CONTENT - 18,
      })
      y -= labelH

      // Note
      if (item.note) {
        const noteH = drawWrappedText(item.note, MARGIN + 18, {
          size: 8, font: regular, color: MUTED,
          maxWidth: CONTENT - 18,
        })
        y -= noteH
      }

      y -= 10

      // AND / OR connector
      if (item.connector && item.connector !== 'none') {
        guard(14)
        page.drawText(item.connector.toUpperCase(), { x: MARGIN, y, size: 7, font: bold, color: accent })
        page.drawLine({ start: { x: MARGIN + 22, y: y + 3 }, end: { x: PAGE_W - MARGIN, y: y + 3 }, thickness: 0.5, color: LINE_GREY })
        y -= 13
      }
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
