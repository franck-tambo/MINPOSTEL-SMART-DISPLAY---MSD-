import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import FlagBadge from './FlagBadge';
import { io } from 'socket.io-client';
import {
  Monitor,
  ExternalLink,
  Clock,
  LayoutDashboard,
  Megaphone,
  Calendar,
  PartyPopper,
  Newspaper,
  AlertTriangle,
  Building2,
  Tv,
  History,
  Settings,
  Sun,
  Moon
} from 'lucide-react';

export default function TopHeader() {
  const location = useLocation();
  const { language, toggleLanguage, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const [timeStr, setTimeStr] = useState('');
  const [screenStatus, setScreenStatus] = useState('CONNECTING'); // 'ONLINE', 'OFFLINE', 'CONNECTING'

  useEffect(() => {
    const socket = io('/', { path: '/socket.io' });
    
    socket.on('disconnect', () => {
      setScreenStatus('OFFLINE');
    });

    socket.on('DISPLAY_STATUS_UPDATE', (data) => {
      if (data.screenId === 'MINPOSTEL-MAIN-ENTRANCE-01' || !data.screenId) {
        setScreenStatus(data.status);
      }
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString(language === 'FR' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [language]);

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path.includes('/announcements')) return { label: t('announcements'), icon: Megaphone };
    if (path.includes('/meetings')) return { label: t('meetings'), icon: Calendar };
    if (path.includes('/events')) return { label: t('events'), icon: PartyPopper };
    if (path.includes('/communications')) return { label: t('communications'), icon: Newspaper };
    if (path.includes('/urgent-messages')) return { label: t('urgentMessages'), icon: AlertTriangle };
    if (path.includes('/locations')) return { label: t('locations'), icon: Building2 };
    if (path.includes('/display-preview')) return { label: t('displayPreview'), icon: Tv };
    if (path.includes('/activity-logs')) return { label: t('activityLogs'), icon: History };
    if (path.includes('/settings')) return { label: t('settings'), icon: Settings };
    return { label: t('dashboard'), icon: LayoutDashboard };
  };

  const breadcrumb = getBreadcrumb();
  const BreadcrumbIcon = breadcrumb.icon;

  return (
    <header style={{
      height: '60px',
      backgroundColor: 'var(--surface-card)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 90,
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Breadcrumb Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontWeight: 500 }}>MINPOSTEL Admin</span>
        <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>/</span>
        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <BreadcrumbIcon size={16} style={{ color: 'var(--primary)' }} />
          <span>{breadcrumb.label}</span>
        </div>
      </div>

      {/* Right System Indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        {/* Dark / Light Mode Switcher Button */}
        <button
          onClick={toggleTheme}
          title={isDark ? t('switchToLight') : t('switchToDark')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '5px 10px',
            backgroundColor: 'var(--surface-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '0.785rem',
            fontWeight: 600,
            color: 'var(--text-main)',
            transition: 'all 0.15s ease'
          }}
        >
          {isDark ? (
            <>
              <Sun size={14} style={{ color: '#F59E0B' }} />
              <span>{t('lightMode')}</span>
            </>
          ) : (
            <>
              <Moon size={14} style={{ color: 'var(--primary)' }} />
              <span>{t('darkMode')}</span>
            </>
          )}
        </button>

        {/* Language Switcher Button */}
        <button
          onClick={toggleLanguage}
          title={language === 'FR' ? 'Switch to English' : 'Passer en Français'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '5px 10px',
            backgroundColor: 'var(--surface-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '0.785rem',
            fontWeight: 600,
            color: 'var(--text-main)',
            transition: 'all 0.15s ease'
          }}
        >
          <FlagBadge lang={language} size="sm" />
          <span>{language}</span>
        </button>

        {/* Real-time Clock */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          fontWeight: 600,
          background: 'var(--surface-subtle)',
          border: '1px solid var(--border-subtle)',
          padding: '5px 10px',
          borderRadius: '20px'
        }}>
          <Clock size={13} style={{ color: 'var(--primary)' }} />
          <span>{timeStr}</span>
        </div>

        {/* Screen Status Badge */}
        <div className={`badge badge-${screenStatus.toLowerCase()}`}>
          <span className={`status-dot ${screenStatus.toLowerCase()}`}></span>
          <span>
            {screenStatus === 'ONLINE' ? t('screenStatusOnline') : 
             screenStatus === 'CONNECTING' ? t('screenStatusConnecting') : 
             t('screenStatusOffline')}
          </span>
        </div>

        {/* Launch Public Screen Link */}
        <a
          href="/display/MINPOSTEL-MAIN-ENTRANCE-01"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
          style={{
            padding: '6px 12px',
            fontSize: '0.8rem',
            textDecoration: 'none',
            borderRadius: '8px'
          }}
        >
          <Monitor size={14} />
          <span>{t('launchScreen')}</span>
          <ExternalLink size={12} />
        </a>
      </div>
    </header>
  );
}
