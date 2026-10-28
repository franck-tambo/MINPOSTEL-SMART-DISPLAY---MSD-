import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Radio, 
  StopCircle, 
  Send, 
  Volume2, 
  Trash2, 
  RotateCcw, 
  Clock, 
  Timer, 
  History, 
  ChevronDown, 
  ChevronUp, 
  Play, 
  Calendar 
} from 'lucide-react';
import FlagBadge from '../components/FlagBadge';
import { useLanguage } from '../context/LanguageContext';
import { playEmergencyChime } from '../utils/alertSound.util';
import { getCached, setCached } from '../utils/apiCache';

export default function UrgentMessagesPage() {
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState(() => getCached('urgent-messages') || []);
  const [msgFr, setMsgFr] = useState('');
  const [msgEn, setMsgEn] = useState('');
  const [toast, setToast] = useState(null);
  const [expandedHistory, setExpandedHistory] = useState({});
  const [nowTime, setNowTime] = useState(Date.now());

  // Ticker for live calculation of active broadcast durations
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchUrgent = () => {
    fetch('/api/urgent-messages')
      .then(r => r.json())
      .then(d => {
        if (d.status === 'success' && d.data) {
          setMessages(d.data);
          setCached('urgent-messages', d.data);
        }
      })
      .catch(err => console.error("Could not fetch urgent messages:", err));
  };

  useEffect(() => {
    fetchUrgent();
  }, []);

  const toggleHistory = (id) => {
    setExpandedHistory(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!msgFr || !msgEn) return;

    try {
      const token = localStorage.getItem('msd_auth_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/urgent-messages', {
        method: 'POST',
        headers,
        body: JSON.stringify({ message_fr: msgFr, message_en: msgEn, priority: 'CRITICAL' })
      });
      if (res.ok) {
        setToast(language === 'FR' ? "Message urgent diffusé immédiatement sur l'écran physique !" : "Urgent message broadcasted immediately to lobby screen!");
        setMsgFr('');
        setMsgEn('');
        fetchUrgent();
        setTimeout(() => setToast(null), 5000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDismiss = async (id) => {
    try {
      const token = localStorage.getItem('msd_auth_token');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/urgent-messages/${id}/dismiss`, { method: 'PATCH', headers });
      if (res.ok) {
        setToast(language === 'FR' ? "Message urgent interrompu. L'écran reprend sa rotation normale." : "Urgent alert dismissed. Display resumes normal rotation.");
        fetchUrgent();
        setTimeout(() => setToast(null), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRebroadcast = async (item) => {
    const confirmed = window.confirm(
      language === 'FR'
        ? `Re-diffuser immédiatement cette alerte sur les écrans du Ministère ?\n\n"${item.message_fr}"`
        : `Immediately re-broadcast this urgent alert on the ministry display screens?\n\n"${item.message_en || item.message_fr}"`
    );
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('msd_auth_token');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/urgent-messages/${item.id}/rebroadcast`, {
        method: 'POST',
        headers
      });
      if (res.ok) {
        setToast(
          language === 'FR'
            ? "Alerte re-diffusée en temps réel avec succès !"
            : "Urgent alert re-broadcasted in real time!"
        );
        fetchUrgent();
        setTimeout(() => setToast(null), 5000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id, messageFr) => {
    const confirmed = window.confirm(
      language === 'FR'
        ? `Supprimer définitivement ce message et son historique de traçabilité ?\n"${messageFr}"\n\nCette action est irréversible.`
        : `Permanently delete this message and its traceability history?\n"${messageFr}"\n\nThis action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('msd_auth_token');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/urgent-messages/${id}`, { method: 'DELETE', headers });
      if (res.ok) {
        setToast(language === 'FR' ? 'Message supprimé de l\'historique.' : 'Message deleted from history.');
        fetchUrgent();
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Format date and precise time
  const formatDateTime = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleString(language === 'FR' ? 'fr-FR' : 'en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  // Format duration in hours, minutes, seconds
  const formatDuration = (seconds) => {
    if (seconds === undefined || seconds === null || isNaN(seconds) || seconds < 0) return '—';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return language === 'FR' ? `${hrs} h ${mins} min ${secs} s` : `${hrs}h ${mins}m ${secs}s`;
    }
    if (mins > 0) {
      return language === 'FR' ? `${mins} min ${secs} s` : `${mins}m ${secs}s`;
    }
    return language === 'FR' ? `${secs} s` : `${secs}s`;
  };

  return (
    <div className="page-container">
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 9999,
          backgroundColor: 'var(--status-offline)',
          color: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: 'var(--radius-sm)',
          fontWeight: 600,
          fontSize: '0.875rem',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          animation: 'fadeIn 0.3s ease'
        }}>
          <AlertTriangle size={18} />
          <span>{toast}</span>
        </div>
      )}

      <div className="page-header-container">
        <div>
          <h2 className="page-title">
            <AlertTriangle size={22} style={{ color: '#EF4444' }} />
            <span>{language === 'FR' ? 'Diffusion Immédiate de Messages Urgents' : 'Urgent Messages Immediate Broadcast'}</span>
          </h2>
          <p className="page-subtitle">
            {language === 'FR' 
              ? "Interrompez la rotation normale de l'écran pour afficher un bandeau d'alerte prioritaire avec traçabilité complète des diffusions et des arrêts." 
              : "Override normal display rotation with high-priority institutional alerts with full traceability of broadcast and stop times."}
          </p>
        </div>
      </div>

      {/* Broadcast Form */}
      <div className="admin-card" style={{
        padding: '1.75rem',
        marginBottom: '2rem',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#EF4444', marginBottom: '1.25rem' }}>
          <Radio size={20} className="pulse-red" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
            {language === 'FR' ? 'Émettre une Nouvelle Alerte en Temps Réel' : 'Broadcast a New Real-Time Alert'}
          </h3>
        </div>

        <form onSubmit={handleBroadcast}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            {/* French Message */}
            <div className="form-section" style={{ margin: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                <FlagBadge lang="FR" size="sm" />
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                  {language === 'FR' ? "Texte de l'alerte (Français)" : 'Alert text (French)'}
                </label>
              </div>
              <textarea
                rows={3}
                required
                value={msgFr}
                onChange={e => setMsgFr(e.target.value)}
                placeholder="Ex: Alerte Sanitaire ou Consigne d'Évacuation Immédiate..."
                style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border-color)', padding: '10px' }}
              />
            </div>

            {/* English Message */}
            <div className="form-section" style={{ margin: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                <FlagBadge lang="EN" size="sm" />
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                  {language === 'FR' ? "Texte de l'alerte (Anglais)" : 'Alert text (English)'}
                </label>
              </div>
              <textarea
                rows={3}
                required
                value={msgEn}
                onChange={e => setMsgEn(e.target.value)}
                placeholder="Ex: Health Advisory or Immediate Evacuation Notice..."
                style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border-color)', padding: '10px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
            <button
              type="submit"
              style={{
                backgroundColor: '#EF4444',
                color: '#FFFFFF',
                border: 'none',
                padding: '10px 22px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)',
                transition: 'all 0.2s ease'
              }}
            >
              <Send size={16} />
              <span>{language === 'FR' ? "Diffuser Immédiatement sur l'Écran" : 'Broadcast Immediately to Display'}</span>
            </button>

            <button
              type="button"
              onClick={() => playEmergencyChime()}
              style={{
                backgroundColor: '#FFF1F2',
                color: '#BE123C',
                border: '1px solid #FECDD3',
                padding: '10px 16px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease'
              }}
              title={language === 'FR' ? "Tester la tonalité d'alarme diffusée sur l'écran" : "Test the alarm chime broadcasted on lobby displays"}
            >
              <Volume2 size={16} />
              <span>{language === 'FR' ? "Tester le Signal Sonore" : "Test Audio Alarm"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Active & Historical Messages with Traceability */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <History size={18} style={{ color: 'var(--primary-color)' }} />
          <span>{language === 'FR' ? 'Historique et Traçabilité des Diffusions' : 'Active Broadcasts & History Traceability'}</span>
        </h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {messages.length} {language === 'FR' ? 'alerte(s) enregistrée(s)' : 'alert(s) recorded'}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
        {messages.map((item) => {
          const isActive = item.status === 'ACTIVE';
          const historyList = Array.isArray(item.broadcast_history) ? item.broadcast_history : [];
          
          // Latest broadcast and stop times
          const broadcastStart = item.broadcasted_at || item.start_time;
          const broadcastStop = item.stopped_at;

          // Calculate current airtime or total recorded duration
          let activeDurationSec = 0;
          if (isActive && broadcastStart) {
            activeDurationSec = Math.max(0, Math.floor((nowTime - new Date(broadcastStart).getTime()) / 1000));
          } else if (broadcastStart && broadcastStop) {
            activeDurationSec = Math.max(0, Math.floor((new Date(broadcastStop).getTime() - new Date(broadcastStart).getTime()) / 1000));
          }

          const hasMultipleSessions = historyList.length > 1;
          const isHistoryExpanded = !!expandedHistory[item.id];

          return (
            <div key={item.id} className="admin-card" style={{
              padding: '1.25rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              borderRadius: '12px',
              border: isActive ? '2px solid #EF4444' : '1px solid var(--border-color)',
              backgroundColor: isActive ? 'rgba(239, 68, 68, 0.02)' : 'var(--surface-color)',
              boxShadow: isActive ? '0 4px 18px rgba(239, 68, 68, 0.12)' : 'var(--shadow-sm)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Header Bar */}
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.6rem' }}>
                  {isActive ? (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      backgroundColor: '#FEE2E2',
                      color: '#DC2626',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      letterSpacing: '0.04em'
                    }}>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#EF4444',
                        boxShadow: '0 0 8px #EF4444'
                      }} />
                      {language === 'FR' ? 'DIFFUSION EN COURS (DIRECT)' : 'ACTIVE BROADCAST (LIVE)'}
                    </span>
                  ) : (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      backgroundColor: '#F1F5F9',
                      color: '#475569',
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}>
                      <StopCircle size={12} style={{ color: '#64748B' }} />
                      {language === 'FR' ? 'DIFFUSION ARRÊTÉE' : 'BROADCAST STOPPED'}
                    </span>
                  )}

                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: '#B91C1C',
                    fontSize: '0.7rem',
                    fontWeight: 700
                  }}>
                    {item.priority || 'CRITICAL'}
                  </span>

                  {historyList.length > 0 && (
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(59, 130, 246, 0.08)',
                      color: '#2563EB',
                      fontSize: '0.7rem',
                      fontWeight: 600
                    }}>
                      {historyList.length} {language === 'FR' ? 'cycle(s) de diffusion' : 'broadcast cycle(s)'}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                  {isActive ? (
                    <button
                      onClick={() => handleDismiss(item.id)}
                      className="btn-secondary"
                      style={{
                        backgroundColor: '#DC2626',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        boxShadow: '0 2px 6px rgba(220, 38, 38, 0.3)'
                      }}
                    >
                      <StopCircle size={15} />
                      <span>{language === 'FR' ? "Interrompre la Diffusion" : 'Stop Broadcast'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRebroadcast(item)}
                      title={language === 'FR' ? "Diffuser à nouveau ce message sur l'écran" : "Re-broadcast this message to display"}
                      style={{
                        backgroundColor: 'rgba(37, 99, 235, 0.08)',
                        color: '#2563EB',
                        border: '1px solid rgba(37, 99, 235, 0.25)',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.15)'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.08)'; }}
                    >
                      <RotateCcw size={14} />
                      <span>{language === 'FR' ? 'Re-diffuser' : 'Re-broadcast'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(item.id, item.message_fr)}
                    title={language === 'FR' ? 'Supprimer définitivement de l\'historique' : 'Delete permanently from history'}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: 'rgba(239, 68, 68, 0.06)',
                      color: '#DC2626',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.06)'; }}
                  >
                    <Trash2 size={14} />
                    <span>{language === 'FR' ? 'Supprimer' : 'Delete'}</span>
                  </button>
                </div>
              </div>

              {/* Message Content */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: 'var(--text-dark)', fontSize: '0.925rem', fontWeight: 600, lineHeight: 1.4 }}>
                  <div style={{ marginTop: '3px' }}><FlagBadge lang="FR" size="sm" /></div>
                  <span>{item.message_fr}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: 'var(--text-dim)', fontSize: '0.85rem', fontStyle: 'italic', lineHeight: 1.4 }}>
                  <div style={{ marginTop: '3px' }}><FlagBadge lang="EN" size="sm" /></div>
                  <span>{item.message_en}</span>
                </div>
              </div>

              {/* Traceability Timestamps & Duration Panel */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.85rem',
                padding: '0.85rem 1rem',
                backgroundColor: 'var(--surface-subtle)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontSize: '0.8rem'
              }}>
                {/* Broadcasted Time */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#2563EB', fontWeight: 700 }}>
                    <Radio size={14} />
                    <span>{language === 'FR' ? 'Diffusé à (Début)' : 'Broadcasted At (Start)'}</span>
                  </div>
                  <div style={{ color: 'var(--text-dark)', fontWeight: 600 }}>
                    {formatDateTime(broadcastStart)}
                  </div>
                </div>

                {/* Stopped Time */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: isActive ? '#16A34A' : '#DC2626', fontWeight: 700 }}>
                    <StopCircle size={14} />
                    <span>{language === 'FR' ? "Arrêté à (Fin)" : 'Stopped At (End)'}</span>
                  </div>
                  <div>
                    {isActive ? (
                      <span style={{ color: '#16A34A', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16A34A' }} />
                        {language === 'FR' ? 'En direct sur l\'écran' : 'Currently Live on Screen'}
                      </span>
                    ) : broadcastStop ? (
                      <span style={{ color: 'var(--text-dark)', fontWeight: 600 }}>
                        {formatDateTime(broadcastStop)}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>
                        {language === 'FR' ? 'Terminé (antérieur)' : 'Ended (legacy)'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Duration */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#D97706', fontWeight: 700 }}>
                    <Timer size={14} />
                    <span>{language === 'FR' ? "Durée d'Affichage" : 'Airtime Duration'}</span>
                  </div>
                  <div style={{ color: 'var(--text-dark)', fontWeight: 700 }}>
                    {isActive ? (
                      <span style={{ color: '#DC2626', fontVariantNumeric: 'tabular-nums' }}>
                        ⏱️ {formatDuration(activeDurationSec)} ({language === 'FR' ? 'En cours' : 'Live'})
                      </span>
                    ) : (
                      <span>{formatDuration(activeDurationSec)}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Multi-cycle Detailed History Timeline */}
              {historyList.length > 0 && (
                <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '0.65rem' }}>
                  <button
                    onClick={() => toggleHistory(item.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px 0',
                      color: 'var(--primary-color)',
                      fontSize: '0.785rem',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <History size={14} />
                    <span>
                      {isHistoryExpanded
                        ? (language === 'FR' ? "Masquer les détails des cycles de diffusion" : "Hide broadcast cycles timeline")
                        : (language === 'FR' ? `Afficher l'historique complet des ${historyList.length} diffusion(s)` : `Show full timeline of ${historyList.length} broadcast cycle(s)`)}
                    </span>
                    {isHistoryExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {isHistoryExpanded && (
                    <div style={{
                      marginTop: '0.65rem',
                      padding: '0.75rem',
                      backgroundColor: 'rgba(19, 64, 116, 0.03)',
                      borderRadius: '8px',
                      border: '1px solid rgba(19, 64, 116, 0.1)'
                    }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
                        {language === 'FR' ? 'Journal Chronologique des Diffusions & Arrêts :' : 'Chronological Broadcast & Stop Log:'}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {historyList.map((session, idx) => {
                          const cycleStart = session.broadcasted_at;
                          const cycleStop = session.stopped_at;
                          const isSessionActive = !cycleStop && isActive && idx === historyList.length - 1;
                          
                          let cycleSec = session.duration_seconds;
                          if (!cycleSec) {
                            if (isSessionActive && cycleStart) {
                              cycleSec = Math.max(0, Math.floor((nowTime - new Date(cycleStart).getTime()) / 1000));
                            } else if (cycleStart && cycleStop) {
                              cycleSec = Math.max(0, Math.floor((new Date(cycleStop).getTime() - new Date(cycleStart).getTime()) / 1000));
                            }
                          }

                          return (
                            <div key={idx} style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '0.5rem',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              backgroundColor: isSessionActive ? '#FEE2E2' : '#FFFFFF',
                              border: isSessionActive ? '1px solid #FECDD3' : '1px solid var(--border-color)',
                              fontSize: '0.75rem'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{
                                  backgroundColor: isSessionActive ? '#DC2626' : 'var(--primary-color)',
                                  color: '#FFFFFF',
                                  borderRadius: '4px',
                                  padding: '1px 6px',
                                  fontWeight: 700,
                                  fontSize: '0.7rem'
                                }}>
                                  #{idx + 1}
                                </span>
                                <div>
                                  <span style={{ color: 'var(--text-muted)' }}>{language === 'FR' ? 'Diffusé : ' : 'Start: '}</span>
                                  <strong style={{ color: 'var(--text-dark)' }}>{formatDateTime(cycleStart)}</strong>
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div>
                                  <span style={{ color: 'var(--text-muted)' }}>{language === 'FR' ? 'Arrêté : ' : 'Stop: '}</span>
                                  {isSessionActive ? (
                                    <strong style={{ color: '#DC2626' }}>{language === 'FR' ? 'En direct...' : 'Live...'}</strong>
                                  ) : (
                                    <strong style={{ color: 'var(--text-dark)' }}>{formatDateTime(cycleStop)}</strong>
                                  )}
                                </div>

                                <div style={{
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  backgroundColor: isSessionActive ? '#DC2626' : 'var(--surface-subtle)',
                                  color: isSessionActive ? '#FFFFFF' : 'var(--text-dark)',
                                  fontWeight: 700
                                }}>
                                  {formatDuration(cycleSec)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {messages.length === 0 && (
          <div className="empty-state-box">
            {t('noData')}
          </div>
        )}
      </div>
    </div>
  );
}
