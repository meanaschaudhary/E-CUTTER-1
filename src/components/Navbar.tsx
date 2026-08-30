import React, { useState } from 'react';
import {
  ShieldCheck,
  HelpCircle,
  Settings,
  Trash2,
  Home,
  Printer,
  Menu,
  X,
  Lock,
} from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="no-print bg-[#002B5B] text-white shadow-md sticky top-0 z-40 shrink-0 border-b border-[#C5A059]/30">
      <div className="max-w-7xl mx-auto px-3 sm:px-8 h-16 flex items-center justify-between gap-2">
        
        {/* Brand Logo & Title with Official Aazmi Emblem */}
        <button
          type="button"
          onClick={() => {
            onNavigateTab('home');
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-2 sm:gap-3 text-left group cursor-pointer transition-opacity hover:opacity-95 shrink-0"
          title="AAZMI SERVICE CENTER - Home"
        >
          <AazmiLogo variant="header" size="sm" />
        </button>

        {/* Security Badge (Desktop) */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20">
          <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span className="text-[11px] font-medium tracking-wide">100% Local Browser Security</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2 sm:gap-3 text-sm font-medium">
          {hasDocument && (
            <button
              id="btn-clear-workspace"
              onClick={onClearWorkspace}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              title="Clear current document and memory"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Workspace</span>
            </button>
          )}

          {/* HOME OPTION */}
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
            className="hover:text-[#E5C158] text-xs sm:text-sm font-medium transition-colors px-2 py-1 cursor-pointer"
            title="Help & Shortcuts"
          >
            Help
          </button>

          {/* PRIVACY OPTION */}
          <button
            id="btn-privacy-modal"
            onClick={onOpenPrivacy}
            className="hover:text-[#E5C158] text-xs sm:text-sm font-medium transition-colors px-2 py-1 cursor-pointer"
            title="Privacy First Guarantee"
          >
            Privacy
          </button>

          {/* SETTINGS OPTION */}
          <button
            id="btn-settings-modal"
            onClick={onOpenSettings}
            className="hover:text-[#E5C158] text-xs sm:text-sm font-medium transition-colors p-2 rounded-lg hover:bg-white/10 cursor-pointer"
            title="Configuration Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Fast Navigation & Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-1.5">
          {/* Compact Home Tab */}
          <button
            type="button"
            onClick={() => {
              onNavigateTab('home');
              setMobileMenuOpen(false);
            }}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'home'
                ? 'bg-white/20 text-[#E5C158] border border-[#C5A059]/40'
                : 'text-gray-200 hover:bg-white/10'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>

          {/* Compact Studio Tab */}
          <button
            type="button"
            onClick={() => {
              onNavigateTab('studio');
              setMobileMenuOpen(false);
            }}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'studio'
                ? 'bg-white/20 text-[#E5C158] border border-[#C5A059]/40'
                : 'text-gray-200 hover:bg-white/10'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Studio</span>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-gray-200 hover:text-white hover:bg-white/10 active:bg-white/20 transition-colors cursor-pointer ml-1"
            title="Open navigation menu"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Slide-Down Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0A192F] border-b border-[#C5A059]/30 px-4 py-3 space-y-2 animate-in slide-in-from-top-2 duration-200 shadow-xl">
          <div className="flex items-center justify-between py-1.5 border-b border-white/10 text-xs text-gray-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              100% Local Browser Security
            </span>
            <span className="text-[10px] font-mono text-[#E5C158]">v2.5 Full HD</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                onOpenHelp();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-200 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-[#E5C158]" />
              <span>Help &amp; Shortcuts</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onOpenPrivacy();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-200 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Privacy First</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onOpenSettings();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-200 cursor-pointer"
            >
              <Settings className="w-4 h-4 text-sky-400" />
              <span>Settings</span>
            </button>

            {hasDocument && (
              <button
                type="button"
                onClick={() => {
                  onClearWorkspace();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-xs font-semibold text-rose-200 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Clear Workspace</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};


