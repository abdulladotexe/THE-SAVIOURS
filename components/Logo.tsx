import React, { useState, useEffect } from 'react';

interface LogoProps {
  className?: string;
  style?: React.CSSProperties;
}

const Logo: React.FC<LogoProps> = ({ className, style }) => {
  const [src, setSrc] = useState<string | null>(null);
  const [showSvg, setShowSvg] = useState(false);

  useEffect(() => {
    // Initial load priority: Custom Upload -> logo.png
    const savedLogo = localStorage.getItem('the_saviour_custom_logo');
    setSrc(savedLogo || "logo.png");

    // Listen for updates from LoginView upload
    const handleUpdate = () => {
      const newLogo = localStorage.getItem('the_saviour_custom_logo');
      setSrc(newLogo || "logo.png");
      setShowSvg(false); // Reset to try image first
    };

    window.addEventListener('logo-updated', handleUpdate);
    return () => window.removeEventListener('logo-updated', handleUpdate);
  }, []);

  const handleError = () => {
    if (src && src !== "logo.png") {
      // If custom logo fails, try default file
      setSrc("logo.png");
    } else {
      // If default file fails, show SVG
      setShowSvg(true);
    }
  };

  if (!showSvg && src) {
    return (
      <img 
        src={src} 
        alt="The Saviour Logo" 
        className={className}
        style={{ objectFit: 'contain', ...style }}
        onError={handleError}
      />
    );
  }

  return (
    <svg 
      viewBox="0 0 512 512" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      style={style}
      aria-label="The Saviour Logo"
    >
      <defs>
        <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" /> {/* Red 500 */}
          <stop offset="45%" stopColor="#b91c1c" /> {/* Red 700 */}
          <stop offset="100%" stopColor="#1e40af" /> {/* Blue 800 */}
        </linearGradient>
        <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" floodOpacity="0.4"/>
        </filter>
        <filter id="innerGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="arithmetic" k2="1" k3="1" />
        </filter>
      </defs>

      {/* Main Shield Shape */}
      <path 
        d="M 256 480 C 256 480 460 380 460 140 L 256 50 L 52 140 C 52 380 256 480 256 480 Z" 
        fill="url(#shieldGradient)" 
        stroke="white" 
        strokeWidth="12"
        strokeLinejoin="round"
        filter="url(#dropShadow)"
      />

      {/* Glassy Overlay for 3D effect */}
      <path 
        d="M 256 65 L 400 140 C 400 300 300 400 256 460 C 212 400 112 300 112 140 L 256 65 Z"
        fill="white"
        fillOpacity="0.1"
        style={{ mixBlendMode: 'overlay' }}
      />

      {/* Central White Circle Container */}
      <circle cx="256" cy="240" r="85" fill="white" filter="url(#dropShadow)" />

      {/* Red Medical Cross */}
      <rect x="236" y="180" width="40" height="120" rx="4" fill="#dc2626" />
      <rect x="196" y="220" width="120" height="40" rx="4" fill="#dc2626" />

      {/* Pulse Line / Heartbeat Overlay */}
      <path 
        d="M 80 320 H 160 L 190 270 L 230 370 L 280 220 L 320 320 H 430" 
        stroke="white" 
        strokeWidth="14" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill="none"
        filter="url(#dropShadow)"
        opacity="0.9"
      />

      {/* Top Accent Star/Badge (Police/Authority Symbol) */}
      <path 
        d="M 256 80 L 270 120 H 242 Z" 
        fill="#fbbf24" 
        stroke="white" 
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Logo;