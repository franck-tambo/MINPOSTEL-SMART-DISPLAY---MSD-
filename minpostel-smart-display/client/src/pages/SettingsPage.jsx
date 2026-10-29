import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  CheckCircle2, 
  Globe, 
  Wifi, 
  RefreshCw, 
  ExternalLink, 
  Clock, 
  Palette, 
  Moon, 
  Sun, 
  Image as ImageIcon, 
  Monitor, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getCached, setCached } from '../utils/apiCache';

export default function SettingsPage() {
  const { language, t } = useLanguage();

  const defaultSettings = {
    app_title: 'MINPOSTEL Smart Display',
    default_language: 'FR',
    rotation_duration_seconds: 15,
    heartbeat_interval_seconds: 15,
    display_code: 'MINPOSTEL-MAIN-ENTRANCE-01',
    theme_color: '#134074',
    background_url: '',
    power_on_time: '00:00',
    power_off_time: '23:59'
  };

  const [settings, setSettings] = useState(() => getCached('settings') || defaultSettings);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [restartingTunnel, setRestartingTunnel] = useState(false);
  const [tunnelMsg, setTunnelMsg] = useState(null);

  // Curated theme color presets
  const themePresets = [
    { name: language === 'FR' ? 'Bleu Nuit MINPOSTEL' : 'MINPOSTEL Navy', color: '#134074' },
    { name: language === 'FR' ? 'Bleu Royal Exécutif' : 'Royal Executive Blue', color: '#2563EB' },
    { name: language === 'FR' ? 'Vert National Cameroun' : 'Cameroon Green', color: '#007A3D' },
    { name: language === 'FR' ? 'Or Présidentiel' : 'Presidential Gold', color: '#D4AF37' },
    { name: language === 'FR' ? 'Rouge République' : 'Republic Red', color: '#991B1B' },
    { name: language === 'FR' ? 'Ardoise Moderne' : 'Modern Slate', color: '#0F172A' }
  ];

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => {
        if (d.status === 'success' && d.data) {
          setSettings(d.data);
          setCached('settings', d.data);
        }
      })
      .catch(err => console.error('Error fetching settings:', err));
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    })
      .then(r => r.json())
      .then(res => {
        setIsSaving(false);
        if (res.status === 'success') {
          setSaved(true);
          setCached('settings', settings);
          setTimeout(() => setSaved(false), 3500);
        }
      })
      .catch(err => {
        setIsSaving(false);
        console.error('Save failed:', err);
      });
  };

  const handleResetDefaults = () => {
    if (window.confirm(language === 'FR' ? 'Restaurer les paramètres par défaut ?' : 'Restore default settings?')) {
      setSettings(prev => ({
        ...prev,
        ...defaultSettings,
        local_network_url: prev.local_network_url,
        public_base_url: prev.public_base_url
      }));
    }
  };

  const handleRestartTunnel = async () => {
    setRestartingTunnel(true);
    setTunnelMsg(null);
    try {
      const res = await fetch('/api/settings/tunnel/restart', { method: 'POST' });
      if (res.ok) {
        setTunnelMsg(language === 'FR' 
          ? 'Relance du tunnel Cloudflare initiée... Patientez quelques secondes.' 
          : 'Cloudflare Tunnel restart initiated... Please wait a few seconds.');
        setTimeout(() => {
          fetch('/api/settings')
            .then(r => r.json())
            .then(d => {
              if (d.status === 'success' && d.data) {
                setSettings(d.data);
                setCached('settings', d.data);
              }
            });
        }, 5000);
      }
    } catch (e) {
      setTunnelMsg('Erreur / Error: ' + e.message);
    } finally {
      setTimeout(() => setRestartingTunnel(false), 2000);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '920px', paddingBottom: '3rem' }}>
      <div className="page-header-container">
        <div>
          <h2 className="page-title">
            <Settings size={22} style={{ color: 'var(--primary)' }} />
            <span>{language === 'FR' ? 'Paramètres Globaux du Système' : 'System Global Settings'}</span>
          </h2>
          <p className="page-subtitle">
            {language === 'FR' 
              ? "Configuration des cycles d'affichage, temporisations, apparence et connectivité des écrans." 
              : 'Configuration of display cycles, carousel timers, visual theme, and screen connectivity.'}
          </p>
        </div>
      </div>

      {saved && (
        <div style={{
          padding: '12px 18px',
          backgroundColor: '#10B981',
          color: '#FFFFFF',
          borderRadius: 'var(--radius-sm)',
          fontWeight: 600,
          fontSize: '0.875rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: 'var(--shadow-md)',
          animation: 'msdFadeIn 0.3s ease'
        }}>
          <CheckCircle2 size={18} />
          <span>{language === 'FR' ? 'Paramètres enregistrés et diffusés en temps réel avec succès !' : 'Settings saved and broadcast in real time successfully!'}</span>
        </div>
      )}

      <form onSubmit={handleSave}>
        {/* =========================================================
            SECTION 1: GÉNÉRAL & IDENTIFICATION DE L'ÉCRAN
            ========================================================= */}
        <div className="admin-card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <Monitor size={20} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-dark)' }}>
              {language === 'FR' ? 'Identification & Langue Principale' : 'Identification & Primary Language'}
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label className="form-label">
                {language === 'FR' ? "Nom de l'application / Système" : 'Application / System Title'}
              </label>
              <input
                type="text"
                value={settings.app_title || ''}
                onChange={e => setSettings({ ...settings, app_title: e.target.value })}
                style={{ width: '100%' }}
                required
              />
            </div>

            <div>
              <label className="form-label">
                {language === 'FR' ? 'Identifiant Écran Principal' : 'Main Screen ID'}
              </label>
              <input
                type="text"
                value={settings.display_code || ''}
                onChange={e => setSettings({ ...settings, display_code: e.target.value })}
                style={{ width: '100%' }}
                required
              />
            </div>

            <div>
              <label className="form-label">
                {language === 'FR' ? 'Langue par Défaut au Démarrage' : 'Startup Default Language'}
              </label>
              <select
                value={settings.default_language || 'FR'}
                onChange={e => setSettings({ ...settings, default_language: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.85rem' }}
              >
                <option value="FR">Français (Cameroun)</option>
                <option value="EN">English (Cameroon)</option>
              </select>
            </div>
          </div>
        </div>

        {/* =========================================================
            SECTION 2: TEMPORISATIONS & ROTATION DU CARROUSEL
            ========================================================= */}
        <div className="admin-card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <Clock size={20} style={{ color: 'var(--primary)' }} />
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-dark)' }}>
                {language === 'FR' ? 'Temporisations du Carrousel & Défilement' : 'Carousel Timers & Slide Rotation'}
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {language === 'FR' 
                  ? "Chaque information reste à l'écran pendant toute la durée configurée avant de passer à la suivante." 
                  : 'Each slide remains on screen for the full configured duration before transitioning.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {/* Slide Duration */}
            <div>
              <label className="form-label">
                {language === 'FR' ? 'Durée par Diapositive (Secondes)' : 'Slide Duration (Seconds)'}
              </label>
              <input
                type="number"
                min="3"
                max="300"
                value={settings.rotation_duration_seconds || 15}
                onChange={e => setSettings({ ...settings, rotation_duration_seconds: parseInt(e.target.value) || 15 })}
                style={{ width: '100%', marginBottom: '0.4rem' }}
              />
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {[10, 15, 20, 30].map(sec => (
                  <button
                    key={sec}
                    type="button"
                    className="btn-secondary"
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.6rem',
                      background: settings.rotation_duration_seconds === sec ? 'var(--primary-light)' : undefined,
                      borderColor: settings.rotation_duration_seconds === sec ? 'var(--primary)' : undefined,
                      color: settings.rotation_duration_seconds === sec ? 'var(--primary)' : undefined,
                      fontWeight: settings.rotation_duration_seconds === sec ? 700 : 500
                    }}
                    onClick={() => setSettings({ ...settings, rotation_duration_seconds: sec })}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>

            {/* Heartbeat Interval */}
            <div>
              <label className="form-label">
                {language === 'FR' ? 'Intervalle Ping Heartbeat (Sec)' : 'Heartbeat Ping Interval (Sec)'}
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={settings.heartbeat_interval_seconds || 15}
                onChange={e => setSettings({ ...settings, heartbeat_interval_seconds: parseInt(e.target.value) || 15 })}
                style={{ width: '100%', marginBottom: '0.4rem' }}
              />
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {[10, 15, 30, 60].map(sec => (
                  <button
                    key={sec}
                    type="button"
                    className="btn-secondary"
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.6rem',
                      background: settings.heartbeat_interval_seconds === sec ? 'var(--primary-light)' : undefined,
                      borderColor: settings.heartbeat_interval_seconds === sec ? 'var(--primary)' : undefined,
                      color: settings.heartbeat_interval_seconds === sec ? 'var(--primary)' : undefined,
                      fontWeight: settings.heartbeat_interval_seconds === sec ? 700 : 500
                    }}
                    onClick={() => setSettings({ ...settings, heartbeat_interval_seconds: sec })}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            SECTION 3: APPARENCE & THÈME VISUEL
            ========================================================= */}
        <div className="admin-card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <Palette size={20} style={{ color: 'var(--primary)' }} />
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-dark)' }}>
                {language === 'FR' ? 'Thème Graphique & Arrière-Plan' : 'Visual Theme & Background'}
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {language === 'FR' 
                  ? "Personnalisez la couleur d'accentuation et l'ambiance visuelle de l'écran public." 
                  : 'Customize the accent color and visual atmosphere of the public display screen.'}
              </p>
            </div>
          </div>

          {/* Theme Color Picker & Swatches */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{language === 'FR' ? "Couleur Principale d'Accent" : 'Primary Accent Color'}</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: settings.theme_color || '#134074' }}>
                {settings.theme_color || '#134074'}
              </span>
            </label>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
              <input
                type="color"
                value={settings.theme_color || '#134074'}
                onChange={e => setSettings({ ...settings, theme_color: e.target.value })}
                style={{ width: '48px', height: '40px', padding: '2px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: '1px solid var(--border-subtle)' }}
              />
              <input
                type="text"
                value={settings.theme_color || '#134074'}
                onChange={e => setSettings({ ...settings, theme_color: e.target.value })}
                placeholder="#134074"
                style={{ width: '130px', fontWeight: 600, fontFamily: 'monospace' }}
              />
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: settings.theme_color || '#134074',
                color: '#FFFFFF',
                fontSize: '0.8rem',
                fontWeight: 700,
                boxShadow: `0 2px 8px ${settings.theme_color || '#134074'}40`
              }}>
                <Sparkles size={14} />
                <span>Aperçu Thème</span>
              </div>
            </div>

            {/* Quick Swatches */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {themePresets.map(preset => (
                <button
                  key={preset.color}
                  type="button"
                  onClick={() => setSettings({ ...settings, theme_color: preset.color })}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.4rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: settings.theme_color === preset.color ? `2px solid ${preset.color}` : '1px solid var(--border-subtle)',
                    background: settings.theme_color === preset.color ? 'var(--surface-subtle)' : '#FFFFFF',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    boxShadow: settings.theme_color === preset.color ? `0 0 0 2px ${preset.color}30` : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: preset.color, display: 'inline-block' }} />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Background URL */}
          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ImageIcon size={16} />
              <span>{language === 'FR' ? "Image de Fond de l'Écran Public (Optionnel)" : 'Public Screen Background Image (Optional)'}</span>
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Ex: https://images.unsplash.com/... ou /uploads/fond.jpg"
                value={settings.background_url || ''}
                onChange={e => setSettings({ ...settings, background_url: e.target.value })}
                style={{ flex: 1, minWidth: '260px' }}
              />
              {settings.background_url && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setSettings({ ...settings, background_url: '' })}
                  style={{ color: '#EF4444' }}
                >
                  {language === 'FR' ? 'Effacer' : 'Clear'}
                </button>
              )}
            </div>

            {settings.background_url && (
              <div style={{ marginTop: '0.75rem', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '120px', border: '1px solid var(--border-subtle)', position: 'relative' }}>
                <img
                  src={settings.background_url}
                  alt="Background Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div style={{ position: 'absolute', bottom: '6px', left: '8px', background: 'rgba(0,0,0,0.65)', color: '#FFF', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem' }}>
                  {language === 'FR' ? 'Aperçu fond écran' : 'Background Preview'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* =========================================================
            SECTION 4: PASSERELLE VISITEUR MOBILE & QR CODE
            ========================================================= */}
        <div style={{ marginBottom: '1.5rem', background: 'rgba(37, 99, 235, 0.08)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <label className="form-label" style={{ marginBottom: 0, fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.98rem' }}>
              <Globe size={18} />
              <span>{language === 'FR' ? "Passerelle QR Code Mobile (Wi-Fi & Tunnel 4G/5G)" : 'Mobile QR Code Gateway (Wi-Fi & 4G/5G Tunnel)'}</span>
            </label>

            {settings.public_base_url && !settings.public_base_url.includes('api.trycloudflare.com') ? (
              <span className="badge badge-online" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '4px 10px' }}>
                <span className="status-dot online"></span>
                <span>{language === 'FR' ? 'Tunnel 4G/5G En Ligne' : '4G/5G Tunnel Online'}</span>
              </span>
            ) : (
              <span className="badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(59, 130, 246, 0.15)', color: '#2563EB', padding: '4px 10px' }}>
                <Wifi size={14} />
                <span>{language === 'FR' ? 'Réseau Wi-Fi Local' : 'Local Wi-Fi Network'}</span>
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Ex: https://...trycloudflare.com ou http://192.168.43.56:5173"
              value={settings.public_base_url || ''}
              onChange={e => setSettings({ ...settings, public_base_url: e.target.value })}
              style={{ flex: 1, minWidth: '240px', fontWeight: 600, color: 'var(--primary)' }}
            />

            {settings.public_base_url && !settings.public_base_url.includes('api.trycloudflare.com') ? (
              <a
                href={`${settings.public_base_url.trim().replace(/\/+$/, '')}/visitor`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap', padding: '0.6rem 1rem' }}
              >
                <ExternalLink size={16} />
                <span>{language === 'FR' ? 'Tester le lien public' : 'Test Public Link'}</span>
              </a>
            ) : (
              <a
                href={`${(settings.local_network_url || 'http://192.168.43.56:5173').trim().replace(/\/+$/, '')}/visitor`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap', padding: '0.6rem 1rem' }}
              >
                <ExternalLink size={16} />
                <span>{language === 'FR' ? 'Tester lien Wi-Fi' : 'Test Wi-Fi Link'}</span>
              </a>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              onClick={() => setSettings({ ...settings, public_base_url: settings.local_network_url || 'http://192.168.43.56:5173' })}
            >
              <Wifi size={14} />
              <span>{language === 'FR' ? "Définir l'URL Réseau Wi-Fi Local" : 'Set Local Wi-Fi Network URL'}</span>
            </button>

            <button
              type="button"
              className="btn-secondary"
              disabled={restartingTunnel}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              onClick={handleRestartTunnel}
            >
              <RefreshCw size={14} className={restartingTunnel ? 'animate-spin' : ''} />
              <span>{language === 'FR' ? 'Relancer le Tunnel Cloudflare' : 'Restart Cloudflare Tunnel'}</span>
            </button>

            {settings.public_base_url && (
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.7rem', color: '#EF4444' }}
                onClick={() => setSettings({ ...settings, public_base_url: '' })}
              >
                {language === 'FR' ? 'Effacer URL' : 'Clear URL'}
              </button>
            )}
          </div>

          {tunnelMsg && (
            <div style={{ marginTop: '0.6rem', fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600 }}>
              {tunnelMsg}
            </div>
          )}

          <div style={{ marginTop: '0.85rem', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            <p style={{ margin: '0 0 0.35rem 0' }}>
              💡 <strong>{language === 'FR' ? 'Fonctionnement de l’accès QR Code :' : 'How QR Code Access works:'}</strong>
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
              <li>
                <strong>{language === 'FR' ? 'Sur Réseau Wi-Fi Local / Hotspot :' : 'On Local Wi-Fi / Hotspot:'}</strong>{' '}
                {language === 'FR' 
                  ? `Tout visiteur connecté au Wi-Fi accède directement à ${settings.local_network_url || 'http://192.168.43.56:5173'}/visitor.`
                  : `Visitors connected to the local Wi-Fi can directly open ${settings.local_network_url || 'http://192.168.43.56:5173'}/visitor.`}
              </li>
              <li>
                <strong>{language === 'FR' ? 'Sur Réseau Mobile 4G/5G Personnel :' : 'On Personal Mobile 4G/5G Data:'}</strong>{' '}
                {language === 'FR' 
                  ? 'Le tunnel Cloudflare permet aux usagers de scanner le QR Code et d’accéder instantanément au guide visiteur depuis n’importe quel opérateur.'
                  : 'Cloudflare Tunnel allows mobile users to scan the QR Code from any carrier with 4G/5G data.'}
              </li>
            </ul>
          </div>
        </div>

        {/* =========================================================
            SECTION 5: GESTION AUTOMATIQUE DE L'ÉNERGIE
            ========================================================= */}
        <div className="admin-card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <Sun size={20} style={{ color: 'var(--primary)' }} />
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-dark)' }}>
                {language === 'FR' ? "Gestion Automatique de l'Énergie & Veille" : 'Automated Power Management & Standby'}
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {language === 'FR' 
                  ? "Définissez les plages horaires pour basculer automatiquement l'écran public en veille écologique." 
                  : 'Define scheduling hours to automatically toggle public display eco-standby.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1rem' }}>
            <div>
              <label className="form-label">
                {language === 'FR' ? "Heure d'Allumage" : 'Power ON Time'}
              </label>
              <input
                type="time"
                value={settings.power_on_time || '00:00'}
                onChange={e => setSettings({ ...settings, power_on_time: e.target.value })}
                style={{ width: '100%', fontSize: '1rem', fontWeight: 600 }}
              />
            </div>
            <div>
              <label className="form-label">
                {language === 'FR' ? "Heure d'Extinction" : 'Power OFF Time'}
              </label>
              <input
                type="time"
                value={settings.power_off_time || '23:59'}
                onChange={e => setSettings({ ...settings, power_off_time: e.target.value })}
                style={{ width: '100%', fontSize: '1rem', fontWeight: 600 }}
              />
            </div>
          </div>

          {/* Quick Schedule Presets */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {language === 'FR' ? 'Préréglages rapides :' : 'Quick Presets:'}
            </span>
            <button
              type="button"
              className="btn-secondary"
              style={{
                fontSize: '0.78rem',
                padding: '0.35rem 0.75rem',
                fontWeight: settings.power_on_time === '00:00' && settings.power_off_time === '23:59' ? 700 : 500,
                borderColor: settings.power_on_time === '00:00' && settings.power_off_time === '23:59' ? 'var(--primary)' : undefined,
                background: settings.power_on_time === '00:00' && settings.power_off_time === '23:59' ? 'var(--primary-light)' : undefined,
                color: settings.power_on_time === '00:00' && settings.power_off_time === '23:59' ? 'var(--primary)' : undefined
              }}
              onClick={() => setSettings({ ...settings, power_on_time: '00:00', power_off_time: '23:59' })}
            >
              ⚡ 24h / 24 (Toujours Allumé)
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{
                fontSize: '0.78rem',
                padding: '0.35rem 0.75rem',
                fontWeight: settings.power_on_time === '07:00' && settings.power_off_time === '18:00' ? 700 : 500,
                borderColor: settings.power_on_time === '07:00' && settings.power_off_time === '18:00' ? 'var(--primary)' : undefined,
                background: settings.power_on_time === '07:00' && settings.power_off_time === '18:00' ? 'var(--primary-light)' : undefined,
                color: settings.power_on_time === '07:00' && settings.power_off_time === '18:00' ? 'var(--primary)' : undefined
              }}
              onClick={() => setSettings({ ...settings, power_on_time: '07:00', power_off_time: '18:00' })}
            >
              🏢 Heures de Service (07:00 - 18:00)
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{
                fontSize: '0.78rem',
                padding: '0.35rem 0.75rem',
                fontWeight: settings.power_on_time === '06:00' && settings.power_off_time === '21:00' ? 700 : 500,
                borderColor: settings.power_on_time === '06:00' && settings.power_off_time === '21:00' ? 'var(--primary)' : undefined,
                background: settings.power_on_time === '06:00' && settings.power_off_time === '21:00' ? 'var(--primary-light)' : undefined,
                color: settings.power_on_time === '06:00' && settings.power_off_time === '21:00' ? 'var(--primary)' : undefined
              }}
              onClick={() => setSettings({ ...settings, power_on_time: '06:00', power_off_time: '21:00' })}
            >
              🌆 Journée Élargie (06:00 - 21:00)
            </button>
          </div>
        </div>

        {/* =========================================================
            ACTIONS BAR
            ========================================================= */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSaving}
            style={{ minWidth: '220px', padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
          >
            <Save size={18} />
            <span>
              {isSaving 
                ? (language === 'FR' ? 'Enregistrement en cours...' : 'Saving...') 
                : (language === 'FR' ? 'Enregistrer la Configuration' : 'Save Configuration')}
            </span>
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={handleResetDefaults}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.75rem 1.25rem' }}
          >
            <RotateCcw size={16} />
            <span>{language === 'FR' ? 'Restaurer Valeurs par Défaut' : 'Restore Defaults'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
