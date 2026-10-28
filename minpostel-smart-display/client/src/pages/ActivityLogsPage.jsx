import React, { useState, useEffect, useCallback } from 'react';
import {
  History,
  Shield,
  User,
  Clock,
  Search,
  Filter,
  Trash2,
  RefreshCw,
  Download,
  AlertTriangle,
  Megaphone,
  Calendar,
  Settings,
  LogIn,
  Radio,
  Newspaper,
  Building2,
  ChevronDown,
  XCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getCached, setCached } from '../utils/apiCache';
import { io } from 'socket.io-client';

// Action type icon and color mapping
const ACTION_MAP = {
  LOGIN:        { icon: LogIn,         color: '#10B981', bg: 'rgba(16, 185, 129, 0.08)' },
  FAILED_LOGIN: { icon: Shield,        color: '#EF4444', bg: 'rgba(239, 68, 68, 0.08)' },
  CREATE:       { icon: Megaphone,     color: '#2563EB', bg: 'rgba(37, 99, 235, 0.08)' },
  UPDATE:       { icon: RefreshCw,     color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.08)' },
  DELETE:       { icon: Trash2,        color: '#DC2626', bg: 'rgba(220, 38, 38, 0.08)' },
  BROADCAST:    { icon: Radio,         color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.08)' },
  DISMISS:      { icon: XCircle,       color: '#64748B', bg: 'rgba(100, 116, 139, 0.08)' },
  SETTINGS:     { icon: Settings,      color: '#6366F1', bg: 'rgba(99, 102, 241, 0.08)' },
  CLEAR_LOGS:   { icon: Trash2,        color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.08)' },
  DEFAULT:      { icon: History,       color: '#134074', bg: 'rgba(19, 64, 116, 0.08)' }
};

const ENTITY_MAP = {
  USER:           { label_fr: 'Utilisateur',       label_en: 'User',            color: '#10B981' },
  SECURITY:       { label_fr: 'Sécurité',          label_en: 'Security',        color: '#EF4444' },
  ANNOUNCEMENT:   { label_fr: 'Annonce',           label_en: 'Announcement',    color: '#2563EB' },
  MEETING:        { label_fr: 'Réunion',           label_en: 'Meeting',         color: '#10B981' },
  EVENT:          { label_fr: 'Événement',         label_en: 'Event',           color: '#8B5CF6' },
  COMMUNICATION:  { label_fr: 'Communication',     label_en: 'Communication',   color: '#0EA5E9' },
  URGENT_MESSAGE: { label_fr: 'Message Urgent',    label_en: 'Urgent Message',  color: '#EF4444' },
  CONFIG:         { label_fr: 'Configuration',     label_en: 'Configuration',   color: '#6366F1' },
  BUILDINGS:      { label_fr: 'Bâtiments',         label_en: 'Buildings',       color: '#0EA5E9' },
  AUDIT:          { label_fr: 'Audit',             label_en: 'Audit',           color: '#94A3B8' },
  SYSTEM:         { label_fr: 'Système',           label_en: 'System',          color: '#64748B' }
};

export default function ActivityLogsPage() {
  const { language, t } = useLanguage();
  const [logs, setLogs] = useState(() => getCached('logs') || []);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');
  const [filterEntity, setFilterEntity] = useState('ALL');
  const [toast, setToast] = useState(null);

  const fetchLogs = useCallback(() => {
    setLoading(true);
    const token = localStorage.getItem('msd_auth_token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch('/api/logs', { headers })
      .then(r => r.json())
      .then(d => {
        if (d.status === 'success' && d.data) {
          setLogs(d.data);
          setCached('logs', d.data);
        }
      })
      .catch(err => console.error("Could not fetch logs:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchLogs();

    // Real-time new log listener
    const socket = io('/', { path: '/socket.io' });
    socket.on('NEW_ACTIVITY_LOG', (newLog) => {
      setLogs(prev => [newLog, ...prev]);
    });
    socket.on('ACTIVITY_LOGS_CLEARED', () => {
      setLogs([]);
    });
    return () => socket.disconnect();
  }, [fetchLogs]);

  // Client-side filtering
  const filteredLogs = logs.filter(log => {
    if (filterAction !== 'ALL' && log.action !== filterAction) return false;
    if (filterEntity !== 'ALL' && log.entity_type !== filterEntity) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      return (
        (log.description && log.description.toLowerCase().includes(q)) ||
        (log.user && log.user.toLowerCase().includes(q)) ||
        (log.ip_address && log.ip_address.includes(q)) ||
        (log.action && log.action.toLowerCase().includes(q)) ||
        (log.entity_type && log.entity_type.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleClearLogs = async () => {
    const confirmed = window.confirm(
      language === 'FR'
        ? "Êtes-vous sûr de vouloir réinitialiser l'intégralité du journal d'activités ?\n\nCette action est irréversible et supprimera tous les enregistrements."
        : "Are you sure you want to clear the entire activity log?\n\nThis action is irreversible and will delete all records."
    );
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('msd_auth_token');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/logs', { method: 'DELETE', headers });
      if (res.ok) {
        fetchLogs();
        setToast(language === 'FR' ? "Journal d'activités réinitialisé avec succès." : 'Activity logs cleared successfully.');
        setTimeout(() => setToast(null), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;

    const header = 'Timestamp,Action,Entity,Description,User,IP Address';
    const rows = filteredLogs.map(log => {
      const desc = (log.description || '').replace(/"/g, '""');
      return `"${log.created_at}","${log.action}","${log.entity_type}","${desc}","${log.user}","${log.ip_address}"`;
    });

    const csv = [header, ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MINPOSTEL_activity_logs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    setToast(language === 'FR' ? `${filteredLogs.length} entrées exportées en CSV.` : `${filteredLogs.length} entries exported to CSV.`);
    setTimeout(() => setToast(null), 3000);
  };

  const formatDateTime = (isoStr) => {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
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
      return isoStr;
    }
  };

  const getTimeAgo = (isoStr) => {
    if (!isoStr) return '';
    try {
      const diff = Math.max(0, Math.floor((Date.now() - new Date(isoStr).getTime()) / 1000));
      if (diff < 60) return language === 'FR' ? `Il y a ${diff}s` : `${diff}s ago`;
      if (diff < 3600) return language === 'FR' ? `Il y a ${Math.floor(diff / 60)} min` : `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return language === 'FR' ? `Il y a ${Math.floor(diff / 3600)}h` : `${Math.floor(diff / 3600)}h ago`;
      return language === 'FR' ? `Il y a ${Math.floor(diff / 86400)}j` : `${Math.floor(diff / 86400)}d ago`;
    } catch {
      return '';
    }
  };

  // Compute unique actions and entity types for filter dropdowns
  const uniqueActions = [...new Set(logs.map(l => l.action).filter(Boolean))];
  const uniqueEntities = [...new Set(logs.map(l => l.entity_type).filter(Boolean))];

  // Stats bar
  const totalLogs = logs.length;
  const todayCount = logs.filter(l => {
    try { return new Date(l.created_at).toDateString() === new Date().toDateString(); } catch { return false; }
  }).length;
  const loginCount = logs.filter(l => l.action === 'LOGIN').length;
  const securityCount = logs.filter(l => l.action === 'FAILED_LOGIN' || l.entity_type === 'SECURITY').length;

  return (
    <div className="page-container">
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 9999,
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: '8px',
          fontWeight: 600,
          fontSize: '0.875rem',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          animation: 'fadeIn 0.3s ease'
        }}>
          <History size={16} />
          <span>{toast}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="page-title">
            <History size={22} style={{ color: 'var(--primary)' }} />
            <span>{language === 'FR' ? "Journal d'Activités & Audit de Traçabilité" : 'Activity Logs & Audit Trail'}</span>
          </h2>
          <p className="page-subtitle">
            {language === 'FR'
              ? 'Suivi en temps réel de toutes les actions administratives : connexions, créations, modifications, suppressions et diffusions.'
              : 'Real-time tracking of all administrative actions: logins, creations, updates, deletions, and broadcasts.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleExportCSV}
            disabled={filteredLogs.length === 0}
            style={{
              backgroundColor: 'var(--surface-subtle)',
              color: 'var(--text-dark)',
              border: '1px solid var(--border-color)',
              padding: '8px 14px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: filteredLogs.length === 0 ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              opacity: filteredLogs.length === 0 ? 0.5 : 1,
              transition: 'all 0.15s ease'
            }}
          >
            <Download size={14} />
            <span>{language === 'FR' ? 'Exporter CSV' : 'Export CSV'}</span>
          </button>

          <button
            onClick={fetchLogs}
            style={{
              backgroundColor: 'var(--surface-subtle)',
              color: 'var(--primary-color)',
              border: '1px solid var(--border-color)',
              padding: '8px 14px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.15s ease'
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>{language === 'FR' ? 'Actualiser' : 'Refresh'}</span>
          </button>

          <button
            onClick={handleClearLogs}
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.06)',
              color: '#DC2626',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              padding: '8px 14px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.15s ease'
            }}
          >
            <Trash2 size={14} />
            <span>{language === 'FR' ? 'Réinitialiser' : 'Clear All'}</span>
          </button>
        </div>
      </div>

      {/* Statistics Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '0.85rem',
        marginBottom: '1.5rem'
      }}>
        {[
          {
            label: language === 'FR' ? 'Total Entrées' : 'Total Entries',
            value: totalLogs,
            icon: History,
            color: '#134074'
          },
          {
            label: language === 'FR' ? "Aujourd'hui" : 'Today',
            value: todayCount,
            icon: Clock,
            color: '#2563EB'
          },
          {
            label: language === 'FR' ? 'Connexions' : 'Logins',
            value: loginCount,
            icon: LogIn,
            color: '#10B981'
          },
          {
            label: language === 'FR' ? 'Alertes Sécurité' : 'Security Alerts',
            value: securityCount,
            icon: Shield,
            color: securityCount > 0 ? '#EF4444' : '#64748B'
          }
        ].map((stat, i) => {
          const StatIcon = stat.icon;
          return (
            <div key={i} className="admin-card" style={{
              padding: '1rem 1.15rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              borderRadius: '10px'
            }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: `${stat.color}12`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <StatIcon size={18} style={{ color: stat.color }} />
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)', lineHeight: 1 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '2px' }}>
                  {stat.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search & Filter Bar */}
      <div className="admin-card" style={{
        padding: '1rem 1.25rem',
        marginBottom: '1.25rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '0.75rem',
        borderRadius: '10px'
      }}>
        {/* Search */}
        <div style={{
          flex: '1 1 280px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-dim)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={language === 'FR' ? 'Rechercher dans le journal (description, utilisateur, IP...)' : 'Search logs (description, user, IP...)'}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              fontSize: '0.825rem',
              backgroundColor: 'var(--surface-subtle)',
              color: 'var(--text-dark)'
            }}
          />
        </div>

        {/* Action Filter */}
        <div style={{ position: 'relative', flex: '0 0 auto' }}>
          <select
            value={filterAction}
            onChange={e => setFilterAction(e.target.value)}
            style={{
              padding: '9px 30px 9px 12px',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 600,
              backgroundColor: 'var(--surface-subtle)',
              color: 'var(--text-dark)',
              appearance: 'none',
              cursor: 'pointer',
              minWidth: '140px'
            }}
          >
            <option value="ALL">{language === 'FR' ? '⚡ Toutes Actions' : '⚡ All Actions'}</option>
            {uniqueActions.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-dim)' }} />
        </div>

        {/* Entity Filter */}
        <div style={{ position: 'relative', flex: '0 0 auto' }}>
          <select
            value={filterEntity}
            onChange={e => setFilterEntity(e.target.value)}
            style={{
              padding: '9px 30px 9px 12px',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 600,
              backgroundColor: 'var(--surface-subtle)',
              color: 'var(--text-dark)',
              appearance: 'none',
              cursor: 'pointer',
              minWidth: '160px'
            }}
          >
            <option value="ALL">{language === 'FR' ? '🏷️ Toutes Entités' : '🏷️ All Entities'}</option>
            {uniqueEntities.map(e => (
              <option key={e} value={e}>{ENTITY_MAP[e]?.[language === 'FR' ? 'label_fr' : 'label_en'] || e}</option>
            ))}
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-dim)' }} />
        </div>

        {/* Active Filters Reset */}
        {(filterAction !== 'ALL' || filterEntity !== 'ALL' || searchQuery.trim()) && (
          <button
            onClick={() => { setFilterAction('ALL'); setFilterEntity('ALL'); setSearchQuery(''); }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#DC2626',
              fontSize: '0.78rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '6px 10px',
              borderRadius: '6px',
              backgroundColor: 'rgba(220, 38, 38, 0.06)'
            }}
          >
            <XCircle size={14} />
            {language === 'FR' ? 'Effacer les filtres' : 'Clear filters'}
          </button>
        )}

        {/* Result Count */}
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: 'auto' }}>
          {filteredLogs.length} / {totalLogs} {language === 'FR' ? 'entrées' : 'entries'}
        </span>
      </div>

      {/* Log Entries Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {filteredLogs.map((log) => {
          const actionInfo = ACTION_MAP[log.action] || ACTION_MAP.DEFAULT;
          const ActionIcon = actionInfo.icon;
          const entityInfo = ENTITY_MAP[log.entity_type] || ENTITY_MAP.SYSTEM;

          return (
            <div key={log.id} className="admin-card" style={{
              padding: '0.85rem 1.15rem',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              borderLeft: `3px solid ${actionInfo.color}`,
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
            >
              {/* Action Icon */}
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: actionInfo.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <ActionIcon size={17} style={{ color: actionInfo.color }} />
              </div>

              {/* Main Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <span style={{
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    color: actionInfo.color,
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em'
                  }}>
                    {log.action}
                  </span>

                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    backgroundColor: `${entityInfo.color}12`,
                    color: entityInfo.color
                  }}>
                    {entityInfo[language === 'FR' ? 'label_fr' : 'label_en'] || log.entity_type}
                  </span>
                </div>

                <p style={{
                  fontSize: '0.84rem',
                  color: 'var(--text-dark)',
                  fontWeight: 500,
                  margin: 0,
                  lineHeight: 1.35,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {log.description}
                </p>
              </div>

              {/* Meta: User + IP */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '0.15rem',
                flexShrink: 0,
                minWidth: '120px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-dark)', fontWeight: 600 }}>
                  <User size={12} />
                  <span>{log.user || 'system'}</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                  IP: {log.ip_address || '—'}
                </div>
              </div>

              {/* Timestamp */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '0.1rem',
                flexShrink: 0,
                minWidth: '145px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-dark)', fontWeight: 600 }}>
                  <Clock size={12} />
                  <span>{formatDateTime(log.created_at)}</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  {getTimeAgo(log.created_at)}
                </div>
              </div>
            </div>
          );
        })}

        {filteredLogs.length === 0 && (
          <div className="empty-state-box" style={{ padding: '3rem', textAlign: 'center' }}>
            <History size={36} style={{ color: 'var(--text-dim)', marginBottom: '0.75rem' }} />
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
              {searchQuery || filterAction !== 'ALL' || filterEntity !== 'ALL'
                ? (language === 'FR'
                  ? 'Aucune entrée ne correspond aux filtres sélectionnés.'
                  : 'No entries match the selected filters.')
                : t('noData')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
