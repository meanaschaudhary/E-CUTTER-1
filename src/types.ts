export type CardCategory = 'identity' | 'healthcare' | 'transport' | 'welfare' | 'employment' | 'custom';

export type WorkflowStep = 'upload' | 'pages' | 'crop' | 'print' | 'export';

export type AspectRatioMode = 'free' | 'cr80' | 'original' | 'custom';

export type DimensionUnit = 'mm' | 'cm' | 'inch' | 'px';

export type SharpenLevel = 'none' | 'light' | 'medium' | 'high';

export type PaperSize = 'A4' | 'A5' | 'Letter' | 'Custom';

export type PageOrientation = 'portrait' | 'landscape';

export type CutGuideStyle = 'solid' | 'dashed' | 'crosshair' | 'none';

export type DuplexMode = 'both-on-sheet' | 'front-only' | 'back-only' | 'two-sided-pages';

export interface CardTemplate {
  id: string;
  name: string;
  category?: CardCategory;
  widthMm: number;
  heightMm: number;
  description?: string;
  isCR80?: boolean;
  aspectRatio?: number;
  recommendedDpi?: number;
  isCustom?: boolean;
  badgeText?: string;
}

export interface CropBox {
  x: number; // percentage 0 to 1
  y: number; // percentage 0 to 1
  width: number; // percentage 0 to 1
  height: number; // percentage 0 to 1
}

export interface ImageAdjustments {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  sharpen: SharpenLevel;
  grayscale: boolean;
}

export interface CardSideState {
  pageIndex: number;
  cropBox: CropBox;
  rotation: number; // 0, 90, 180, 270
  adjustments: ImageAdjustments;
  aspectRatioMode?: AspectRatioMode;
  customRatioWidth?: number;
  customRatioHeight?: number;
  croppedCanvasUrl?: string | null;
  sourceResolution?: { width: number; height: number };
  outputResolution?: { width: number; height: number };
  effectiveDpi?: number;
}

export interface DocumentPage {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
  aspectRatio: number;
  rotation: number;
}

export interface UploadedDocument {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: 'pdf' | 'image';
  pageCount: number;
  isPasswordProtected: boolean;
  pages: DocumentPage[];
  activeSide: 'front' | 'back';
  hasBackSide: boolean;
  selectedTemplateId: string;
  targetWidthMm: number;
  targetHeightMm: number;
  unit: DimensionUnit;
  targetDpi: number;
  front: CardSideState;
  back: CardSideState | null;
}

export interface PrintSettings {
  paperSize: PaperSize;
  customPaperWidthMm: number;
  customPaperHeightMm: number;
  orientation: PageOrientation;
  copies: number;
  duplexMode: DuplexMode;
  marginsMm: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  spacingMm: {
    horizontal: number;
    vertical: number;
  };
  alignment: 'center' | 'top-left' | 'custom';
  printScale: 'actual' | 'fit' | 'custom';
  customScalePercent: number;
  showCutGuides: boolean;
  cutGuideStyle: CutGuideStyle;
  showCardBorder: boolean;
  borderColor: string;
  printFrontAndBackPairs: boolean;
}

export const OFFICIAL_TEMPLATES: CardTemplate[] = [
  {
    id: 'aadhaar-pvc',
    name: 'Aadhaar PVC Card',
    category: 'identity',
    widthMm: 86.0,
    heightMm: 54.0,
    isCR80: true,
    recommendedDpi: 600,
    description: 'Standard UIDAI CR80 Plastic Card (86 × 54 mm)',
    badgeText: 'Official CR80',
  },
  {
    id: 'pan-card',
    name: 'PAN Card',
    category: 'identity',
    widthMm: 86.0,
    heightMm: 54.0,
    isCR80: true,
    recommendedDpi: 600,
    description: 'Income Tax Department NSDL / UTIITSL Card (86 × 54 mm)',
    badgeText: 'Standard ID',
  },
  {
    id: 'ayushman-pmjay',
    name: 'Ayushman Bharat / PM-JAY',
    category: 'healthcare',
    widthMm: 86.0,
    heightMm: 54.0,
    isCR80: true,
    recommendedDpi: 600,
    description: 'National Health Authority Golden Card (86 × 54 mm)',
    badgeText: 'Health Scheme',
  },
  {
    id: 'abha-card',
    name: 'ABHA Health Card',
    category: 'healthcare',
    widthMm: 86.0,
    heightMm: 54.0,
    isCR80: true,
    recommendedDpi: 600,
    description: 'Ayushman Bharat Digital Health Account ID Card',
    badgeText: 'Digital Health',
  },
  {
    id: 'voter-id',
    name: 'Voter ID / EPIC Card',
    category: 'identity',
    widthMm: 86.0,
    heightMm: 54.0,
    isCR80: true,
    recommendedDpi: 600,
    description: 'Election Commission of India e-EPIC format (86 × 54 mm)',
    badgeText: 'ECI Format',
  },
  {
    id: 'driving-licence',
    name: 'Driving Licence (DL)',
    category: 'transport',
    widthMm: 86.0,
    heightMm: 54.0,
    isCR80: true,
    recommendedDpi: 600,
    description: 'Ministry of Road Transport & Highways Smart Card',
    badgeText: 'Sarathi Format',
  },
  {
    id: 'aadhaar-letter',
    name: 'Aadhaar Letter (Full Crop)',
    category: 'identity',
    widthMm: 100.0,
    heightMm: 140.0,
    isCR80: false,
    recommendedDpi: 300,
    description: 'Full laminated letter cutout format with address',
    badgeText: 'Extended Slip',
  },
  {
    id: 'ration-card',
    name: 'Ration Card / Food Security',
    category: 'welfare',
    widthMm: 95.0,
    heightMm: 65.0,
    isCR80: false,
    recommendedDpi: 300,
    description: 'NFSA / State Food & Civil Supplies Card format',
    badgeText: 'State Format',
  },
  {
    id: 'govt-employee-id',
    name: 'Government Employee ID',
    category: 'employment',
    widthMm: 86.0,
    heightMm: 54.0,
    isCR80: true,
    recommendedDpi: 600,
    description: 'Standard Horizontal / Vertical Departmental ID',
    badgeText: 'Service ID',
  },
  {
    id: 'other-gov-card',
    name: 'Other Government Card',
    category: 'custom',
    widthMm: 86.0,
    heightMm: 54.0,
    isCR80: true,
    recommendedDpi: 600,
    description: 'Flexible template with customizable dimensions',
    badgeText: 'Customizable',
  },
  {
    id: 'custom-card',
    name: 'Custom Size Card',
    category: 'custom',
    widthMm: 86.0,
    heightMm: 54.0,
    isCR80: false,
    recommendedDpi: 600,
    description: 'User-defined width and height dimensions',
    badgeText: 'User Defined',
  },
];

export const PAPER_DIMENSIONS_MM: Record<PaperSize, { width: number; height: number }> = {
  A4: { width: 210, height: 297 },
  A5: { width: 148, height: 210 },
  Letter: { width: 215.9, height: 279.4 },
  Custom: { width: 210, height: 297 },
};

export const DPI_PRESETS = [
  { value: 300, label: '300 DPI (Standard Print)', note: 'Fast processing, ideal for standard inkjet/laser' },
  { value: 600, label: '600 DPI (High Resolution)', note: 'Recommended for crisp Aadhaar QR & small text' },
  { value: 1200, label: '1200 DPI (Ultra Fine Detail)', note: 'Maximum precision for photographic PVC badge printers' },
  { value: 1800, label: '1800 DPI (Maximum Density)', note: 'Extreme density; calculates high pixel buffer' },
];

export const DEFAULT_PRINT_SETTINGS: PrintSettings = {
  paperSize: 'A4',
  customPaperWidthMm: 210,
  customPaperHeightMm: 297,
  orientation: 'portrait',
  copies: 1,
  duplexMode: 'both-on-sheet',
  marginsMm: {
    top: 10,
    bottom: 10,
    left: 10,
    right: 10,
  },
  spacingMm: {
    horizontal: 6,
    vertical: 6,
  },
  alignment: 'center',
  printScale: 'actual',
  customScalePercent: 100,
  showCutGuides: true,
  cutGuideStyle: 'crosshair',
  showCardBorder: true,
  borderColor: '#cbd5e1',
  printFrontAndBackPairs: true,
};

