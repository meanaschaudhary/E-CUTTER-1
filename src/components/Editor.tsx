import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Layers,
  RotateCw,
  Printer,
  ChevronRight,
  FileCheck,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import {
  AspectRatioMode,
  CardTemplate,
  CropBox,
  DimensionUnit,
  ImageAdjustments,
  UploadedDocument,
} from '../types';
import { FrontBackTabs } from './FrontBackTabs';
import { CropCanvas } from './CropCanvas';
import { CardTemplateSelector } from './CardTemplateSelector';
import { AdjustmentsPanel } from './AdjustmentsPanel';
import { ResolutionPanel } from './ResolutionPanel';
import { AazmiLogo } from './AazmiLogo';
import { detectCardBoundsInImage } from '../utils/imageEngine';

interface EditorProps {
  document: UploadedDocument;
  onUpdateDocument: (doc: UploadedDocument) => void;
  onAutoProcess: () => void;
  onProceedToPrint: () => void;
  onBackToPages: () => void;
  onAddToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

export const Editor: React.FC<EditorProps> = ({
  document: doc,
  onUpdateDocument,
  onAutoProcess,
  onProceedToPrint,
  onBackToPages,
  onAddToast,
}) => {
  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [showBoundaryGuide, setShowBoundaryGuide] = useState<boolean>(true);

  // Undo / Redo history stack for crop adjustments
  const [history, setHistory] = useState<
    Array<{ frontCrop: CropBox; backCrop?: CropBox }>
  >([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Load custom presets from localStorage
  const [customTemplates, setCustomTemplates] = useState<CardTemplate[]>(() => {
    try {
      const saved = localStorage.getItem('aazmi_custom_card_templates');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const currentSideState = activeSide === 'front' ? doc.front : doc.back || doc.front;
  const currentPageIndex = currentSideState.pageIndex;
  const currentPage = doc.pages[currentPageIndex] || doc.pages[0];

  // Helper to record history step
  const pushHistory = (newDoc: UploadedDocument) => {
    const step = {
      frontCrop: { ...newDoc.front.cropBox },
      backCrop: newDoc.back ? { ...newDoc.back.cropBox } : undefined,
    };
    const newHist = history.slice(0, historyIndex + 1);
    newHist.push(step);
    if (newHist.length > 20) newHist.shift();
    setHistory(newHist);
    setHistoryIndex(newHist.length - 1);
  };

  // Crop change handler
  const handleCropChange = (newCrop: CropBox) => {
    if (activeSide === 'front') {
      const updated: UploadedDocument = {
        ...doc,
        front: { ...doc.front, cropBox: newCrop },
      };
      onUpdateDocument(updated);
      pushHistory(updated);
    } else if (doc.back) {
      const updated: UploadedDocument = {
        ...doc,
        back: { ...doc.back, cropBox: newCrop },
      };
      onUpdateDocument(updated);
      pushHistory(updated);
    }
  };

  // Rotate handler
  const handleRotateCurrentSide = () => {
    const currentRot = currentSideState.rotation || 0;
    const newRot = (currentRot + 90) % 360;

    if (activeSide === 'front') {
      onUpdateDocument({
        ...doc,
        front: { ...doc.front, rotation: newRot },
      });
    } else if (doc.back) {
      onUpdateDocument({
        ...doc,
        back: { ...doc.back, rotation: newRot },
      });
    }
    onAddToast(`Rotated ${activeSide.toUpperCase()} side 90°`, 'info');
  };

  // Auto Detect Card Bounds
  const handleAutoDetectCurrentSide = async () => {
    try {
      const detected = await detectCardBoundsInImage(
        currentPage.dataUrl,
        activeSide,
        doc.targetWidthMm / (doc.targetHeightMm || 1)
      );
      handleCropChange(detected);
      onAddToast(`Auto-detected ${activeSide.toUpperCase()} card boundaries`, 'success');
    } catch (err) {
      console.error(err);
      onAddToast('Could not automatically find card edges. Adjust manually.', 'info');
    }
  };

  // Reset crop
  const handleResetCrop = () => {
    const defaultCrop: CropBox = {
      x: 0.15,
      y: 0.25,
      width: 0.7,
      height: 0.5,
    };
    handleCropChange(defaultCrop);
    onAddToast('Crop box reset to center', 'info');
  };

  // Undo / Redo handlers
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevStep = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      onUpdateDocument({
        ...doc,
        front: { ...doc.front, cropBox: prevStep.frontCrop },
        back: doc.back && prevStep.backCrop ? { ...doc.back, cropBox: prevStep.backCrop } : doc.back,
      });
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextStep = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      onUpdateDocument({
        ...doc,
        front: { ...doc.front, cropBox: nextStep.frontCrop },
        back: doc.back && nextStep.backCrop ? { ...doc.back, cropBox: nextStep.backCrop } : doc.back,
      });
    }
  };

  // Template change
  const handleSelectTemplate = (template: CardTemplate) => {
    onUpdateDocument({
      ...doc,
      selectedTemplateId: template.id,
      targetWidthMm: template.widthMm,
      targetHeightMm: template.heightMm,
      aspectRatioMode: template.id === 'custom' ? 'custom' : 'cr80',
    });
    onAddToast(`Template selected: ${template.name}`, 'info');
  };

  // Aspect ratio change
  const handleChangeAspectRatioMode = (mode: AspectRatioMode) => {
    onUpdateDocument({
      ...doc,
      aspectRatioMode: mode,
    });
  };

  // Dimensions change
  const handleChangeDimensions = (
    widthMm: number,
    heightMm: number,
    unit: DimensionUnit
  ) => {
    onUpdateDocument({
      ...doc,
      targetWidthMm: widthMm,
      targetHeightMm: heightMm,
      unit,
      selectedTemplateId: 'custom',
    });
  };

  // Save custom template
  const handleSaveCustomTemplate = (name: string, widthMm: number, heightMm: number) => {
    const newTmpl: CardTemplate = {
      id: `custom-${Date.now()}`,
      name,
      widthMm,
      heightMm,
      aspectRatio: widthMm / heightMm,
      isCustom: true,
    };
    const updated = [...customTemplates, newTmpl];
    setCustomTemplates(updated);
    try {
      localStorage.setItem('aazmi_custom_card_templates', JSON.stringify(updated));
    } catch {}
    handleSelectTemplate(newTmpl);
    onAddToast(`Custom preset "${name}" saved!`, 'success');
  };

  // Delete custom template
  const handleDeleteCustomTemplate = (id: string) => {
    const updated = customTemplates.filter((t) => t.id !== id);
    setCustomTemplates(updated);
    try {
      localStorage.setItem('aazmi_custom_card_templates', JSON.stringify(updated));
    } catch {}
    onAddToast('Custom preset removed', 'info');
  };

  // Adjustments change
  const handleAdjustmentsChange = (adjustments: ImageAdjustments) => {
    if (activeSide === 'front') {
      onUpdateDocument({
        ...doc,
        front: { ...doc.front, adjustments },
      });
    } else if (doc.back) {
      onUpdateDocument({
        ...doc,
        back: { ...doc.back, adjustments },
      });
    }
  };

  // Reset adjustments
  const handleResetAdjustments = () => {
    handleAdjustmentsChange({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      sharpen: 'none',
      grayscale: false,
    });
    onAddToast('Image adjustments reset to original', 'info');
  };

  // DPI change
  const handleSelectDpi = (dpi: number) => {
    onUpdateDocument({
      ...doc,
      targetDpi: dpi,
    });
    onAddToast(`Target density updated to ${dpi} DPI`, 'info');
  };

  // Toggle Has Back Side
  const handleToggleHasBackSide = (hasBack: boolean) => {
    if (hasBack) {
      // Create back side default from page 2 if exists, or page 1
      const backPageIndex = doc.pageCount > 1 ? 1 : 0;
      const isAadhaarLike = doc.selectedTemplateId.includes('aadhaar');

      onUpdateDocument({
        ...doc,
        hasBackSide: true,
        back: {
          pageIndex: backPageIndex,
          cropBox: isAadhaarLike && backPageIndex === 0
            ? { x: 0.52, y: 0.60, width: 0.42, height: 0.33 }
            : { x: 0.08, y: 0.15, width: 0.84, height: 0.70 },
          rotation: 0,
          adjustments: {
            brightness: 0,
            contrast: 0,
            saturation: 0,
            sharpen: 'none',
            grayscale: false,
          },
          aspectRatioMode: doc.front.aspectRatioMode,
          customRatioWidth: doc.targetWidthMm,
          customRatioHeight: doc.targetHeightMm,
        },
      });
      setActiveSide('back');
      onAddToast('Back side enabled. Position crop box for reverse side of card.', 'info');
    } else {
      onUpdateDocument({
        ...doc,
        hasBackSide: false,
      });
      setActiveSide('front');
      onAddToast('Back side disabled. Printing front side only.', 'info');
    }
  };

  // Select page index for a specific side (front or back)
  const handleSelectPageIndexForSide = (side: 'front' | 'back', pageIndex: number) => {
    if (side === 'front') {
      onUpdateDocument({
        ...doc,
        front: { ...doc.front, pageIndex },
      });
      onAddToast(`Front side set to Page ${pageIndex + 1}`, 'info');
    } else if (doc.back) {
      onUpdateDocument({
        ...doc,
        back: { ...doc.back, pageIndex },
      });
      onAddToast(`Back side set to Page ${pageIndex + 1}`, 'info');
    }
  };

  // Swap Front and Back
  const handleSwapSides = () => {
    if (!doc.back) return;
    const oldFront = { ...doc.front };
    const oldBack = { ...doc.back };

    onUpdateDocument({
      ...doc,
      front: { ...oldBack },
      back: { ...oldFront },
    });
    onAddToast('Front and Back side assignments swapped', 'success');
  };

  // Handler for "Next: Crop Back Side from Same PDF"
  const handleProceedToBackSide = () => {
    if (!doc.hasBackSide || !doc.back) {
      handleToggleHasBackSide(true);
    } else {
      setActiveSide('back');
    }
    onAddToast('Now cropping BACK SIDE from same document.', 'info');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Top Workflow Action Bar with Step Title & Direct Flow Actions */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {activeSide === 'front' ? (
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg mr-1">
                <AazmiLogo size="xs" variant="mark-only" />
                <span className="text-[11px] font-bold text-amber-900 tracking-wide">FRONT</span>
              </div>
            ) : (
              <span className="w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold bg-emerald-600">
                2
              </span>
            )}
            <h2 className="text-base font-bold text-gray-900">
              {activeSide === 'front' ? 'Crop Front Side' : 'Crop Back Side from Same Document'}
            </h2>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
              {doc.targetWidthMm} × {doc.targetHeightMm} mm
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {activeSide === 'front'
              ? 'First crop the FRONT side card boundary, then click next to crop the BACK side.'
              : 'Now position the crop frame over the BACK side of the card, then proceed to Print.'}
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {activeSide === 'front' ? (
            <>
              <button
                id="btn-print-front-only"
                type="button"
                onClick={onProceedToPrint}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                title="Skip back side and print front only"
              >
                <Printer className="w-3.5 h-3.5 text-gray-600" />
                <span>Print Front Only</span>
              </button>

              <button
                id="btn-next-crop-back"
                type="button"
                onClick={handleProceedToBackSide}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 shadow-sm transition-all cursor-pointer"
              >
                <span>Next: Crop Back Side &rarr;</span>
              </button>
            </>
          ) : (
            <>
              <button
                id="btn-back-to-front"
                type="button"
                onClick={() => setActiveSide('front')}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>&larr; Back to Front</span>
              </button>

              <button
                id="btn-proceed-print"
                type="button"
                onClick={onProceedToPrint}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-sm transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Done: Proceed to Print &rarr;</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Front / Back Switcher Tabs & Page Selector */}
      <FrontBackTabs
        document={doc}
        activeSide={activeSide}
        onSelectSide={setActiveSide}
        onToggleHasBackSide={handleToggleHasBackSide}
        onSwapSides={handleSwapSides}
        onSelectPageIndexForSide={handleSelectPageIndexForSide}
      />

      {/* Main Studio Grid: Left Canvas Area (7 cols) + Right Controls Area (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Crop Studio Canvas */}
        <div className="lg:col-span-7 h-[400px] sm:h-[520px] lg:h-[650px] flex flex-col">
          <CropCanvas
            imageSrc={currentPage.dataUrl}
            cropBox={currentSideState.cropBox}
            rotation={currentSideState.rotation}
            aspectRatioMode={doc.aspectRatioMode}
            targetWidthMm={doc.targetWidthMm}
            targetHeightMm={doc.targetHeightMm}
            showGrid={showGrid}
            showBoundaryGuide={showBoundaryGuide}
            onCropChange={handleCropChange}
            onRotate={handleRotateCurrentSide}
            onAutoDetect={handleAutoDetectCurrentSide}
            onReset={handleResetCrop}
            onToggleGrid={() => setShowGrid(!showGrid)}
            onToggleBoundaryGuide={() => setShowBoundaryGuide(!showBoundaryGuide)}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
          />
        </div>

        {/* Right Settings Columns */}
        <div className="lg:col-span-5 space-y-4 max-h-[680px] overflow-y-auto pr-1">
          {/* Card Template & Dimensions Selector */}
          <CardTemplateSelector
            selectedTemplateId={doc.selectedTemplateId}
            aspectRatioMode={doc.aspectRatioMode}
            targetWidthMm={doc.targetWidthMm}
            targetHeightMm={doc.targetHeightMm}
            unit={doc.unit}
            customTemplates={customTemplates}
            onSelectTemplate={handleSelectTemplate}
            onChangeAspectRatioMode={handleChangeAspectRatioMode}
            onChangeDimensions={handleChangeDimensions}
            onSaveCustomTemplate={handleSaveCustomTemplate}
            onDeleteCustomTemplate={handleDeleteCustomTemplate}
          />

          {/* Document Sharpening & Image Quality */}
          <AdjustmentsPanel
            adjustments={currentSideState.adjustments}
            onChange={handleAdjustmentsChange}
            onReset={handleResetAdjustments}
          />

          {/* DPI Resolution Matrix */}
          <ResolutionPanel
            targetDpi={doc.targetDpi}
            widthMm={doc.targetWidthMm}
            heightMm={doc.targetHeightMm}
            sourceResolution={{
              width: Math.round(currentSideState.cropBox.width * currentPage.width),
              height: Math.round(currentSideState.cropBox.height * currentPage.height),
            }}
            onSelectDpi={handleSelectDpi}
          />
        </div>
      </div>
    </div>
  );
};
