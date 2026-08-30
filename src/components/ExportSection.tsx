import React, { useState } from 'react';
import {
  Download,
  Printer,
  FileText,
  ArrowLeft,
  PlusCircle,
  CheckCircle2,
  HardDrive,
  FileCheck,
  Sparkles,
} from 'lucide-react';
import { PrintSettings, UploadedDocument } from '../types';
import { downloadImageFile, exportDocumentToPdf } from '../utils/pdfExportEngine';

interface ExportSectionProps {
  document: UploadedDocument;
  frontCardUrl: string | null;
  backCardUrl: string | null;
  printSettings: PrintSettings;
  onBackToEditor: () => void;
  onStartNewDocument: () => void;
  onPrintNow: () => void;
}

export const ExportSection: React.FC<ExportSectionProps> = ({
  document: doc,
  frontCardUrl,
  backCardUrl,
  printSettings,
  onBackToEditor,
  onStartNewDocument,
  onPrintNow,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultPdfName = `Aazmi_Card_${doc.selectedTemplateId.replace(/[^a-zA-Z0-9]/g, '_')}_${todayStr}.pdf`;

  const [pdfFileName, setPdfFileName] = useState(defaultPdfName);
  const [pdfQuality, setPdfQuality] = useState<'maximum' | 'high' | 'standard'>('maximum');
  const [pdfOutputType, setPdfOutputType] = useState<
    'front-only' | 'back-only' | 'front-and-back' | 'print-sheet'
  >('print-sheet');
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const cardW = doc.targetWidthMm || 86;
  const cardH = doc.targetHeightMm || 54;
  const dpi = doc.targetDpi || 1800;
  const pixelW = Math.round((cardW / 25.4) * dpi);
  const pixelH = Math.round((cardH / 25.4) * dpi);

  // Approximate uncompressed byte size
  const estimatedKb = Math.round((pixelW * pixelH * 4) / 1024);

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      await exportDocumentToPdf(
        doc,
        {
          fileName: pdfFileName,
          quality: pdfQuality,
          outputType: pdfOutputType,
          printSettings,
        },
        frontCardUrl,
        backCardUrl
      );
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadFrontPng = () => {
    if (!frontCardUrl) return;
    downloadImageFile(
      frontCardUrl,
      `Aazmi_${doc.selectedTemplateId}_Front_${todayStr}.png`,
      'png'
    );
  };

  const handleDownloadBackPng = () => {
    if (!backCardUrl) return;
    downloadImageFile(
      backCardUrl,
      `Aazmi_${doc.selectedTemplateId}_Back_${todayStr}.png`,
      'png'
    );
  };

  const handleDownloadFrontJpg = () => {
    if (!frontCardUrl) return;
    downloadImageFile(
      frontCardUrl,
      `Aazmi_${doc.selectedTemplateId}_Front_${todayStr}.jpg`,
      'jpeg'
    );
  };

  const handleDownloadBackJpg = () => {
    if (!backCardUrl) return;
    downloadImageFile(
      backCardUrl,
      `Aazmi_${doc.selectedTemplateId}_Back_${todayStr}.jpg`,
      'jpeg'
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900">
                Ready to Export &amp; Print
              </h2>
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                High Quality Processed
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Review cropped front/back cards, generate high-res PDF or print directly at 100% scale.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            id="btn-back-editor"
            onClick={onBackToEditor}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Crop Editor</span>
          </button>

          <button
            id="btn-start-new"
            onClick={onStartNewDocument}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 shadow-2xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-blue-700" />
            <span>New Document</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Card Previews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FRONT CARD PREVIEW */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
              FRONT SIDE
            </span>
            <span className="text-xs font-mono font-semibold text-gray-600">
              {cardW} × {cardH} mm ({pixelW} × {pixelH} px)
            </span>
          </div>

          <div className="bg-transparency-grid rounded-xl p-3 border border-gray-200 flex items-center justify-center min-h-[220px]">
            {frontCardUrl ? (
              <img
                src={frontCardUrl}
                alt="Front Card Preview"
                className="max-h-[240px] w-auto object-contain rounded-lg shadow-md border border-gray-300 bg-white"
              />
            ) : (
              <p className="text-xs text-gray-400">Front side not available</p>
            )}
          </div>

          {/* Quick Image Downloads for Front */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
            <button
              id="btn-download-front-png"
              onClick={handleDownloadFrontPng}
              className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg border border-gray-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-700" />
              <span>Download Front PNG (Lossless)</span>
            </button>
            <button
              id="btn-download-front-jpg"
              onClick={handleDownloadFrontJpg}
              className="py-2 px-3 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg border border-gray-200 transition-colors cursor-pointer"
            >
              JPG
            </button>
          </div>
        </div>

        {/* BACK CARD PREVIEW */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              BACK SIDE
            </span>
            <span className="text-xs font-mono font-semibold text-gray-600">
              {doc.hasBackSide
                ? `${cardW} × ${cardH} mm (${pixelW} × ${pixelH} px)`
                : 'Single Side Card'}
            </span>
          </div>

          <div className="bg-transparency-grid rounded-xl p-3 border border-gray-200 flex items-center justify-center min-h-[220px]">
            {backCardUrl ? (
              <img
                src={backCardUrl}
                alt="Back Card Preview"
                className="max-h-[240px] w-auto object-contain rounded-lg shadow-md border border-gray-300 bg-white"
              />
            ) : (
              <div className="text-center py-8 text-gray-400 text-xs">
                <p>No back side attached.</p>
                <button
                  onClick={onBackToEditor}
                  className="mt-2 text-blue-700 font-semibold underline cursor-pointer"
                >
                  + Add Back Side in Crop Editor
                </button>
              </div>
            )}
          </div>

          {/* Quick Image Downloads for Back */}
          {backCardUrl && (
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
              <button
                id="btn-download-back-png"
                onClick={handleDownloadBackPng}
                className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg border border-gray-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Download Back PNG (Lossless)</span>
              </button>
              <button
                id="btn-download-back-jpg"
                onClick={handleDownloadBackJpg}
                className="py-2 px-3 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg border border-gray-200 transition-colors cursor-pointer"
              >
                JPG
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Export Options & Direct Print Hub */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PDF Export Panel */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-red-600" />
            <h3 className="text-sm font-bold text-gray-900">
              Save as High-Precision PDF
            </h3>
          </div>

          {/* Filename Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              File Name
            </label>
            <input
              id="input-pdf-filename"
              type="text"
              value={pdfFileName}
              onChange={(e) => setPdfFileName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-700"
            />
          </div>

          {/* Output selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                PDF Layout Output
              </label>
              <select
                value={pdfOutputType}
                onChange={(e) => setPdfOutputType(e.target.value as any)}
                className="w-full p-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-700 cursor-pointer"
              >
                <option value="print-sheet">
                  Full Print Sheet ({printSettings.paperSize})
                </option>
                <option value="front-and-back">
                  Front &amp; Back (Card Sized)
                </option>
                <option value="front-only">Front Side Only</option>
                <option value="back-only">Back Side Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                PDF Quality
              </label>
              <select
                value={pdfQuality}
                onChange={(e) => setPdfQuality(e.target.value as any)}
                className="w-full p-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-700 cursor-pointer"
              >
                <option value="maximum">Maximum Quality (Lossless)</option>
                <option value="high">High Resolution</option>
                <option value="standard">Standard Compressed</option>
              </select>
            </div>
          </div>

          <button
            id="btn-download-pdf"
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isExportingPdf ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>Download Processed PDF</span>
              </>
            )}
          </button>
        </div>

        {/* Direct Print & Station Info */}
        <div className="bg-navy-950 border border-navy-900 text-white rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <Printer className="w-5 h-5 text-sky-400" />
              <h3 className="text-sm font-bold text-white">
                Direct Browser Printing
              </h3>
            </div>
            <p className="text-xs text-gray-300">
              Prints using a dedicated millimeter-exact CSS print layout. No UI clutter or borders are printed.
            </p>

            <div className="mt-4 bg-navy-900/90 border border-navy-800 rounded-xl p-3 text-xs space-y-1.5">
              <div className="flex justify-between text-gray-300">
                <span>Card Physical Size:</span>
                <span className="font-mono font-bold text-sky-300">
                  {cardW} × {cardH} mm
                </span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Output Density:</span>
                <span className="font-mono font-bold text-gray-100">
                  {dpi} DPI
                </span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Raster Buffer:</span>
                <span className="font-mono text-gray-200">
                  {pixelW} × {pixelH} px (~{estimatedKb} KB)
                </span>
              </div>
            </div>
          </div>

          <button
            id="btn-export-direct-print"
            onClick={onPrintNow}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Open Print Dialog (Ctrl+P)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
