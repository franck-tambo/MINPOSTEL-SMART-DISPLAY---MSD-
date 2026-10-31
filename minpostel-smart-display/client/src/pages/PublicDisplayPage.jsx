import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Clock, Calendar, MapPin, AlertTriangle, PartyPopper, Megaphone, Newspaper, Globe } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import CameroonEmblem from '../components/CameroonEmblem';
import FlagBadge from '../components/FlagBadge';
import WeatherClockWidget from '../components/WeatherClockWidget';
import { startAmbulanceSiren, stopAmbulanceSiren } from '../utils/alertSound.util';
import { isItemExpired, isItemStarted, getItemDateLabel, formatDisplayDate } from '../utils/expiration.util';
import { getCached, setCached } from '../utils/apiCache';
import '../styles/PublicDisplay.css'; // Import the carousel stylesheet

export default function PublicDisplayPage() {
  const { screenId = 'MINPOSTEL-MAIN-ENTRANCE-01' } = useParams();

  // Time & Language Rotation State
  const [lang, setLang] = useState('FR'); // Alternates FR -> EN
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  // Content Store
  const [announcements, setAnnouncements] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [events, setEvents] = useState([]);
  const [communications, setCommunications] = useState([]);
  const [urgentMessage, setUrgentMessage] = useState(null);
  const [newsFeeds, setNewsFeeds] = useState([]);
  const [settings, setSettings] = useState(() => getCached('settings') || null);
  const [isPowerOff, setIsPowerOff] = useState(false);
  const [temporaryWake, setTemporaryWake] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false); // tracks if browser audio is unlocked

  // Socket Connection State
  const [socketConnected, setSocketConnected] = useState(false);

  // Load Content Initial Data Atomically
  const loadDisplayContent = async () => {
    try {
      const [annRes, meetRes, evRes, commRes, msgRes, feedRes, setRes] = await Promise.all([
        fetch('/api/announcements').then(r => r.json()).catch(() => null),
        fetch('/api/meetings').then(r => r.json()).catch(() => null),
        fetch('/api/events').then(r => r.json()).catch(() => null),
        fetch('/api/communications').then(r => r.json()).catch(() => null),
        fetch('/api/urgent-messages').then(r => r.json()).catch(() => null),
        fetch('/api/feed/ticker').then(r => r.json()).catch(() => null),
        fetch('/api/settings').then(r => r.json()).catch(() => null)
      ]);

      if (annRes?.status === 'success') setAnnouncements(annRes.data || []);
      if (meetRes?.status === 'success') setMeetings(meetRes.data || []);
      if (evRes?.status === 'success') setEvents(evRes.data || []);
      if (commRes?.status === 'success') setCommunications(commRes.data || []);

      if (msgRes?.status === 'success') {
        const active = (msgRes.data || []).find(m => m.status === 'ACTIVE');
        setUrgentMessage(active || null);
        if (!active) stopAmbulanceSiren();
      }

      if (feedRes?.status === 'success') setNewsFeeds(feedRes.data || []);

      if (setRes?.status === 'success' && setRes.data) {
        setSettings(setRes.data);
        setCached('settings', setRes.data);
      }
    } catch (e) {
      console.error('Error loading display content:', e);
    }
  };

  useEffect(() => {
    loadDisplayContent();

    // Setup Real-Time Socket.IO Client
    const socket = io('/', { path: '/socket.io' });

    socket.on('connect', () => {
      setSocketConnected(true);
      socket.emit('DISPLAY_REGISTER', { screenId });
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });

    // Real-Time Socket Event Handlers
    socket.on('CONTENT_CREATED', () => loadDisplayContent());
    socket.on('CONTENT_UPDATED', () => loadDisplayContent());
    socket.on('CONTENT_DELETED', () => loadDisplayContent());
    socket.on('CONTENT_PUBLISHED', () => loadDisplayContent());
    socket.on('MEETING_STATUS_CHANGED', () => loadDisplayContent());

    socket.on('URGENT_MESSAGE_STARTED', (data) => {
      const msg = data?.urgentMessage || null;
      setUrgentMessage(msg);
      if (msg) startAmbulanceSiren();
    });

    socket.on('URGENT_MESSAGE_ENDED', () => {
      setUrgentMessage(null);
      stopAmbulanceSiren();
    });

    socket.on('SETTINGS_UPDATED', (newSettings) => {
      setSettings(newSettings);
      setCached('settings', newSettings);
      try {
        localStorage.setItem('msd_cached_settings', JSON.stringify(newSettings));
      } catch (e) {}
    });

    socket.on('POWER_STATE', (state) => {
      setIsPowerOff(state === 'OFF');
    });

    // Dynamic Heartbeat Interval (Configurable from Admin Settings, default 15s)
    const pingSeconds = settings?.heartbeat_interval_seconds ? Number(settings.heartbeat_interval_seconds) : 15;
    const heartbeatInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit('DISPLAY_HEARTBEAT', { screenId, timestamp: new Date().toISOString() });
      }
    }, pingSeconds * 1000);

    // Auto-Sync Periodic Content Refresh (60s fallback — real-time updates are driven by Socket.IO)
    const autoSyncInterval = setInterval(() => {
      loadDisplayContent();
    }, 60000);

    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(autoSyncInterval);
      socket.disconnect();
    };
  }, [screenId, settings?.heartbeat_interval_seconds]);

  // Automated Eco-Standby / Power Schedule from Admin Settings
  useEffect(() => {
    if (!settings?.power_on_time || !settings?.power_off_time) return;
    const checkSchedule = () => {
      const now = new Date();
      const currentHm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const { power_on_time, power_off_time } = settings;
      if (power_on_time === '00:00' && (power_off_time === '23:59' || power_off_time === '24:00')) {
        setIsPowerOff(false);
        return;
      }
      if (power_on_time <= power_off_time) {
        setIsPowerOff(currentHm < power_on_time || currentHm >= power_off_time);
      } else {
        setIsPowerOff(currentHm < power_on_time && currentHm >= power_off_time);
      }
    };
    checkSchedule();
    const scheduleInterval = setInterval(checkSchedule, 30000);
    return () => clearInterval(scheduleInterval);
  }, [settings?.power_on_time, settings?.power_off_time]);

  // Live Expiration Clock Ticker (updates currentTime every second so expired items drop immediately)
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timeInterval);
  }, []);
 
  // Continuous Ambulance Siren — starts immediately when urgent message is active
  useEffect(() => {
    if (urgentMessage) {
      startAmbulanceSiren(); // async — internally retries if AudioContext suspended
    } else {
      stopAmbulanceSiren();
    }
    return () => {
      stopAmbulanceSiren();
    };
  }, [urgentMessage, audioUnlocked]);

  // Unlock audio context on any interaction with the kiosk display screen
  const handleScreenInteraction = () => {
    if (!audioUnlocked) {
      setAudioUnlocked(true);
      // Trigger siren immediately if an urgent message is already active
      if (urgentMessage) startAmbulanceSiren();
    }
  };

  // Helper to determine if an item is active and displayable on the public screen
  const isDisplayableItem = (item) => {
    if (!item) return false;
    const status = (item.status || '').toUpperCase();
    if (['CANCELLED', 'ARCHIVED', 'DRAFT', 'DELETED', 'FINISHED', 'COMPLETED', 'EXPIRED'].includes(status)) {
      return false;
    }
    // Automatically remove item from display when its scheduled end time has reached
    if (isItemExpired(item, currentTime)) {
      return false;
    }
    return true;
  };

  // Consolidate & Filter Active Playlist Items (Retains active/published items and drops them when end time is reached)
  const playlistItems = useMemo(() => {
    return [
      ...meetings.filter(isDisplayableItem).map(m => ({ ...m, itemType: 'MEETING' })),
      ...events.filter(isDisplayableItem).map(e => ({ ...e, itemType: 'EVENT' })),
      ...announcements.filter(a => isDisplayableItem(a) && (a.status === 'PUBLISHED' || a.status === 'ACTIVE' || !a.status)).map(a => ({ ...a, itemType: 'ANNOUNCEMENT' })),
      ...communications.filter(c => isDisplayableItem(c) && (c.status === 'PUBLISHED' || c.status === 'ACTIVE' || !c.status)).map(c => ({ ...c, itemType: 'COMMUNICATION' }))
    ];
  }, [meetings, events, announcements, communications, currentTime]);

  const safeIndex = playlistItems.length > 0 ? currentIndex % playlistItems.length : 0;
  const activeItem = playlistItems[safeIndex] || null;

  // Slide Duration (checks global admin setting first, or item override, fallback 15s)
  const slideDurationSeconds = Number(settings?.rotation_duration_seconds)
    || activeItem?.duration_seconds 
    || activeItem?.slide_duration 
    || 15;
  const slideDurationMs = slideDurationSeconds * 1000;

  // Stable references to prevent background state ticks from restarting the active slide
  const playlistRef = useRef(playlistItems);
  playlistRef.current = playlistItems;

  const durationMsRef = useRef(slideDurationMs);
  durationMsRef.current = slideDurationMs;

  const [progressWidth, setProgressWidth] = useState(0);

  // Clamp index if playlist shrinks
  useEffect(() => {
    if (playlistItems.length > 0 && currentIndex >= playlistItems.length) {
      setCurrentIndex(0);
    }
  }, [playlistItems.length, currentIndex]);

  // High-Precision Slide Rotation Timer:
  // 1. Plays each slide for its exact full duration without drifting or unexpected resets
  // 2. All items in the playlist are displayed in one language, then all items in the other language
  useEffect(() => {
    if (playlistItems.length === 0 || urgentMessage) {
      setProgressWidth(0);
      return;
    }

    setProgressWidth(0);
    const startTime = Date.now();
    const duration = durationMsRef.current;

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.max(0, (elapsed / duration) * 100));
      setProgressWidth(pct);

      if (elapsed >= duration) {
        clearInterval(progressInterval);
        setProgressWidth(0);
        setCurrentIndex(prev => {
          const currentList = playlistRef.current;
          if (!currentList || currentList.length === 0) return 0;
          const nextIndex = (prev + 1) % currentList.length;
          // When all informations in the playlist have finished displaying in the current language,
          // switch to the other language for the next full rotation round!
          if (nextIndex === 0) {
            setLang(currentLang => (currentLang === 'FR' ? 'EN' : 'FR'));
          }
          return nextIndex;
        });
      }
    }, 100);

    return () => {
      clearInterval(progressInterval);
    };
  }, [currentIndex, playlistItems.length === 0, urgentMessage]);

  // Icon selector based on type
  const getTypeIcon = (type) => {
    switch(type) {
      case 'MEETING': return <Calendar size={20} />;
      case 'EVENT': return <PartyPopper size={20} />;
      case 'COMMUNICATION': return <Newspaper size={20} />;
      case 'ANNOUNCEMENT': return <Megaphone size={20} />;
      default: return <Globe size={20} />;
    }
  };

  // Helper for type labels
  const getTypeLabel = (type, currentLang) => {
    switch(type) {
      case 'MEETING': return currentLang === 'FR' ? 'RÉUNION' : 'MEETING';
      case 'EVENT': return currentLang === 'FR' ? 'ÉVÉNEMENT' : 'EVENT';
      case 'COMMUNICATION': return currentLang === 'FR' ? 'COMMUNICATION OFFICIELLE' : 'OFFICIAL COMMUNICATION';
      case 'ANNOUNCEMENT': return currentLang === 'FR' ? 'ANNONCE' : 'ANNOUNCEMENT';
      default: return '';
    }
  };

  const getVisitorQrUrl = (item) => {
    if (!item) return '';
    const itemPath = `/visitor/${item.itemType === 'EVENT' ? 'event' : 'meeting'}/${item.id}`;
    
    // 1. Active, verified cloud tunnel (if running)
    if (settings?.is_tunnel_active && settings?.public_base_url && !settings.public_base_url.includes('api.trycloudflare.com')) {
      return `${settings.public_base_url.trim().replace(/\/+$/, '')}${itemPath}`;
    }
    
    // 2. Real LAN/Wi-Fi origin (e.g. from Smart TV at http://192.168.43.56:5173/...)
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return `${window.location.origin}${itemPath}`;
    }
    
    // 3. Fallback for localhost developer testing: use detected Wi-Fi IP
    const hostIp = settings?.local_ip || '192.168.43.56';
    const hostPort = window.location.port || '5173';
    return `${window.location.protocol}//${hostIp}:${hostPort}${itemPath}`;
  };

  if (isPowerOff && !temporaryWake) {
    return (
      <div
        onClick={() => setTemporaryWake(true)}
        style={{
          width: '100vw',
          height: '100vh',
          backgroundColor: '#030712',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748B',
          cursor: 'pointer',
          userSelect: 'none',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.4 }}>🌙</div>
        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#CBD5E1', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Veille Énergétique MINPOSTEL
        </div>
        <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.4rem', letterSpacing: '0.04em' }}>
          Automated Eco-Standby Mode (Hors heures de service)
        </div>
        <div
          style={{
            marginTop: '1.75rem',
            padding: '8px 20px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#38BDF8',
            fontSize: '0.825rem',
            fontWeight: 600
          }}
        >
          Touchez l'écran pour réveiller • Tap to wake
        </div>
      </div>
    );
  }

  // Compute style overrides from settings
  const dynamicStyle = settings ? {
    '--msd-accent': settings.theme_color || '#134074',
    '--msd-primary': settings.theme_color || '#0B2545',
    '--theme-color': settings.theme_color || '#134074',
    backgroundColor: '#0B172A'
  } : {
    backgroundColor: '#0B172A'
  };

  // Background overlay rendering
  const bgOverlayStyle = settings?.background_url ? {
    backgroundImage: `url(${settings.background_url})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: 0.15 // keep it subtle
  } : {};

  return (
    <div className="public-display-container" style={dynamicStyle} onClick={handleScreenInteraction}>
      <div className="pd-bg-overlay" style={bgOverlayStyle}></div>

      {/* KIOSK AUDIO UNLOCK BANNER — visible until first tap/click unlocks the browser audio context */}
      {!audioUnlocked && (
        <div
          onClick={handleScreenInteraction}
          style={{
            position: 'fixed',
            bottom: '1.25rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10000,
            background: 'rgba(15,23,42,0.82)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '50px',
            padding: '0.6rem 1.6rem',
            color: '#CBD5E1',
            fontSize: '0.8rem',
            fontWeight: 600,
            letterSpacing: '0.03em',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            cursor: 'pointer',
            animation: 'pd-fade-in 1.2s ease'
          }}
        >
          <span style={{ fontSize: '1rem' }}>🔊</span>
          <span>{lang === 'FR' ? 'Appuyez sur l\'écran pour activer les alertes sonores' : 'Tap screen to enable audio alerts'}</span>
        </div>
      )}

      {/* HEADER */}
      <header className="pd-header">
        <div className="pd-header-left">
          <CameroonEmblem size={55} />
          <div className="pd-ministry-title">
            <h1>{lang === 'FR' ? 'RÉPUBLIQUE DU CAMEROUN' : 'REPUBLIC OF CAMEROON'}</h1>
            <div className="pd-ministry-motto">
              {lang === 'FR' ? 'Paix — Travail — Patrie' : 'Peace — Work — Fatherland'}
            </div>
            <h2>
              {settings?.app_title || (lang === 'FR' ? 'Ministère des Postes et Télécommunications' : 'Ministry of Posts and Telecommunications')}
            </h2>
          </div>
        </div>
        
        <div className="pd-header-right">
          <WeatherClockWidget lang={lang} />
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            background: 'var(--glass-bg)',
            padding: '0.6rem 1.25rem',
            borderRadius: '50px',
            border: '1px solid var(--glass-border)',
            color: '#FFF',
            fontWeight: '800'
          }}>
            <FlagBadge lang={lang} size="sm" />
            <span>{lang === 'FR' ? 'FRANÇAIS' : 'ENGLISH'}</span>
          </div>
        </div>
      </header>

      {/* URGENT MESSAGE OVERLAY */}
      {urgentMessage && (
        <div className="pd-urgent-overlay">
          <div className="pd-urgent-header">
            <AlertTriangle size={80} style={{ color: '#FDE047' }} />
            <h1>{lang === 'FR' ? 'ALERTE URGENTE' : 'URGENT ALERT'}</h1>
          </div>
          <div className="pd-urgent-body">
            <p className="pd-urgent-text">{urgentMessage.message_fr}</p>
            <p className="pd-urgent-text-en">{urgentMessage.message_en}</p>
          </div>
        </div>
      )}

      {/* MAIN CAROUSEL STAGE */}
      <main className="pd-main-stage">
        {!activeItem && !urgentMessage ? (
          <div className="pd-empty-state">
            <div className="pd-logo-hero-badge" style={{ width: '220px', height: '220px', marginBottom: '1.25rem' }}>
              <img src="/logo.png" alt="MINPOSTEL Logo" className="pd-logo-hero-img" />
            </div>
            <h1 className="pd-empty-title">MINPOSTEL</h1>
            <p className="pd-empty-subtitle">{lang === 'FR' ? 'Bienvenue au Ministère des Postes et Télécommunications' : 'Welcome to the Ministry of Posts and Telecommunications'}</p>
          </div>
        ) : activeItem && !urgentMessage ? (
          <div key={`${currentIndex}-${lang}`} className="pd-slide active">
            {/* Dynamic Ambient Color Aura Glow (Controlled subtle depth) */}
            <div 
              className="pd-slide-ambient-aura"
              style={{
                background: `radial-gradient(circle at 50% 50%, rgba(37, 99, 235, 0.18) 0%, transparent 70%)`
              }}
            />

            <div
              className="pd-slide-content"
              style={{
                background: '#0D1B2A',
                borderColor: activeItem.card_color ? `${activeItem.card_color}60` : 'rgba(255, 255, 255, 0.08)',
                boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.85), 0 0 25px rgba(11, 23, 42, 0.5)'
              }}
            >
              {/* Media Section (Side of the Information) */}
              <div className="pd-slide-media">
                {activeItem.media_url ? (
                  activeItem.media_url.endsWith('.mp4') || activeItem.media_url.endsWith('.webm') ? (
                    <video src={activeItem.media_url} autoPlay loop muted playsInline className="pd-slide-media-video" />
                  ) : (
                    <img src={activeItem.media_url} alt="Slide Media" className="pd-slide-media-img" />
                  )
                ) : (
                  <div
                    className="pd-slide-media-placeholder"
                    style={{
                      background: '#08111E'
                    }}
                  >
                    <div className="pd-logo-hero-container">
                      <div className="pd-logo-hero-badge">
                        <img src="/logo.png" alt="MINPOSTEL Logo" className="pd-logo-hero-img" />
                      </div>
                      <div className="pd-logo-hero-caption">
                        <div className="pd-logo-hero-state">{lang === 'FR' ? 'RÉPUBLIQUE DU CAMEROUN' : 'REPUBLIC OF CAMEROON'}</div>
                        <div className="pd-logo-hero-motto">{lang === 'FR' ? 'Paix — Travail — Patrie' : 'Peace — Work — Fatherland'}</div>
                        <div className="pd-logo-hero-ministry">MINPOSTEL</div>
                        <div className="pd-logo-hero-fullname">
                          {lang === 'FR' 
                            ? 'Ministère des Postes et Télécommunications' 
                            : 'Ministry of Posts and Telecommunications'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Visual Gradient Shimmer Edge */}
                <div className="pd-slide-media-gradient-overlay" />
              </div>
              
              {/* Info Section with Staggered Entrance Animations */}
              <div className="pd-slide-info">
                {/* Executive Carousel HUD: Live Progress Dots */}
                <div className="pd-carousel-hud">
                  <div className="pd-carousel-dots">
                    {playlistItems.map((_, idx) => (
                      <span 
                        key={idx} 
                        className={`pd-carousel-dot ${idx === currentIndex ? 'active' : ''}`}
                        style={{
                          backgroundColor: idx === currentIndex ? (activeItem.card_color || '#38BDF8') : 'rgba(255, 255, 255, 0.25)',
                          boxShadow: idx === currentIndex ? `0 0 10px ${activeItem.card_color || '#38BDF8'}` : 'none'
                        }}
                      />
                    ))}
                  </div>
                </div>

                {(() => {
                  const itemDateLabel = getItemDateLabel(activeItem, lang);
                  return (
                    <>
                      {/* LIVE ONGOING INDICATOR (Displayed only when start time for a MEETING has reached) */}
                      {activeItem.itemType === 'MEETING' && isItemStarted(activeItem, currentTime) && (
                        <div
                          className="pd-slide-status-badge ongoing"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            padding: '4px 14px',
                            borderRadius: '20px',
                            background: 'rgba(239, 68, 68, 0.22)',
                            border: '1.5px solid #EF4444',
                            color: '#FCA5A5',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            boxShadow: '0 0 15px rgba(239, 68, 68, 0.45)',
                            marginBottom: '0.5rem',
                            width: 'fit-content'
                          }}
                        >
                          <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#EF4444',
                            boxShadow: '0 0 10px #EF4444',
                            display: 'inline-block',
                            animation: 'pd-pulse-dot 1.2s infinite ease-in-out'
                          }} />
                          <span>{lang === 'FR' ? 'EN COURS' : 'ONGOING'}</span>
                        </div>
                      )}
                      
                      <h2 className="pd-slide-title pd-anim-title">
                        {lang === 'FR' ? activeItem.title_fr : activeItem.title_en}
                      </h2>
                      
                      <div className="pd-slide-meta pd-anim-meta">
                        {/* HIGH-VISIBILITY DATE ROW IN METADATA */}
                        {itemDateLabel && (
                          <div className="pd-meta-item pd-meta-date">
                            <Calendar size={24} style={{ color: '#38BDF8', flexShrink: 0 }} />
                            <span style={{ fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.01em' }}>
                              {itemDateLabel}
                            </span>
                          </div>
                        )}

                        {(activeItem.itemType === 'MEETING' || activeItem.itemType === 'EVENT') && (
                          <>
                            {activeItem.start_time && (
                              <div className="pd-meta-item">
                                <Clock size={24} style={{ color: activeItem.card_color || 'var(--msd-accent)', flexShrink: 0 }} />
                                <span>{activeItem.start_time} {activeItem.end_time ? `— ${activeItem.end_time}` : ''}</span>
                              </div>
                            )}
                            {(activeItem.room_fr || activeItem.room_en || activeItem.building_fr || activeItem.location_fr) && (
                              <div className="pd-meta-item">
                                <MapPin size={24} style={{ color: '#D4AF37', flexShrink: 0 }} />
                                <span>{lang === 'FR' ? (activeItem.building_fr || 'Bâtiment Principal') : (activeItem.building_en || 'Main Building')} - {lang === 'FR' ? (activeItem.room_fr || activeItem.location_fr) : (activeItem.room_en || activeItem.location_en)}</span>
                              </div>
                            )}
                          </>
                        )}

                        {activeItem.itemType === 'COMMUNICATION' && (activeItem.publisher || activeItem.author_name) && (
                          <div className="pd-meta-item">
                            <Megaphone size={22} style={{ color: '#93C5FD', flexShrink: 0 }} />
                            <span>{activeItem.publisher || activeItem.author_name}</span>
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
                
                <p className="pd-slide-desc pd-anim-desc">
                  {lang === 'FR' ? (activeItem.description_fr || activeItem.content_fr) : (activeItem.description_en || activeItem.content_en)}
                </p>

                {/* QR Code Section */}
                {(activeItem.itemType === 'MEETING' || activeItem.itemType === 'EVENT') && (
                  <div className="pd-anim-qr" style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'rgba(0,0,0,0.28)', padding: '1rem', borderRadius: '16px', border: `1px solid ${activeItem.card_color ? `${activeItem.card_color}45` : 'rgba(255,255,255,0.08)'}`, backdropFilter: 'blur(10px)' }}>
                    <div style={{ background: '#FFF', padding: '0.5rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }}>
                      <QRCodeSVG 
                        value={getVisitorQrUrl(activeItem)} 
                        size={64} 
                        fgColor="#0B2545" 
                      />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, color: activeItem.card_color || 'var(--msd-accent)', fontSize: '1.1rem', fontWeight: 700 }}>{lang === 'FR' ? 'Scanner pour les détails' : 'Scan for details'}</h4>
                      <p style={{ margin: '0.2rem 0 0 0', color: '#94A3B8', fontSize: '0.9rem' }}>{lang === 'FR' ? 'Guide visiteur mobile' : 'Mobile visitor guide'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {/* Progress Bar Container overlay on stage bottom */}
        <div className="pd-progress-container">
          <div className="pd-progress-bar" style={{ width: `${progressWidth}%` }}></div>
        </div>
      </main>

      {/* FOOTER TICKER */}
      <footer className="pd-footer">
        <div className="pd-ticker-label">
          <Globe size={18} />
          {lang === 'FR' ? 'INFO MINPOSTEL' : 'MINPOSTEL INFO'}
        </div>
        <div className="pd-ticker-wrap">
          <div className="pd-ticker-content">
            <div className="pd-ticker-item">
              <span>{lang === 'FR' ? 'Ministère des Postes et Télécommunications' : 'Ministry of Posts and Telecommunications'}</span>
              <span className="pd-ticker-item-separator">•</span>
              {newsFeeds.map((feed) => (
                <React.Fragment key={`feed-${feed.id}`}>
                  <span>{lang === 'FR' ? feed.text_fr : feed.text_en}</span>
                  <span className="pd-ticker-item-separator">•</span>
                </React.Fragment>
              ))}
              {announcements.filter(a => a.status === 'PUBLISHED' && !isItemExpired(a, currentTime)).map((a, i) => (
                <React.Fragment key={i}>
                  <span>{lang === 'FR' ? a.title_fr : a.title_en}</span>
                  <span className="pd-ticker-item-separator">•</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
