import React from 'react';
import { Gauge, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { DPI_PRESETS } from '../types';

interface ResolutionPanelProps {
  targetDpi: number;
  widthMm: number;
  heightMm: number;
  sourceResolution: { width: number; height: number };
  onSelectDpi: (dpi: number) => void;
}

export const ResolutionPanel: React.FC<ResolutionPanelProps> = ({
  targetDpi,
  widthMm,
  heightMm,
  sourceResolution,
  onSelectDpi,
}) => {
  // Calculate output pixels
  const pixelWidth = Math.round((widthMm / 25.4) * targetDpi);
  const pixelHeight = Math.round((heightMm / 25.4) * targetDpi);

  // Calculate effective source DPI
  const effectiveSourceDpi = Math.round(
    Math.min(
      (sourceResolution.width / (widthMm || 86)) * 25.4,
      (sourceResolution.height / (heightMm || 54)) * 25.4
    )
  );

  const isUpscaling = targetDpi > effectiveSourceDpi * 1.25;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-blue-700" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800">
            DPI &amp; Output Resolution
          </h3>
        </div>
        <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
          {targetDpi} DPI
        </span>
      </div>

      {/* DPI Preset Selector Buttons */}
      <div>
        <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
          Output Target Density
        </label>
        <div className="grid grid-cols-2 gap-2">
          {DPI_PRESETS.map((preset) => (
            <button
              key={preset.value}
              id={`btn-dpi-${preset.value}`}
              type="button"
              onClick={() => onSelectDpi(preset.value)}
              className={`p-2.5 rounded-xl text-left border transition-all ${
                targetDpi === preset.value
                  ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-600/10 shadow-2xs'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold ${
                    targetDpi === preset.value
                      ? 'text-blue-900'
                      : 'text-gray-800'
                  }`}
                >
                  {preset.value} DPI
                </span>
                {targetDpi === preset.value && (
                  <CheckCircle className="w-3.5 h-3.5 text-blue-700" />
                )}
              </div>
              <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">
                {preset.label.split('(')[1]?.replace(')', '') || ''}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Resolution Stats Matrix */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Source Native Region:</span>
          <span className="font-mono font-semibold text-gray-800">
            {sourceResolution.width} × {sourceResolution.height} px (~{effectiveSourceDpi} DPI)
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Output Raster Matrix:</span>
          <span className="font-mono font-bold text-blue-700">
            {pixelWidth} × {pixelHeight} px
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Physical Sizing:</span>
          <span className="font-mono font-semibold text-gray-800">
            {widthMm} × {heightMm} mm
          </span>
        </div>
      </div>

      {/* Advisory Notice */}
      {isUpscaling ? (
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-[11px] text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            Upscaling to {targetDpi} DPI increases pixel dimensions for fine print rasterization but does not invent synthetic source detail.
          </span>
        </div>
      ) : (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2 text-[11px] text-emerald-900">
          <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            Target output matches original document density cleanly for crisp QR codes &amp; text.
          </span>
        </div>
      )}
    </div>
  );
};
