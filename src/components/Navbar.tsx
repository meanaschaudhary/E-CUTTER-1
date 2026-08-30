import React from 'react';
import { ShieldCheck, HelpCircle, Settings, Trash2, Home, Printer, Sparkles } from 'lucide-react';
import { AazmiLogo } from './AazmiLogo';

interface NavbarProps {
  activeTab: 'home' | 'studio';
  onNavigateTab: (tab: 'home' | 'studio') => void;
  onOpenFile?: () => void;
  onOpenHelp: () => void;
  onOpenPrivacy: () => void;
  onOpenSettings: () => void;
  onClearWorkspace: () => void;
  hasDocument: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onNavigateTab,
  onOpenFile,
  onOpenHelp,
  onOpenPrivacy,
  onOpenSettings,
  onClearWorkspace,
  hasDocument,
}) => {
  return (
    <header className="no-print bg-[#002B5B] text-white shadow-md sticky top-0 z-40 shrink-0 border-b border-[#C5A059]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Title with Official Aazmi Emblem */}
        <button
          type="button"
          onClick={() => onNavigateTab('home')}
          className="flex items-center gap-3 text-left group cursor-pointer transition-opacity hover:opacity-95"
          title="AAZMI SERVICE CENTER - Home"
        >
          <AazmiLogo variant="header" size="sm" />
        </button>

        {/* Security Badge (Center/Right) */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20">
          <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span className="text-[11px] font-medium tracking-wide">100% Local Browser Security</span>
        </div>

        {/* Right Navigation: Home -> Studio -> Help -> Privacy -> Settings */}
        <div className="flex items-center gap-2 sm:gap-3 text-sm font-medium">
          {hasDocument && (
            <button
              id="btn-clear-workspace"
              onClick={onClearWorkspace}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              title="Clear current document and memory"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Clear Workspace</span>
            </button>
          )}

          {/* HOME OPTION (Placed right before Help) */}
          <button
            id="nav-btn-home"
            onClick={() => onNavigateTab('home')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'bg-white/20 text-[#E5C158] border border-[#C5A059]/40 shadow-xs'
                : 'text-gray-200 hover:text-white hover:bg-white/10'
            }`}
            title="Go to Home Page"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>

          {/* CARD STUDIO OPTION */}
          <button
            id="nav-btn-studio"
            onClick={() => onNavigateTab('studio')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'studio'
                ? 'bg-white/20 text-[#E5C158] border border-[#C5A059]/40 shadow-xs'
                : 'text-gray-200 hover:text-white hover:bg-white/10'
            }`}
            title="Open Card Crop & Print Studio"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Card Studio</span>
          </button>

          {/* HELP OPTION */}
          <button
            id="btn-help-modal"
            onClick={onOpenHelp}
            className="hover:text-blue-200 text-xs sm:text-sm font-medium transition-colors px-2 py-1 cursor-pointer"
            title="Help & Shortcuts"
          >
            Help
          </button>

          {/* PRIVACY OPTION */}
          <button
            id="btn-privacy-modal"
            onClick={onOpenPrivacy}
            className="hover:text-blue-200 text-xs sm:text-sm font-medium transition-colors px-2 py-1 cursor-pointer"
            title="Privacy First Guarantee"
          >
            Privacy
          </button>

          {/* SETTINGS OPTION */}
          <button
            id="btn-settings-modal"
            onClick={onOpenSettings}
            className="hover:text-blue-200 text-xs sm:text-sm font-medium transition-colors p-1 cursor-pointer"
            title="Configuration Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};

