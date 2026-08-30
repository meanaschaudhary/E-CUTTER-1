import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  WorkflowStep,
  UploadedDocument,
  PrintSettings,
  DEFAULT_PRINT_SETTINGS,
  CardTemplate,
  PaperSize,
  PAPER_DIMENSIONS_MM,
  OFFICIAL_TEMPLATES,
} from './types';
import { Navbar } from './components/Navbar';
import { WorkflowBar } from './components/WorkflowBar';
import { FileUploader } from './components/FileUploader';
import { PageSelector } from './components/PageSelector';
import { Editor } from './components/Editor';
import { PrintSheetView } from './components/PrintSheetView';
import { ExportSection } from './components/ExportSection';
import { PasswordModal } from './components/PasswordModal';
import { HelpModal } from './components/HelpModal';
import { PrivacyModal } from './components/PrivacyModal';
import { SettingsModal } from './components/SettingsModal';
import { Footer } from './components/Footer';
import { ToastContainer, ToastMessage } from './components/Toast';
import { HomePage } from './components/HomePage';
import { loadPdfDocument, loadImageDocument } from './utils/pdfEngine';
import { renderCroppedCard, autoProcessFullDocument } from './utils/imageEngine';

export const App: React.FC = () => {
  // Main Application State
  const [activeTab, setActiveTab] = useState<'home' | 'studio'>('home');
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('upload');
  const [document, setDocument] = useState<UploadedDocument | null>(null);

  // Card Selection First State
  const [selectedCardTemplate, setSelectedCardTemplate] = useState<CardTemplate>(OFFICIAL_TEMPLATES[0]);
  const [customWidthMm, setCustomWidthMm] = useState<number>(86.0);
  const [customHeightMm, setCustomHeightMm] = useState<number>(54.0);

  // Uploading / Decoding Progress State
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<{ percent: number; status: string } | null>(null);

  // Modal States
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [pendingPdfData, setPendingPdfData] = useState<{
    fileData: ArrayBuffer;
    fileName: string;
  } | null>(null);

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Settings & Preferences
  const [defaultDpi, setDefaultDpi] = useState<number>(1800);
  const [defaultPaperSize, setDefaultPaperSize] = useState<PaperSize>('A4');
  const [printSettings, setPrintSettings] = useState<PrintSettings>(DEFAULT_PRINT_SETTINGS);
  const [customTemplates, setCustomTemplates] = useState<CardTemplate[]>([]);

  // Rasterized Final Cards (Front & Back Data URLs)
  const [frontCardUrl, setFrontCardUrl] = useState<string | null>(null);
  const [backCardUrl, setBackCardUrl] = useState<string | null>(null);
  const [isProcessingCards, setIsProcessingCards] = useState<boolean>(false);

  // Notification Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const addToast = useCallback(
    (text: string, type: 'success' | 'error' | 'info' = 'info') => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      setToasts((prev) => [...prev, { id, text, type }]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Update Settings
  const handleUpdatePrintSettings = (newSettings: Partial<PrintSettings>) => {
    setPrintSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Helper to build an UploadedDocument from PDF load result using selected card template
  const buildDocFromPdf = (
    res: import('./utils/pdfEngine').PdfLoadResult,
    fileName: string,
    fileSize: number,
    template: CardTemplate,
    customW: number,
    customH: number
  ): UploadedDocument => {
    const isCustom = template.id === 'custom-card' || template.id === 'other-gov-card';
    const targetW = isCustom ? customW : template.widthMm;
    const targetH = isCustom ? customH : template.heightMm;
    const isAadhaarLike = template.id.includes('aadhaar');

    return {
      id: `doc_${Date.now()}`,
      fileName,
      fileSize,
      fileType: 'pdf',
      pageCount: res.pageCount,
      isPasswordProtected: res.isPasswordProtected,
      pages: res.pages,
      activeSide: 'front',
      hasBackSide: isAadhaarLike || res.pageCount > 1,
      selectedTemplateId: template.id,
      targetWidthMm: targetW,
      targetHeightMm: targetH,
      unit: 'mm',
      targetDpi: defaultDpi,
      front: {
        pageIndex: 0,
        cropBox: isAadhaarLike
          ? { x: 0.08, y: 0.60, width: 0.42, height: 0.33 }
          : { x: 0.08, y: 0.15, width: 0.84, height: 0.70 },
        rotation: 0,
        adjustments: {
          brightness: 0,
          contrast: 0,
          saturation: 0,
          sharpen: 'none',
          grayscale: false,
        },
        aspectRatioMode: template.isCR80 ? 'cr80' : 'custom',
        customRatioWidth: targetW,
        customRatioHeight: targetH,
      },
      back:
        isAadhaarLike || res.pageCount > 1
          ? {
              pageIndex: res.pageCount > 1 ? 1 : 0,
              cropBox: isAadhaarLike && res.pageCount === 1
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
              aspectRatioMode: template.isCR80 ? 'cr80' : 'custom',
              customRatioWidth: targetW,
              customRatioHeight: targetH,
            }
          : null,
    };
  };

  // Helper to build an UploadedDocument from Image load result
  const buildDocFromImage = (
    page: import('./types').DocumentPage,
    fileName: string,
    fileSize: number,
    template: CardTemplate,
    customW: number,
    customH: number
  ): UploadedDocument => {
    const isCustom = template.id === 'custom-card' || template.id === 'other-gov-card';
    const targetW = isCustom ? customW : template.widthMm;
    const targetH = isCustom ? customH : template.heightMm;

    return {
      id: `doc_${Date.now()}`,
      fileName,
      fileSize,
      fileType: 'image',
      pageCount: 1,
      isPasswordProtected: false,
      pages: [page],
      activeSide: 'front',
      hasBackSide: false,
      selectedTemplateId: template.id,
      targetWidthMm: targetW,
      targetHeightMm: targetH,
      unit: 'mm',
      targetDpi: defaultDpi,
      front: {
        pageIndex: 0,
        cropBox: { x: 0.05, y: 0.05, width: 0.90, height: 0.90 },
        rotation: 0,
        adjustments: {
          brightness: 0,
          contrast: 0,
          saturation: 0,
          sharpen: 'none',
          grayscale: false,
        },
        aspectRatioMode: template.isCR80 ? 'cr80' : 'custom',
        customRatioWidth: targetW,
        customRatioHeight: targetH,
      },
      back: null,
    };
  };

  // 1. Process Uploaded File
  const handleFileUpload = async (file: File) => {
    setActiveTab('studio');
    setIsUploading(true);
    setUploadProgress({ percent: 15, status: 'Reading document file...' });

    try {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        const arrayBuffer = await file.arrayBuffer();
        setPendingPdfData({ fileData: arrayBuffer, fileName: file.name });

        const res = await loadPdfDocument(
          arrayBuffer,
          undefined,
          (percent, status) => setUploadProgress({ percent, status })
        );

        if (res.isPasswordProtected) {
          setIsPasswordModalOpen(true);
          setPasswordError(null);
          setIsUploading(false);
          setUploadProgress(null);
          return;
        }

        const doc = buildDocFromPdf(
          res,
          file.name,
          file.size,
          selectedCardTemplate,
          customWidthMm,
          customHeightMm
        );
        setDocument(doc);
        setCurrentStep('crop');
        addToast(
          `PDF "${file.name}" loaded (${doc.pageCount} page${doc.pageCount > 1 ? 's' : ''}) for ${selectedCardTemplate.name}`,
          'success'
        );
      } else {
        const page = await loadImageDocument(
          file,
          (percent, status) => setUploadProgress({ percent, status })
        );
        const doc = buildDocFromImage(
          page,
          file.name,
          file.size,
          selectedCardTemplate,
          customWidthMm,
          customHeightMm
        );
        setDocument(doc);
        setCurrentStep('crop');
        addToast(
          `Image "${file.name}" loaded for ${selectedCardTemplate.name}`,
          'success'
        );
      }
    } catch (err: any) {
      console.error('File load error:', err);
      const msg = err?.message || 'Error loading file';
      if (msg.toLowerCase().includes('password')) {
        setIsPasswordModalOpen(true);
        setPasswordError('This PDF is password protected. Enter password to continue.');
      } else {
        addToast(`Failed to load file: ${msg}`, 'error');
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  // 2. Submit Password for PDF
  const handlePasswordSubmit = async (password: string) => {
    if (!pendingPdfData) return;
    setIsUploading(true);
    setUploadProgress({ percent: 30, status: 'Decrypting PDF...' });

    try {
      const res = await loadPdfDocument(
        pendingPdfData.fileData,
        password,
        (percent, status) => setUploadProgress({ percent, status })
      );
      const doc = buildDocFromPdf(
        res,
        pendingPdfData.fileName,
        pendingPdfData.fileData.byteLength,
        selectedCardTemplate,
        customWidthMm,
        customHeightMm
      );
      setDocument(doc);
      setIsPasswordModalOpen(false);
      setPasswordError(null);
      setPendingPdfData(null);
      setCurrentStep('crop');
      addToast('PDF decrypted and loaded successfully', 'success');
    } catch (err: any) {
      setPasswordError(err?.message || 'Incorrect PDF password. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  // 3. Auto Process Entire Document
  const handleAutoProcess = async () => {
    if (!document) return;
    try {
      addToast('Analyzing document layout & detecting card boundaries...', 'info');
      const updated = await autoProcessFullDocument(document);
      setDocument(updated);
      setCurrentStep('crop');
      addToast('Document auto-processed with optimal crop boundaries!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Auto process completed with standard defaults.', 'info');
    }
  };

  // 4. Render Cropped Cards to High-Res Data URLs
  const rasterizeCroppedCards = useCallback(async (docToRasterize: UploadedDocument) => {
    setIsProcessingCards(true);
    try {
      const frontPage = docToRasterize.pages[docToRasterize.front.pageIndex] || docToRasterize.pages[0];
      const frontUrl = await renderCroppedCard(
        frontPage.dataUrl,
        docToRasterize.front.cropBox,
        docToRasterize.front.rotation,
        docToRasterize.front.adjustments,
        docToRasterize.targetWidthMm,
        docToRasterize.targetHeightMm,
        docToRasterize.targetDpi
      );
      setFrontCardUrl(frontUrl);

      if (docToRasterize.hasBackSide && docToRasterize.back) {
        const backPage = docToRasterize.pages[docToRasterize.back.pageIndex] || docToRasterize.pages[0];
        const backUrl = await renderCroppedCard(
          backPage.dataUrl,
          docToRasterize.back.cropBox,
          docToRasterize.back.rotation,
          docToRasterize.back.adjustments,
          docToRasterize.targetWidthMm,
          docToRasterize.targetHeightMm,
          docToRasterize.targetDpi
        );
        setBackCardUrl(backUrl);
      } else {
        setBackCardUrl(null);
      }
    } catch (err) {
      console.error('Card rasterization failed:', err);
      addToast('Error rendering cropped card graphics.', 'error');
    } finally {
      setIsProcessingCards(false);
    }
  }, [addToast]);

  // Transition to Print & Export step
  const handleProceedToPrint = async () => {
    if (!document) return;
    await rasterizeCroppedCards(document);
    setCurrentStep('print');
  };

  // Transition to Final Export view
  const handleProceedToExport = async () => {
    if (!document) return;
    if (!frontCardUrl) {
      await rasterizeCroppedCards(document);
    }
    setCurrentStep('export');
  };

  // Native Print Trigger
  const handlePrintNow = async () => {
    if (!document) return;
    if (!frontCardUrl) {
      await rasterizeCroppedCards(document);
    }
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Clear Workspace & Purge Memory
  const handleClearWorkspace = () => {
    setDocument(null);
    setFrontCardUrl(null);
    setBackCardUrl(null);
    setPendingPdfData(null);
    setCurrentStep('upload');
    addToast('Workspace cleared. Document memory purged.', 'info');
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+O: Open file
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        fileInputRef.current?.click();
      }
      // Ctrl+P: Print
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p' && (currentStep === 'print' || currentStep === 'export')) {
        e.preventDefault();
        handlePrintNow();
      }
      // Escape: Close modals
      if (e.key === 'Escape') {
        setIsHelpOpen(false);
        setIsPrivacyOpen(false);
        setIsSettingsOpen(false);
        if (isPasswordModalOpen) {
          setIsPasswordModalOpen(false);
          setPendingPdfData(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, isPasswordModalOpen]);

  // Paper measurements for print container
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
  const cardW = document?.targetWidthMm || (selectedCardTemplate.id === 'custom-card' ? customWidthMm : selectedCardTemplate.widthMm);
  const cardH = document?.targetHeightMm || (selectedCardTemplate.id === 'custom-card' ? customHeightMm : selectedCardTemplate.heightMm);

  const printCardItems: Array<{ type: 'front' | 'back'; url: string; id: string }> = [];
  for (let c = 0; c < printSettings.copies; c++) {
    if (frontCardUrl && printSettings.duplexMode !== 'back-only') {
      printCardItems.push({ type: 'front', url: frontCardUrl, id: `f-${c}` });
    }
    if (backCardUrl && printSettings.duplexMode !== 'front-only') {
      printCardItems.push({ type: 'back', url: backCardUrl, id: `b-${c}` });
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] print:bg-white print:min-h-0 text-[#1D1D1F] flex flex-col font-sans antialiased">
      {/* Hidden File Input for Keyboard Shortcuts & Header */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf,image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
          }
        }}
      />

      {/* Top Professional Header */}
      <Navbar
        activeTab={activeTab}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'studio' && !document) {
            setCurrentStep('upload');
          }
        }}
        onOpenFile={() => fileInputRef.current?.click()}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onClearWorkspace={handleClearWorkspace}
        hasDocument={!!document}
      />

      {/* 4-Step Interactive Workflow Indicator (Only in Studio view) */}
      {activeTab === 'studio' && (
        <WorkflowBar
          currentStep={
            currentStep === 'upload'
              ? 'upload'
              : currentStep === 'crop' || currentStep === 'pages'
              ? document?.activeSide === 'back'
                ? 'crop-back'
                : 'crop-front'
              : 'export'
          }
          onStepClick={(step) => {
            if (step === 'upload') {
              handleClearWorkspace();
            } else if (step === 'crop-front') {
              if (document) {
                setDocument({ ...document, activeSide: 'front' });
                setCurrentStep('crop');
              }
            } else if (step === 'crop-back') {
              if (document) {
                if (!document.hasBackSide || !document.back) {
                  const backPageIndex = document.pageCount > 1 ? 1 : 0;
                  const isAadhaarLike = document.selectedTemplateId.includes('aadhaar');
                  setDocument({
                    ...document,
                    hasBackSide: true,
                    activeSide: 'back',
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
                      aspectRatioMode: document.front.aspectRatioMode,
                      customRatioWidth: document.targetWidthMm,
                      customRatioHeight: document.targetHeightMm,
                    },
                  });
                } else {
                  setDocument({ ...document, activeSide: 'back' });
                }
                setCurrentStep('crop');
              }
            } else if (step === 'export') {
              handleProceedToPrint();
            }
          }}
          hasDocument={!!document}
          hasBackSide={!!document?.hasBackSide}
          hasCropped={!!frontCardUrl}
        />
      )}

      {/* Main Dynamic Workspace Body */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-6">
        {/* TAB 1: HOME PAGE */}
        {activeTab === 'home' && (
          <HomePage
            onStartCrop={(tmpl) => {
              if (tmpl) {
                setSelectedCardTemplate(tmpl);
              }
              setActiveTab('studio');
              if (!document) {
                setCurrentStep('upload');
              }
            }}
            onFileUpload={(file) => {
              setActiveTab('studio');
              handleFileUpload(file);
            }}
            onOpenHelp={() => setIsHelpOpen(true)}
            onOpenPrivacy={() => setIsPrivacyOpen(true)}
          />
        )}

        {/* TAB 2: STUDIO WORKSPACE */}
        {activeTab === 'studio' && currentStep === 'upload' && (
          <FileUploader
            selectedTemplate={selectedCardTemplate}
            onSelectTemplate={setSelectedCardTemplate}
            customWidthMm={customWidthMm}
            customHeightMm={customHeightMm}
            onUpdateCustomDimensions={(w, h) => {
              setCustomWidthMm(w);
              setCustomHeightMm(h);
            }}
            onFileUpload={handleFileUpload}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
          />
        )}

        {/* STEP 2: MULTI-PAGE SELECTOR */}
        {activeTab === 'studio' && currentStep === 'pages' && document && (
          <PageSelector
            document={document}
            onSelectFrontPage={(idx) =>
              setDocument({
                ...document,
                front: { ...document.front, pageIndex: idx },
              })
            }
            onSelectBackPage={(idx) => {
              if (document.back) {
                setDocument({
                  ...document,
                  back: { ...document.back, pageIndex: idx },
                });
              }
            }}
            onToggleHasBackSide={(hasBack) => {
              setDocument({
                ...document,
                hasBackSide: hasBack,
                back: hasBack
                  ? {
                      pageIndex: document.pageCount > 1 ? 1 : 0,
                      cropBox: { x: 0.52, y: 0.60, width: 0.42, height: 0.33 },
                      rotation: 0,
                      adjustments: {
                        brightness: 0,
                        contrast: 0,
                        saturation: 0,
                        sharpen: 'none',
                        grayscale: false,
                      },
                      aspectRatioMode: document.front.aspectRatioMode,
                      customRatioWidth: document.targetWidthMm,
                      customRatioHeight: document.targetHeightMm,
                    }
                  : null,
              });
            }}
            onRotatePage={(idx) => {
              const pages = [...document.pages];
              const curRot = pages[idx].rotation || 0;
              pages[idx] = { ...pages[idx], rotation: (curRot + 90) % 360 };
              setDocument({ ...document, pages });
            }}
            onAutoProcess={handleAutoProcess}
            onProceedToCrop={() => setCurrentStep('crop')}
          />
        )}

        {/* STEP 3: CROP STUDIO & ENHANCEMENT EDITOR */}
        {activeTab === 'studio' && currentStep === 'crop' && document && (
          <Editor
            document={document}
            onUpdateDocument={setDocument}
            onAutoProcess={handleAutoProcess}
            onProceedToPrint={handleProceedToPrint}
            onBackToPages={() => setCurrentStep('pages')}
            onAddToast={addToast}
          />
        )}

        {/* STEP 4: PRINT LAYOUT VIEW */}
        {activeTab === 'studio' && currentStep === 'print' && document && (
          <div className="max-w-6xl mx-auto py-4 space-y-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentStep('crop')}
                className="text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                &larr; Back to Crop Studio
              </button>

              <button
                onClick={handleProceedToExport}
                className="text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 px-5 py-2 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                Proceed to Export &amp; Save PDF &rarr;
              </button>
            </div>

            <PrintSheetView
              document={document}
              printSettings={printSettings}
              frontCardUrl={frontCardUrl}
              backCardUrl={backCardUrl}
              onUpdateSettings={handleUpdatePrintSettings}
              onPrintNow={handlePrintNow}
            />
          </div>
        )}

        {/* STEP 5: FINAL EXPORT & DOWNLOAD HUB */}
        {activeTab === 'studio' && currentStep === 'export' && document && (
          <ExportSection
            document={document}
            frontCardUrl={frontCardUrl}
            backCardUrl={backCardUrl}
            printSettings={printSettings}
            onBackToEditor={() => setCurrentStep('crop')}
            onStartNewDocument={handleClearWorkspace}
            onPrintNow={handlePrintNow}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Password Unlock Modal */}
      <PasswordModal
        isOpen={isPasswordModalOpen}
        errorMessage={passwordError}
        fileName={pendingPdfData?.fileName || 'Document.pdf'}
        onSubmit={handlePasswordSubmit}
        onCancel={() => {
          setIsPasswordModalOpen(false);
          setPendingPdfData(null);
          setPasswordError(null);
        }}
      />

      {/* Operator Help & Guide Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Privacy & Security Modal */}
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        onClearWorkspace={handleClearWorkspace}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        defaultDpi={defaultDpi}
        onUpdateDefaultDpi={setDefaultDpi}
        defaultPaperSize={defaultPaperSize}
        onUpdateDefaultPaperSize={setDefaultPaperSize}
        customTemplates={customTemplates}
        onDeleteCustomTemplate={(id) => {
          const updated = customTemplates.filter((t) => t.id !== id);
          setCustomTemplates(updated);
          localStorage.setItem('aazmi_custom_card_templates', JSON.stringify(updated));
        }}
      />

      {/* DEDICATED NATIVE PRINT MOUNT ROOT (Only visible in Print Output) */}
      <div id="print-mount-root" className="bg-white">
        {printCardItems.length > 0 && (
          <div
            className="print-sheet bg-white"
            style={{
              width: `${pageWidthMm}mm`,
              maxHeight: `${pageHeightMm}mm`,
              paddingTop: `${printSettings.marginsMm.top}mm`,
              paddingBottom: `${printSettings.marginsMm.bottom}mm`,
              paddingLeft: `${printSettings.marginsMm.left}mm`,
              paddingRight: `${printSettings.marginsMm.right}mm`,
              display: 'flex',
              flexWrap: 'wrap',
              alignContent: 'flex-start',
              gap: `${printSettings.spacingMm.vertical}mm ${printSettings.spacingMm.horizontal}mm`,
              boxSizing: 'border-box',
              overflow: 'hidden',
              backgroundColor: '#ffffff',
              pageBreakInside: 'avoid',
              pageBreakAfter: 'avoid',
              breakInside: 'avoid',
              breakAfter: 'avoid',
            }}
          >
            {printCardItems.map((item, idx) => (
              <div
                key={item.id}
                className="print-card-wrapper"
                style={{
                  width: `${cardW}mm`,
                  height: `${cardH}mm`,
                  position: 'relative',
                  overflow: 'hidden',
                  border: printSettings.showCardBorder ? '0.2mm solid #cbd5e1' : 'none',
                  boxSizing: 'border-box',
                }}
              >
                <img
                  src={item.url}
                  alt={`${item.type} side ${idx + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />

                {/* Print Corner Cut Marks */}
                {printSettings.showCutGuides && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      pointerEvents: 'none',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '3mm',
                        height: '3mm',
                        borderTop: '0.25mm solid #64748b',
                        borderLeft: '0.25mm solid #64748b',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '3mm',
                        height: '3mm',
                        borderTop: '0.25mm solid #64748b',
                        borderRight: '0.25mm solid #64748b',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '3mm',
                        height: '3mm',
                        borderBottom: '0.25mm solid #64748b',
                        borderLeft: '0.25mm solid #64748b',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: '3mm',
                        height: '3mm',
                        borderBottom: '0.25mm solid #64748b',
                        borderRight: '0.25mm solid #64748b',
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
