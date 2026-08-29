import React from 'react';
import { HelpCircle, X, CheckCircle, Keyboard, Printer, Shield, Sparkles } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-200 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Aazmi Workstation Guide &amp; Shortcuts
              </h3>
              <p className="text-xs text-gray-500">
                Operator instructions for CSC &amp; Online Service Centers
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-gray-700">
          {/* 4-Step Workflow */}
          <div>
            <h4 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-700" />
              <span>How to Process Documents in 4 Easy Steps:</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 pl-1 text-gray-600 leading-relaxed">
              <li><strong>Upload:</strong> Drop your Aadhaar, PAN or ID PDF/Image (or click sample to demo).</li>
              <li><strong>Unlock:</strong> If PDF is password protected, enter the standard document password locally.</li>
              <li><strong>Select &amp; Crop:</strong> Choose front/back pages, click <em>Auto Detect</em> or manually drag the 8-point crop box to the card edges.</li>
              <li><strong>Layout &amp; Print:</strong> Choose A4/A5 paper, copies count, check <em>Actual Size (100%)</em> and print directly or download high-res PDF.</li>
            </ol>
          </div>

          {/* Printer Warning Tip Box */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-amber-950">
            <p className="font-bold flex items-center gap-1.5 text-amber-900">
              <Printer className="w-4 h-4 text-amber-600" />
              <span>Crucial Printing Tip for PVC &amp; Laminated Cards:</span>
            </p>
            <p className="text-[11px] leading-relaxed text-amber-850">
              In the browser / printer dialog, always choose <strong>"Actual Size / 100%"</strong> scale. Avoid "Fit to printable area" which alters physical CR80 dimensions (86 mm × 54 mm).
            </p>
          </div>

          {/* Keyboard Shortcuts */}
          <div>
            <h4 className="font-bold text-gray-900 text-sm mb-2.5 flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-gray-700" />
              <span>Operator Keyboard Shortcuts:</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
                <span className="text-gray-600">Open Document</span>
                <kbd className="px-2 py-0.5 bg-white border border-gray-300 rounded font-mono font-bold text-gray-800">
                  Ctrl + O
                </kbd>
              </div>
              <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
                <span className="text-gray-600">Print Sheet</span>
                <kbd className="px-2 py-0.5 bg-white border border-gray-300 rounded font-mono font-bold text-gray-800">
                  Ctrl + P
                </kbd>
              </div>
              <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
                <span className="text-gray-600">Undo Crop Change</span>
                <kbd className="px-2 py-0.5 bg-white border border-gray-300 rounded font-mono font-bold text-gray-800">
                  Ctrl + Z
                </kbd>
              </div>
              <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
                <span className="text-gray-600">Redo Crop Change</span>
                <kbd className="px-2 py-0.5 bg-white border border-gray-300 rounded font-mono font-bold text-gray-800">
                  Ctrl + Y
                </kbd>
              </div>
            </div>
          </div>

          {/* Local Security */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-start gap-2 text-[11px] text-gray-600">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              All decoding, password verification, contour analysis, and rasterization happen directly inside your computer's RAM. No Aadhaar numbers or biometric data are transmitted over the web.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            Got it, Close
          </button>
        </div>
      </div>
    </div>
  );
};
