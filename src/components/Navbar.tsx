import React from 'react';
import { ShieldCheck, HelpCircle, Settings, Trash2, Lock, FolderOpen } from 'lucide-react';

interface NavbarProps {
  onOpenFile?: () => void;
  onOpenHelp: () => void;
  onOpenPrivacy: () => void;
  onOpenSettings: () => void;
  onClearWorkspace: () => void;
  hasDocument: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenFile,
  onOpenHelp,
  onOpenPrivacy,
  onOpenSettings,
  onClearWorkspace,
  hasDocument,
}) => {
  return (
    <header className="no-print bg-[#002B5B] text-white shadow-md sticky top-0 z-40 shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-xs">
            <span className="text-[#002B5B] font-bold text-xl">A</span>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight leading-none uppercase">
              AAZMI SERVICE CENTER
            </h1>
            <p className="text-[10px] opacity-80 uppercase tracking-widest mt-0.5">
              Card Crop &amp; Print
            </p>
          </div>
        </div>

        {/* Security Badge (Center/Right) */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20">
          <div className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
          <span className="text-[11px] font-medium tracking-wide">Secure Local Processing</span>
        </div>

        {/* Right Navigation & Utility Actions */}
        <div className="flex items-center gap-3 text-sm font-medium">
          {hasDocument && (
            <button
              id="btn-clear-workspace"
              onClick={onClearWorkspace}
              className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 rounded-lg text-xs font-semibold transition-colors"
              title="Clear current document and memory (Ctrl+Shift+X)"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear Workspace</span>
            </button>
          )}

          <button
            id="btn-help-modal"
            onClick={onOpenHelp}
            className="hover:text-blue-200 text-xs sm:text-sm font-medium transition-colors"
            title="Help &amp; Shortcuts (Ctrl+H)"
          >
            Help
          </button>

          <button
            id="btn-privacy-modal"
            onClick={onOpenPrivacy}
            className="hover:text-blue-200 text-xs sm:text-sm font-medium transition-colors"
            title="Privacy First Guarantee"
          >
            Privacy
          </button>

          <button
            id="btn-settings-modal"
            onClick={onOpenSettings}
            className="hover:text-blue-200 text-xs sm:text-sm font-medium transition-colors p-1"
            title="Configuration Settings"
          >
            Settings
          </button>
        </div>

      </div>
    </header>
  );
};
