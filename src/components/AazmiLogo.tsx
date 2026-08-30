import React from 'react';

interface AazmiLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'full-card' | 'horizontal' | 'mark-only' | 'header' | 'photo';
  useImage?: boolean;
}

export const AazmiLogo: React.FC<AazmiLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full-card',
  useImage = false,
}) => {
  // Size mappings
  const dimensions = {
    sm: { width: 36, height: 36 },
    md: { width: 48, height: 48 },
    lg: { width: 80, height: 80 },
    xl: { width: 140, height: 140 },
    full: { width: 280, height: 280 },
  };

  const currentDim = dimensions[size] || dimensions.md;

  if (variant === 'photo' || useImage) {
    return (
      <div
        className={`inline-block overflow-hidden rounded-2xl border-2 border-[#C5A059] shadow-md bg-white p-1 ${className}`}
        style={{ width: currentDim.width, height: currentDim.height }}
      >
        <img
          src="/aazmi-logo.jpeg"
          alt="Aazmi Service Center Logo"
          className="w-full h-full object-contain rounded-xl"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  if (variant === 'header' || variant === 'horizontal') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {/* Emblem Badge */}
        <div className="w-10 h-10 rounded-xl bg-white p-1 border-2 border-[#C5A059] shadow-xs flex items-center justify-center shrink-0">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <defs>
              <linearGradient id="goldSwooshHeader" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C5A059" />
                <stop offset="50%" stopColor="#E5C158" />
                <stop offset="100%" stopColor="#A88438" />
              </linearGradient>
            </defs>
            {/* Stylized Serif 'A' in Midnight Navy */}
            <path
              d="M 100,28 L 62,148 L 84,148 L 94,115 L 126,115 L 136,148 L 158,148 Z M 100,68 L 119,102 L 91,102 Z"
              fill="#0A192F"
            />
            {/* Dynamic Gold Swoosh Banner */}
            <path
              d="M 52,138 C 76,112 110,92 165,82 C 145,95 110,118 68,144 Z"
              fill="url(#goldSwooshHeader)"
            />
          </svg>
        </div>

        {/* Brand Typography */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold tracking-[0.25em] text-white text-base sm:text-lg leading-tight uppercase font-sans">
              AAZMI
            </span>
          </div>
          <div className="flex items-center text-[#E5C158] text-[9px] sm:text-[10px] font-bold tracking-[0.22em] uppercase leading-none">
            <span>SERVICE CENTER</span>
          </div>
          <span className="text-[8px] tracking-[0.18em] text-gray-300 uppercase mt-0.5 font-medium hidden sm:block">
            YOUR TRUST • OUR SERVICE
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'mark-only') {
    return (
      <div
        className={`rounded-2xl bg-white p-2 border-2 border-[#C5A059] shadow-sm flex items-center justify-center ${className}`}
        style={{ width: currentDim.width, height: currentDim.height }}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <defs>
            <linearGradient id="goldSwooshMark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C5A059" />
              <stop offset="50%" stopColor="#E5C158" />
              <stop offset="100%" stopColor="#A88438" />
            </linearGradient>
          </defs>
          <path
            d="M 100,24 L 56,156 L 82,156 L 93,118 L 127,118 L 138,156 L 164,156 Z M 100,64 L 120,104 L 90,104 Z"
            fill="#0A192F"
          />
          <path
            d="M 46,144 C 74,115 115,92 174,80 C 150,96 112,122 66,152 Z"
            fill="url(#goldSwooshMark)"
          />
        </svg>
      </div>
    );
  }

  // Exact Full Card Logo (matching uploaded image with luxury navy and gold frame)
  return (
    <div className={`inline-block ${className}`}>
      <svg
        viewBox="0 0 400 400"
        className="w-full h-auto max-w-full drop-shadow-md select-none"
        style={{ maxWidth: currentDim.width ? `${currentDim.width}px` : '100%' }}
      >
        <defs>
          {/* Subtle Warm Background Gradient */}
          <linearGradient id="cardBgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#FBFBFC" />
          </linearGradient>

          {/* Premium Gold Ribbon Gradient */}
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C59B4B" />
            <stop offset="40%" stopColor="#E8C872" />
            <stop offset="70%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#A67C2E" />
          </linearGradient>

          {/* Shadow Filter for Vector Elevation */}
          <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0A192F" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* Card Background Base */}
        <rect
          x="12"
          y="12"
          width="376"
          height="376"
          rx="36"
          ry="36"
          fill="url(#cardBgGrad)"
        />

        {/* Outer Midnight Navy Border Line */}
        <rect
          x="12"
          y="12"
          width="376"
          height="376"
          rx="36"
          ry="36"
          fill="none"
          stroke="#0A192F"
          strokeWidth="6"
        />

        {/* Inner Elegant Gold Filigree Border Line */}
        <rect
          x="20"
          y="20"
          width="360"
          height="360"
          rx="30"
          ry="30"
          fill="none"
          stroke="#C5A059"
          strokeWidth="2.5"
        />

        {/* === CENTRAL EMBLEM: Stylized Serif 'A' === */}
        <g transform="translate(200, 115)">
          {/* Main Midnight Navy Glyph */}
          <path
            d="M 0,-70 L -46,75 L -16,75 L -4,34 L 28,34 L 38,75 L 68,75 Z M 0,-24 L 20,18 L -14,18 Z"
            fill="#0A192F"
            filter="url(#softShadow)"
          />

          {/* Golden Dynamic Ribbon Across 'A' */}
          <path
            d="M -56,58 C -22,24 20,-2 86,-15 C 58,2 14,32 -32,68 Z"
            fill="url(#goldGrad)"
            filter="url(#softShadow)"
          />
        </g>

        {/* === MAIN TITLE: AAZMI === */}
        <text
          x="200"
          y="256"
          textAnchor="middle"
          fill="#0A192F"
          style={{
            fontFamily: "Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            fontWeight: 800,
            fontSize: '44px',
            letterSpacing: '0.22em',
          }}
        >
          AAZMI
        </text>

        {/* === SUBTITLE: SERVICE CENTER === */}
        <g transform="translate(200, 280)">
          <text
            x="0"
            y="4.5"
            textAnchor="middle"
            fill="#0A192F"
            style={{
              fontFamily: "Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              fontWeight: 700,
              fontSize: '13px',
              letterSpacing: '0.36em',
            }}
          >
            SERVICE CENTER
          </text>
        </g>

        {/* === DECORATIVE ORNAMENTAL DIVIDER === */}
        <g transform="translate(200, 305)">
          <line x1="-70" y1="0" x2="-10" y2="0" stroke="#C5A059" strokeWidth="1" />
          <circle cx="0" cy="0" r="3" fill="#C5A059" />
          <line x1="10" y1="0" x2="70" y2="0" stroke="#C5A059" strokeWidth="1" />
        </g>

        {/* === TAGLINE: YOUR TRUST • OUR SERVICE === */}
        <text
          x="200"
          y="328"
          textAnchor="middle"
          fill="#0A192F"
          style={{
            fontFamily: "Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            fontWeight: 700,
            fontSize: '9.5px',
            letterSpacing: '0.28em',
          }}
        >
          YOUR TRUST <tspan fill="#C5A059">•</tspan> OUR SERVICE
        </text>
      </svg>
    </div>
  );
};
