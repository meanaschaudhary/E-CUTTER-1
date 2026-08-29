import React from 'react';
import { Sliders, Sparkles, Sun, Contrast, Droplet, RefreshCw } from 'lucide-react';
import { ImageAdjustments, SharpenLevel } from '../types';

interface AdjustmentsPanelProps {
  adjustments: ImageAdjustments;
  onChange: (adjustments: ImageAdjustments) => void;
  onReset: () => void;
}

export const AdjustmentsPanel: React.FC<AdjustmentsPanelProps> = ({
  adjustments,
  onChange,
  onReset,
}) => {
  const handleSharpenChange = (level: SharpenLevel) => {
    onChange({ ...adjustments, sharpen: level });
  };

  const handleBrightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...adjustments, brightness: parseInt(e.target.value, 10) });
  };

  const handleContrastChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...adjustments, contrast: parseInt(e.target.value, 10) });
  };

  const handleSaturationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...adjustments, saturation: parseInt(e.target.value, 10) });
  };

  const handleGrayscaleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...adjustments, grayscale: e.target.checked });
  };

  const isDefault =
    adjustments.brightness === 0 &&
    adjustments.contrast === 0 &&
    adjustments.saturation === 0 &&
    adjustments.sharpen === 'none' &&
    !adjustments.grayscale;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-700" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800">
            Image Quality &amp; Enhancement
          </h3>
        </div>
        <button
          id="btn-reset-adjustments"
          type="button"
          onClick={onReset}
          disabled={isDefault}
          className="text-[11px] font-semibold text-gray-500 hover:text-blue-700 disabled:opacity-40 flex items-center gap-1 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Sharpening Kernel Selector */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Document Sharpening</span>
          </label>
          <span className="text-[10px] font-bold text-gray-500 capitalize">
            {adjustments.sharpen === 'none' ? 'Original (Off)' : `${adjustments.sharpen} Sharpen`}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1 p-1 bg-gray-100 rounded-xl text-xs">
          {(['none', 'light', 'medium', 'high'] as SharpenLevel[]).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => handleSharpenChange(lvl)}
              className={`py-1 rounded-lg font-bold capitalize transition-all ${
                adjustments.sharpen === lvl
                  ? 'bg-white text-blue-700 shadow-xs ring-1 ring-gray-200'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {lvl === 'none' ? 'Off' : lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Brightness Slider */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold text-gray-700 flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Brightness</span>
          </span>
          <span className="text-[11px] font-mono font-bold text-gray-600">
            {adjustments.brightness > 0 ? `+${adjustments.brightness}` : adjustments.brightness}
          </span>
        </div>
        <input
          type="range"
          min="-50"
          max="50"
          value={adjustments.brightness}
          onChange={handleBrightnessChange}
          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
        />
      </div>

      {/* Contrast Slider */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold text-gray-700 flex items-center gap-1.5">
            <Contrast className="w-3.5 h-3.5 text-blue-600" />
            <span>Contrast</span>
          </span>
          <span className="text-[11px] font-mono font-bold text-gray-600">
            {adjustments.contrast > 0 ? `+${adjustments.contrast}` : adjustments.contrast}
          </span>
        </div>
        <input
          type="range"
          min="-50"
          max="50"
          value={adjustments.contrast}
          onChange={handleContrastChange}
          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
        />
      </div>

      {/* Saturation Slider */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold text-gray-700 flex items-center gap-1.5">
            <Droplet className="w-3.5 h-3.5 text-indigo-500" />
            <span>Color Saturation</span>
          </span>
          <span className="text-[11px] font-mono font-bold text-gray-600">
            {adjustments.saturation > 0 ? `+${adjustments.saturation}` : adjustments.saturation}
          </span>
        </div>
        <input
          type="range"
          min="-50"
          max="50"
          value={adjustments.saturation}
          onChange={handleSaturationChange}
          disabled={adjustments.grayscale}
          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-700 disabled:opacity-40"
        />
      </div>

      {/* Grayscale Toggle */}
      <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-700 cursor-pointer">
          Black &amp; White (Grayscale)
        </label>
        <input
          type="checkbox"
          checked={adjustments.grayscale}
          onChange={handleGrayscaleToggle}
          className="w-4 h-4 text-blue-700 rounded border-gray-300 focus:ring-blue-600 cursor-pointer"
        />
      </div>

      {/* Integrity Notice */}
      <p className="text-[10px] text-gray-400 italic">
        Default settings preserve original document colors and UIDAI / Income Tax authenticity.
      </p>
    </div>
  );
};
