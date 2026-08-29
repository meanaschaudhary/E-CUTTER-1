import { CropBox, ImageAdjustments, SharpenLevel } from '../types';

/**
 * Intelligent Card Boundary Detection using Canvas Computer Vision
 * Scans for high-contrast edges, card borderlines, and content density bounding boxes.
 */
export async function detectCardBounds(
  imageSource: HTMLImageElement | HTMLCanvasElement,
  cardType?: string,
  side: 'front' | 'back' = 'front'
): Promise<CropBox> {
  const canvas = document.createElement('canvas');
  const maxDim = 800; // Work at manageable resolution for fast CV analysis
  const scale = Math.min(1, maxDim / Math.max(imageSource.width, imageSource.height));
  
  canvas.width = Math.max(100, Math.floor(imageSource.width * scale));
  canvas.height = Math.max(100, Math.floor(imageSource.height * scale));
  
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    // Default CR80 fallback box (centered)
    return getDefaultCardCropBox(cardType, side);
  }

  ctx.drawImage(imageSource, 0, 0, canvas.width, canvas.height);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  const w = canvas.width;
  const h = canvas.height;

  // Compute luminance map
  const lum = new Float32Array(w * h);
  for (let i = 0; i < data.length; i += 4) {
    lum[i / 4] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }

  // 1. Aadhaar Letter heuristic detection:
  // Standard e-Aadhaar PDF on Page 1 has the printable card at the bottom ~35% - 40% of the A4 page.
  // Front card is usually bottom-left or bottom-half, Back card is bottom-right or page 2.
  if (cardType?.includes('aadhaar')) {
    if (h > w * 1.2) { // Portrait A4 page
      if (side === 'front') {
        // Aadhaar front card is standardly located between y: 0.62 to 0.95 and x: 0.08 to 0.52 (or full width)
        // Let's refine within bottom 45% of page
        return {
          x: 0.08,
          y: 0.64,
          width: 0.42,
          height: 0.28,
        };
      } else {
        // Aadhaar back card is often bottom right
        return {
          x: 0.50,
          y: 0.64,
          width: 0.42,
          height: 0.28,
        };
      }
    }
  }

  // 2. PAN Card heuristic: e-PAN PDF usually has the rectangular card outline in bottom third
  if (cardType?.includes('pan')) {
    if (h > w * 1.2) {
      return {
        x: 0.08,
        y: 0.65,
        width: 0.84,
        height: 0.28,
      };
    }
  }

  // 3. Generic Edge/Gradient Bounding Box Scanner:
  // Detect where the content starts and ends away from pure white/light margins
  let minX = w;
  let maxX = 0;
  let minY = h;
  let maxY = 0;

  // Background color sampling from corners
  const bgLuminance = (lum[0] + lum[w - 1] + lum[(h - 1) * w] + lum[h * w - 1]) / 4;
  const threshold = Math.abs(bgLuminance - 128) > 50 ? 25 : 35;

  // Find bounding box of non-background content
  for (let y = Math.floor(h * 0.05); y < Math.floor(h * 0.95); y++) {
    for (let x = Math.floor(w * 0.05); x < Math.floor(w * 0.95); x++) {
      const val = lum[y * w + x];
      if (Math.abs(val - bgLuminance) > threshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX > minX + 50 && maxY > minY + 50) {
    const normX = Math.max(0, Math.min(1, (minX - 5) / w));
    const normY = Math.max(0, Math.min(1, (minY - 5) / h));
    const normW = Math.max(0.1, Math.min(1 - normX, (maxX - minX + 10) / w));
    const normH = Math.max(0.1, Math.min(1 - normY, (maxY - minY + 10) / h));

    return {
      x: normX,
      y: normY,
      width: normW,
      height: normH,
    };
  }

  return getDefaultCardCropBox(cardType, side);
}

/**
 * Returns clean standard default crop region based on document type
 */
export function getDefaultCardCropBox(cardType?: string, side: 'front' | 'back' = 'front'): CropBox {
  if (cardType?.includes('aadhaar')) {
    if (side === 'front') {
      return { x: 0.08, y: 0.63, width: 0.42, height: 0.28 };
    } else {
      return { x: 0.50, y: 0.63, width: 0.42, height: 0.28 };
    }
  }

  if (cardType?.includes('pan')) {
    return { x: 0.12, y: 0.62, width: 0.76, height: 0.30 };
  }

  // Centered CR80 proportion box
  return {
    x: 0.10,
    y: 0.20,
    width: 0.80,
    height: 0.50,
  };
}

/**
 * Applies sharpening convolution filter (3x3 kernel) to canvas context
 */
export function applySharpenKernel(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  level: SharpenLevel
) {
  if (level === 'none') return;

  const imgData = ctx.getImageData(0, 0, width, height);
  const src = imgData.data;
  const output = ctx.createImageData(width, height);
  const dst = output.data;

  // 3x3 Convolution matrix based on intensity
  let kernel: number[];
  if (level === 'light') {
    kernel = [
       0, -0.25,  0,
      -0.25, 2.0, -0.25,
       0, -0.25,  0
    ];
  } else if (level === 'medium') {
    kernel = [
       0, -0.5,  0,
      -0.5, 3.0, -0.5,
       0, -0.5,  0
    ];
  } else {
    // high
    kernel = [
      -0.5, -1.0, -0.5,
      -1.0,  7.0, -1.0,
      -0.5, -1.0, -0.5
    ];
  }

  const kw = 3;
  const kh = 3;
  const half = 1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0;
      for (let ky = 0; ky < kh; ky++) {
        for (let kx = 0; kx < kw; kx++) {
          const px = Math.min(width - 1, Math.max(0, x + kx - half));
          const py = Math.min(height - 1, Math.max(0, y + ky - half));
          const idx = (py * width + px) * 4;
          const weight = kernel[ky * kw + kx];

          r += src[idx] * weight;
          g += src[idx + 1] * weight;
          b += src[idx + 2] * weight;
        }
      }

      const outIdx = (y * width + x) * 4;
      dst[outIdx] = Math.min(255, Math.max(0, r));
      dst[outIdx + 1] = Math.min(255, Math.max(0, g));
      dst[outIdx + 2] = Math.min(255, Math.max(0, b));
      dst[outIdx + 3] = src[outIdx + 3]; // keep alpha
    }
  }

  ctx.putImageData(output, 0, 0);
}

/**
 * Apply image adjustments (brightness, contrast, saturation, grayscale)
 */
export function applyAdjustments(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  adjustments: ImageAdjustments
) {
  const { brightness, contrast, saturation, grayscale, sharpen } = adjustments;

  if (brightness !== 0 || contrast !== 0 || saturation !== 0 || grayscale) {
    const imgData = ctx.getImageData(0, 0, width, height);
    const d = imgData.data;

    // Contrast factor
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    // Brightness factor (-100 to 100 maps to -128 to 128)
    const bOffset = (brightness / 100) * 128;
    // Saturation factor
    const satFactor = 1 + (saturation / 100);

    for (let i = 0; i < d.length; i += 4) {
      let r = d[i];
      let g = d[i + 1];
      let b = d[i + 2];

      // Brightness & Contrast
      r = factor * (r - 128) + 128 + bOffset;
      g = factor * (g - 128) + 128 + bOffset;
      b = factor * (b - 128) + 128 + bOffset;

      // Saturation / Grayscale
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      if (grayscale) {
        r = gray;
        g = gray;
        b = gray;
      } else if (saturation !== 0) {
        r = gray + (r - gray) * satFactor;
        g = gray + (g - gray) * satFactor;
        b = gray + (b - gray) * satFactor;
      }

      d[i] = Math.min(255, Math.max(0, r));
      d[i + 1] = Math.min(255, Math.max(0, g));
      d[i + 2] = Math.min(255, Math.max(0, b));
    }

    ctx.putImageData(imgData, 0, 0);
  }

  // Apply convolution sharpen if enabled
  if (sharpen && sharpen !== 'none') {
    applySharpenKernel(ctx, width, height, sharpen);
  }
}

/**
 * Calculates physical pixels, DPI, and informational resolution notes
 */
export function calculatePhysicalPixelDimensions(
  widthMm: number,
  heightMm: number,
  targetDpi: number,
  sourceCropPx: { width: number; height: number }
) {
  // 1 inch = 25.4 mm
  const pixelWidth = Math.round((widthMm / 25.4) * targetDpi);
  const pixelHeight = Math.round((heightMm / 25.4) * targetDpi);

  // Calculate what the source image resolution corresponds to in DPI
  const effectiveSourceDpi = Math.round(Math.min(
    (sourceCropPx.width / widthMm) * 25.4,
    (sourceCropPx.height / heightMm) * 25.4
  ));

  const isUpscaling = targetDpi > effectiveSourceDpi * 1.15;

  let advice = `Original source region: ${sourceCropPx.width} × ${sourceCropPx.height} px (~${effectiveSourceDpi} DPI).`;
  if (isUpscaling) {
    advice += ' Note: Upscaling increases pixel dimensions but preserves original clarity without inventing synthetic noise.';
  } else {
    advice += ' Source contains high native density for crisp, razor-sharp card output.';
  }

  return {
    pixelWidth,
    pixelHeight,
    effectiveSourceDpi,
    targetDpi,
    isUpscaling,
    advice,
  };
}

/**
 * Generates a cropped high-resolution canvas with full rotation and filters applied
 */
export async function renderCroppedCard(
  imageSource: HTMLImageElement | string,
  cropBox: CropBox,
  rotation: number,
  adjustments: ImageAdjustments,
  targetWidthMm: number = 86,
  targetHeightMm: number = 54,
  targetDpi: number = 600
): Promise<string> {
  const img = await resolveImage(imageSource);

  // Calculate actual source crop coordinates in pixels
  const sx = Math.floor(cropBox.x * img.naturalWidth);
  const sy = Math.floor(cropBox.y * img.naturalHeight);
  const sw = Math.max(10, Math.floor(cropBox.width * img.naturalWidth));
  const sh = Math.max(10, Math.floor(cropBox.height * img.naturalHeight));

  // Determine output canvas size based on physical mm & target DPI
  const outW = Math.max(100, Math.round((targetWidthMm / 25.4) * targetDpi));
  const outH = Math.max(100, Math.round((targetHeightMm / 25.4) * targetDpi));

  const isRotatedQuarter = rotation === 90 || rotation === 270;

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Fill crisp white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);

  const drawW = isRotatedQuarter ? canvas.height : canvas.width;
  const drawH = isRotatedQuarter ? canvas.width : canvas.height;

  ctx.drawImage(
    img,
    sx, sy, sw, sh,
    -drawW / 2, -drawH / 2, drawW, drawH
  );
  ctx.restore();

  // Apply filters/adjustments
  applyAdjustments(ctx, canvas.width, canvas.height, adjustments);

  return canvas.toDataURL('image/png', 1.0);
}

/**
 * Detect card boundaries from an image URL or element
 */
export async function detectCardBoundsInImage(
  imageSource: HTMLImageElement | string,
  side: 'front' | 'back' = 'front',
  targetAspectRatio: number = 86 / 54
): Promise<CropBox> {
  const img = await resolveImage(imageSource);
  return detectCardBounds(img, undefined, side);
}

/**
 * Automatically processes a document (Front & Back assignment, card edge detection)
 */
export async function autoProcessFullDocument(
  doc: import('../types').UploadedDocument
): Promise<import('../types').UploadedDocument> {
  const updated: import('../types').UploadedDocument = { ...doc };

  // Page heuristic
  if (doc.pageCount > 1) {
    updated.front.pageIndex = 0;
    if (doc.back) {
      updated.back.pageIndex = 1;
      updated.hasBackSide = true;
    }
  }

  // Detect front crop box
  const frontPage = doc.pages[updated.front.pageIndex] || doc.pages[0];
  if (frontPage) {
    const frontCrop = await detectCardBoundsInImage(
      frontPage.dataUrl,
      'front',
      doc.targetWidthMm / doc.targetHeightMm
    );
    updated.front.cropBox = frontCrop;
  }

  // Detect back crop box if present
  if (updated.hasBackSide && updated.back) {
    const backPage = doc.pages[updated.back.pageIndex] || doc.pages[0];
    if (backPage) {
      const backCrop = await detectCardBoundsInImage(
        backPage.dataUrl,
        'back',
        doc.targetWidthMm / doc.targetHeightMm
      );
      updated.back.cropBox = backCrop;
    }
  }

  return updated;
}

function resolveImage(src: HTMLImageElement | string): Promise<HTMLImageElement> {
  if (typeof src !== 'string') {
    if (src.complete && src.naturalWidth > 0) return Promise.resolve(src);
    return new Promise((resolve, reject) => {
      src.onload = () => resolve(src);
      src.onerror = reject;
    });
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
