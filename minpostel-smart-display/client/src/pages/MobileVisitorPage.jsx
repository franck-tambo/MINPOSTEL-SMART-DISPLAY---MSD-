import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import { 
  MapPin, Clock, Users, Building, Compass, CheckCircle, 
  Calendar, ArrowRight, ShieldCheck, Phone, Navigation, 
  Share2, Download, Wifi, Info, Search, Sparkles, ChevronRight,
  RotateCw, RefreshCw, Zap
} from 'lucide-react';
import CameroonEmblem from '../components/CameroonEmblem';
import FlagBadge from '../components/FlagBadge';
import { isItemExpired, isItemStarted, getItemComputedStatus, formatDisplayDate, getItemDateLabel } from '../utils/expiration.util';
import '../styles/MobileVisitor.css';

export default function MobileVisitorPage() {
  const { id } = useParams();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState(null);
  const [allMeetings, setAllMeetings] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'navigate' | 'schedule' | 'services'
  const [lang, setLang] = useState('FR');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSyncToast, setShowSyncToast] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedWifi, setCopiedWifi] = useState(false);
  const [loadingStepText, setLoadingStepText] = useState('Connexion au réseau MINPOSTEL...');
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [isRequestedItemExpired, setIsRequestedItemExpired] = useState(false);

  // 10-Hour Visitor Mobile Pass State
  const [visitorPass, setVisitorPass] = useState(() => {
    try {
      const TEN_HOURS_MS = 10 * 60 * 60 * 1000;
      const stored = localStorage.getItem('minpostel_visitor_pass_v1');
      const now = Date.now();
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.expiresAt && now > parsed.expiresAt) {
          return { expired: true, expiresAt: parsed.expiresAt };
        }
        return { expired: false, expiresAt: parsed.expiresAt };
      } else {
        const expiresAt = now + TEN_HOURS_MS;
        localStorage.setItem('minpostel_visitor_pass_v1', JSON.stringify({
          scannedAt: now,
          expiresAt: expiresAt
        }));
        return { expired: false, expiresAt: expiresAt };
      }
    } catch (_) {
      return { expired: false };
    }
  });

  const handleRenewPass = () => {
    const TEN_HOURS_MS = 10 * 60 * 60 * 1000;
    const now = Date.now();
    const expiresAt = now + TEN_HOURS_MS;
    localStorage.setItem('minpostel_visitor_pass_v1', JSON.stringify({
      scannedAt: now,
      expiresAt: expiresAt
    }));
    setVisitorPass({ expired: false, expiresAt: expiresAt });
  };

  const fetchData = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const now = new Date();
      setCurrentTime(now);

      const [mRes, eRes] = await Promise.all([
        fetch('/api/meetings').then(r => r.json()).catch(() => ({ data: [] })),
        fetch('/api/events').then(r => r.json()).catch(() => ({ data: [] }))
      ]);

      const rawMeetings = mRes.data || [];
      const rawEvents = eRes.data || [];

      // STRICT VISITOR FILTER: Completely exclude any information that has already occurred
      const unexpiredMeetings = rawMeetings.filter(m => !isItemExpired(m, now));
      const unexpiredEvents = rawEvents.filter(e => !isItemExpired(e, now));

      setAllMeetings(unexpiredMeetings);
      setAllEvents(unexpiredEvents);

      // Check if user specifically requested an item by ID
      let found = null;
      let requestedExpired = false;

      if (id) {
        let requestedRaw = null;
        if (location.pathname.includes('/event/')) {
          requestedRaw = rawEvents.find(e => String(e.id) === String(id));
        } else {
          requestedRaw = rawMeetings.find(m => String(m.id) === String(id)) || rawEvents.find(e => String(e.id) === String(id));
        }

        if (requestedRaw) {
          if (isItemExpired(requestedRaw, now)) {
            requestedExpired = true;
          } else {
            found = requestedRaw;
          }
        }
      }

      setIsRequestedItemExpired(requestedExpired);

      // Default to first active non-expired meeting or event (NEVER show expired item)
      if (!found && !requestedExpired) {
        found = unexpiredMeetings[0] || unexpiredEvents[0] || null;
      }

      setActiveItem(found);
      setLoading(false);
      setIsRefreshing(false);

      if (isManual) {
        setShowSyncToast(true);
        setTimeout(() => setShowSyncToast(false), 2500);
      }
    } catch (err) {
      console.error('Error fetching visitor guide data:', err);
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Sequential loading steps for initial visual wow
    const timer1 = setTimeout(() => {
      setLoadingStepText(lang === 'FR' ? 'Récupération de la séance officielle...' : 'Loading official session dossier...');
    }, 400);

    const timer2 = setTimeout(() => {
      setLoadingStepText(lang === 'FR' ? 'Synchronisation du guide en temps réel...' : 'Synchronizing real-time orientation...');
    }, 800);

    fetchData();

    // 1. Real-Time Socket.io Synchronization (0s latency)
    const socket = io('/', { path: '/socket.io' });
    socket.on('CONTENT_CREATED', () => { fetchData(true); });
    socket.on('CONTENT_UPDATED', () => { fetchData(true); });
    socket.on('CONTENT_DELETED', () => { fetchData(true); });
    socket.on('MEETING_STATUS_CHANGED', () => { fetchData(true); });

    // 2. High-Frequency Fallback Polling (Every 8 seconds) for resilient 4G/5G mobile connections
    const pollingInterval = setInterval(() => {
      fetchData(false);
    }, 8000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearInterval(pollingInterval);
      socket.disconnect();
    };
  }, [id, location.pathname, lang]);

  // Real-Time 5-Second Expiration Ticker: automatically prunes completed sessions with zero refresh required
  useEffect(() => {
    const ticker = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      setAllMeetings(prev => prev.filter(m => !isItemExpired(m, now)));
      setAllEvents(prev => prev.filter(e => !isItemExpired(e, now)));

      setActiveItem(prev => {
        if (!prev) return null;
        if (isItemExpired(prev, now)) {
          return null;
        }
        return prev;
      });
    }, 5000);

    return () => clearInterval(ticker);
  }, []);

  // Share Handler
  const handleShare = async () => {
    if (navigator.share && activeItem) {
      try {
        await navigator.share({
          title: lang === 'FR' ? activeItem.title_fr : activeItem.title_en,
          text: `MINPOSTEL — ${lang === 'FR' ? activeItem.title_fr : activeItem.title_en} (${activeItem.room_fr || activeItem.room_en})`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share canceled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(lang === 'FR' ? 'Lien copié dans le presse-papier !' : 'Link copied to clipboard!');
    }
  };

  // Add to Calendar .ics Generator
  const handleAddToCalendar = () => {
    if (!activeItem) return;
    const title = lang === 'FR' ? (activeItem.title_fr || 'Séance MINPOSTEL') : (activeItem.title_en || 'MINPOSTEL Session');
    const desc = lang === 'FR' ? (activeItem.description_fr || '') : (activeItem.description_en || '');
    const loc = `${lang === 'FR' ? (activeItem.building_fr || 'Bâtiment Principal') : (activeItem.building_en || 'Main Building')} - ${lang === 'FR' ? activeItem.room_fr : activeItem.room_en}`;
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//MINPOSTEL//Smart Display Visitor//FR',
      'BEGIN:VEVENT',
      `SUMMARY:${title}`,
      `DESCRIPTION:${desc.replace(/\n/g, ' ')}`,
      `LOCATION:${loc}`,
      `DTSTART:${(activeItem.date || new Date().toISOString()).split('T')[0].replace(/-/g, '')}T080000Z`,
      `DTEND:${(activeItem.date || new Date().toISOString()).split('T')[0].replace(/-/g, '')}T100000Z`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `minpostel-session-${activeItem.id || 'event'}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // =========================================================================
  // 1. EXECUTIVE INSTITUTIONAL LOADING SCREEN
  // =========================================================================
  if (loading) {
    return (
      <div className="mv-loader-screen">
        <div className="mv-loader-crest-box">
          <div className="mv-loader-crest-ring"></div>
          <CameroonEmblem size={58} />
        </div>

        <div className="mv-loader-title">MINPOSTEL</div>
        <div className="mv-loader-subtitle">
          {lang === 'FR' ? 'Guide Numérique & Orientation des Visiteurs' : 'Digital Visitor Orientation & Guide'}
        </div>

        <div className="mv-loader-progress-track">
          <div className="mv-loader-progress-fill"></div>
        </div>

        <div className="mv-loader-status-text">
          <Zap size={14} className="mv-spin" />
          <span>{loadingStepText}</span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 1.5. 10-HOUR VISITOR PASS EXPIRATION SCREEN
  // =========================================================================
  if (visitorPass.expired) {
    return (
      <div className="mv-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '1.5rem', textAlign: 'center', background: '#F8FAFC' }}>
        <div style={{ background: '#FFF', borderRadius: '24px', padding: '2.25rem 1.5rem', maxWidth: '420px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <CameroonEmblem size={64} />
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#FEF2F2', color: '#B91C1C', padding: '0.35rem 0.85rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 800, marginBottom: '1rem', border: '1px solid #FECACA' }}>
            <span>🔒</span>
            <span>{lang === 'FR' ? 'PASS VISITEUR EXPIRÉ (10 HEURES)' : 'VISITOR PASS EXPIRED (10 HOURS)'}</span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.75rem' }}>
            {lang === 'FR' ? 'Accès Visiteur Dépassé' : 'Visitor Access Expired'}
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748B', lineHeight: 1.5, marginBottom: '1.25rem' }}>
            {lang === 'FR'
              ? 'Conformément aux protocoles de sécurité du Ministère des Postes et Télécommunications, votre pass temporaire a expiré 10 heures après le scan du QR code à l’accueil.'
              : 'In accordance with MINPOSTEL security protocols, your temporary visitor pass expired 10 hours after scanning the reception QR code.'}
          </p>
          <div style={{ background: '#F8FAFC', borderRadius: '14px', padding: '1rem', border: '1px solid #E2E8F0', marginBottom: '1.25rem', fontSize: '0.8rem', color: '#475569', textAlign: 'left', lineHeight: 1.5 }}>
            <strong>{lang === 'FR' ? '💡 Note de Sécurité :' : '💡 Security Note:'}</strong>
            <p style={{ marginTop: '0.25rem', marginBottom: 0 }}>
              {lang === 'FR'
                ? 'Le QR code affiché à l’accueil du Ministère reste permanent et statique. Scannez-le à nouveau lors de votre prochaine visite pour débloquer immédiatement une nouvelle session de 10 heures.'
                : 'The QR code displayed at the Ministry reception remains permanent. Rescan it upon your next visit to instantly unlock a new 10-hour session.'}
            </p>
          </div>
          <button
            onClick={handleRenewPass}
            className="mv-tab-btn active"
            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', background: 'var(--primary)', color: '#FFF', border: 'none' }}
          >
            {lang === 'FR' ? 'Simuler un Nouveau Scan' : 'Simulate New Scan'}
          </button>
        </div>
      </div>
    );
  }

  const filteredMeetings = allMeetings
    .filter(m => !isItemExpired(m, currentTime))
    .filter(m => 
      ((m.title_fr || '') + ' ' + (m.title_en || '') + ' ' + (m.room_fr || '') + ' ' + (m.room_en || '')).toLowerCase().includes(searchQuery.toLowerCase())
    );

  const filteredEvents = allEvents
    .filter(e => !isItemExpired(e, currentTime))
    .filter(e => 
      ((e.title_fr || '') + ' ' + (e.title_en || '') + ' ' + (e.location_fr || '') + ' ' + (e.location_en || '')).toLowerCase().includes(searchQuery.toLowerCase())
    );

  // =========================================================================
  // 2. MAIN EXECUTIVE VISITOR APPLICATION VIEW
  // =========================================================================
  return (
    <div className="mv-container">
      {/* EXECUTIVE IDENTITY HEADER */}
      <header className="mv-header">
        <div className="mv-header-top">
          <div className="mv-brand">
            <CameroonEmblem size={34} />
            <div>
              <div className="mv-brand-title">MINPOSTEL</div>
              <div className="mv-brand-subtitle">
                {lang === 'FR' ? 'Guide d’Orientation Numérique' : 'Digital Orientation Guide'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            {/* Manual Refresh Button */}
            <button 
              className="mv-lang-btn" 
              onClick={() => fetchData(true)}
              title={lang === 'FR' ? 'Actualiser les données' : 'Refresh data'}
              style={{ padding: '6px 8px' }}
            >
              <RotateCw size={14} className={isRefreshing ? 'mv-spin' : ''} />
            </button>

            {/* Language Switcher Button */}
            <button className="mv-lang-btn" onClick={() => setLang(lang === 'FR' ? 'EN' : 'FR')}>
              <FlagBadge lang={lang} size="sm" />
              <span>{lang}</span>
            </button>
          </div>
        </div>

        <div className="mv-live-bar">
          <div className="mv-live-indicator">
            <span className="mv-pulse-dot"></span>
            <span>{lang === 'FR' ? 'DIRECT • SYNCHRONISÉ' : 'LIVE • SYNCHRONIZED'}</span>
          </div>
          <div style={{ color: '#94A3B8', fontSize: '0.7rem' }}>
            {lang === 'FR' ? 'Rafraîchissement auto : 8s' : 'Auto-refresh rate: 8s'}
          </div>
        </div>
      </header>

      {/* FLOATING SYNC TOAST */}
      {showSyncToast && (
        <div className="mv-refresh-pill">
          <CheckCircle size={14} style={{ color: '#34D399' }} />
          <span>{lang === 'FR' ? 'Informations actualisées en direct' : 'Information updated live'}</span>
        </div>
      )}

      {/* TOP NAVIGATION TABS */}
      <nav className="mv-tabs">
        <button 
          className={`mv-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Compass size={15} />
          <span>{lang === 'FR' ? 'Séance' : 'Session'}</span>
        </button>

        <button 
          className={`mv-tab-btn ${activeTab === 'navigate' ? 'active' : ''}`}
          onClick={() => setActiveTab('navigate')}
        >
          <Navigation size={15} />
          <span>{lang === 'FR' ? 'Itinéraire' : 'Route'}</span>
        </button>

        <button 
          className={`mv-tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          <Calendar size={15} />
          <span>{lang === 'FR' ? 'Programme' : 'Schedule'}</span>
        </button>

        <button 
          className={`mv-tab-btn ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          <Info size={15} />
          <span>{lang === 'FR' ? 'Services' : 'Services'}</span>
        </button>
      </nav>

      {/* MAIN VIEWPORT */}
      <main style={{ padding: '1.25rem', flex: 1 }}>

        {/* TAB 1: OVERVIEW / SESSION DOSSIER */}
        {activeTab === 'overview' && (
          activeItem ? (
            <div>
              {/* Notice if the user specifically scanned an item that already completed */}
              {isRequestedItemExpired && (
                <div className="mv-card" style={{ borderLeft: '4px solid #F59E0B', background: 'rgba(245, 158, 11, 0.08)', padding: '0.85rem 1.1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FBBF24', fontWeight: 700, fontSize: '0.85rem' }}>
                    <Clock size={16} />
                    <span>{lang === 'FR' ? 'Séance demandée déjà terminée' : 'Requested session has ended'}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.25rem' }}>
                    {lang === 'FR' 
                      ? 'L\'événement ou la réunion correspondant au lien scanné s\'est achevé(e). Affichage de la séance en cours.' 
                      : 'The event or meeting corresponding to this link has concluded. Showing current active session.'}
                  </div>
                </div>
              )}

              <div className="mv-card" style={{ borderTop: `4px solid ${activeItem.card_color || '#2563EB'}` }}>
                <div className="mv-card-header">
                  {(() => {
                    const status = getItemComputedStatus(activeItem, currentTime);
                    const isOngoing = status === 'ONGOING';
                    return (
                      <span className={`mv-pill ${isOngoing ? 'mv-pill-ongoing' : 'mv-pill-upcoming'}`}>
                        {isOngoing && <span className="mv-pill-dot"></span>}
                        {isOngoing 
                          ? (lang === 'FR' ? 'EN COURS' : 'ONGOING') 
                          : (lang === 'FR' ? 'À VENIR' : 'UPCOMING')}
                      </span>
                    );
                  })()}
                  <span className="mv-pill mv-pill-official">
                    {lang === 'FR' 
                      ? (activeItem.priority === 'OFFICIAL' ? 'OFFICIEL' : activeItem.priority === 'IMPORTANT' ? 'IMPORTANT' : activeItem.priority === 'URGENT' ? 'URGENT' : (activeItem.priority || 'OFFICIEL')) 
                      : (activeItem.priority || 'OFFICIAL')}
                  </span>
                </div>

                <h1 className="mv-title">
                  {lang === 'FR' ? (activeItem.title_fr || activeItem.title_en) : (activeItem.title_en || activeItem.title_fr)}
                </h1>

                <p className="mv-desc">
                  {lang === 'FR' ? (activeItem.description_fr || activeItem.content_fr || '') : (activeItem.description_en || activeItem.content_en || '')}
                </p>

                <div className="mv-meta-grid">
                  {/* Date & Time */}
                  <div className="mv-meta-row">
                    <div className="mv-icon-box">
                      <Clock size={18} />
                    </div>
                    <div>
                      <div className="mv-meta-label">{lang === 'FR' ? 'DATE & HORAIRES' : 'DATE & SCHEDULE'}</div>
                      <div className="mv-meta-val">
                        <span style={{ color: '#38BDF8', fontWeight: 700 }}>
                          {formatDisplayDate(activeItem.date || activeItem.start_date, lang)}
                        </span>
                        {activeItem.start_time && (
                          <span> • {activeItem.start_time} {activeItem.end_time ? `— ${activeItem.end_time}` : ''}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="mv-meta-row">
                    <div className="mv-icon-box" style={{ background: 'rgba(212, 175, 55, 0.12)', borderColor: 'rgba(212, 175, 55, 0.3)', color: '#FACC15' }}>
                      <MapPin size={18} />
                    </div>
                    <div>
                      <div className="mv-meta-label">{lang === 'FR' ? 'AFFECTATION SALLE & BÂTIMENT' : 'ROOM & BUILDING ASSIGNMENT'}</div>
                      <div className="mv-meta-val">
                        {lang === 'FR' ? (activeItem.building_fr || 'Bâtiment Principal') : (activeItem.building_en || 'Main Building')}
                      </div>
                      <div className="mv-meta-sub">
                        {lang === 'FR' ? (activeItem.floor_fr || '2e Étage') : (activeItem.floor_en || '2nd Floor')} • {lang === 'FR' ? (activeItem.room_fr || activeItem.location_fr || 'Salle des Actes') : (activeItem.room_en || activeItem.location_en || 'Conference Hall')}
                      </div>
                    </div>
                  </div>

                  {/* Participants */}
                  {activeItem.participants_info && (
                    <div className="mv-meta-row">
                      <div className="mv-icon-box" style={{ background: 'rgba(16, 185, 129, 0.12)', borderColor: 'rgba(16, 185, 129, 0.3)', color: '#34D399' }}>
                        <Users size={18} />
                      </div>
                      <div>
                        <div className="mv-meta-label">{lang === 'FR' ? 'DÉLÉGATION & AUDIENCE' : 'DELEGATION & AUDIENCE'}</div>
                        <div className="mv-meta-val" style={{ fontSize: '0.85rem' }}>{activeItem.participants_info}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mv-actions">
                  <button className="mv-btn-action mv-btn-primary" onClick={handleAddToCalendar}>
                    <Download size={16} />
                    <span>{lang === 'FR' ? 'Ajouter Agenda' : 'Save to Calendar'}</span>
                  </button>

                  <button className="mv-btn-action" onClick={handleShare}>
                    <Share2 size={16} />
                    <span>{lang === 'FR' ? 'Partager' : 'Share'}</span>
                  </button>
                </div>
              </div>

              {/* Quick Navigation Teaser */}
              <div 
                className="mv-card" 
                onClick={() => setActiveTab('navigate')}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="mv-icon-box" style={{ background: 'rgba(37, 99, 235, 0.15)', color: '#60A5FA' }}>
                    <Compass size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FFFFFF' }}>
                      {lang === 'FR' ? 'Voir l’itinéraire d’accès' : 'View Room Route & Steps'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                      {lang === 'FR' ? 'Orientation étape par étape dans le bâtiment' : 'Step-by-step indoor directions'}
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} style={{ color: '#64748B' }} />
              </div>
            </div>
          ) : (
            /* EMPTY / ALL COMPLETED STATE: When all events and meetings have concluded */
            <div className="mv-card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
                color: '#34D399'
              }}>
                <CheckCircle size={32} />
              </div>

              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.5rem' }}>
                {isRequestedItemExpired 
                  ? (lang === 'FR' ? 'Séance Clôturée' : 'Session Concluded')
                  : (lang === 'FR' ? 'Aucune Séance en Cours' : 'No Active Session Currently')}
              </h2>

              <p style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                {isRequestedItemExpired
                  ? (lang === 'FR' 
                      ? 'La réunion ou l\'événement correspondant à votre scan est terminé(e). Aucune autre séance n\'est programmée actuellement.' 
                      : 'The meeting or event corresponding to your scan has already ended. No other active session is currently in progress.')
                  : (lang === 'FR'
                      ? 'Toutes les séances et réunions programmées sont terminées pour le moment. Veuillez vous adresser au hall d\'accueil pour toute assistance.'
                      : 'All scheduled sessions and meetings have completed. Please visit the reception desk for guidance.')}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button className="mv-btn-action mv-btn-primary" onClick={() => setActiveTab('services')}>
                  <Info size={16} />
                  <span>{lang === 'FR' ? 'Contacter l\'Accueil & Services' : 'Contact Reception & Services'}</span>
                </button>
                <button className="mv-btn-action" onClick={() => fetchData(true)}>
                  <RotateCw size={16} />
                  <span>{lang === 'FR' ? 'Actualiser les données' : 'Check for Updates'}</span>
                </button>
              </div>
            </div>
          )
        )}

        {/* TAB 2: STEP-BY-STEP INDOOR NAVIGATION */}
        {activeTab === 'navigate' && (
          <div>
            <div className="mv-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Navigation size={20} style={{ color: '#3B82F6' }} />
                <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                  {lang === 'FR' ? 'Guide d’Orientation Intérieure' : 'Indoor Floor & Room Guidance'}
                </h2>
              </div>

              <div className="mv-stepper">
                <div className="mv-step active">
                  <div className="mv-step-num">1</div>
                  <div className="mv-step-content">
                    <div className="mv-step-title">{lang === 'FR' ? "Hall d’Accueil — Rez-de-Chaussée" : 'Main Reception — Ground Floor'}</div>
                    <div className="mv-step-desc">
                      {lang === 'FR' 
                        ? 'Accédez par l’entrée principale du Ministère. Présentez votre convocation ou pièce d’identité au poste de sécurité pour l’obtention du badge visiteur.' 
                        : 'Enter via the main Ministry entrance. Present your invitation or ID to security desk to receive your visitor pass.'}
                    </div>
                  </div>
                </div>

                <div className="mv-step active">
                  <div className="mv-step-num">2</div>
                  <div className="mv-step-content">
                    <div className="mv-step-title">{lang === 'FR' ? "Transit Vertical — Ascenseurs / Escaliers" : 'Vertical Transit — Elevators / Stairs'}</div>
                    <div className="mv-step-desc">
                      {lang === 'FR' 
                        ? `Empruntez les ascenseurs centraux ou l'escalier vers ${activeItem?.floor_fr || 'l’Étage indiqué'}. Accès PMR disponible sur l’aile droite.` 
                        : `Take the central elevators or stairs to ${activeItem?.floor_en || 'the specified floor'}. Accessible ramps and elevator located on the right wing.`}
                    </div>
                  </div>
                </div>

                <div className="mv-step active">
                  <div className="mv-step-num">3</div>
                  <div className="mv-step-content">
                    <div className="mv-step-title">
                      {lang === 'FR' ? `Arrivée — ${activeItem?.room_fr || 'Salle des Séances'}` : `Arrival — ${activeItem?.room_en || 'Boardroom'}`}
                    </div>
                    <div className="mv-step-desc">
                      {lang === 'FR' 
                        ? `Suivez la signalétique ministérielle bleue. La salle se trouve au bout du couloir principal (${activeItem?.building_fr || 'Bâtiment Principal'}).` 
                        : `Follow the blue ministerial hallway signs. The room is located along the primary corridor (${activeItem?.building_en || 'Main Building'}).`}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Protocol Notice */}
            <div className="mv-service-card" style={{ borderLeft: '4px solid #10B981' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="mv-service-icon">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#FFFFFF' }}>{lang === 'FR' ? 'Consigne de Sécurité' : 'Security Protocol'}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{lang === 'FR' ? 'Badge visiteur obligatoire et visible en permanence.' : 'Visitor badge must remain visibly worn at all times.'}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SCHEDULE / FULL AGENDA */}
        {activeTab === 'schedule' && (
          <div>
            <div style={{ marginBottom: '1rem', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '12px', color: '#94A3B8' }} />
              <input
                type="text"
                placeholder={lang === 'FR' ? 'Rechercher une séance, salle...' : 'Search session, room...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  borderRadius: '10px',
                  backgroundColor: '#1E293B',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#FFFFFF',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Unexpired Active Meetings */}
              {filteredMeetings.map(m => (
                <div
                  key={`m-${m.id}`}
                  onClick={() => { setActiveItem(m); setActiveTab('overview'); }}
                  className="mv-card"
                  style={{
                    padding: '1.1rem',
                    cursor: 'pointer',
                    borderLeft: `4px solid ${m.card_color || '#2563EB'}`,
                    marginBottom: 0
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.3 }}>
                          {lang === 'FR' ? m.title_fr : m.title_en}
                        </span>
                        {(() => {
                          const mStatus = getItemComputedStatus(m, currentTime);
                          const isOngoing = mStatus === 'ONGOING';
                          return (
                            <span className={`mv-pill ${isOngoing ? 'mv-pill-ongoing' : 'mv-pill-upcoming'}`} style={{ fontSize: '0.62rem', padding: '2px 8px' }}>
                              {isOngoing && <span className="mv-pill-dot" style={{ width: '5px', height: '5px' }}></span>}
                              {isOngoing 
                                ? (lang === 'FR' ? 'EN COURS' : 'ONGOING') 
                                : (lang === 'FR' ? 'À VENIR' : 'UPCOMING')}
                            </span>
                          );
                        })()}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#38BDF8', fontWeight: 600 }}>
                          <Calendar size={13} />
                          <span>{formatDisplayDate(m.date, lang)}</span>
                        </div>
                        <span>•</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Clock size={13} style={{ color: '#60A5FA' }} />
                          <span>{m.start_time} {m.end_time ? `— ${m.end_time}` : ''}</span>
                        </div>
                        {m.room_fr && (
                          <>
                            <span>•</span>
                            <span>{lang === 'FR' ? m.room_fr : m.room_en}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <ArrowRight size={18} style={{ color: '#64748B', marginTop: '4px' }} />
                  </div>
                </div>
              ))}

              {/* Unexpired Active Events */}
              {filteredEvents.map(e => (
                <div
                  key={`e-${e.id}`}
                  onClick={() => { setActiveItem(e); setActiveTab('overview'); }}
                  className="mv-card"
                  style={{
                    padding: '1.1rem',
                    cursor: 'pointer',
                    borderLeft: '4px solid #10B981',
                    marginBottom: 0
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.3 }}>
                          {lang === 'FR' ? e.title_fr : e.title_en}
                        </span>
                        {(() => {
                          const eStatus = getItemComputedStatus(e, currentTime);
                          const isOngoing = eStatus === 'ONGOING';
                          return (
                            <span className={`mv-pill ${isOngoing ? 'mv-pill-ongoing' : 'mv-pill-upcoming'}`} style={{ fontSize: '0.62rem', padding: '2px 8px' }}>
                              {isOngoing && <span className="mv-pill-dot" style={{ width: '5px', height: '5px' }}></span>}
                              {isOngoing 
                                ? (lang === 'FR' ? 'EN COURS' : 'ONGOING') 
                                : (lang === 'FR' ? 'À VENIR' : 'UPCOMING')}
                            </span>
                          );
                        })()}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#34D399', fontWeight: 600 }}>
                          <Calendar size={13} />
                          <span>{formatDisplayDate(e.date, lang)}</span>
                        </div>
                        {e.start_time && (
                          <>
                            <span>•</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Clock size={13} style={{ color: '#60A5FA' }} />
                              <span>{e.start_time} {e.end_time ? `— ${e.end_time}` : ''}</span>
                            </div>
                          </>
                        )}
                        {(e.location_fr || e.location_en || e.room_fr) && (
                          <>
                            <span>•</span>
                            <span>{lang === 'FR' ? (e.location_fr || e.room_fr) : (e.location_en || e.room_en)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <ArrowRight size={18} style={{ color: '#64748B', marginTop: '4px' }} />
                  </div>
                </div>
              ))}

              {/* Empty state when all events and meetings are expired or search yields nothing */}
              {filteredMeetings.length === 0 && filteredEvents.length === 0 && (
                <div className="mv-card" style={{ textAlign: 'center', padding: '2.5rem 1.25rem' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'rgba(100, 116, 139, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem auto',
                    color: '#94A3B8'
                  }}>
                    <Calendar size={28} />
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.4rem' }}>
                    {searchQuery 
                      ? (lang === 'FR' ? 'Aucun résultat trouvé' : 'No Results Found')
                      : (lang === 'FR' ? 'Aucune séance à venir' : 'No Upcoming Sessions')}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: 0, lineHeight: 1.5 }}>
                    {searchQuery
                      ? (lang === 'FR' ? 'Essayez d\'autres termes de recherche.' : 'Try adjusting your search criteria.')
                      : (lang === 'FR' ? 'Toutes les séances de la journée sont terminées. Revenez plus tard pour le programme suivant.' : 'All sessions for today have concluded. Please check back later for the next schedule.')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: SERVICES & CONCIERGE */}
        {activeTab === 'services' && (
          <div>
            {/* Wi-Fi Credentials */}
            <div className="mv-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
                <div className="mv-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34D399' }}>
                  <Wifi size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                    {lang === 'FR' ? 'Accès Wi-Fi Visiteur' : 'Visitor Guest Wi-Fi'}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{lang === 'FR' ? 'Réseau sans fil public sécurisé' : 'Secure public wireless network'}</div>
                </div>
              </div>

              <div style={{ background: '#0F172A', padding: '0.85rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>SSID</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#F8FAFC' }}>MINPOSTEL-GUEST</div>
                </div>

                <button 
                  onClick={() => {
                    navigator.clipboard.writeText('MINPOSTEL-GUEST');
                    setCopiedWifi(true);
                    setTimeout(() => setCopiedWifi(false), 2000);
                  }}
                  style={{
                    background: copiedWifi ? '#10B981' : '#2563EB',
                    color: '#FFF',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {copiedWifi ? (lang === 'FR' ? 'Copié !' : 'Copied!') : (lang === 'FR' ? 'Copier' : 'Copy')}
                </button>
              </div>
            </div>

            {/* Reception & Security Assistance Phone */}
            <div className="mv-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
                <div className="mv-icon-box" style={{ background: 'rgba(37, 99, 235, 0.15)', color: '#60A5FA' }}>
                  <Phone size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                    {lang === 'FR' ? 'Secrétariat & Accueil' : 'Reception & Assistance'}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{lang === 'FR' ? 'Assistance protocolaire et orientation' : 'Protocol & visitor assistance'}</div>
                </div>
              </div>

              <div style={{ background: '#0F172A', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>{lang === 'FR' ? 'LIGNE DIRECTE' : 'DIRECT LINE'}</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#38BDF8' }}>+237 674 256 040</div>
                </div>
                <span className="badge badge-online" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                  {lang === 'FR' ? 'DISPONIBLE' : 'AVAILABLE'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <a 
                  href="tel:+237674256040" 
                  className="mv-btn-action mv-btn-primary" 
                  style={{ textDecoration: 'none', flex: 1, textAlign: 'center' }}
                >
                  <Phone size={16} />
                  <span>{lang === 'FR' ? 'Appeler Accueil (+237 674 256 040)' : 'Call Reception (+237 674 256 040)'}</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER ACCREDITATION */}
      <footer style={{
        padding: '1.25rem 1rem',
        textAlign: 'center',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        backgroundColor: '#0F172A',
        fontSize: '0.75rem',
        color: '#64748B'
      }}>
        <div style={{ fontWeight: 700, color: '#94A3B8', marginBottom: '4px' }}>
          MINPOSTEL SMART DISPLAY • V2.0
        </div>
        <div>
          {lang === 'FR' 
            ? 'Ministère des Postes et Télécommunications • République du Cameroun' 
            : 'Ministry of Posts and Telecommunications • Republic of Cameroon'}
        </div>
      </footer>
    </div>
  );
}
