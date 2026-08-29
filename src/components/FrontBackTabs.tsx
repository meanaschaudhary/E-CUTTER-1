import React from 'react';
import { Layers, ArrowLeftRight, Plus, Trash2, CheckCircle2, ChevronRight, FileText } from 'lucide-react';
import { UploadedDocument } from '../types';

interface FrontBackTabsProps {
  document: UploadedDocument;
  activeSide: 'front' | 'back';
  onSelectSide: (side: 'front' | 'back') => void;
  onToggleHasBackSide: (hasBack: boolean) => void;
  onSwapSides: () => void;
  onSelectPageIndexForSide: (side: 'front' | 'back', pageIndex: number) => void;
}

export const FrontBackTabs: React.FC<FrontBackTabsProps> = ({
  document: doc,
  activeSide,
  onSelectSide,
  onToggleHasBackSide,
  onSwapSides,
  onSelectPageIndexForSide,
}) => {
  const currentSideObj = activeSide === 'front' ? doc.front : (doc.back || doc.front);
  const currentPageIdx = currentSideObj.pageIndex;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-2xs mb-4 space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Step Indicator & Tabs */}
        <div className="flex items-center gap-2">
          {/* Front Side Tab / Step 1 */}
          <button
            id="tab-select-front"
            type="button"
            onClick={() => onSelectSide('front')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSide === 'front'
                ? 'bg-blue-700 text-white shadow-xs ring-2 ring-blue-700/20'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                activeSide === 'front' ? 'bg-white text-blue-700' : 'bg-gray-300 text-gray-700'
              }`}
            >
              1
            </div>
            <span>STEP 1: CROP FRONT SIZE</span>
            {doc.pageCount > 1 && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  activeSide === 'front'
                    ? 'bg-blue-800 text-blue-100'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                Page {doc.front.pageIndex + 1}
              </span>
            )}
          </button>

          <ChevronRight className="w-4 h-4 text-gray-400 hidden sm:inline" />

          {/* Back Side Tab / Step 2 */}
          {doc.hasBackSide ? (
            <button
              id="tab-select-back"
              type="button"
              onClick={() => onSelectSide('back')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSide === 'back'
                  ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-600/20'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  activeSide === 'back' ? 'bg-white text-emerald-700' : 'bg-gray-300 text-gray-700'
                }`}
              >
                2
              </div>
              <span>STEP 2: CROP BACK SIZE</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  activeSide === 'back'
                    ? 'bg-emerald-700 text-emerald-100'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {doc.pageCount > 1 ? `Page ${(doc.back?.pageIndex ?? 0) + 1}` : 'Same Page'}
              </span>
            </button>
          ) : (
            <button
              id="btn-add-back-side"
              type="button"
              onClick={() => onToggleHasBackSide(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-700" />
              <span>+ Add Back Side from Same PDF</span>
            </button>
          )}
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-2">
          {doc.hasBackSide && (
            <>
              <button
                id="btn-swap-sides"
                type="button"
                onClick={onSwapSides}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer"
                title="Swap Front and Back assignments"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-gray-500" />
                <span className="hidden md:inline">Swap Front / Back</span>
              </button>

              <button
                id="btn-remove-back"
                type="button"
                onClick={() => onToggleHasBackSide(false)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200 transition-colors cursor-pointer"
                title="Remove Back Side (Single side print)"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Remove Back</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* PDF Source Page Selector for Active Side (if document has multiple pages) */}
      {doc.pageCount > 1 && (
        <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-gray-600 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-gray-500" />
            PDF Source Page for <strong className="text-gray-900 uppercase">{activeSide} SIDE:</strong>
          </span>

          <div className="flex items-center gap-1.5">
            {doc.pages.map((p, idx) => {
              const isSelected = currentPageIdx === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectPageIndexForSide(activeSide, idx)}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold transition-all cursor-pointer ${
                    isSelected
                      ? activeSide === 'front'
                        ? 'bg-blue-700 text-white shadow-2xs'
                        : 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Page {idx + 1}
                </button>
              );
            })}
          </div>

          <span className="text-[11px] text-gray-400 italic ml-auto hidden sm:inline">
            (You can crop front from Page 1 and back from Page 2 or the same page)
          </span>
        </div>
      )}
    </div>
  );
};
