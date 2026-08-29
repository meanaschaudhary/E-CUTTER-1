import React, { useState } from 'react';
import {
  CreditCard,
  Save,
  Trash2,
  Sliders,
  Check,
  ChevronDown,
} from 'lucide-react';
import {
  AspectRatioMode,
  CardTemplate,
  DimensionUnit,
  OFFICIAL_TEMPLATES,
} from '../types';

interface CardTemplateSelectorProps {
  selectedTemplateId: string;
  aspectRatioMode: AspectRatioMode;
  targetWidthMm: number;
  targetHeightMm: number;
  unit: DimensionUnit;
  customTemplates: CardTemplate[];
  onSelectTemplate: (template: CardTemplate) => void;
  onChangeAspectRatioMode: (mode: AspectRatioMode) => void;
  onChangeDimensions: (width: number, height: number, unit: DimensionUnit) => void;
  onSaveCustomTemplate: (name: string, width: number, height: number) => void;
  onDeleteCustomTemplate: (id: string) => void;
}

export const CardTemplateSelector: React.FC<CardTemplateSelectorProps> = ({
  selectedTemplateId,
  aspectRatioMode,
  targetWidthMm,
  targetHeightMm,
  unit,
  customTemplates,
  onSelectTemplate,
  onChangeAspectRatioMode,
  onChangeDimensions,
  onSaveCustomTemplate,
  onDeleteCustomTemplate,
}) => {
  const [customName, setCustomName] = useState('');
  const [isSavingCustom, setIsSavingCustom] = useState(false);

  const allTemplates = [...OFFICIAL_TEMPLATES, ...customTemplates];

  // Convert mm to selected unit for display/editing
  const convertFromMm = (valMm: number, targetUnit: DimensionUnit): number => {
    if (targetUnit === 'cm') return Number((valMm / 10).toFixed(2));
    if (targetUnit === 'inch') return Number((valMm / 25.4).toFixed(3));
    if (targetUnit === 'px') return Math.round((valMm / 25.4) * 300); // 300 dpi base
    return Number(valMm.toFixed(1)); // mm
  };

  const convertToMm = (val: number, sourceUnit: DimensionUnit): number => {
    if (sourceUnit === 'cm') return val * 10;
    if (sourceUnit === 'inch') return val * 25.4;
    if (sourceUnit === 'px') return (val / 300) * 25.4;
    return val;
  };

  const currentDisplayWidth = convertFromMm(targetWidthMm, unit);
  const currentDisplayHeight = convertFromMm(targetHeightMm, unit);

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || 0;
    const mmVal = convertToMm(val, unit);
    onChangeDimensions(mmVal, targetHeightMm, unit);
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || 0;
    const mmVal = convertToMm(val, unit);
    onChangeDimensions(targetWidthMm, mmVal, unit);
  };

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newUnit = e.target.value as DimensionUnit;
    onChangeDimensions(targetWidthMm, targetHeightMm, newUnit);
  };

  const handleSavePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    onSaveCustomTemplate(customName.trim(), targetWidthMm, targetHeightMm);
    setCustomName('');
    setIsSavingCustom(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-blue-700" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800">
            Card Size &amp; Template
          </h3>
        </div>
        <span className="text-[11px] font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
          {targetWidthMm} × {targetHeightMm} mm
        </span>
      </div>

      {/* Aspect Ratio Mode Selection */}
      <div>
        <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
          Aspect Ratio Mode
        </label>
        <div className="grid grid-cols-4 gap-1 p-1 bg-gray-100 rounded-xl">
          {(['free', 'cr80', 'original', 'custom'] as AspectRatioMode[]).map((mode) => (
            <button
              key={mode}
              id={`btn-ratio-mode-${mode}`}
              type="button"
              onClick={() => onChangeAspectRatioMode(mode)}
              className={`py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                aspectRatioMode === mode
                  ? 'bg-white text-blue-700 shadow-xs ring-1 ring-gray-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              {mode === 'cr80' ? 'CR80 (PVC)' : mode}
            </button>
          ))}
        </div>
      </div>

      {/* Preset Card Dropdown Selector */}
      <div>
        <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
          Document Template Preset
        </label>
        <div className="relative">
          <select
            id="select-card-template"
            value={selectedTemplateId}
            onChange={(e) => {
              const tmpl = allTemplates.find((t) => t.id === e.target.value);
              if (tmpl) onSelectTemplate(tmpl);
            }}
            className="w-full pl-3 pr-8 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-700 appearance-none cursor-pointer"
          >
            <optgroup label="Government & Identity Cards">
              {allTemplates
                .filter((t) => !t.isCustom)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.widthMm} × {t.heightMm} mm)
                  </option>
                ))}
            </optgroup>
            {customTemplates.length > 0 && (
              <optgroup label="Your Custom Presets">
                {customTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.widthMm} × {t.heightMm} mm)
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Output Physical Dimensions Inputs */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
            Output Dimensions
          </label>
          {/* Unit selector */}
          <select
            value={unit}
            onChange={handleUnitChange}
            className="text-[11px] font-semibold text-gray-700 bg-gray-100 border border-gray-200 rounded-md px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="mm">mm (Millimeters)</option>
            <option value="cm">cm (Centimeters)</option>
            <option value="inch">in (Inches)</option>
            <option value="px">px (Pixels)</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] font-medium text-gray-400 block mb-0.5">
              Width ({unit})
            </span>
            <input
              id="input-card-width"
              type="number"
              step="0.1"
              value={currentDisplayWidth}
              onChange={handleWidthChange}
              className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono font-bold text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-700"
            />
          </div>
          <div>
            <span className="text-[10px] font-medium text-gray-400 block mb-0.5">
              Height ({unit})
            </span>
            <input
              id="input-card-height"
              type="number"
              step="0.1"
              value={currentDisplayHeight}
              onChange={handleHeightChange}
              className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono font-bold text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-700"
            />
          </div>
        </div>
      </div>

      {/* Save Custom Template Preset */}
      <div className="pt-2 border-t border-gray-100">
        {!isSavingCustom ? (
          <button
            id="btn-open-save-preset"
            type="button"
            onClick={() => setIsSavingCustom(true)}
            className="w-full py-1.5 px-3 rounded-lg text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Current Size as Custom Preset</span>
          </button>
        ) : (
          <form onSubmit={handleSavePreset} className="space-y-2">
            <input
              type="text"
              placeholder="e.g. My State ID Card"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              autoFocus
              className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={!customName.trim()}
                className="flex-1 py-1 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg disabled:opacity-50"
              >
                Save Preset
              </button>
              <button
                type="button"
                onClick={() => setIsSavingCustom(false)}
                className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
