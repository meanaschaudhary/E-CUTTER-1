import { CropBox, ImageAdjustments, SharpenLevel } from '../types';

/**
 * High-Precision Intelligent Card Boundary Detection using Canvas Computer Vision
 * Scans for high-contrast edges, cutlines, card borderlines, and content density bounding boxes.
 * Accurately segments Front side (left/top/page 1) and Back side (right/bottom/page 2).
 */
export async function detectCardBounds(
  imageSource: HTMLImageElement | HTMLCanvasElement,
  cardType?: string,
  side: 'front' | 'back' = 'front',
  targetAspectRatio: number = 86 / 54
): Promise<CropBox> {
  const canvas = document.createElement('canvas');
  // High analytical resolution to catch subtle dotted cutlines and sharp card borders
  const maxDim = 1200;
  const origW = imageSource instanceof HTMLImageElement ? imageSource.naturalWidth || imageSource.width : imageSource.width;
  const origH = imageSource instanceof HTMLImageElement ? imageSource.naturalHeight || imageSource.height : imageSource.height;
  
  if (!origW || !origH) {
    return getDefaultCardCropBox(cardType, side);
  }

  const scale = Math.min(1, maxDim / Math.max(origW, origH));
  canvas.width = Math.max(100, Math.floor(origW * scale));
  canvas.height = Math.max(100, Math.floor(origH * scale));
  
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    return getDefaultCardCropBox(cardType, side);
  }

  ctx.drawImage(imageSource, 0, 0, canvas.width, canvas.height);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  const w = canvas.width;
  const h = canvas.height;

  // Compute Luminance and Sobel Gradients
  const lum = new Float32Array(w * h);
  for (let i = 0; i < data.length; i += 4) {
    lum[i / 4] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }

  // Sample background color from four outer corners
  const sampleSize = Math.max(3, Math.floor(Math.min(w, h) * 0.03));
  let bgSum = 0;
  let bgCount = 0;
  for (let dy = 0; dy < sampleSize; dy++) {
    for (let dx = 0; dx < sampleSize; dx++) {
      bgSum += lum[dy * w + dx]; // top-left
      bgSum += lum[dy * w + (w - 1 - dx)]; // top-right
      bgSum += lum[(h - 1 - dy) * w + dx]; // bottom-left
      bgSum += lum[(h - 1 - dy) * w + (w - 1 - dx)]; // bottom-right
      bgCount += 4;
    }
  }
  const bgLuminance = bgSum / bgCount;

  // Compute Sobel vertical & horizontal gradients
  const gradMag = new Float32Array(w * h);
  const gradX = new Float32Array(w * h);
  const gradY = new Float32Array(w * h);

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      // Sobel horizontal
      const gx =
        -lum[(y - 1) * w + (x - 1)] + lum[(y - 1) * w + (x + 1)] +
        -2 * lum[y * w + (x - 1)] + 2 * lum[y * w + (x + 1)] +
        -lum[(y + 1) * w + (x - 1)] + lum[(y + 1) * w + (x + 1)];

      // Sobel vertical
      const gy =
        -lum[(y - 1) * w + (x - 1)] - 2 * lum[(y - 1) * w + x] - lum[(y - 1) * w + (x + 1)] +
        lum[(y + 1) * w + (x - 1)] + 2 * lum[(y + 1) * w + x] + lum[(y + 1) * w + (x + 1)];

      gradX[y * w + x] = Math.abs(gx);
      gradY[y * w + x] = Math.abs(gy);
      gradMag[y * w + x] = Math.sqrt(gx * gx + gy * gy);
    }
  }

  const isPortraitDocument = h >= w * 1.18; // Standard A4 / Letter PDF sheet
  const isAadhaarDocument = cardType?.includes('aadhaar');

  // =========================================================================
  // SCENARIO 1: TALL A4 / LETTER GOVERNMENT PDF (Aadhaar, PAN, Voter, Ayushman)
  // The bottom 35-45% of the page contains the printable card section with cutline
  // =========================================================================
  if (isPortraitDocument || isAadhaarDocument) {
    // Scan bottom half of page for the horizontal cutline or top card border
    // Usually cutline or card top is located between y = 0.52 and 0.72 of the page
    const scanStartY = Math.floor(h * 0.50);
    const scanEndY = Math.floor(h * 0.74);
    
    // Find sharp horizontal edge peak in scan region
    let bestCutlineY = Math.floor(h * 0.635);
    let maxHorizEdge = 0;

    for (let y = scanStartY; y < scanEndY; y++) {
      let rowGrad = 0;
      // Scan across the middle 80% width
      for (let x = Math.floor(w * 0.10); x < Math.floor(w * 0.90); x++) {
        rowGrad += gradY[y * w + x];
      }
      if (rowGrad > maxHorizEdge) {
        maxHorizEdge = rowGrad;
        bestCutlineY = y;
      }
    }

    // Top of the card starts slightly below or right at the cutline
    let cardTopY = bestCutlineY;
    // If cutline detected, find first content row below it (within 30px)
    for (let y = bestCutlineY; y < Math.min(h - 20, bestCutlineY + Math.floor(h * 0.05)); y++) {
      let contentHits = 0;
      for (let x = Math.floor(w * 0.15); x < Math.floor(w * 0.85); x++) {
        if (Math.abs(lum[y * w + x] - bgLuminance) > 25) contentHits++;
      }
      if (contentHits > w * 0.2) {
        cardTopY = y;
        break;
      }
    }

    // Find the bottom border of the card section (scanning from bottom up)
    let cardBottomY = Math.floor(h * 0.965);
    let maxBottomGrad = 0;
    for (let y = Math.floor(h * 0.98); y > Math.floor(h * 0.86); y--) {
      let rowGrad = 0;
      for (let x = Math.floor(w * 0.10); x < Math.floor(w * 0.90); x++) {
        rowGrad += gradY[y * w + x];
      }
      if (rowGrad > maxBottomGrad) {
        maxBottomGrad = rowGrad;
        cardBottomY = y;
      }
    }

    // Ensure realistic card height span (typically 24% to 34% of portrait page height)
    let cardH_px = cardBottomY - cardTopY;
    if (cardH_px < h * 0.20 || cardH_px > h * 0.38) {
      cardTopY = Math.floor(h * 0.63);
      cardBottomY = Math.floor(h * 0.95);
      cardH_px = cardBottomY - cardTopY;
    }

    // Determine horizontal split (Center gutter between Front & Back cards)
    const centerSearchStart = Math.floor(w * 0.45);
    const centerSearchEnd = Math.floor(w * 0.55);
    let centerSplitX = Math.floor(w * 0.50);
    let minCenterDensity = Infinity;

    for (let x = centerSearchStart; x <= centerSearchEnd; x++) {
      let colDensity = 0;
      for (let y = cardTopY; y <= cardBottomY; y++) {
        if (Math.abs(lum[y * w + x] - bgLuminance) > 20) colDensity++;
      }
      if (colDensity < minCenterDensity) {
        minCenterDensity = colDensity;
        centerSplitX = x;
      }
    }

    // Find outer left boundary for Front card
    let frontLeftX = Math.floor(w * 0.07);
    let maxLeftEdge = 0;
    for (let x = Math.floor(w * 0.03); x < Math.floor(w * 0.15); x++) {
      let colGrad = 0;
      for (let y = cardTopY; y <= cardBottomY; y++) {
        colGrad += gradX[y * w + x];
      }
      if (colGrad > maxLeftEdge) {
        maxLeftEdge = colGrad;
        frontLeftX = x;
      }
    }

    // Find outer right boundary for Back card
    let backRightX = Math.floor(w * 0.93);
    let maxRightEdge = 0;
    for (let x = Math.floor(w * 0.85); x < Math.floor(w * 0.97); x++) {
      let colGrad = 0;
      for (let y = cardTopY; y <= cardBottomY; y++) {
        colGrad += gradX[y * w + x];
      }
      if (colGrad > maxRightEdge) {
        maxRightEdge = colGrad;
        backRightX = x;
      }
    }

    // Fine-tune front and back candidate boxes
    if (side === 'front') {
      const rawX = frontLeftX / w;
      const rawY = cardTopY / h;
      const rawW = (centerSplitX - frontLeftX) / w;
      const rawH = (cardBottomY - cardTopY) / h;
      return fitToTargetAspectRatio(rawX, rawY, rawW, rawH, origW, origH, targetAspectRatio);
    } else {
      const rawX = (centerSplitX + 2) / w;
      const rawY = cardTopY / h;
      const rawW = (backRightX - centerSplitX - 2) / w;
      const rawH = (cardBottomY - cardTopY) / h;
      return fitToTargetAspectRatio(rawX, rawY, rawW, rawH, origW, origH, targetAspectRatio);
    }
  }

  // =========================================================================
  // SCENARIO 2: SCANNED IMAGE / PHOTO (Dual Card Scan or Single Card Isolated)
  // =========================================================================
  
  // Find non-background content bounds
  let minX = w, maxX = 0, minY = h, maxY = 0;
  const threshold = Math.abs(bgLuminance - 128) > 50 ? 20 : 28;

  for (let y = Math.floor(h * 0.02); y < Math.floor(h * 0.98); y++) {
    for (let x = Math.floor(w * 0.02); x < Math.floor(w * 0.98); x++) {
      const isDiff = Math.abs(lum[y * w + x] - bgLuminance) > threshold;
      const isEdge = gradMag[y * w + x] > 35;
      if (isDiff || isEdge) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  // If no clear content found, return standard default
  if (maxX <= minX + 40 || maxY <= minY + 40) {
    return getDefaultCardCropBox(cardType, side);
  }

  const contentW = maxX - minX;
  const contentH = maxY - minY;

  // Check if there are TWO side-by-side cards on this sheet (Landscape or Flatbed scan)
  const midX = Math.floor((minX + maxX) / 2);
  let centerValleyDensity = 0;
  for (let y = minY; y <= maxY; y++) {
    if (Math.abs(lum[y * w + midX] - bgLuminance) > threshold) {
      centerValleyDensity++;
    }
  }

  // Side-by-side cards layout test (aspect ratio of total content is wide >= 2.2)
  const isSideBySide = (contentW / contentH >= 2.0) || (centerValleyDensity < contentH * 0.25 && contentW / contentH >= 1.7);

  if (isSideBySide) {
    // Two cards placed horizontally side-by-side
    if (side === 'front') {
      const rawX = minX / w;
      const rawY = minY / h;
      const rawW = (midX - minX) / w;
      const rawH = contentH / h;
      return fitToTargetAspectRatio(rawX, rawY, rawW, rawH, origW, origH, targetAspectRatio);
    } else {
      const rawX = midX / w;
      const rawY = minY / h;
      const rawW = (maxX - midX) / w;
      const rawH = contentH / h;
      return fitToTargetAspectRatio(rawX, rawY, rawW, rawH, origW, origH, targetAspectRatio);
    }
  }

  // Check if two cards are stacked vertically (Top & Bottom)
  const midY = Math.floor((minY + maxY) / 2);
  let centerHorizValley = 0;
  for (let x = minX; x <= maxX; x++) {
    if (Math.abs(lum[midY * w + x] - bgLuminance) > threshold) {
      centerHorizValley++;
    }
  }
  const isStackedVertical = (contentH / contentW >= 1.0 && centerHorizValley < contentW * 0.25);

  if (isStackedVertical) {
    if (side === 'front') {
      const rawX = minX / w;
      const rawY = minY / h;
      const rawW = contentW / w;
      const rawH = (midY - minY) / h;
      return fitToTargetAspectRatio(rawX, rawY, rawW, rawH, origW, origH, targetAspectRatio);
    } else {
      const rawX = minX / w;
      const rawY = midY / h;
      const rawW = contentW / w;
      const rawH = (maxY - midY) / h;
      return fitToTargetAspectRatio(rawX, rawY, rawW, rawH, origW, origH, targetAspectRatio);
    }
  }

  // Single card scan (fill target aspect ratio directly over detected card bounds)
  const rawX = minX / w;
  const rawY = minY / h;
  const rawW = contentW / w;
  const rawH = contentH / h;
  return fitToTargetAspectRatio(rawX, rawY, rawW, rawH, origW, origH, targetAspectRatio);
}

/**
 * Fits candidate bounding box coordinates to exact target aspect ratio cleanly and centrally
 */
function fitToTargetAspectRatio(
  rawX: number,
  rawY: number,
  rawW: number,
  rawH: number,
  imageW: number,
  imageH: number,
  targetAR: number // e.g. 86 / 54 = 1.59259
): CropBox {
  // Convert normalized box to pixel dimensions in original image
  let boxPxW = Math.max(20, rawW * imageW);
  let boxPxH = Math.max(20, rawH * imageH);
  let boxCenterX = (rawX + rawW / 2) * imageW;
  let boxCenterY = (rawY + rawH / 2) * imageH;

  const currentAR = boxPxW / boxPxH;

  if (currentAR > targetAR) {
    // Current box is wider than target ratio -> expand height
    boxPxH = boxPxW / targetAR;
  } else {
    // Current box is taller than target ratio -> expand width
    boxPxW = boxPxH * targetAR;
  }

  // Ensure does not exceed image bounds
  if (boxPxW > imageW) {
    boxPxW = imageW;
    boxPxH = boxPxW / targetAR;
  }
  if (boxPxH > imageH) {
    boxPxH = imageH;
    boxPxW = boxPxH * targetAR;
  }

  // Calculate new normalized top-left coordinates clamped within image
  let newX = (boxCenterX - boxPxW / 2) / imageW;
  let newY = (boxCenterY - boxPxH / 2) / imageH;
  let newW = boxPxW / imageW;
  let newH = boxPxH / imageH;

  if (newX < 0) newX = 0;
  if (newY < 0) newY = 0;
  if (newX + newW > 1) newX = Math.max(0, 1 - newW);
  if (newY + newH > 1) newY = Math.max(0, 1 - newH);

  return {
    x: Math.max(0, Math.min(0.95, Number(newX.toFixed(4)))),
    y: Math.max(0, Math.min(0.95, Number(newY.toFixed(4)))),
    width: Math.max(0.05, Math.min(1.0, Number(newW.toFixed(4)))),
    height: Math.max(0.05, Math.min(1.0, Number(newH.toFixed(4)))),
  };
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
  targetDpi: number = 1800
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
  targetAspectRatio: number = 86 / 54,
  cardType?: string
): Promise<CropBox> {
  const img = await resolveImage(imageSource);
  return detectCardBounds(img, cardType, side, targetAspectRatio);
}

/**
 * Automatically processes a document (Front & Back assignment, card edge detection)
 */
export async function autoProcessFullDocument(
  doc: import('../types').UploadedDocument
): Promise<import('../types').UploadedDocument> {
  const updated: import('../types').UploadedDocument = { ...doc };
  const targetAR = (doc.targetWidthMm || 86) / (doc.targetHeightMm || 54);
  const cardType = doc.selectedTemplateId;

  // Multi-page or Single-page assignment
  if (doc.pageCount > 1) {
    updated.front = { ...updated.front, pageIndex: 0 };
    updated.hasBackSide = true;
    if (!updated.back) {
      updated.back = {
        pageIndex: 1,
        cropBox: { x: 0.1, y: 0.2, width: 0.8, height: 0.5 },
        rotation: 0,
        adjustments: {
          brightness: 0,
          contrast: 0,
          saturation: 0,
          sharpen: 'none',
          grayscale: false,
        },
        aspectRatioMode: 'cr80',
        customRatioWidth: doc.targetWidthMm,
        customRatioHeight: doc.targetHeightMm,
      };
    } else {
      updated.back = { ...updated.back, pageIndex: 1 };
    }
  } else {
    // Single page document: Check if it's an Aadhaar or standard dual-side document
    const isAadhaarLike = cardType.includes('aadhaar');
    if (isAadhaarLike || updated.hasBackSide) {
      updated.hasBackSide = true;
      if (!updated.back) {
        updated.back = {
          pageIndex: 0,
          cropBox: { x: 0.52, y: 0.60, width: 0.42, height: 0.33 },
          rotation: 0,
          adjustments: {
            brightness: 0,
            contrast: 0,
            saturation: 0,
            sharpen: 'none',
            grayscale: false,
          },
          aspectRatioMode: 'cr80',
          customRatioWidth: doc.targetWidthMm,
          customRatioHeight: doc.targetHeightMm,
        };
      }
    }
  }

  // Detect front crop box with pure precision
  const frontPage = doc.pages[updated.front.pageIndex] || doc.pages[0];
  if (frontPage) {
    const frontCrop = await detectCardBoundsInImage(
      frontPage.dataUrl,
      'front',
      targetAR,
      cardType
    );
    updated.front = {
      ...updated.front,
      cropBox: frontCrop,
    };
  }

  // Detect back crop box with pure precision
  if (updated.hasBackSide && updated.back) {
    const backPage = doc.pages[updated.back.pageIndex] || doc.pages[0];
    if (backPage) {
      const backCrop = await detectCardBoundsInImage(
        backPage.dataUrl,
        'back',
        targetAR,
        cardType
      );
      updated.back = {
        ...updated.back,
        cropBox: backCrop,
      };
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
