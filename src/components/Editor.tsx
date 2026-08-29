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
      // Create back side default from page 2 if exists or page 1
      const backPageIndex = doc.pageCount > 1 ? 1 : 0;
      onUpdateDocument({
        ...doc,
        hasBackSide: true,
        back: {
          pageIndex: backPageIndex,
          cropBox: {
            x: 0.52,
            y: 0.62,
            width: 0.44,
            height: 0.34,
          },
          rotation: 0,
          adjustments: {
            brightness: 0,
            contrast: 0,
            saturation: 0,
            sharpen: 'none',
            grayscale: false,
          },
        },
      });
      setActiveSide('back');
      onAddToast('Back side added. Position crop box for the reverse side.', 'info');
    } else {
      onUpdateDocument({
        ...doc,
        hasBackSide: false,
      });
      setActiveSide('front');
      onAddToast('Back side removed', 'info');
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

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Top Workflow Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {doc.pageCount > 1 && (
            <button
              onClick={onBackToPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 shadow-2xs transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Pages</span>
            </button>
          )}
          <span className="text-xs font-bold text-gray-900 truncate max-w-xs">
            {doc.fileName}
          </span>
          <span className="text-[11px] font-mono bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
            P{currentPageIndex + 1}/{doc.pageCount}
          </span>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            id="btn-editor-auto-process"
            onClick={onAutoProcess}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors shadow-2xs"
            title="Auto identify front/back & optimal crop"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Auto Process</span>
          </button>

          <button
            id="btn-proceed-print"
            onClick={onProceedToPrint}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-700 hover:bg-blue-800 shadow-md shadow-blue-500/20 transition-all"
          >
            <span>Proceed to Print &amp; Export</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Front / Back Switcher Tabs */}
      <FrontBackTabs
        document={doc}
        activeSide={activeSide}
        onSelectSide={setActiveSide}
        onToggleHasBackSide={handleToggleHasBackSide}
        onSwapSides={handleSwapSides}
      />

      {/* Main Studio Grid: Left Canvas Area (7 cols) + Right Controls Area (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Crop Studio Canvas */}
        <div className="lg:col-span-7 h-[580px] lg:h-[680px] flex flex-col">
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
