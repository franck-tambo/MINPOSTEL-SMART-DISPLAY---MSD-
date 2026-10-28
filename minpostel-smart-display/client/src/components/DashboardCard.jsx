import React from 'react';

export default function DashboardCard({ title, count, subtitle, icon: Icon, accentColor = 'var(--primary, #2563EB)' }) {
  return (
    <div className="admin-card" style={{
      padding: '1.25rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem'
    }}>
      <div>
        <p style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--text-muted)',
          marginBottom: '0.35rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          {title}
        </p>
        <h3 style={{
          fontSize: '1.75rem',
          fontWeight: 800,
          color: 'var(--text-dark)',
          lineHeight: 1.1,
          marginBottom: '0.25rem'
        }}>
          {count}
        </h3>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          {subtitle}
        </p>
      </div>

      <div style={{
        width: '44px',
        height: '44px',
        borderRadius: '10px',
        backgroundColor: 'var(--surface-subtle)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: accentColor,
        flexShrink: 0
      }}>
        {Icon && <Icon size={20} />}
      </div>
    </div>
  );
}
