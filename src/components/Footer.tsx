import React from 'react';

interface FooterProps {
  onOpenPrivacy: () => void;
  onOpenHelp: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPrivacy, onOpenHelp }) => {
  return (
    <footer className="no-print h-10 bg-white border-t border-gray-200 flex items-center justify-between px-4 sm:px-8 text-[10px] shrink-0 shadow-2xs">
      <div className="flex items-center gap-4">
        <span className="font-medium text-gray-500 uppercase tracking-widest">
          &copy; 2026 AAZMI SERVICE CENTER
        </span>
        <span className="hidden sm:inline text-gray-300">|</span>
        <button
          onClick={onOpenPrivacy}
          className="hidden sm:inline text-gray-500 hover:text-gray-900 transition-colors"
        >
          Privacy First
        </button>
        <button
          onClick={onOpenHelp}
          className="hidden sm:inline text-gray-500 hover:text-gray-900 transition-colors"
        >
          Shortcuts &amp; Guide
        </button>
      </div>

      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5 text-gray-500 font-medium">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
          <span>System Ready</span>
        </span>
        <span className="hidden sm:flex items-center gap-1.5 text-gray-400">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
          <span>Local Engine Active</span>
        </span>
      </div>
    </footer>
  );
};
