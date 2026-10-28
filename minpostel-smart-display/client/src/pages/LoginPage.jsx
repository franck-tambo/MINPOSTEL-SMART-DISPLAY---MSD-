import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CameroonEmblem from '../components/CameroonEmblem';
import FlagBadge from '../components/FlagBadge';
import {
  Shield,
  Lock,
  User,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Clock,
  ArrowRight,
  Monitor,
  Radio,
  Layers,
  Globe,
  KeyRound
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import '../styles/LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { language: lang, setLanguage, toggleLanguage } = useLanguage();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [timeStr, setTimeStr] = useState('');

  // Live Yaoundé/Cameroon Clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Redirect if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError(
        lang === 'FR'
          ? 'Veuillez saisir votre identifiant et votre mot de passe.'
          : 'Please enter your username and password.'
      );
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await login(username.trim(), password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 350);
    } catch (err) {
      setError(err.message || (lang === 'FR' ? 'Identifiants invalides.' : 'Invalid credentials.'));
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page-root">
      {/* BACKGROUND DECORATIVE GLOWS */}
      <div className="login-bg-glow-1" />
      <div className="login-bg-glow-2" />

      {/* ========================================================================= */}
      {/* LEFT SHOWCASE PANEL (INSTITUTIONAL IDENTITY & SYSTEM OVERVIEW)             */}
      {/* ========================================================================= */}
      <div className="login-left-panel">
        <div>
          {/* Official Ministry Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.4rem', marginBottom: '1.5rem' }}>

            {/* MINPOSTEL Official Logo — Rectangular, fully visible, professional */}
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '12px',
                backgroundColor: '#FFFFFF',
                border: '2px solid #D4AF37',
                boxShadow: '0 0 0 4px rgba(212,175,55,0.12), 0 8px 24px rgba(0,0,0,0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px',
                flexShrink: 0,
                overflow: 'hidden',
              }}
            >
              <CameroonEmblem
                size={68}
                hasBorder={false}
                shape="square"
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '7px',
                  boxShadow: 'none',
                  border: 'none',
                  padding: 0,
                  backgroundColor: '#FFFFFF',
                }}
              />
            </div>

            <div>
              <div
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  color: '#D4AF37',
                  textTransform: 'uppercase'
                }}
              >
                {lang === 'FR' ? 'RÉPUBLIQUE DU CAMEROUN' : 'REPUBLIC OF CAMEROON'}
              </div>
              <div style={{ fontSize: '0.725rem', color: '#94A3B8', fontStyle: 'italic', letterSpacing: '0.03em' }}>
                {lang === 'FR' ? 'Paix — Travail — Patrie' : 'Peace — Work — Fatherland'}
              </div>
              <div
                style={{
                  fontSize: '0.925rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  marginTop: '0.25rem',
                  letterSpacing: '0.01em'
                }}
              >
                {lang === 'FR' ? 'MINISTÈRE DES POSTES ET TÉLÉCOMMUNICATIONS' : 'MINISTRY OF POSTS AND TELECOMMUNICATIONS'}
              </div>
            </div>
          </div>

          <div
            style={{
              height: '1px',
              width: '100%',
              background: 'linear-gradient(90deg, rgba(212, 175, 55, 0.5) 0%, rgba(255, 255, 255, 0.05) 100%)',
              margin: '1.5rem 0 2rem 0'
            }}
          />

          {/* PROJECT PRESENTATION */}
          <div style={{ maxWidth: '520px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '5px 12px',
                borderRadius: '20px',
                backgroundColor: 'rgba(38, 96, 164, 0.3)',
                border: '1px solid rgba(62, 130, 198, 0.4)',
                color: '#38BDF8',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '1rem'
              }}
            >
              <Monitor size={14} />
              {lang === 'FR' ? "Système Central d'Affichage Dynamique" : 'Central Digital Signage System'}
            </span>

            <h1
              style={{
                fontSize: '2.3rem',
                fontWeight: 800,
                lineHeight: 1.2,
                color: '#FFFFFF',
                marginBottom: '1rem'
              }}
            >
              MINPOSTEL <span style={{ color: '#D4AF37' }}>Smart Display</span>
            </h1>

            <p style={{ fontSize: '0.95rem', color: '#94A3B8', lineHeight: 1.6, marginBottom: '2rem' }}>
              {lang === 'FR'
                ? "Système centralisé de gestion et d'affichage en temps réel pour les écrans de MINPOSTEL."
                : 'Centralized real-time management and digital signage system for MINPOSTEL screens.'}
            </p>

            {/* KEY FEATURES LIST */}
            <div className="login-left-features" style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#60A5FA',
                    flexShrink: 0
                  }}
                >
                  <Globe size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#F1F5F9' }}>
                    {lang === 'FR' ? 'Affichage Bilingue Automatique' : 'Automated Bilingual Display'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    {lang === 'FR' ? 'Alternance cyclique Français et Anglais' : 'Cyclic alternation between French and English'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#34D399',
                    flexShrink: 0
                  }}
                >
                  <Radio size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#F1F5F9' }}>
                    {lang === 'FR' ? 'Synchronisation Instantanée (Socket.IO)' : 'Real-time WebSocket Synchronization'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    {lang === 'FR' ? 'Diffusion immédiate sans rechargement' : 'Immediate broadcast without page reload'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(212, 175, 55, 0.15)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#D4AF37',
                    flexShrink: 0
                  }}
                >
                  <Layers size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#F1F5F9' }}>
                    {lang === 'FR' ? 'Gestion Spatiale des Salles et Réunions' : 'Spatial Room & Meeting Management'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    {lang === 'FR' ? 'Orientation bâtiment, étage et salle avec QR Code' : 'Building, floor and room orientation with QR Code'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM TELEMETRY BAR */}
        <div className="login-telemetry-box" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.15rem 1.5rem',
          borderRadius: '14px',
          backgroundColor: 'rgba(7, 13, 25, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          marginTop: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                boxShadow: '0 0 10px #10B981'
              }}
            />
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#E2E8F0' }}>
              {lang === 'FR' ? 'Système Opérationnel' : 'System Operational'}
            </span>
            <span style={{ color: '#475569' }}>•</span>
            <span style={{ fontSize: '0.775rem', color: '#94A3B8' }}>
              Portail V1
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#CBD5E1', fontSize: '0.825rem' }}>
            <Clock size={15} style={{ color: '#38BDF8' }} />
            <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{timeStr || '14:30:00'} WAT</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT AUTHENTICATION PANEL                                                */}
      {/* ========================================================================= */}
      <div className="login-right-panel">
        {/* TOP LANGUAGE TOGGLE BUTTON */}
        <div className="login-lang-btn-top" style={{ position: 'absolute', top: '2rem', right: '2.5rem' }}>
          <button
            type="button"
            onClick={toggleLanguage}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#F1F5F9',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.825rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease'
            }}
          >
            <FlagBadge lang={lang} size="sm" />
            <span>{lang === 'FR' ? 'Basculer en English' : 'Switch to Français'}</span>
          </button>
        </div>

        {/* AUTHENTICATION CARD */}
        <div className="login-card">
          {/* CARD HEADER */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(38, 96, 164, 0.4) 0%, rgba(11, 37, 69, 0.8) 100%)',
                border: '1px solid rgba(62, 130, 198, 0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38BDF8',
                marginBottom: '1rem',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)'
              }}
            >
              <Shield size={26} />
            </div>

            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.35rem' }}>
              {lang === 'FR' ? 'Espace Sécurisé' : 'Secure Admin Portal'}
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#94A3B8' }}>
              {lang === 'FR'
                ? 'Authentification requise pour administrer les diffusions'
                : 'Authentication required to manage ministry signage'}
            </p>
          </div>

          {/* ALERT MESSAGES */}
          {error && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: '#F87171',
                fontSize: '0.85rem',
                marginBottom: '1.5rem'
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: '#34D399',
                fontSize: '0.85rem',
                marginBottom: '1.5rem'
              }}
            >
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <span>{lang === 'FR' ? 'Connexion réussie ! Chargement...' : 'Login successful! Loading dashboard...'}</span>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit}>
            {/* USERNAME FIELD */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  color: '#CBD5E1',
                  marginBottom: '0.5rem'
                }}
              >
                {lang === 'FR' ? "Identifiant administrateur" : 'Administrator username'}
              </label>
              <div className="login-input-group">
                <div className="login-input-icon-left">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={lang === 'FR' ? 'Saisir votre identifiant' : 'Enter your username'}
                  required
                  autoComplete="username"
                  className="login-input"
                />
              </div>
            </div>

            {/* PASSWORD FIELD */}
            <div style={{ marginBottom: '1.75rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  color: '#CBD5E1',
                  marginBottom: '0.5rem'
                }}
              >
                {lang === 'FR' ? 'Mot de passe' : 'Password'}
              </label>
              <div className="login-input-group">
                <div className="login-input-icon-left">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                  className="login-input login-input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="login-input-btn-right"
                  title={showPassword ? (lang === 'FR' ? 'Masquer' : 'Hide') : (lang === 'FR' ? 'Afficher' : 'Show')}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={submitting || success}
              className="login-btn-submit"
              style={{
                opacity: submitting || success ? 0.75 : 1
              }}
            >
              <span>
                {submitting
                  ? lang === 'FR'
                    ? 'Authentification en cours...'
                    : 'Signing in...'
                  : lang === 'FR'
                  ? 'Se Connecter'
                  : 'Sign In'}
              </span>
              {!submitting && <ArrowRight size={18} />}
            </button>
          </form>

          {/* CARD FOOTER */}
          <div
            style={{
              marginTop: '2rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              textAlign: 'center',
              fontSize: '0.75rem',
              color: '#64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <Lock size={13} style={{ color: '#10B981' }} />
            <span>
              {lang === 'FR'
                ? 'Connexion chiffrée SSL • Accès restreint au personnel habilité'
                : 'SSL encrypted connection • Authorized personnel only'}
            </span>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT */}
        <div style={{ marginTop: '2rem', fontSize: '0.75rem', color: '#475569', textAlign: 'center' }}>
          {lang === 'FR'
            ? '© 2026 MINPOSTEL — République du Cameroun. Tous droits réservés.'
            : '© 2026 MINPOSTEL — Republic of Cameroon. All rights reserved.'}
        </div>
      </div>
    </div>
  );
}
