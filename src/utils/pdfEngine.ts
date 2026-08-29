import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { DocumentPage } from '../types';

// Set up worker source reliably via local Vite asset bundle
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
  } catch (err) {
    console.warn('PDF.js worker initialization error fallback:', err);
  }
}

export interface PdfLoadResult {
  pages: DocumentPage[];
  isPasswordProtected: boolean;
  pageCount: number;
}

/**
 * Load PDF file data and render pages to high-resolution canvas data URLs
 */
export async function loadPdfDocument(
  fileBuffer: ArrayBuffer,
  password?: string,
  onProgress?: (percent: number, status: string) => void
): Promise<PdfLoadResult> {
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(fileBuffer),
    password: password || undefined,
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`,
  });

  if (onProgress) {
    loadingTask.onProgress = ({ loaded, total }) => {
      if (total > 0) {
        const pct = Math.round((loaded / total) * 30);
        onProgress(pct, `Loading PDF document... ${pct}%`);
      }
    };
  }

  let pdfDoc: pdfjsLib.PDFDocumentProxy;
  try {
    pdfDoc = await loadingTask.promise;
  } catch (error: any) {
    const isPasswordErr =
      error.name === 'PasswordException' ||
      error.name === 'NeedPasswordException' ||
      error.name === 'InvalidPasswordException' ||
      error.message?.toLowerCase().includes('password') ||
      error.code === 1 ||
      error.code === 2;

    if (isPasswordErr) {
      if (password) {
        throw new Error('Incorrect PDF password. Please try again.');
      }
      return {
        pages: [],
        isPasswordProtected: true,
        pageCount: 0,
      };
    }
    throw new Error(error.message || 'Failed to parse PDF document.');
  }

  const numPages = pdfDoc.numPages;
  const pages: DocumentPage[] = [];

  for (let i = 1; i <= numPages; i++) {
    if (onProgress) {
      const pagePct = 30 + Math.round(((i - 1) / numPages) * 65);
      onProgress(pagePct, `Rendering high-res page ${i} of ${numPages}...`);
    }

    const page = await pdfDoc.getPage(i);
    // Render at 2.5x scale for razor-sharp vector text and QR codes
    let desiredScale = 2.5;
    let viewport = page.getViewport({ scale: desiredScale });

    // Limit maximum canvas dimension to 4096px for browser safety
    if (viewport.width > 4096 || viewport.height > 4096) {
      desiredScale = 4096 / Math.max(viewport.width / desiredScale, viewport.height / desiredScale);
      viewport = page.getViewport({ scale: desiredScale });
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    if (!context) {
      throw new Error('Canvas 2D context creation failed');
    }

    // Fill clean white background
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: context,
      viewport: viewport,
      canvas: canvas,
    }).promise;

    const dataUrl = canvas.toDataURL('image/png', 0.95);
    pages.push({
      pageNumber: i,
      dataUrl,
      width: canvas.width,
      height: canvas.height,
      aspectRatio: canvas.width / canvas.height,
      rotation: 0,
    });
  }

  if (onProgress) {
    onProgress(100, 'Document ready for processing');
  }

  return {
    pages,
    isPasswordProtected: false,
    pageCount: numPages,
  };
}

/**
 * Load image file into DocumentPage representation
 */
export async function loadImageDocument(
  file: File,
  onProgress?: (percent: number, status: string) => void
): Promise<DocumentPage> {
  if (onProgress) onProgress(30, 'Reading image file...');

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      if (onProgress) onProgress(100, 'Image loaded successfully');
      
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      }
      const dataUrl = canvas.toDataURL('image/png', 0.95);
      URL.revokeObjectURL(objectUrl);

      resolve({
        pageNumber: 1,
        dataUrl,
        width: canvas.width,
        height: canvas.height,
        aspectRatio: canvas.width / canvas.height,
        rotation: 0,
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to decode image file. Please ensure it is a valid JPG, PNG, or WebP image.'));
    };
    img.src = objectUrl;
  });
}
