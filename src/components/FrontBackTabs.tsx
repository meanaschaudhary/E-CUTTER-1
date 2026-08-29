import React from 'react';
import { Layers, ArrowLeftRight, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { UploadedDocument } from '../types';

interface FrontBackTabsProps {
  document: UploadedDocument;
  activeSide: 'front' | 'back';
  onSelectSide: (side: 'front' | 'back') => void;
  onToggleHasBackSide: (hasBack: boolean) => void;
  onSwapSides: () => void;
}

export const FrontBackTabs: React.FC<FrontBackTabsProps> = ({
  document: doc,
  activeSide,
  onSelectSide,
  onToggleHasBackSide,
  onSwapSides,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-2.5 shadow-2xs mb-4 flex flex-wrap items-center justify-between gap-3">
      {/* Front & Back Tabs */}
      <div className="flex items-center gap-2">
        {/* Front Tab */}
        <button
          id="tab-select-front"
          onClick={() => onSelectSide('front')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeSide === 'front'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              activeSide === 'front' ? 'bg-white' : 'bg-blue-700'
            }`}
          />
          <span>FRONT SIDE</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
              activeSide === 'front'
                ? 'bg-blue-800 text-blue-100'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            P{doc.front.pageIndex + 1}
          </span>
        </button>

        {/* Back Tab */}
        {doc.hasBackSide ? (
          <button
            id="tab-select-back"
            onClick={() => onSelectSide('back')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSide === 'back'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                activeSide === 'back' ? 'bg-white' : 'bg-emerald-600'
              }`}
            />
            <span>BACK SIDE</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                activeSide === 'back'
                  ? 'bg-emerald-700 text-emerald-100'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              P{(doc.back?.pageIndex ?? 0) + 1}
            </span>
          </button>
        ) : (
          <button
            id="btn-add-back-side"
            onClick={() => onToggleHasBackSide(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 border border-dashed border-gray-300 hover:border-emerald-400 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Back Side</span>
          </button>
        )}
      </div>

      {/* Utility Actions */}
      <div className="flex items-center gap-2">
        {doc.hasBackSide && (
          <>
            <button
              id="btn-swap-sides"
              onClick={onSwapSides}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 transition-colors"
              title="Swap Front and Back assignments"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-gray-500" />
              <span className="hidden sm:inline">Swap Front / Back</span>
            </button>

            <button
              id="btn-remove-back"
              onClick={() => onToggleHasBackSide(false)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Remove Back Side"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
