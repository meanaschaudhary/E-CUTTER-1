import { jsPDF } from 'jspdf';
import { PaperSize, PrintSettings, UploadedDocument } from '../types';

export interface PdfExportOptions {
  fileName: string;
  quality: 'maximum' | 'high' | 'standard';
  outputType: 'front-only' | 'back-only' | 'front-and-back' | 'print-sheet';
  printSettings: PrintSettings;
}

/**
 * Generates and downloads a high-precision client-side PDF using jsPDF
 */
export async function exportDocumentToPdf(
  doc: UploadedDocument,
  options: PdfExportOptions,
  frontCardDataUrl: string | null,
  backCardDataUrl: string | null
): Promise<void> {
  const { fileName, outputType, printSettings, quality } = options;

  // Compression setting
  const compress = quality === 'standard' ? 'FAST' : 'NONE';

  if (outputType === 'print-sheet') {
    // Generate full page sheet (e.g. A4 / Letter) with multiple copies
    await exportPrintSheetPdf(doc, printSettings, frontCardDataUrl, backCardDataUrl, fileName, compress);
  } else {
    // Generate exact card-sized PDF or 2-page front/back card PDF
    const cardWidthMm = doc.targetWidthMm || 86;
    const cardHeightMm = doc.targetHeightMm || 54;
    const isLandscape = cardWidthMm >= cardHeightMm;

    const pdf = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: [cardWidthMm, cardHeightMm],
      compress: compress === 'FAST',
    });

    let pagesAdded = 0;

    if ((outputType === 'front-only' || outputType === 'front-and-back') && frontCardDataUrl) {
      pdf.addImage(frontCardDataUrl, 'PNG', 0, 0, cardWidthMm, cardHeightMm, undefined, 'FAST');
      pagesAdded++;
    }

    if ((outputType === 'back-only' || outputType === 'front-and-back') && backCardDataUrl) {
      if (pagesAdded > 0) {
        pdf.addPage([cardWidthMm, cardHeightMm], isLandscape ? 'landscape' : 'portrait');
      }
      pdf.addImage(backCardDataUrl, 'PNG', 0, 0, cardWidthMm, cardHeightMm, undefined, 'FAST');
      pagesAdded++;
    }

    if (pagesAdded === 0 && frontCardDataUrl) {
      pdf.addImage(frontCardDataUrl, 'PNG', 0, 0, cardWidthMm, cardHeightMm, undefined, 'FAST');
    }

    pdf.save(ensurePdfExtension(fileName));
  }
}

/**
 * Exports full print sheet layout to PDF matching physical print requirements
 */
async function exportPrintSheetPdf(
  doc: UploadedDocument,
  settings: PrintSettings,
  frontCardDataUrl: string | null,
  backCardDataUrl: string | null,
  fileName: string,
  compress: 'FAST' | 'NONE'
) {
  const { paperSize, orientation, copies, marginsMm, spacingMm, showCutGuides } = settings;

  let pageW = 210;
  let pageH = 297;
  if (paperSize === 'A4') { pageW = 210; pageH = 297; }
  else if (paperSize === 'A5') { pageW = 148; pageH = 210; }
  else if (paperSize === 'Letter') { pageW = 215.9; pageH = 279.4; }
  else { pageW = settings.customPaperWidthMm || 210; pageH = settings.customPaperHeightMm || 297; }

  if (orientation === 'landscape') {
    const tmp = pageW;
    pageW = pageH;
    pageH = tmp;
  }

  const pdf = new jsPDF({
    orientation: orientation,
    unit: 'mm',
    format: [pageW, pageH],
    compress: compress === 'FAST',
  });

  const cardW = doc.targetWidthMm || 86;
  const cardH = doc.targetHeightMm || 54;

  const usableW = pageW - marginsMm.left - marginsMm.right;
  const usableH = pageH - marginsMm.top - marginsMm.bottom;

  // Calculate items to print
  // Each copy can be: Front + Back pair side-by-side, or Front only
  const items: Array<{ type: 'front' | 'back'; img: string }> = [];
  for (let c = 0; c < copies; c++) {
    if (frontCardDataUrl && settings.duplexMode !== 'back-only') {
      items.push({ type: 'front', img: frontCardDataUrl });
    }
    if (backCardDataUrl && settings.duplexMode !== 'front-only') {
      items.push({ type: 'back', img: backCardDataUrl });
    }
  }

  let currX = marginsMm.left;
  let currY = marginsMm.top;
  let rowMaxHeight = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    // Check if card fits horizontally
    if (currX + cardW > pageW - marginsMm.right + 0.1 && currX > marginsMm.left) {
      currX = marginsMm.left;
      currY += rowMaxHeight + spacingMm.vertical;
      rowMaxHeight = 0;
    }

    // Check if card fits vertically, if not add new page
    if (currY + cardH > pageH - marginsMm.bottom + 0.1) {
      pdf.addPage([pageW, pageH], orientation);
      currX = marginsMm.left;
      currY = marginsMm.top;
      rowMaxHeight = 0;
    }

    // Draw card image
    pdf.addImage(item.img, 'PNG', currX, currY, cardW, cardH, undefined, 'FAST');

    // Draw cut guides if enabled
    if (showCutGuides) {
      pdf.setDrawColor(180, 190, 200);
      pdf.setLineWidth(0.2);
      // Corner tick marks
      const tick = 3;
      pdf.line(currX - tick, currY, currX, currY);
      pdf.line(currX, currY - tick, currX, currY);

      pdf.line(currX + cardW, currY, currX + cardW + tick, currY);
      pdf.line(currX + cardW, currY - tick, currX + cardW, currY);

      pdf.line(currX - tick, currY + cardH, currX, currY + cardH);
      pdf.line(currX, currY + cardH, currX, currY + cardH + tick);

      pdf.line(currX + cardW, currY + cardH, currX + cardW + tick, currY + cardH);
      pdf.line(currX + cardW, currY + cardH, currX + cardW, currY + cardH + tick);
    }

    // Advance X
    currX += cardW + spacingMm.horizontal;
    rowMaxHeight = Math.max(rowMaxHeight, cardH);
  }

  pdf.save(ensurePdfExtension(fileName));
}

function ensurePdfExtension(name: string): string {
  if (!name) return 'Aazmi_Card_Document.pdf';
  return name.toLowerCase().endsWith('.pdf') ? name : `${name}.pdf`;
}

/**
 * Downloads a canvas data URL as PNG or JPEG image file
 */
export function downloadImageFile(dataUrl: string, fileName: string, format: 'png' | 'jpeg' = 'png') {
  if (!dataUrl) return;

  const link = document.createElement('a');
  link.href = dataUrl;
  
  const ext = format === 'jpeg' ? '.jpg' : '.png';
  const cleanName = fileName.replace(/\.[^/.]+$/, '') + ext;
  link.download = cleanName;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
