import React from 'react';
import {
  Printer,
  FileSpreadsheet,
  Layers,
  Scissors,
  AlertTriangle,
  Info,
  Check,
  ChevronDown,
  RotateCw,
} from 'lucide-react';
import {
  PaperSize,
  PageOrientation,
  PrintSettings,
  PAPER_DIMENSIONS_MM,
  DuplexMode,
  CutGuideStyle,
  UploadedDocument,
} from '../types';

interface PrintSheetViewProps {
  document: UploadedDocument;
  printSettings: PrintSettings;
  frontCardUrl: string | null;
  backCardUrl: string | null;
  onUpdateSettings: (settings: Partial<PrintSettings>) => void;
  onPrintNow: () => void;
}

export const PrintSheetView: React.FC<PrintSheetViewProps> = ({
  document: doc,
  printSettings,
  frontCardUrl,
  backCardUrl,
  onUpdateSettings,
  onPrintNow,
}) => {
  const cardW = doc.targetWidthMm || 86;
  const cardH = doc.targetHeightMm || 54;

  const baseDimensions = PAPER_DIMENSIONS_MM[printSettings.paperSize] || {
    width: 210,
    height: 297,
  };

  const pageWidthMm =
    printSettings.orientation === 'portrait'
      ? baseDimensions.width
      : baseDimensions.height;
  const pageHeightMm =
    printSettings.orientation === 'portrait'
      ? baseDimensions.height
      : baseDimensions.width;

  const usableWidthMm =
    pageWidthMm - printSettings.marginsMm.left - printSettings.marginsMm.right;
  const usableHeightMm =
    pageHeightMm - printSettings.marginsMm.top - printSettings.marginsMm.bottom;

  // Calculate items to lay out on sheet
  const cardItems: Array<{ type: 'front' | 'back'; url: string; id: string }> = [];
  for (let c = 0; c < printSettings.copies; c++) {
    if (frontCardUrl && printSettings.duplexMode !== 'back-only') {
      cardItems.push({
        type: 'front',
        url: frontCardUrl,
        id: `front-${c}`,
      });
    }
    if (backCardUrl && printSettings.duplexMode !== 'front-only') {
      cardItems.push({
        type: 'back',
        url: backCardUrl,
        id: `back-${c}`,
      });
    }
  }

  // Calculate maximum fit per page
  const colsFit = Math.max(
    1,
    Math.floor((usableWidthMm + printSettings.spacingMm.horizontal) / (cardW + printSettings.spacingMm.horizontal))
  );
  const rowsFit = Math.max(
    1,
    Math.floor((usableHeightMm + printSettings.spacingMm.vertical) / (cardH + printSettings.spacingMm.vertical))
  );
  const maxCardsPerPage = colsFit * rowsFit;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Print Configuration Panel */}
      <div className="lg:col-span-5 space-y-4">
        {/* Main Print Banner */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Print Layout &amp; Sheet Generator
                </h3>
                <p className="text-xs text-gray-500">
                  Configure precision A4/A5 alignment for physical card printing
                </p>
              </div>
            </div>
          </div>

          <button
            id="btn-trigger-print"
            onClick={onPrintNow}
            className="w-full py-3 px-4 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-bold text-sm rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Now (100% Actual Scale)</span>
          </button>
        </div>

        {/* Paper & Orientation */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs space-y-3.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Paper Settings
          </h4>

          <div className="grid grid-cols-2 gap-3">
            {/* Paper Size */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                Paper Size
              </label>
              <select
                id="select-paper-size"
                value={printSettings.paperSize}
                onChange={(e) =>
                  onUpdateSettings({ paperSize: e.target.value as PaperSize })
                }
                className="w-full p-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-700 cursor-pointer"
              >
                <option value="A4">A4 (210 × 297 mm)</option>
                <option value="A5">A5 (148 × 210 mm)</option>
                <option value="Letter">Letter (8.5 × 11 in)</option>
                <option value="Custom">Custom Size</option>
              </select>
            </div>

            {/* Orientation */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                Orientation
              </label>
              <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 rounded-xl text-xs">
                {(['portrait', 'landscape'] as PageOrientation[]).map((ori) => (
                  <button
                    key={ori}
                    type="button"
                    onClick={() => onUpdateSettings({ orientation: ori })}
                    className={`py-1.5 font-bold rounded-lg capitalize transition-all ${
                      printSettings.orientation === ori
                        ? 'bg-white text-blue-700 shadow-xs ring-1 ring-gray-200'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {ori}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Copies Multiplier & Duplex Mode */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                Number of Copies
              </label>
              <input
                id="input-print-copies"
                type="number"
                min="1"
                max="20"
                value={printSettings.copies}
                onChange={(e) =>
                  onUpdateSettings({
                    copies: Math.max(1, parseInt(e.target.value, 10) || 1),
                  })
                }
                className="w-full p-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                Duplex / Sides
              </label>
              <select
                id="select-duplex-mode"
                value={printSettings.duplexMode}
                onChange={(e) =>
                  onUpdateSettings({ duplexMode: e.target.value as DuplexMode })
                }
                className="w-full p-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-700 cursor-pointer"
              >
                <option value="both-on-sheet">Front &amp; Back (Pair)</option>
                <option value="front-only">Front Side Only</option>
                <option value="back-only">Back Side Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Margins, Spacing & Alignment */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs space-y-3.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Margins &amp; Spacing (mm)
          </h4>

          {/* 4 Margins */}
          <div className="grid grid-cols-4 gap-2">
            <div>
              <span className="text-[10px] font-medium text-gray-400 block mb-0.5">
                Top
              </span>
              <input
                type="number"
                min="0"
                max="50"
                value={printSettings.marginsMm.top}
                onChange={(e) =>
                  onUpdateSettings({
                    marginsMm: {
                      ...printSettings.marginsMm,
                      top: parseFloat(e.target.value) || 0,
                    },
                  })
                }
                className="w-full p-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono text-center"
              />
            </div>
            <div>
              <span className="text-[10px] font-medium text-gray-400 block mb-0.5">
                Bottom
              </span>
              <input
                type="number"
                min="0"
                max="50"
                value={printSettings.marginsMm.bottom}
                onChange={(e) =>
                  onUpdateSettings({
                    marginsMm: {
                      ...printSettings.marginsMm,
                      bottom: parseFloat(e.target.value) || 0,
                    },
                  })
                }
                className="w-full p-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono text-center"
              />
            </div>
            <div>
              <span className="text-[10px] font-medium text-gray-400 block mb-0.5">
                Left
              </span>
              <input
                type="number"
                min="0"
                max="50"
                value={printSettings.marginsMm.left}
                onChange={(e) =>
                  onUpdateSettings({
                    marginsMm: {
                      ...printSettings.marginsMm,
                      left: parseFloat(e.target.value) || 0,
                    },
                  })
                }
                className="w-full p-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono text-center"
              />
            </div>
            <div>
              <span className="text-[10px] font-medium text-gray-400 block mb-0.5">
                Right
              </span>
              <input
                type="number"
                min="0"
                max="50"
                value={printSettings.marginsMm.right}
                onChange={(e) =>
                  onUpdateSettings({
                    marginsMm: {
                      ...printSettings.marginsMm,
                      right: parseFloat(e.target.value) || 0,
                    },
                  })
                }
                className="w-full p-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs font-mono text-center"
              />
            </div>
          </div>

          {/* Horizontal & Vertical Spacing */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                Horizontal Gap (mm)
              </label>
              <input
                type="number"
                min="0"
                max="40"
                value={printSettings.spacingMm.horizontal}
                onChange={(e) =>
                  onUpdateSettings({
                    spacingMm: {
                      ...printSettings.spacingMm,
                      horizontal: parseFloat(e.target.value) || 0,
                    },
                  })
                }
                className="w-full p-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                Vertical Gap (mm)
              </label>
              <input
                type="number"
                min="0"
                max="40"
                value={printSettings.spacingMm.vertical}
                onChange={(e) =>
                  onUpdateSettings({
                    spacingMm: {
                      ...printSettings.spacingMm,
                      vertical: parseFloat(e.target.value) || 0,
                    },
                  })
                }
                className="w-full p-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Guides & Scale Rules */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Print Alignment &amp; Guides
          </h4>

          {/* Scale Setting */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">
              Print Scale
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onUpdateSettings({ printScale: 'actual' })}
                className={`p-2.5 rounded-xl text-xs font-bold border text-left transition-all ${
                  printSettings.printScale === 'actual'
                    ? 'bg-blue-50/80 border-blue-600 text-blue-900 ring-1 ring-blue-600/20'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>Actual Size (100%)</span>
                <p className="text-[10px] font-normal text-gray-500 mt-0.5">
                  Exact {cardW} × {cardH} mm
                </p>
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ printScale: 'fit' })}
                className={`p-2.5 rounded-xl text-xs font-bold border text-left transition-all ${
                  printSettings.printScale === 'fit'
                    ? 'bg-amber-50 border-amber-500 text-amber-900 ring-1 ring-amber-500/20'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>Fit to Page</span>
                <p className="text-[10px] font-normal text-amber-700 mt-0.5">
                  May alter card dimensions
                </p>
              </button>
            </div>
          </div>

          {printSettings.printScale === 'fit' && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-[11px] text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Warning:</strong> "Fit to Page" alters physical card dimensions. For CR80 PVC card laminate or wallet insertion, use <strong>Actual Size / 100%</strong>.
              </span>
            </div>
          )}

          {/* Cut Guides & Border toggles */}
          <div className="pt-2 border-t border-gray-100 space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={printSettings.showCutGuides}
                onChange={(e) =>
                  onUpdateSettings({ showCutGuides: e.target.checked })
                }
                className="w-4 h-4 text-blue-700 rounded border-gray-300 focus:ring-blue-600"
              />
              <span className="flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-gray-500" />
                <span>Show Corner Cutting Guides</span>
              </span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={printSettings.showCardBorder}
                onChange={(e) =>
                  onUpdateSettings({ showCardBorder: e.target.checked })
                }
                className="w-4 h-4 text-blue-700 rounded border-gray-300 focus:ring-blue-600"
              />
              <span>Show Thin 0.2mm Outer Card Border</span>
            </label>
          </div>
        </div>

        {/* Printer instruction badge */}
        <div className="p-3.5 bg-navy-950 text-white rounded-xl text-xs space-y-1 border border-navy-900">
          <p className="font-bold text-sky-400">
            🖨️ Service Center Printing Tip:
          </p>
          <p className="text-gray-300 text-[11px] leading-relaxed">
            In your browser's print dialog, ensure <strong>Destination Printer</strong> is selected, <strong>Paper size</strong> is set to <strong>{printSettings.paperSize}</strong>, and <strong>Scale</strong> is set to <strong>100% / Actual Size</strong> (do NOT check "Fit to printable area").
          </p>
        </div>
      </div>

      {/* Right Column: Interactive Sheet Visualizer Preview */}
      <div className="lg:col-span-7">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-md flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-4 text-gray-300 text-xs">
            <span className="font-bold">
              {printSettings.paperSize} Sheet Layout Preview ({pageWidthMm} × {pageHeightMm} mm)
            </span>
            <span className="font-mono bg-gray-800 px-2 py-0.5 rounded text-gray-200 border border-gray-700">
              {cardItems.length} Cards ({colsFit}×{rowsFit} Max/Page)
            </span>
          </div>

          {/* Interactive Sheet Container */}
          <div
            className="bg-white rounded shadow-2xl overflow-hidden relative border border-gray-300"
            style={{
              width: '100%',
              maxWidth: printSettings.orientation === 'portrait' ? '460px' : '580px',
              aspectRatio: `${pageWidthMm} / ${pageHeightMm}`,
              padding: `${(printSettings.marginsMm.top / pageHeightMm) * 100}% ${(printSettings.marginsMm.right / pageWidthMm) * 100}% ${(printSettings.marginsMm.bottom / pageHeightMm) * 100}% ${(printSettings.marginsMm.left / pageWidthMm) * 100}%`,
            }}
          >
            {/* Sheet Margin Guide Border */}
            <div
              className="w-full h-full flex flex-wrap content-start"
              style={{
                gap: `${(printSettings.spacingMm.vertical / pageHeightMm) * 100}% ${(printSettings.spacingMm.horizontal / pageWidthMm) * 100}%`,
              }}
            >
              {cardItems.map((item, idx) => (
                <div
                  key={item.id}
                  className={`relative overflow-hidden ${
                    printSettings.showCardBorder ? 'border border-gray-300' : ''
                  }`}
                  style={{
                    width: `${(cardW / usableWidthMm) * (usableWidthMm / pageWidthMm) * 100}%`,
                    aspectRatio: `${cardW} / ${cardH}`,
                  }}
                >
                  <img
                    src={item.url}
                    alt={`${item.type} side ${idx + 1}`}
                    className="w-full h-full object-cover block"
                  />

                  {/* Corner Cut Guides overlay on Sheet Visualizer */}
                  {printSettings.showCutGuides && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-gray-400" />
                      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-gray-400" />
                      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-gray-400" />
                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-gray-400" />
                    </div>
                  )}

                  {/* Label badge */}
                  <span className="absolute bottom-1 right-1 bg-gray-900/80 text-white text-[8px] font-bold px-1 rounded uppercase">
                    {item.type} #{Math.floor(idx / 2) + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-4 text-[11px] text-gray-400 text-center">
            Exact millimeter layout matches standard CR80 thermal &amp; inkjet PVC badge printing.
          </p>
        </div>
      </div>
    </div>
  );
};
