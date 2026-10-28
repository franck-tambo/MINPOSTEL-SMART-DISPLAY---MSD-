import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
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
  LogOut,
  UserCheck
} from 'lucide-react';

import CameroonEmblem from './CameroonEmblem';
import { prefetchApi } from '../utils/apiCache';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const navItems = [
    { path: '/dashboard', label: t('dashboard'), icon: LayoutDashboard, api: 'announcements' },
    { path: '/dashboard/announcements', label: t('announcements'), icon: Megaphone, api: 'announcements' },
    { path: '/dashboard/meetings', label: t('meetings'), icon: Calendar, api: 'meetings' },
    { path: '/dashboard/events', label: t('events'), icon: PartyPopper, api: 'events' },
    { path: '/dashboard/communications', label: t('communications'), icon: Newspaper, api: 'communications' },
    { path: '/dashboard/urgent-messages', label: t('urgentMessages'), icon: AlertTriangle, hasAlert: true, api: 'urgent-messages' },
    { path: '/dashboard/locations', label: t('locations'), icon: Building2, api: 'locations' },
    { path: '/dashboard/display-preview', label: t('displayPreview'), icon: Tv },
    { path: '/dashboard/activity-logs', label: t('activityLogs'), icon: History, api: 'logs' },
    { path: '/dashboard/settings', label: t('settings'), icon: Settings, api: 'settings' }
  ];

  // Silently pre-warm critical tabs in the background on layout mount
  React.useEffect(() => {
    ['announcements', 'meetings', 'events', 'communications', 'locations'].forEach(ep => {
      prefetchApi(ep);
    });
  }, []);

  return (
    <aside style={{
      width: '260px',
      height: '100vh',
      backgroundColor: '#0A1120',
      color: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100,
      borderRight: '1px solid #1E2D47'
    }}>
      {/* Institutional Brand Header */}
      <div style={{
        padding: '1.25rem 1.25rem',
        borderBottom: '1px solid #1E2D47',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <CameroonEmblem size={32} />
        </div>
        <div>
          <h1 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#F8FAFC', letterSpacing: '0.04em', lineHeight: 1.2 }}>
            MINPOSTEL
          </h1>
          <p style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 500 }}>
            Smart Display System
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{
        flex: 1,
        padding: '0.85rem 0.65rem',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.2rem'
      }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              onMouseEnter={() => item.api && prefetchApi(item.api)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                color: isActive ? '#FFFFFF' : '#94A3B8',
                backgroundColor: isActive ? '#1E293B' : 'transparent',
                borderLeft: isActive ? '3px solid var(--primary, #2563EB)' : '3px solid transparent',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: isActive ? 600 : 500,
                transition: 'all 0.15s ease'
              })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Icon size={17} style={{ opacity: 0.9 }} />
                <span>{item.label}</span>
              </div>
              {item.hasAlert && (
                <span
                  title="Alertes actives"
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: '#EF4444',
                    flexShrink: 0
                  }}
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom User Profile Section */}
      <div style={{
        padding: '0.85rem 1rem',
        borderTop: '1px solid #1E2D47',
        backgroundColor: '#070D18'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '0.75rem'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#1E293B',
            border: '1px solid #334155',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#60A5FA'
          }}>
            <UserCheck size={16} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#F8FAFC', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user?.full_name || 'Admin MINPOSTEL'}
            </p>
            <p style={{ fontSize: '0.675rem', color: '#94A3B8', fontWeight: 500 }}>
              {user?.role_name || t('superAdminRole')}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
            padding: '7px',
            backgroundColor: 'transparent',
            border: '1px solid #334155',
            borderRadius: '6px',
            color: '#94A3B8',
            fontSize: '0.785rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
            e.currentTarget.style.color = '#F87171';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = '#334155';
            e.currentTarget.style.color = '#94A3B8';
          }}
        >
          <LogOut size={14} />
          <span>{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
}
