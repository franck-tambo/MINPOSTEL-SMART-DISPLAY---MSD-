import React from 'react';
import { Tv, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function DisplayPreviewPage() {
  const { language, t } = useLanguage();

  return (
    <div className="page-container">
      <div className="page-header-container">
        <div>
          <h2 className="page-title">
            <Tv size={22} style={{ color: 'var(--primary)' }} />
            <span>{language === 'FR' ? 'Aperçu en Temps Réel — Écran Entrée Principale RDC' : 'Real-Time Preview — Ground Floor Lobby Display'}</span>
          </h2>
          <p className="page-subtitle">
            {language === 'FR' 
              ? "Reproduction exacte en direct du contenu diffusé sur l'écran physique des visiteurs."
              : "Exact live mirror of the digital content broadcast on the visitor display kiosk."}
          </p>
        </div>

        <a
          href="/display/MINPOSTEL-MAIN-ENTRANCE-01"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
          style={{ textDecoration: 'none' }}
        >
          <span>{language === 'FR' ? 'Ouvrir Plein Écran Kiosque' : 'Open Fullscreen Kiosk'}</span>
          <ExternalLink size={15} />
        </a>
      </div>

      {/* Screen Frame Container */}
      <div className="admin-card" style={{
        backgroundColor: '#070D19',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        border: '1px solid #1F2D48',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', color: '#94A3B8', fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="badge badge-online">
              <span className="status-dot online"></span>
              {language === 'FR' ? 'FLUX EN DIRECT: CONNECTÉ' : 'LIVE FEED: ONLINE'}
            </span>
            <span>ID: MINPOSTEL-MAIN-ENTRANCE-01</span>
          </div>
          <div>{language === 'FR' ? 'Synchronisation Socket.IO: Instantanée' : 'Socket.IO Synchronization: Instant'}</div>
        </div>

        {/* Live Preview Iframe Frame */}
        <iframe
          src="/display/MINPOSTEL-MAIN-ENTRANCE-01"
          title="MINPOSTEL Live Display Preview"
          style={{
            width: '100%',
            height: '620px',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: '#070D19'
          }}
        />
      </div>
    </div>
  );
}
