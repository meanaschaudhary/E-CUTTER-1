import React from 'react';
import {
  RotateCw,
  Sparkles,
  ArrowRight,
  Layers,
  FileCheck,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { UploadedDocument } from '../types';

interface PageSelectorProps {
  document: UploadedDocument;
  onSelectFrontPage: (pageIndex: number) => void;
  onSelectBackPage: (pageIndex: number) => void;
  onToggleHasBackSide: (hasBack: boolean) => void;
  onRotatePage: (pageIndex: number) => void;
  onAutoProcess: () => void;
  onProceedToCrop: () => void;
}

export const PageSelector: React.FC<PageSelectorProps> = ({
  document: doc,
  onSelectFrontPage,
  onSelectBackPage,
  onToggleHasBackSide,
  onRotatePage,
  onAutoProcess,
  onProceedToCrop,
}) => {
  const frontPageIndex = doc.front.pageIndex;
  const backPageIndex = doc.back ? doc.back.pageIndex : -1;

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Top Banner with File Info & Quick Auto Process */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-700 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-gray-900 truncate max-w-md">
                {doc.fileName}
              </h2>
              <span className="bg-gray-100 text-gray-700 text-[11px] px-2 py-0.5 rounded-md font-mono font-medium border border-gray-200">
                {doc.pageCount} {doc.pageCount === 1 ? 'Page' : 'Pages'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Select which page contains the <strong>FRONT</strong> side and which contains the <strong>BACK</strong> side.
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            id="btn-auto-process"
            onClick={onAutoProcess}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors shadow-2xs"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Auto Process</span>
          </button>

          <button
            id="btn-proceed-crop"
            onClick={onProceedToCrop}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 shadow-md shadow-blue-500/20 transition-all"
          >
            <span>Continue to Crop</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dual Side Controls & Back Side Toggle */}
      <div className="bg-white border border-gray-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 font-semibold text-gray-800 cursor-pointer">
            <input
              type="checkbox"
              id="checkbox-has-back"
              checked={doc.hasBackSide}
              onChange={(e) => onToggleHasBackSide(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span>Document has a Back Side</span>
          </label>
        </div>

        <div className="flex items-center gap-4 text-gray-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-700" />
            <span>Front Side: <strong>Page {frontPageIndex + 1}</strong></span>
          </div>
          {doc.hasBackSide && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>Back Side: <strong>{backPageIndex >= 0 ? `Page ${backPageIndex + 1}` : 'Not assigned'}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Multi-Page Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {doc.pages.map((page, index) => {
          const isFront = frontPageIndex === index;
          const isBack = doc.hasBackSide && backPageIndex === index;

          return (
            <div
              key={index}
              className={`bg-white border rounded-xl overflow-hidden transition-all shadow-xs ${
                isFront
                  ? 'border-blue-600 ring-2 ring-blue-600/20'
                  : isBack
                  ? 'border-emerald-600 ring-2 ring-emerald-600/20'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Thumbnail Header */}
              <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-800">
                    Page {page.pageNumber}
                  </span>
                  {isFront && (
                    <span className="bg-blue-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>FRONT</span>
                    </span>
                  )}
                  {isBack && (
                    <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>BACK</span>
                    </span>
                  )}
                </div>

                {/* Rotate button */}
                <button
                  id={`btn-rotate-page-${index}`}
                  onClick={() => onRotatePage(index)}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-200 transition-colors"
                  title="Rotate Page 90°"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Thumbnail Preview Area */}
              <div className="p-4 bg-gray-100/70 flex items-center justify-center min-h-[260px] max-h-[320px] overflow-hidden">
                <img
                  src={page.dataUrl}
                  alt={`Page ${page.pageNumber}`}
                  className="max-h-[240px] w-auto object-contain rounded-md shadow-xs border border-gray-200 bg-white"
                  style={{
                    transform: `rotate(${page.rotation || 0}deg)`,
                    transition: 'transform 0.2s ease',
                  }}
                />
              </div>

              {/* Assignment Controls */}
              <div className="p-3 bg-white border-t border-gray-200 flex items-center justify-between gap-2">
                <button
                  id={`btn-set-front-${index}`}
                  onClick={() => onSelectFrontPage(index)}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-colors ${
                    isFront
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-700 border border-gray-200'
                  }`}
                >
                  {isFront ? '✓ Front Selected' : 'Set as Front'}
                </button>

                {doc.hasBackSide && (
                  <button
                    id={`btn-set-back-${index}`}
                    onClick={() => onSelectBackPage(index)}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-colors ${
                      isBack
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 border border-gray-200'
                    }`}
                  >
                    {isBack ? '✓ Back Selected' : 'Set as Back'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Note about single-page vs multi-page */}
      <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-950 flex items-start gap-2.5">
        <HelpCircle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-blue-900">Single-Page Cutout Documents (e.g. e-Aadhaar A4 slip):</p>
          <p className="text-blue-800 mt-0.5">
            If both Front and Back cards are on the <strong>same single page</strong> (Page 1), select Page 1 for both Front and Back. In the next Crop step, you can crop the left section for Front and right section for Back independently.
          </p>
        </div>
      </div>
    </div>
  );
};
