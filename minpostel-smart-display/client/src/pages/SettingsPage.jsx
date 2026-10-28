import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, Globe, Wifi, RefreshCw, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

import { getCached, setCached } from '../utils/apiCache';

export default function SettingsPage() {
  const { language, t } = useLanguage();
  const defaultSettings = {
    app_title: 'MINPOSTEL Smart Display',
    default_language: 'FR',
    rotation_duration_seconds: 10,
    language_cycle_seconds: 10,
    heartbeat_interval_seconds: 15,
    display_code: 'MINPOSTEL-MAIN-ENTRANCE-01',
    theme_color: '#134074',
    background_url: '',
    power_on_time: '07:00',
    power_off_time: '18:00'
  };
  const [settings, setSettings] = useState(() => getCached('settings') || defaultSettings);
  const [saved, setSaved] = useState(false);
  const [restartingTunnel, setRestartingTunnel] = useState(false);
  const [tunnelMsg, setTunnelMsg] = useState(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => {
        if (d.status === 'success' && d.data) {
          setSettings(d.data);
          setCached('settings', d.data);
        }
      });
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    }).then(() => {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  };

  const handleRestartTunnel = async () => {
    setRestartingTunnel(true);
    setTunnelMsg(null);
    try {
      const res = await fetch('/api/settings/tunnel/restart', { method: 'POST' });
      if (res.ok) {
        setTunnelMsg(language === 'FR' ? 'Relance du tunnel Cloudflare initiée... Patientez quelques secondes.' : 'Cloudflare Tunnel restart initiated... Please wait a few seconds.');
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
    <div className="page-container" style={{ maxWidth: '840px' }}>
      <div className="page-header-container">
        <div>
          <h2 className="page-title">
            <Settings size={22} style={{ color: 'var(--primary)' }} />
            <span>{language === 'FR' ? 'Paramètres Globaux du Système' : 'System Global Settings'}</span>
          </h2>
          <p className="page-subtitle">
            {language === 'FR' ? "Configuration des cycles d'affichage, temporisations et identifiants d'écrans." : 'Configuration of display cycles, timeouts, and screen identifiers.'}
          </p>
        </div>
      </div>

      {saved && (
        <div style={{
          padding: '12px 18px',
          backgroundColor: 'var(--status-online)',
          color: '#FFFFFF',
          borderRadius: 'var(--radius-sm)',
          fontWeight: 600,
          fontSize: '0.875rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: 'var(--shadow-md)'
        }}>
          <CheckCircle2 size={18} />
          <span>{language === 'FR' ? 'Paramètres sauvegardés avec succès !' : 'Settings saved successfully!'}</span>
        </div>
      )}

      <div className="admin-card" style={{ padding: '1.75rem' }}>
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.1rem', marginBottom: '1.25rem' }}>
            <div>
              <label className="form-label">
                {language === 'FR' ? "Nom de l'application" : 'Application Name'}
              </label>
              <input
                type="text"
                value={settings.app_title}
                onChange={e => setSettings({ ...settings, app_title: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label className="form-label">
                {language === 'FR' ? 'Identifiant Écran Principal' : 'Main Screen ID'}
              </label>
              <input
                type="text"
                value={settings.display_code}
                onChange={e => setSettings({ ...settings, display_code: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label className="form-label">
                {language === 'FR' ? 'Durée Diapositive (Secondes)' : 'Slide Duration (Seconds)'}
              </label>
              <input
                type="number"
                value={settings.rotation_duration_seconds}
                onChange={e => setSettings({ ...settings, rotation_duration_seconds: parseInt(e.target.value) || 10 })}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label className="form-label">
                {language === 'FR' ? 'Intervalle Heartbeat Ping (Sec)' : 'Heartbeat Ping Interval (Sec)'}
              </label>
              <input
                type="number"
                value={settings.heartbeat_interval_seconds}
                onChange={e => setSettings({ ...settings, heartbeat_interval_seconds: parseInt(e.target.value) || 15 })}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Public Base URL for Mobile QR Access */}
          <div style={{ marginBottom: '1.25rem', background: 'rgba(37, 99, 235, 0.08)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <label className="form-label" style={{ marginBottom: 0, fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Globe size={18} />
                <span>{language === 'FR' ? "URL d'accès pour les QR Codes Mobiles" : 'Mobile QR Code Access URL'}</span>
              </label>

              {settings.public_base_url && !settings.public_base_url.includes('api.trycloudflare.com') ? (
                <span className="badge badge-online" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span className="status-dot online"></span>
                  <span>{language === 'FR' ? 'Tunnel 4G/5G Actif' : '4G/5G Tunnel Active'}</span>
                </span>
              ) : (
                <span className="badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(59, 130, 246, 0.15)', color: '#2563eb' }}>
                  <Wifi size={14} />
                  <span>{language === 'FR' ? 'Mode Réseau Local Wi-Fi' : 'Local Wi-Fi Network Mode'}</span>
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Ex: https://...trycloudflare.com ou http://192.168.100.64:5173"
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
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap', padding: '0 1rem' }}
                >
                  <ExternalLink size={16} />
                  <span>{language === 'FR' ? 'Tester le lien public' : 'Test Public Link'}</span>
                </a>
              ) : (
                <a
                  href={`${(settings.local_network_url || 'http://192.168.100.64:5173').trim().replace(/\/+$/, '')}/visitor`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap', padding: '0 1rem' }}
                >
                  <ExternalLink size={16} />
                  <span>{language === 'FR' ? 'Tester lien Wi-Fi' : 'Test Wi-Fi Link'}</span>
                </a>
              )}
            </div>

            {/* Quick action buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                onClick={() => setSettings({ ...settings, public_base_url: settings.local_network_url || 'http://192.168.100.64:5173' })}
              >
                <Wifi size={14} />
                <span>{language === 'FR' ? "Définir l'URL Réseau Wi-Fi Local" : 'Set Local Wi-Fi Network URL'}</span>
              </button>

              <button
                type="button"
                className="btn-secondary"
                disabled={restartingTunnel}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                onClick={handleRestartTunnel}
              >
                <RefreshCw size={14} className={restartingTunnel ? 'animate-spin' : ''} />
                <span>{language === 'FR' ? 'Relancer le Tunnel Cloudflare' : 'Restart Cloudflare Tunnel'}</span>
              </button>

              {settings.public_base_url && (
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem', color: '#ef4444' }}
                  onClick={() => setSettings({ ...settings, public_base_url: '' })}
                >
                  {language === 'FR' ? 'Réinitialiser' : 'Reset'}
                </button>
              )}
            </div>

            {tunnelMsg && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 500 }}>
                {tunnelMsg}
              </div>
            )}

            <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              <p style={{ margin: '0 0 0.35rem 0' }}>
                💡 <strong>{language === 'FR' ? 'Comment ça fonctionne :' : 'How it works:'}</strong>
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                <li>
                  <strong>{language === 'FR' ? 'Sur Réseau Wi-Fi / Hotspot :' : 'On Wi-Fi / Hotspot:'}</strong>{' '}
                  {language === 'FR' 
                    ? `Tout téléphone ou tablette connecté au même réseau accède à ${settings.local_network_url || 'http://192.168.100.64:5173'}/visitor (100% stable, aucun quota internet).`
                    : `Any phone on the same network accesses ${settings.local_network_url || 'http://192.168.100.64:5173'}/visitor (100% reliable, no internet limits).`}
                </li>
                <li>
                  <strong>{language === 'FR' ? 'Sur Données Cellulaires (4G/5G) :' : 'On Mobile Data (4G/5G):'}</strong>{' '}
                  {language === 'FR'
                    ? 'Le tunnel Cloudflare attribue automatiquement une URL HTTPS sécurisée. (Si Cloudflare est en période de refroidissement temporaire, les téléphones peuvent se connecter directement via le Wi-Fi local).'
                    : 'Cloudflare Tunnel automatically provisions a secure HTTPS URL. (If Cloudflare is cooling down from rate limits, mobile users can connect via the local Wi-Fi).'}
                </li>
              </ul>
            </div>
          </div>

          {/* Display Background (Optional) */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">
              {language === 'FR' ? "Image de Fond de l'Écran Public (Optionnel)" : 'Public Screen Background Image (Optional)'}
            </label>
            <input
              type="text"
              placeholder="Ex: https://..."
              value={settings.background_url || ''}
              onChange={e => setSettings({ ...settings, background_url: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          {/* Power Management Section */}
          <div className="form-section" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.75rem' }}>
              {language === 'FR' ? "Gestion Automatique de l'Énergie" : 'Automated Power Management'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label className="form-label">
                  {language === 'FR' ? "Heure d'Allumage" : 'Power ON Time'}
                </label>
                <input
                  type="time"
                  value={settings.power_on_time}
                  onChange={e => setSettings({ ...settings, power_on_time: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label className="form-label">
                  {language === 'FR' ? "Heure d'Extinction" : 'Power OFF Time'}
                </label>
                <input
                  type="time"
                  value={settings.power_off_time}
                  onChange={e => setSettings({ ...settings, power_off_time: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
          >
            <Save size={16} />
            <span>{language === 'FR' ? 'Enregistrer la Configuration' : 'Save Configuration'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
