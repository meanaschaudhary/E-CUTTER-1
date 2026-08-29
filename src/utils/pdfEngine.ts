import * as pdfjsLib from 'pdfjs-dist';
import { DocumentPage } from '../types';

// Set up worker source
if (typeof window !== 'undefined') {
  try {
    // Use worker from unpkg/cdnjs or pdfjs version
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
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
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
    cMapPacked: true,
  });

  if (onProgress) {
    loadingTask.onProgress = ({ loaded, total }) => {
      if (total > 0) {
        const pct = Math.round((loaded / total) * 40);
        onProgress(pct, `Loading PDF document... ${pct}%`);
      }
    };
  }

  let pdfDoc: pdfjsLib.PDFDocumentProxy;
  try {
    pdfDoc = await loadingTask.promise;
  } catch (error: any) {
    if (
      error.name === 'PasswordException' ||
      error.message?.toLowerCase().includes('password') ||
      error.code === 1
    ) {
      return {
        pages: [],
        isPasswordProtected: true,
        pageCount: 0,
      };
    }
    throw error;
  }

  const numPages = pdfDoc.numPages;
  const pages: DocumentPage[] = [];

  for (let i = 1; i <= numPages; i++) {
    if (onProgress) {
      const pagePct = 40 + Math.round(((i - 1) / numPages) * 55);
      onProgress(pagePct, `Rendering high-res page ${i} of ${numPages}...`);
    }

    const page = await pdfDoc.getPage(i);
    // Render at scale 2.5 to 3.0 for crisp vector detail preservation
    const desiredScale = 2.5;
    const viewport = page.getViewport({ scale: desiredScale });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    if (!context) {
      throw new Error('Canvas 2D context creation failed');
    }

    // Fill white background
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    const renderContext: any = {
      canvasContext: context,
      viewport: viewport,
      canvas: canvas,
    };

    await page.render(renderContext).promise;

    const dataUrl = canvas.toDataURL('image/png', 1.0);
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
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        if (onProgress) onProgress(100, 'Image loaded successfully');
        resolve({
          pageNumber: 1,
          dataUrl: img.src,
          width: img.naturalWidth,
          height: img.naturalHeight,
          aspectRatio: img.naturalWidth / img.naturalHeight,
          rotation: 0,
        });
      };
      img.onerror = () => reject(new Error('Failed to decode image data'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}
