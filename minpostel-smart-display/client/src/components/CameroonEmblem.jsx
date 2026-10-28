import React, { useState } from 'react';
import logoImg from '../assets/logo.png';

/**
 * Official MINPOSTEL Logo / Emblem Component
 * Displays the official Ministry logo with elegant golden accenting and SVG fallback
 */
export default function CameroonEmblem({ size = 44, hasBorder = true, shape = 'circle', className = '', style = {} }) {
  const [imgError, setImgError] = useState(false);

  const borderRadius = shape === 'circle' ? '50%' : `${Math.max(8, Math.round(size * 0.12))}px`;
  const padding = Math.max(2, Math.round(size * 0.05));

  return (
    <div
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius,
        overflow: 'hidden',
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
        border: hasBorder ? '2px solid #D4AF37' : 'none',
        backgroundColor: '#FFFFFF',
        padding: `${padding}px`,
        flexShrink: 0,
        ...style
      }}
    >
      {!imgError ? (
        <img
          src={logoImg}
          alt="MINPOSTEL Logo"
          onError={() => setImgError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block'
          }}
        />
      ) : (
        <svg
          viewBox="0 0 90 60"
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid slice"
          style={{ display: 'block' }}
        >
          {/* Green vertical band */}
          <rect width="30" height="60" fill="#007A3D" />
          {/* Red vertical band */}
          <rect x="30" width="30" height="60" fill="#CE1126" />
          {/* Yellow vertical band */}
          <rect x="60" width="30" height="60" fill="#FCD116" />
          {/* Central Gold Star on red band */}
          <polygon
            points="45,21 47.9,29.9 57.3,29.9 49.7,35.4 52.6,44.3 45,38.8 37.4,44.3 40.3,35.4 32.7,29.9 42.1,29.9"
            fill="#FCD116"
          />
        </svg>
      )}
    </div>
  );
}
