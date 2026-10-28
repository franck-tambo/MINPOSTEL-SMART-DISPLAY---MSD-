import React from 'react';

/**
 * FlagBadge Component
 * Displays clean vector flag badge for FR or EN
 */
export default function FlagBadge({ lang = 'FR', label, size = 'md' }) {
  const isFR = lang?.toUpperCase() === 'FR';

  const badgePadding = size === 'sm' ? '3px 8px' : '4px 10px';
  const fontSize = size === 'sm' ? '0.725rem' : '0.8rem';
  const flagWidth = size === 'sm' ? 14 : 16;
  const flagHeight = size === 'sm' ? 10 : 12;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: badgePadding,
        borderRadius: '6px',
        fontSize,
        fontWeight: 700,
        letterSpacing: '0.04em',
        backgroundColor: isFR ? 'rgba(59, 130, 246, 0.12)' : 'rgba(212, 175, 55, 0.14)',
        color: isFR ? '#2563EB' : '#D97706',
        border: `1px solid ${isFR ? 'rgba(59, 130, 246, 0.25)' : 'rgba(212, 175, 55, 0.35)'}`,
        verticalAlign: 'middle'
      }}
    >
      {/* SVG Flag */}
      <svg
        width={flagWidth}
        height={flagHeight}
        viewBox="0 0 16 12"
        style={{ borderRadius: '2px', overflow: 'hidden', flexShrink: 0 }}
      >
        {isFR ? (
          <>
            <rect width="5.33" height="12" fill="#002395" />
            <rect x="5.33" width="5.33" height="12" fill="#FFFFFF" />
            <rect x="10.66" width="5.34" height="12" fill="#ED2939" />
          </>
        ) : (
          <>
            {/* UK Union Jack simplified crisp mini flag */}
            <rect width="16" height="12" fill="#012169" />
            <path d="M0,0 L16,12 M16,0 L0,12" stroke="#FFFFFF" strokeWidth="2.5" />
            <path d="M0,0 L16,12 M16,0 L0,12" stroke="#C8102E" strokeWidth="1.2" />
            <path d="M8,0 V12 M0,6 H16" stroke="#FFFFFF" strokeWidth="4" />
            <path d="M8,0 V12 M0,6 H16" stroke="#C8102E" strokeWidth="2.2" />
          </>
        )}
      </svg>
      <span>{label || (isFR ? 'FRANÇAIS' : 'ENGLISH')}</span>
    </span>
  );
}
