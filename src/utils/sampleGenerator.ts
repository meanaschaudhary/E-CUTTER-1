import { DocumentPage, UploadedDocument } from '../types';

/**
 * Generates high-fidelity mock test documents for instant testing in CSC workflow.
 */
export function generateSampleAadhaarDocument(): UploadedDocument {
  // Create Page 1: A4 page with top letterhead and bottom front/back cards
  const canvas1 = document.createElement('canvas');
  canvas1.width = 1654; // A4 at ~200 DPI
  canvas1.height = 2338;
  const ctx1 = canvas1.getContext('2d')!;

  // Background
  ctx1.fillStyle = '#ffffff';
  ctx1.fillRect(0, 0, canvas1.width, canvas1.height);

  // Outer border & header banner
  ctx1.fillStyle = '#0f2942';
  ctx1.fillRect(60, 60, canvas1.width - 120, 90);
  ctx1.fillStyle = '#ffffff';
  ctx1.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
  ctx1.fillText('GOVERNMENT OF INDIA - UNIQUE IDENTIFICATION AUTHORITY', 100, 120);

  // Letter body mock text
  ctx1.fillStyle = '#334155';
  ctx1.font = '24px "Plus Jakarta Sans", sans-serif';
  ctx1.fillText('To,', 80, 230);
  ctx1.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
  ctx1.fillText('SAMPLE CITIZEN (Aazmi Test Customer)', 80, 270);
  ctx1.font = '22px "Plus Jakarta Sans", sans-serif';
  ctx1.fillText('House No. 124, Near Civil Lines Road, Azamgarh, UP - 276001', 80, 310);
  ctx1.fillText('Mobile: 98XXXXXX10  |  DOB: 15/08/1990  |  Gender: MALE', 80, 350);

  // Middle instruction section
  ctx1.fillStyle = '#f1f5f9';
  ctx1.fillRect(80, 420, canvas1.width - 160, 380);
  ctx1.strokeStyle = '#cbd5e1';
  ctx1.strokeRect(80, 420, canvas1.width - 160, 380);

  ctx1.fillStyle = '#1e293b';
  ctx1.font = 'bold 26px "Plus Jakarta Sans", sans-serif';
  ctx1.fillText('Your Aadhaar Number / आपका आधार क्रमांक :', 120, 480);
  ctx1.font = 'bold 38px "JetBrains Mono", monospace';
  ctx1.fillStyle = '#0369a1';
  ctx1.fillText('XXXX  XXXX  9012', 120, 540);

  ctx1.fillStyle = '#64748b';
  ctx1.font = '20px "Plus Jakarta Sans", sans-serif';
  ctx1.fillText('Instructions: Cut along the dotted line below for the wallet card.', 120, 620);
  ctx1.fillText('Aadhaar is a proof of identity, not of citizenship or date of birth.', 120, 660);

  // Dashed Cut Line across the page
  ctx1.setLineDash([15, 10]);
  ctx1.strokeStyle = '#94a3b8';
  ctx1.lineWidth = 3;
  ctx1.beginPath();
  ctx1.moveTo(60, 1480);
  ctx1.lineTo(canvas1.width - 60, 1480);
  ctx1.stroke();
  ctx1.setLineDash([]);

  // Scissors icon text
  ctx1.fillStyle = '#64748b';
  ctx1.font = 'bold 22px sans-serif';
  ctx1.fillText('✂ Cut Here for Card / कार्ड यहाँ से काटें', 100, 1460);

  // -------------------------------------------------------------
  // BOTTOM HALF: FRONT CARD (Left) & BACK CARD (Right)
  // Standard CR80 layout on lower section
  // -------------------------------------------------------------
  const cardW = 680;
  const cardH = 430;
  const cardY = 1540;

  // 1. FRONT CARD (Left)
  const frontX = 110;
  ctx1.fillStyle = '#ffffff';
  ctx1.fillRect(frontX, cardY, cardW, cardH);
  ctx1.strokeStyle = '#0284c7';
  ctx1.lineWidth = 4;
  ctx1.strokeRect(frontX, cardY, cardW, cardH);

  // Card Header Tricolor strip
  ctx1.fillStyle = '#f97316';
  ctx1.fillRect(frontX, cardY, cardW, 14);
  ctx1.fillStyle = '#16a34a';
  ctx1.fillRect(frontX, cardY + 14, cardW, 14);

  // Front Header text
  ctx1.fillStyle = '#0f172a';
  ctx1.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
  ctx1.fillText('भारत सरकार / GOVERNMENT OF INDIA', frontX + 24, cardY + 60);

  // Photo box
  ctx1.fillStyle = '#e2e8f0';
  ctx1.fillRect(frontX + 24, cardY + 90, 140, 175);
  ctx1.strokeStyle = '#94a3b8';
  ctx1.strokeRect(frontX + 24, cardY + 90, 140, 175);
  ctx1.fillStyle = '#475569';
  ctx1.font = '16px "Plus Jakarta Sans", sans-serif';
  ctx1.fillText('PHOTO', frontX + 65, cardY + 185);

  // Front citizen details
  ctx1.fillStyle = '#0f172a';
  ctx1.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
  ctx1.fillText('राहुल शर्मा / Rahul Sharma', frontX + 185, cardY + 120);
  ctx1.font = '19px "Plus Jakarta Sans", sans-serif';
  ctx1.fillText('जन्म तिथि / DOB: 15/08/1990', frontX + 185, cardY + 160);
  ctx1.fillText('पुरुष / MALE', frontX + 185, cardY + 195);
  ctx1.fillText('VID : 9182 3819 4012 3910', frontX + 185, cardY + 230);

  // Aadhaar Number large in red/black box
  ctx1.fillStyle = '#b91c1c';
  ctx1.fillRect(frontX + 24, cardY + 300, cardW - 48, 60);
  ctx1.fillStyle = '#ffffff';
  ctx1.font = 'bold 30px "JetBrains Mono", monospace';
  ctx1.fillText('1234  5678  9012', frontX + 180, cardY + 342);

  ctx1.fillStyle = '#0369a1';
  ctx1.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
  ctx1.fillText('मेरा आधार, मेरी पहचान', frontX + 220, cardY + 395);

  // 2. BACK CARD (Right)
  const backX = 860;
  ctx1.fillStyle = '#ffffff';
  ctx1.fillRect(backX, cardY, cardW, cardH);
  ctx1.strokeStyle = '#0284c7';
  ctx1.lineWidth = 4;
  ctx1.strokeRect(backX, cardY, cardW, cardH);

  // Back Header text
  ctx1.fillStyle = '#f97316';
  ctx1.fillRect(backX, cardY, cardW, 14);
  ctx1.fillStyle = '#16a34a';
  ctx1.fillRect(backX, cardY + 14, cardW, 14);

  ctx1.fillStyle = '#0f172a';
  ctx1.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
  ctx1.fillText('विशिष्ट पहचान प्राधिकरण / UIDAI', backX + 24, cardY + 60);

  // Address block
  ctx1.fillStyle = '#334155';
  ctx1.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
  ctx1.fillText('पता / Address:', backX + 24, cardY + 105);
  ctx1.font = '17px "Plus Jakarta Sans", sans-serif';
  ctx1.fillText('आत्मज: राम प्रकाश शर्मा, मकान नं. 124,', backX + 24, cardY + 135);
  ctx1.fillText('सिविल लाइन्स, आजमगढ़, उत्तर प्रदेश - 276001', backX + 24, cardY + 165);
  ctx1.fillText('S/O: Ram Prakash Sharma, H No. 124,', backX + 24, cardY + 205);
  ctx1.fillText('Civil Lines, Azamgarh, UP - 276001', backX + 24, cardY + 235);

  // Mock QR Code box on Back
  ctx1.fillStyle = '#0f172a';
  ctx1.fillRect(backX + cardW - 190, cardY + 95, 160, 160);
  ctx1.fillStyle = '#ffffff';
  ctx1.fillRect(backX + cardW - 180, cardY + 105, 140, 140);
  ctx1.fillStyle = '#0f172a';
  ctx1.fillRect(backX + cardW - 170, cardY + 115, 40, 40);
  ctx1.fillRect(backX + cardW - 80, cardY + 115, 30, 30);
  ctx1.fillRect(backX + cardW - 170, cardY + 195, 30, 30);
  ctx1.font = 'bold 12px monospace';
  ctx1.fillText('SECURE QR', backX + cardW - 148, cardY + 180);

  // Aadhaar Number on back
  ctx1.fillStyle = '#b91c1c';
  ctx1.fillRect(backX + 24, cardY + 300, cardW - 48, 60);
  ctx1.fillStyle = '#ffffff';
  ctx1.font = 'bold 30px "JetBrains Mono", monospace';
  ctx1.fillText('1234  5678  9012', backX + 180, cardY + 342);

  ctx1.fillStyle = '#64748b';
  ctx1.font = '16px "Plus Jakarta Sans", sans-serif';
  ctx1.fillText('Toll Free: 1947 | help@uidai.gov.in | www.uidai.gov.in', backX + 130, cardY + 395);

  // Create Page 2: Additional details page (for multi-page testing)
  const canvas2 = document.createElement('canvas');
  canvas2.width = 1654;
  canvas2.height = 2338;
  const ctx2 = canvas2.getContext('2d')!;
  ctx2.fillStyle = '#ffffff';
  ctx2.fillRect(0, 0, canvas2.width, canvas2.height);

  ctx2.fillStyle = '#1e3a8a';
  ctx2.font = 'bold 32px "Plus Jakarta Sans", sans-serif';
  ctx2.fillText('Aadhaar Authentication & Usage Terms (Page 2)', 100, 150);
  ctx2.fillStyle = '#475569';
  ctx2.font = '22px "Plus Jakarta Sans", sans-serif';
  ctx2.fillText('1. Use of Aadhaar is governed by Aadhaar Act, 2016.', 100, 240);
  ctx2.fillText('2. Always mask first 8 digits when sharing physical photocopies if required.', 100, 300);
  ctx2.fillText('3. Processed digitally at Aazmi Service Center with complete privacy protection.', 100, 360);

  // Build Pages Array
  const pages: DocumentPage[] = [
    {
      pageNumber: 1,
      dataUrl: canvas1.toDataURL('image/png'),
      width: canvas1.width,
      height: canvas1.height,
      aspectRatio: canvas1.width / canvas1.height,
      rotation: 0,
    },
    {
      pageNumber: 2,
      dataUrl: canvas2.toDataURL('image/png'),
      width: canvas2.width,
      height: canvas2.height,
      aspectRatio: canvas2.width / canvas2.height,
      rotation: 0,
    },
  ];

  // Normalized crop region for front card on Page 1
  const frontCrop = {
    x: frontX / canvas1.width,
    y: cardY / canvas1.height,
    width: cardW / canvas1.width,
    height: cardH / canvas1.height,
  };

  // Normalized crop region for back card on Page 1
  const backCrop = {
    x: backX / canvas1.width,
    y: cardY / canvas1.height,
    width: cardW / canvas1.width,
    height: cardH / canvas1.height,
  };

  return {
    id: `doc_${Date.now()}`,
    fileName: 'Sample_eAadhaar_Document.pdf',
    fileSize: 1420500, // ~1.4 MB
    fileType: 'pdf',
    pageCount: 2,
    isPasswordProtected: false,
    pages,
    activeSide: 'front',
    hasBackSide: true,
    selectedTemplateId: 'aadhaar-pvc',
    targetWidthMm: 86.0,
    targetHeightMm: 54.0,
    unit: 'mm',
    targetDpi: 1800,
    front: {
      pageIndex: 0,
      cropBox: frontCrop,
      rotation: 0,
      adjustments: {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        sharpen: 'none',
        grayscale: false,
      },
      aspectRatioMode: 'cr80',
      customRatioWidth: 86,
      customRatioHeight: 54,
      croppedCanvasUrl: null,
      sourceResolution: { width: cardW, height: cardH },
      outputResolution: { width: 2031, height: 1276 },
      effectiveDpi: 600,
    },
    back: {
      pageIndex: 0,
      cropBox: backCrop,
      rotation: 0,
      adjustments: {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        sharpen: 'none',
        grayscale: false,
      },
      aspectRatioMode: 'cr80',
      customRatioWidth: 86,
      customRatioHeight: 54,
      croppedCanvasUrl: null,
      sourceResolution: { width: cardW, height: cardH },
      outputResolution: { width: 2031, height: 1276 },
      effectiveDpi: 600,
    },
  };
}

/**
 * Generates sample e-PAN Card document
 */
export function generateSamplePanDocument(): UploadedDocument {
  const canvas = document.createElement('canvas');
  canvas.width = 1654;
  canvas.height = 2338;
  const ctx = canvas.getContext('2d')!;

  // White A4 sheet
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Income Tax Header
  ctx.fillStyle = '#047857';
  ctx.fillRect(60, 60, canvas.width - 120, 80);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('INCOME TAX DEPARTMENT / आयकर विभाग', 100, 112);

  // Pan Card Box at middle/lower section
  const cardW = 860;
  const cardH = 540;
  const cardX = (canvas.width - cardW) / 2;
  const cardY = 1350;

  // Background of card (subtle blue-gray tint)
  ctx.fillStyle = '#e0f2fe';
  ctx.fillRect(cardX, cardY, cardW, cardH);
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 3;
  ctx.strokeRect(cardX, cardY, cardW, cardH);

  // Card header
  ctx.fillStyle = '#0369a1';
  ctx.fillRect(cardX, cardY, cardW, 60);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('आयकर विभाग / INCOME TAX DEPARTMENT', cardX + 30, cardY + 38);
  ctx.fillText('भारत सरकार / GOVT. OF INDIA', cardX + cardW - 320, cardY + 38);

  // Photo
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(cardX + 40, cardY + 90, 160, 200);
  ctx.strokeStyle = '#94a3b8';
  ctx.strokeRect(cardX + 40, cardY + 90, 160, 200);
  ctx.fillStyle = '#334155';
  ctx.font = '18px sans-serif';
  ctx.fillText('PHOTO', cardX + 90, cardY + 200);

  // Signature box
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(cardX + 40, cardY + 320, 220, 70);
  ctx.strokeRect(cardX + 40, cardY + 320, 220, 70);
  ctx.fillStyle = '#1e293b';
  ctx.font = 'italic 20px cursive';
  ctx.fillText('Anas Chaudharry', cardX + 60, cardY + 365);

  // Details
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('नाम / Name:', cardX + 240, cardY + 115);
  ctx.font = '24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('ANAS CHAUDHARRY', cardX + 240, cardY + 145);

  ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('पिता का नाम / Father\'s Name:', cardX + 240, cardY + 195);
  ctx.font = '24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('MOHD AAZMI CHAUDHARRY', cardX + 240, cardY + 225);

  ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('जन्म की तारीख / Date of Birth:', cardX + 240, cardY + 275);
  ctx.font = '24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('12/10/1996', cardX + 240, cardY + 305);

  // Permanent Account Number Box
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(cardX + 240, cardY + 350, 420, 60);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 34px "JetBrains Mono", monospace';
  ctx.fillText('ABCDE1234F', cardX + 260, cardY + 394);

  // QR area on card
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(cardX + cardW - 170, cardY + 100, 140, 140);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(cardX + cardW - 160, cardY + 110, 120, 120);

  const page: DocumentPage = {
    pageNumber: 1,
    dataUrl: canvas.toDataURL('image/png'),
    width: canvas.width,
    height: canvas.height,
    aspectRatio: canvas.width / canvas.height,
    rotation: 0,
  };

  const crop = {
    x: cardX / canvas.width,
    y: cardY / canvas.height,
    width: cardW / canvas.width,
    height: cardH / canvas.height,
  };

  return {
    id: `doc_${Date.now()}`,
    fileName: 'Sample_ePAN_Card.pdf',
    fileSize: 980200,
    fileType: 'pdf',
    pageCount: 1,
    isPasswordProtected: false,
    pages: [page],
    activeSide: 'front',
    hasBackSide: false,
    selectedTemplateId: 'pan-card',
    targetWidthMm: 86.0,
    targetHeightMm: 54.0,
    unit: 'mm',
    targetDpi: 1800,
    front: {
      pageIndex: 0,
      cropBox: crop,
      rotation: 0,
      adjustments: {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        sharpen: 'none',
        grayscale: false,
      },
      aspectRatioMode: 'cr80',
      customRatioWidth: 86,
      customRatioHeight: 54,
      croppedCanvasUrl: null,
      sourceResolution: { width: cardW, height: cardH },
      outputResolution: { width: 2031, height: 1276 },
      effectiveDpi: 600,
    },
    back: null,
  };
}

export const generateSampleAadhaarDoc = generateSampleAadhaarDocument;
export const generateSamplePanDoc = generateSamplePanDocument;

