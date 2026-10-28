import React, { useState, useEffect } from 'react';
import DashboardCard from '../components/DashboardCard';
import { useLanguage } from '../context/LanguageContext';
import {
  Megaphone,
  Calendar,
  PartyPopper,
  AlertTriangle,
  Newspaper,
  Tv,
  Plus,
  Clock,
  MapPin,
  CheckCircle2,
  History,
  ArrowRight,
  ExternalLink,
  Layers,
  Radio,
  Building2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import FlagBadge from '../components/FlagBadge';

import { getCached, setCached } from '../utils/apiCache';
import { isItemExpired, getItemComputedStatus, getStatusLabel } from '../utils/expiration.util';

export default function DashboardOverview() {
  const { language, t } = useLanguage();

  const [announcements, setAnnouncements] = useState(() => getCached('announcements') || []);
  const [meetings, setMeetings] = useState(() => getCached('meetings') || []);
  const [locations, setLocations] = useState(() => getCached('locations') || { buildings: [], rooms: [] });
  const [currentTime, setCurrentTime] = useState(() => new Date());

  // Clock ticker to auto-update computed status
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 5000);
    return () => clearInterval(timer);
  }, []);
  const [events, setEvents] = useState(() => getCached('events') || []);
  const [comms, setComms] = useState(() => getCached('communications') || []);
  const [urgentMessages, setUrgentMessages] = useState(() => getCached('urgent-messages') || []);
  const [analytics, setAnalytics] = useState(() => getCached('analytics') || null);
  const [loading, setLoading] = useState(() => !getCached('announcements'));

  useEffect(() => {
    Promise.all([
      fetch('/api/announcements').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/meetings').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/events').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/communications').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/urgent-messages').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/locations').then(r => r.json()).catch(() => ({ data: null })),
      fetch('/api/analytics', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('msd_auth_token')}` }
      }).then(r => r.json()).catch(() => ({ data: null }))
    ]).then(([a, m, e, c, u, loc, an]) => {
      if (a.status === 'success' && a.data) { setAnnouncements(a.data); setCached('announcements', a.data); }
      if (m.status === 'success' && m.data) { setMeetings(m.data); setCached('meetings', m.data); }
      if (e.status === 'success' && e.data) { setEvents(e.data); setCached('events', e.data); }
      if (c.status === 'success' && c.data) { setComms(c.data); setCached('communications', c.data); }
      if (u.status === 'success' && u.data) { setUrgentMessages(u.data); setCached('urgent-messages', u.data); }
      if (loc?.status === 'success' && loc.data) { setLocations(loc.data); setCached('locations', loc.data); }
      if (an?.status === 'success' && an.data) { setAnalytics(an.data); setCached('analytics', an.data); }
      setLoading(false);
    });
  }, []);

  const activeUrgentCount = urgentMessages.filter(u => u.status === 'ACTIVE').length;

  return (
    <div className="page-container">
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.75rem 2rem',
        color: '#FFFFFF',
        marginBottom: '2rem',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1.25rem'
      }}>
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '3px 10px', backgroundColor: 'rgba(37, 99, 235, 0.2)', borderRadius: 'var(--radius-full)', border: '1px solid rgba(59, 130, 246, 0.3)', marginBottom: '0.5rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#60A5FA' }}></span>
            <span style={{ fontSize: '0.725rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#93C5FD', fontWeight: 700 }}>
              {t('welcomeBadge')}
            </span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.1rem', marginBottom: '0.35rem', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            {t('welcomeTitle')}
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#94A3B8', lineHeight: 1.5 }}>
            {t('welcomeDesc')}
          </p>
        </div>

        {/* Quick Action Button Group */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
          <Link
            to="/dashboard/meetings"
            className="btn-primary"
            style={{ textDecoration: 'none' }}
          >
            <Plus size={16} />
            <span>{t('btnScheduleMeeting')}</span>
          </Link>

          <Link
            to="/dashboard/communications"
            style={{
              padding: '9px 16px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.15s ease'
            }}
          >
            <Newspaper size={16} />
            <span>{t('btnNewCommunication')}</span>
          </Link>

          <Link
            to="/dashboard/urgent-messages"
            style={{
              padding: '9px 16px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#F87171',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.15s ease'
            }}
          >
            <AlertTriangle size={16} />
            <span>{t('btnUrgentAlert')}</span>
          </Link>
        </div>
      </div>

      {/* Grid Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        <DashboardCard
          title={t('activeAnnouncements')}
          count={announcements.length.toString()}
          subtitle={t('activeAnnouncementsSub')}
          icon={Megaphone}
          accentColor="#2563EB"
        />
        <DashboardCard
          title={t('upcomingMeetings')}
          count={meetings.length.toString()}
          subtitle={t('upcomingMeetingsSub')}
          icon={Calendar}
          accentColor="#10B981"
        />
        <DashboardCard
          title={t('todayEvents')}
          count={events.length.toString()}
          subtitle={t('todayEventsSub')}
          icon={PartyPopper}
          accentColor="#8B5CF6"
        />
        <DashboardCard
          title={t('totalCommunications')}
          count={comms.length.toString()}
          subtitle={t('totalCommunicationsSub')}
          icon={Newspaper}
          accentColor="#2563EB"
        />
        <DashboardCard
          title={t('activeUrgent')}
          count={activeUrgentCount.toString()}
          subtitle={activeUrgentCount > 0 ? `${activeUrgentCount} ${language === 'FR' ? 'alerte(s)' : 'alert(s)'}` : t('activeUrgentSub')}
          icon={AlertTriangle}
          accentColor={activeUrgentCount > 0 ? "#EF4444" : "#64748B"}
        />
        <DashboardCard
          title={t('screenHealth')}
          count={`${analytics?.uptime?.percentage || 99.8}%`}
          subtitle={language === 'FR' ? 'Disponibilité du système' : 'System uptime'}
          icon={Tv}
          accentColor="#10B981"
        />
        <DashboardCard
          title={language === 'FR' ? 'Bâtiments' : 'Buildings'}
          count={(locations?.buildings?.length || 2).toString()}
          subtitle={`${locations?.rooms?.length || 8} ${language === 'FR' ? 'salles & amphis' : 'rooms & halls'}`}
          icon={Building2}
          accentColor="#0EA5E9"
        />
        <DashboardCard
          title={language === 'FR' ? 'Scans QR (Auj.)' : 'QR Scans (Today)'}
          count={analytics?.scans?.today?.toString() || '0'}
          subtitle={language === 'FR' ? `Total global : ${analytics?.scans?.total || 0}` : `Global total: ${analytics?.scans?.total || 0}`}
          icon={CheckCircle2}
          accentColor="#6366F1"
        />
      </div>

      {/* Two Column Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Left Column: Meetings & Events */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Meetings Widget */}
          <div className="admin-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={18} style={{ color: 'var(--primary)' }} />
                  <span>{t('todayMeetingsOnScreen')}</span>
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {language === 'FR' ? 'Statut calculé automatiquement en temps réel' : 'Real-time computed status'}
                </p>
              </div>
              <Link to="/dashboard/meetings" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                {t('seeAll')} →
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {meetings.slice(0, 3).map((m) => {
                const computedStatus = getItemComputedStatus(m, currentTime);
                return (
                <div key={m.id} style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--surface-subtle)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span className="badge badge-subtle-blue">
                        {m.priority}
                      </span>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>
                        {language === 'FR' ? m.title_fr : m.title_en}
                      </h4>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                      {language === 'FR' ? m.title_en : m.title_fr}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', fontSize: '0.785rem', color: 'var(--text-dim)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={13} style={{ color: 'var(--primary)' }} />
                        {m.start_time} - {m.end_time}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <MapPin size={13} style={{ color: 'var(--text-muted)' }} />
                        {language === 'FR' ? m.room_fr : m.room_en} ({language === 'FR' ? m.floor_fr : m.floor_en})
                      </span>
                    </div>
                  </div>

                  <span className={`badge ${computedStatus === 'COMPLETED' ? 'badge-subtle-green' : (m.status === 'IN_PROGRESS' ? 'badge-online' : 'badge-subtle-blue')}`}>
                    <span className={`status-dot ${computedStatus === 'COMPLETED' ? 'online' : (m.status === 'IN_PROGRESS' ? 'online' : 'connecting')}`}></span>
                    {getStatusLabel(computedStatus, language)}
                  </span>
                </div>
              );
              })}

              {meetings.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '1.5rem 0', fontSize: '0.85rem' }}>
                  {t('noData')}
                </p>
              )}
            </div>
          </div>

          {/* Active Announcements Widget */}
          <div className="admin-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Megaphone size={18} style={{ color: 'var(--primary)' }} />
                  <span>{t('activeAnnouncementsWidget')}</span>
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {language === 'FR' ? 'Actuellement intégrées à la boucle bilingue' : 'Currently active in bilingual loop'}
                </p>
              </div>
              <Link to="/dashboard/announcements" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                {t('seeAll')} →
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {announcements.slice(0, 3).map((a) => (
                <div key={a.id} style={{
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--surface-subtle)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-dark)' }}>
                      {language === 'FR' ? a.title_fr : a.title_en}
                    </h4>
                    <p style={{ fontSize: '0.775rem', color: 'var(--text-dim)' }}>
                      {a.start_date?.split('T')[0]} → {a.end_date?.split('T')[0]}
                    </p>
                  </div>
                  <span className="badge badge-subtle-green">
                    {a.status}
                  </span>
                </div>
              ))}

              {announcements.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '1rem 0', fontSize: '0.85rem' }}>
                  {t('noData')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Status & System Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Display Health Widget */}
          <div className="admin-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Tv size={18} style={{ color: 'var(--primary)' }} />
                <span>{language === 'FR' ? "Moniteur d'Écran Physique" : 'Physical Kiosk Monitor'}</span>
              </h3>
              <span className="badge badge-online">
                <span className="status-dot online"></span>
                LIVE
              </span>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              {language === 'FR' ? 'Écran de Réception (Entrée Principale MINPOSTEL)' : 'Lobby Display (MINPOSTEL Main Entrance)'}
            </p>

            <div style={{
              padding: '1rem',
              backgroundColor: 'var(--surface-subtle)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
              fontSize: '0.825rem',
              marginBottom: '1.25rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>{language === 'FR' ? 'Identifiant :' : 'Screen ID:'}</span>
                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>MINPOSTEL-MAIN-01</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>{language === 'FR' ? 'Mode de rotation :' : 'Rotation Mode:'}</span>
                <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>Bilingue (FR / EN)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>{language === 'FR' ? 'Durée diapositive :' : 'Slide Duration:'}</span>
                <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>10 {language === 'FR' ? 'secondes' : 'seconds'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>{language === 'FR' ? 'Statut Socket :' : 'Socket Status:'}</span>
                <span style={{ fontWeight: 600, color: '#10B981' }}>{language === 'FR' ? 'Connecté (Temps Réel)' : 'Connected (Real-Time)'}</span>
              </div>
            </div>

            <Link
              to="/dashboard/display-preview"
              className="btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                textDecoration: 'none'
              }}
            >
              <ExternalLink size={16} />
              <span>{t('openKioskPreview')}</span>
            </Link>
          </div>

          {/* Activity Log Mini Feed */}
          <div className="admin-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <History size={18} style={{ color: 'var(--primary)' }} />
                <span>{language === 'FR' ? 'Dernières Actions' : 'Recent Activities'}</span>
              </h3>
              <Link to="/dashboard/activity-logs" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                {language === 'FR' ? 'Journal complet' : 'Full log'} →
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.825rem' }}>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <CheckCircle2 size={16} style={{ color: '#10B981', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <p style={{ color: 'var(--text-dark)', fontWeight: 600 }}>
                    {language === 'FR' ? 'Publication Réunion Cabinet' : 'Cabinet Meeting Broadcasted'}
                  </p>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                    {language === 'FR' ? 'Par Admin • Il y a 12 min' : 'By Admin • 12 mins ago'}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <p style={{ color: 'var(--text-dark)', fontWeight: 600 }}>
                    {language === 'FR' ? 'Connexion Administrateur' : 'Administrator Signed In'}
                  </p>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                    IP 127.0.0.1 • {language === 'FR' ? 'Il y a 25 min' : '25 mins ago'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
