import React from 'react';

export const ToolsScene = ({ className = 'illu' }) => (
  <svg className={className} viewBox="0 0 180 220" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxWidth: 175 }}>
    {/* Laptop, tools, particles - paste SVG content from Register.jsx ToolsScene here, simplified for Tailwind */}
    <rect x="20" y="60" width="140" height="90" rx="8" fill="#130928" stroke="rgba(167,139,250,0.4)" strokeWidth="1.5" />
    {/* Add other paths as needed */}
    <text x="90" y="140" fontFamily="serif" fontSize="48" fill="rgba(255,255,255,0.08)" textAnchor="middle">TOOLS</text>
  </svg>
);

export const RepairIllustration = ({ className = 'illu' }) => (
  <svg className={className} viewBox="0 0 200 230" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxWidth: 195 }}>
    {/* Phone shell, cracks, tools - paste from Login.jsx */}
    <rect x="52" y="24" width="96" height="178" rx="16" fill="#0d1f3c" stroke="rgba(59,130,246,0.45)" strokeWidth="1.5" />
    <text x="100" y="140" fontFamily="serif" fontSize="48" fill="rgba(255,255,255,0.05)" textAnchor="middle">FIX</text>
  </svg>
);

