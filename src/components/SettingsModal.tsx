import React from 'react';
import { Settings, X, Trash2, Check } from 'lucide-react';
import { CardTemplate, PaperSize } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDpi: number;
  onUpdateDefaultDpi: (dpi: number) => void;
  defaultPaperSize: PaperSize;
  onUpdateDefaultPaperSize: (paper: PaperSize) => void;
  customTemplates: CardTemplate[];
  onDeleteCustomTemplate: (id: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  defaultDpi,
  onUpdateDefaultDpi,
  defaultPaperSize,
  onUpdateDefaultPaperSize,
  customTemplates,
  onDeleteCustomTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-gray-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Workstation Settings
              </h3>
              <p className="text-xs text-gray-500">
                Operator default configuration and saved presets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-gray-700">
          {/* Default DPI */}
          <div>
            <label className="block font-bold text-gray-800 mb-1.5 uppercase tracking-wider text-[11px]">
              Default Output Quality / DPI
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[300, 600, 1200, 1800].map((dpi) => (
                <button
                  key={dpi}
                  onClick={() => onUpdateDefaultDpi(dpi)}
                  className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                    defaultDpi === dpi
                      ? 'bg-blue-50/80 border-blue-600 text-blue-900 ring-1 ring-blue-600/20'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>{dpi} DPI</span>
                  <span className="block font-normal text-[10px] text-gray-500">
                    {dpi === 600 ? 'Recommended for PVC Cards' : `${dpi} DPI rasterization`}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Default Paper Size */}
          <div>
            <label className="block font-bold text-gray-800 mb-1.5 uppercase tracking-wider text-[11px]">
              Default Paper Size
            </label>
            <select
              value={defaultPaperSize}
              onChange={(e) => onUpdateDefaultPaperSize(e.target.value as PaperSize)}
              className="w-full p-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-700 cursor-pointer"
            >
              <option value="A4">A4 (210 × 297 mm) — Standard Indian CSC Paper</option>
              <option value="A5">A5 (148 × 210 mm)</option>
              <option value="Letter">Letter (8.5 × 11 inches)</option>
            </select>
          </div>

          {/* Saved Custom Card Presets */}
          <div>
            <label className="block font-bold text-gray-800 mb-1.5 uppercase tracking-wider text-[11px]">
              Saved Custom Presets ({customTemplates.length})
            </label>
            {customTemplates.length === 0 ? (
              <p className="text-gray-400 italic p-3 bg-gray-50 rounded-xl border border-gray-200">
                No custom card presets saved yet. You can save any custom size from the Crop Editor panel.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {customTemplates.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <span className="font-bold text-gray-800">{t.name}</span>
                      <span className="text-gray-500 text-[10px] ml-2">
                        {t.widthMm} × {t.heightMm} mm
                      </span>
                    </div>
                    <button
                      onClick={() => onDeleteCustomTemplate(t.id)}
                      className="p-1 text-gray-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                      title="Delete Preset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            Save &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
