import React, { useRef, useState } from 'react';
import {
  Upload,
  FileText,
  Image as ImageIcon,
  ShieldCheck,
  Zap,
  Sparkles,
  CreditCard,
  HeartPulse,
  Award,
  Truck,
  Layers,
  Info,
} from 'lucide-react';
import { OFFICIAL_TEMPLATES } from '../types';

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  onLoadSampleAadhaar: () => void;
  onLoadSamplePan: () => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileUpload,
  onLoadSampleAadhaar,
  onLoadSamplePan,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  };

  const validateAndProcessFile = (file: File) => {
    const validTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];
    const isExtensionValid = /\.(pdf|jpe?g|png|webp)$/i.test(file.name);

    if (!validTypes.includes(file.type) && !isExtensionValid) {
      alert('Please upload a valid PDF, JPG, PNG or WebP file.');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      alert('This file is very large (over 100 MB). Please choose a smaller document file.');
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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Main Drag & Drop Box */}
      <div
        id="drop-zone-container"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-14 text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? 'border-blue-600 bg-blue-50/70 ring-4 ring-blue-500/10'
            : 'border-gray-300 bg-white hover:border-blue-500 hover:bg-gray-50/60 shadow-xs'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          id="file-input-element"
          accept=".pdf,image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileInputChange}
        />

        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-700 mb-4 shadow-2xs">
            <Upload className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-1">
            Drop your PDF or Image here
          </h2>
          <p className="text-xs text-gray-500 mb-5">
            or <span className="text-blue-700 font-semibold underline underline-offset-2">Browse from Computer</span> (Ctrl+O)
          </p>

          {/* File format pill tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
              <FileText className="w-3.5 h-3.5 mr-1 text-red-600" /> PDF Document
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
              <ImageIcon className="w-3.5 h-3.5 mr-1 text-blue-600" /> JPG / JPEG
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
              <ImageIcon className="w-3.5 h-3.5 mr-1 text-emerald-600" /> PNG Lossless
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
              <ImageIcon className="w-3.5 h-3.5 mr-1 text-purple-600" /> WebP
            </span>
          </div>

          {/* Quick Demo Test Buttons */}
          <div
            className="pt-5 border-t border-gray-100 w-full max-w-lg flex flex-col sm:flex-row items-center justify-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              id="btn-sample-aadhaar"
              type="button"
              onClick={onLoadSampleAadhaar}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors shadow-2xs"
            >
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span>Load Sample Aadhaar Card</span>
            </button>

            <button
              id="btn-sample-pan"
              type="button"
              onClick={onLoadSamplePan}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 transition-colors shadow-2xs"
            >
              <Zap className="w-3.5 h-3.5 text-gray-600" />
              <span>Load Sample e-PAN Card</span>
            </button>
          </div>
        </div>
      </div>

      {/* Privacy Guarantee Card */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
        <div className="text-xs text-orange-950">
          <p className="font-bold text-orange-900 uppercase tracking-wide text-[11px]">
            Privacy &amp; Security Note
          </p>
          <p className="text-orange-800 mt-0.5 leading-relaxed">
            All document rasterization, cropping, and PDF decryption occur entirely inside your browser's memory. No customer identity numbers or photos are transmitted to external servers.
          </p>
        </div>
      </div>

      {/* Supported Documents Presets Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Supported Card Formats
          </h3>
          <span className="text-[11px] text-gray-400">
            Standard CR80 &amp; Custom Dimensions
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {OFFICIAL_TEMPLATES.map((tmpl) => {
            const Icon = getTemplateIcon(tmpl.id);
            return (
              <div
                key={tmpl.id}
                className="bg-white border border-gray-200 rounded-xl p-3.5 hover:border-gray-300 transition-all shadow-2xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  {tmpl.badgeText && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                      {tmpl.badgeText}
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-gray-900 truncate">
                  {tmpl.name}
                </h4>
                <p className="text-[11px] font-mono text-blue-700 font-semibold mt-0.5">
                  {tmpl.widthMm} × {tmpl.heightMm} mm
                </p>
                <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">
                  {tmpl.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
