import React, { useRef, useState, useEffect } from 'react';
import {
  Upload,
  FileText,
  Image as ImageIcon,
  ShieldCheck,
  CreditCard,
  HeartPulse,
  Award,
  Truck,
  Layers,
  FileCheck2,
  CheckCircle2,
  Sliders,
  Sparkles,
  AlertCircle,
  Loader2,
  Info,
} from 'lucide-react';
import { CardTemplate, OFFICIAL_TEMPLATES } from '../types';
import { AazmiLogo } from './AazmiLogo';
import { SERVICES_LIST } from '../data/serviceData';

interface FileUploaderProps {
  selectedTemplate: CardTemplate;
  onSelectTemplate: (template: CardTemplate) => void;
  customWidthMm: number;
  customHeightMm: number;
  onUpdateCustomDimensions: (widthMm: number, heightMm: number) => void;
  onFileUpload: (file: File) => void;
  isUploading?: boolean;
  uploadProgress?: { percent: number; status: string } | null;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  selectedTemplate,
  onSelectTemplate,
  customWidthMm,
  customHeightMm,
  onUpdateCustomDimensions,
  onFileUpload,
  isUploading = false,
  uploadProgress = null,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'identity' | 'healthcare' | 'transport' | 'custom'>('all');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle global paste for quick image clipboard upload
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.items) {
        for (let i = 0; i < e.clipboardData.items.length; i++) {
          const item = e.clipboardData.items[i];
          if (item.type.indexOf('image') !== -1) {
            const file = item.getAsFile();
            if (file) {
              validateAndProcessFile(file);
              break;
            }
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndProcessFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndProcessFile(file);
    }
    // Reset file input so re-uploading the same file still triggers onChange
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateAndProcessFile = (file: File) => {
    setErrorMessage(null);
    const validTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/bmp',
      'image/tiff',
    ];
    const isExtensionValid = /\.(pdf|jpe?g|png|webp|bmp|tiff|jfif)$/i.test(file.name);

    if (!validTypes.includes(file.type) && !isExtensionValid) {
      setErrorMessage('Invalid file format. Please upload a valid PDF, JPG, PNG, or WebP document.');
      return;
    }

    if (file.size > 150 * 1024 * 1024) {
      setErrorMessage('File size exceeds 150 MB limit. Please select a smaller document.');
      return;
    }

    onFileUpload(file);
  };

  const getTemplateIcon = (id: string) => {
    if (id.includes('aadhaar') || id.includes('voter')) return CreditCard;
    if (id.includes('health') || id.includes('pmjay') || id.includes('abha')) return HeartPulse;
    if (id.includes('driving')) return Truck;
    if (id.includes('employee') || id.includes('pan')) return Award;
    return Layers;
  };

  const filteredTemplates = OFFICIAL_TEMPLATES.filter((tmpl) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'custom') return tmpl.id === 'custom-card' || tmpl.id === 'other-gov-card';
    return tmpl.category === selectedCategory;
  });

  const isCustomSelected = selectedTemplate.id === 'custom-card' || selectedTemplate.id === 'other-gov-card';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* STEP 1: CARD TYPE SELECTION */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-bold">
                1
              </span>
              <h2 className="text-base font-bold text-gray-900">
                Choose Card Format to Crop
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-1 pl-8">
              Select your target document card size first for accurate physical dimensions and crop ratio.
            </p>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(
              [
                { id: 'all', label: 'All Cards' },
                { id: 'identity', label: 'Identity' },
                { id: 'healthcare', label: 'Health' },
                { id: 'transport', label: 'Transport' },
                { id: 'custom', label: 'Custom' },
              ] as const
            ).map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-blue-700 text-white shadow-2xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Card Template Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredTemplates.map((tmpl) => {
            const Icon = getTemplateIcon(tmpl.id);
            const isSelected = selectedTemplate.id === tmpl.id;

            return (
              <button
                key={tmpl.id}
                type="button"
                id={`template-btn-${tmpl.id}`}
                onClick={() => onSelectTemplate(tmpl)}
                className={`flex items-start text-left p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-blue-700 bg-blue-50/70 ring-2 ring-blue-700/20 shadow-2xs'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/70'
                }`}
              >
                {tmpl.imageSrc ? (
                  <div className="w-12 h-8 rounded-md overflow-hidden bg-white border border-gray-200 shrink-0 mr-3 mt-0.5 shadow-xs p-0.5 flex items-center justify-center">
                    <img
                      src={tmpl.imageSrc}
                      alt={tmpl.name}
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mr-3 mt-0.5 ${
                      isSelected ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                )}

                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold text-gray-900 truncate">
                      {tmpl.name}
                    </h3>
                  </div>

                  <p className="text-[11px] font-mono text-blue-800 font-semibold mt-0.5">
                    {tmpl.id === 'custom-card'
                      ? `${customWidthMm} × ${customHeightMm} mm`
                      : `${tmpl.widthMm} × ${tmpl.heightMm} mm`}
                  </p>

                  <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">
                    {tmpl.description}
                  </p>
                </div>

                {/* Selected Checkmark Indicator */}
                {isSelected ? (
                  <div className="absolute top-3.5 right-3 text-blue-700">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                ) : (
                  tmpl.badgeText && (
                    <span className="absolute top-3.5 right-3 text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                      {tmpl.badgeText}
                    </span>
                  )
                )}
              </button>
            );
          })}
        </div>

        {/* Inline Custom Dimension Editor (if Custom selected) */}
        {isCustomSelected && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-gray-700" />
              <span className="font-bold text-gray-900">Custom Dimensions:</span>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-gray-600 font-medium">Width (mm):</label>
              <input
                type="number"
                min="30"
                max="300"
                step="0.5"
                value={customWidthMm}
                onChange={(e) =>
                  onUpdateCustomDimensions(
                    parseFloat(e.target.value) || 86,
                    customHeightMm
                  )
                }
                className="w-20 px-2.5 py-1 bg-white border border-gray-300 rounded-lg text-xs font-mono font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-gray-600 font-medium">Height (mm):</label>
              <input
                type="number"
                min="30"
                max="300"
                step="0.5"
                value={customHeightMm}
                onChange={(e) =>
                  onUpdateCustomDimensions(
                    customWidthMm,
                    parseFloat(e.target.value) || 54
                  )
                }
                className="w-20 px-2.5 py-1 bg-white border border-gray-300 rounded-lg text-xs font-mono font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>

            <span className="text-[11px] text-gray-500 italic">
              Aspect Ratio: {(customWidthMm / (customHeightMm || 1)).toFixed(3)}:1
            </span>
          </div>
        )}
      </div>

      {/* STEP 2: UPLOAD DOCUMENT */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-bold">
              2
            </span>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Upload Document for {selectedTemplate.name}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Target Output: <strong className="text-blue-700 font-mono">{isCustomSelected ? `${customWidthMm} × ${customHeightMm} mm` : `${selectedTemplate.widthMm} × ${selectedTemplate.heightMm} mm`}</strong>
              </p>
            </div>
          </div>

          <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            100% Local Processing
          </span>
        </div>

        {/* Drag and Drop Zone */}
        <div
          id="drop-zone-container"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-200 ${
            isUploading
              ? 'border-blue-500 bg-blue-50/50 cursor-wait'
              : isDragOver
              ? 'border-blue-700 bg-blue-50/80 ring-4 ring-blue-500/10 cursor-pointer'
              : 'border-gray-300 bg-gray-50/40 hover:border-blue-600 hover:bg-gray-50 cursor-pointer'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            id="file-input-element"
            accept=".pdf,application/pdf,image/jpeg,image/jpg,image/png,image/webp,image/bmp,image/tiff"
            className="hidden"
            onChange={handleFileInputChange}
            disabled={isUploading}
          />

          {isUploading ? (
            <div className="flex flex-col items-center justify-center py-4 space-y-3">
              <Loader2 className="w-10 h-10 text-blue-700 animate-spin" />
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {uploadProgress?.status || 'Processing document...'}
                </p>
                <div className="w-56 h-2 bg-gray-200 rounded-full mt-2 overflow-hidden mx-auto">
                  <div
                    className="h-full bg-blue-700 transition-all duration-200"
                    style={{ width: `${uploadProgress?.percent || 40}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-700 mb-3 shadow-2xs">
                <Upload className="w-7 h-7" />
              </div>

              <h3 className="text-lg font-bold text-gray-900 tracking-tight mb-1">
                Drop your {selectedTemplate.name} PDF or Image here
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                or <span className="text-blue-700 font-semibold underline underline-offset-2">Browse Files from Computer</span> (or press Ctrl+O)
              </p>

              {/* Supported Formats */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white text-gray-700 border border-gray-200 shadow-2xs">
                  <FileText className="w-3.5 h-3.5 mr-1 text-red-600" /> PDF (e-Aadhaar, e-PAN, Ayushman)
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white text-gray-700 border border-gray-200 shadow-2xs">
                  <ImageIcon className="w-3.5 h-3.5 mr-1 text-blue-600" /> JPG / JPEG Scan
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white text-gray-700 border border-gray-200 shadow-2xs">
                  <ImageIcon className="w-3.5 h-3.5 mr-1 text-emerald-600" /> PNG Lossless
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white text-gray-700 border border-gray-200 shadow-2xs">
                  <ImageIcon className="w-3.5 h-3.5 mr-1 text-purple-600" /> WebP
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Error Alert Box if any */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Security / Privacy Footnote */}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-start gap-2.5 text-[11px] text-gray-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            <strong>Local Decryption &amp; Privacy:</strong> Documents, passwords, and photos are processed strictly inside your device's memory. No customer identity data is uploaded to remote servers.
          </span>
        </div>
      </div>
    </div>
  );
};
