import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, MapPin, Users, AlertTriangle, CheckCircle2, XCircle, X, Trash2, Edit2 } from 'lucide-react';
import FlagBadge from '../components/FlagBadge';
import MediaUploadInput from '../components/MediaUploadInput';
import ColorThemePicker from '../components/ColorThemePicker';
import { useLanguage } from '../context/LanguageContext';

import { getCached, setCached } from '../utils/apiCache';
import { isItemExpired, getItemComputedStatus, getStatusLabel } from '../utils/expiration.util';

export default function MeetingsPage() {
  const { language, t } = useLanguage();
  const [meetings, setMeetings] = useState(() => getCached('meetings') || []);
  const [loading, setLoading] = useState(() => !getCached('meetings'));
  const [activeTab, setActiveTab] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  // Clock ticker to dynamically auto-update completed status
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 5000);
    return () => clearInterval(timer);
  }, []);

  const defaultForm = {
    title_fr: '',
    title_en: '',
    description_fr: '',
    description_en: '',
    date: new Date().toISOString().split('T')[0],
    start_time: '14:00',
    end_time: '16:00',
    building_id: '1',
    floor_id: '3',
    room_id: '2',
    participants_info: '',
    priority: 'NORMAL',
    media_url: '',
    card_color: '#134074'
  };

  const [form, setForm] = useState(defaultForm);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchMeetings = (silent = false) => {
    if (!silent && !getCached('meetings')) setLoading(true);
    fetch('/api/meetings')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && data.data) {
          setMeetings(data.data);
          setCached('meetings', data.data);
        }
      })
      .catch(err => console.error('Failed to load meetings', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMeetings(true);
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (form.end_time <= form.start_time) {
      showToast(language === 'FR' ? "L'heure de fin doit être strictement supérieure à l'heure de début" : "End time must be strictly after start time", 'error');
      return;
    }

    try {
      const token = localStorage.getItem('msd_auth_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const url = editingId ? `/api/meetings/${editingId}` : '/api/meetings';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        showToast(language === 'FR' ? (editingId ? 'Réunion modifiée avec succès' : 'Réunion programmée avec succès') : (editingId ? 'Meeting updated successfully' : 'Meeting scheduled successfully'));
        setIsModalOpen(false);
        setEditingId(null);
        setForm(defaultForm);
        fetchMeetings();
      } else {
        showToast(data.message || (language === 'FR' ? "Erreur lors de l'enregistrement" : 'Save error'), 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const token = localStorage.getItem('msd_auth_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/meetings/${id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showToast(language === 'FR' ? `Statut mis à jour : ${status}` : `Status updated: ${status}`);
        fetchMeetings();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleEdit = (item) => {
    setForm({
      title_fr: item.title_fr || '',
      title_en: item.title_en || '',
      description_fr: item.description_fr || '',
      description_en: item.description_en || '',
      date: item.date ? item.date.split('T')[0] : new Date().toISOString().split('T')[0],
      start_time: item.start_time || '14:00',
      end_time: item.end_time || '16:00',
      building_id: item.building_id?.toString() || '1',
      floor_id: item.floor_id?.toString() || '3',
      room_id: item.room_id?.toString() || '2',
      participants_info: item.participants_info || '',
      priority: item.priority || 'NORMAL',
      media_url: item.media_url || '',
      card_color: item.card_color || '#134074'
    });
    setEditingId(item.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('confirmDelete'))) return;
    try {
      const token = localStorage.getItem('msd_auth_token');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/meetings/${id}`, { method: 'DELETE', headers });
      if (res.ok) {
        showToast(t('successDeleted'));
        fetchMeetings();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filteredMeetings = meetings.filter(item => {
    const computed = getItemComputedStatus(item, currentTime);
    if (activeTab === 'UPCOMING' && computed !== 'UPCOMING' && computed !== 'SCHEDULED') return false;
    if (activeTab === 'IN_PROGRESS' && computed !== 'IN_PROGRESS') return false;
    if (activeTab === 'COMPLETED' && computed !== 'COMPLETED') return false;
    if (activeTab === 'CANCELLED' && computed !== 'CANCELLED') return false;
    return true;
  });

  return (
    <div className="page-container">
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 9999,
          backgroundColor: toast.type === 'error' ? 'var(--status-offline)' : 'var(--status-online)',
          color: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: 'var(--radius-sm)',
          fontWeight: 600,
          fontSize: '0.875rem',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="page-header-container">
        <div>
          <h2 className="page-title">
            <Calendar size={22} style={{ color: 'var(--primary)' }} />
            <span>{language === 'FR' ? 'Gestion des Réunions du Ministère' : 'Ministry Meetings Management'}</span>
          </h2>
          <p className="page-subtitle">
            {language === 'FR' ? "Planifiez les réunions de cabinet et sessions de travail affichées à l'accueil." : 'Schedule cabinet meetings and working sessions broadcast on the lobby screen.'}
          </p>
        </div>

        <button
          onClick={() => {
            setEditingId(null);
            setForm(defaultForm);
            setIsModalOpen(true);
          }}
          className="btn-primary"
        >
          <Plus size={16} />
          <span>{language === 'FR' ? 'Programmer Réunion' : 'Schedule Meeting'}</span>
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="filter-container">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {[
            { id: 'ALL', label: t('filterAll') },
            { id: 'UPCOMING', label: language === 'FR' ? 'À venir' : 'Upcoming' },
            { id: 'IN_PROGRESS', label: language === 'FR' ? 'En cours' : 'In Progress' },
            { id: 'COMPLETED', label: language === 'FR' ? 'Terminées' : 'Completed' },
            { id: 'CANCELLED', label: language === 'FR' ? 'Annulées' : 'Cancelled' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`filter-tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Meetings Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
        {filteredMeetings.map((item) => {
          const computedStatus = getItemComputedStatus(item, currentTime);
          return (
          <div key={item.id} className="admin-card" style={{
            padding: '1.35rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              {/* Header Badge Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <span className={`badge ${item.priority === 'URGENT' ? 'badge-subtle-red' : item.priority === 'IMPORTANT' ? 'badge-subtle-amber' : 'badge-subtle-blue'}`}>
                  {item.priority}
                </span>

                <span className={`badge ${
                  computedStatus === 'IN_PROGRESS' ? 'badge-online' :
                  computedStatus === 'COMPLETED' ? 'badge-subtle-green' :
                  computedStatus === 'CANCELLED' ? 'badge-offline' : 'badge-subtle-blue'
                }`}>
                  <span className={`status-dot ${computedStatus === 'IN_PROGRESS' ? 'online' : computedStatus === 'CANCELLED' ? 'offline' : 'connecting'}`}></span>
                  {getStatusLabel(computedStatus, language)}
                </span>
              </div>

              {/* Media Preview if attached */}
              {item.media_url ? (
                <div style={{
                  marginBottom: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  maxHeight: '150px',
                  backgroundColor: 'var(--navy-deep)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {item.media_url.endsWith('.mp4') || item.media_url.endsWith('.webm') ? (
                    <video src={item.media_url} controls style={{ maxHeight: '150px', maxWidth: '100%' }} />
                  ) : (
                    <img src={item.media_url} alt="Meeting media" style={{ maxHeight: '150px', maxWidth: '100%', objectFit: 'contain' }} />
                  )}
                </div>
              ) : null}

              {/* Title & Description FR */}
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FlagBadge lang="FR" size="sm" />
                <span>{item.title_fr}</span>
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                {item.description_fr || item.title_fr}
              </p>

              {/* Title & Description EN */}
              <div style={{ padding: '0.65rem 0.85rem', backgroundColor: 'var(--surface-subtle)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--primary)', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FlagBadge lang="EN" size="sm" />
                  <span>{item.title_en}</span>
                </h4>
                <p style={{ fontSize: '0.785rem', color: 'var(--text-dim)', fontStyle: 'italic', marginTop: '0.2rem' }}>
                  {item.description_en || item.title_en}
                </p>
              </div>

              {/* Location & Time Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--surface-subtle)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <Clock size={13} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{item.start_time} — {item.end_time}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--surface-subtle)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <MapPin size={13} style={{ color: 'var(--text-muted)' }} />
                  <span>{language === 'FR' ? item.room_fr : item.room_en} • {language === 'FR' ? item.floor_fr : item.floor_en}</span>
                </div>
                {item.participants_info && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--surface-subtle)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <Users size={13} style={{ color: '#10B981' }} />
                    <span>{item.participants_info}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {item.status !== 'COMPLETED' && (
                  <button
                    onClick={() => handleStatusChange(item.id, 'COMPLETED')}
                    className="btn-secondary"
                    style={{ padding: '5px 9px', fontSize: '0.75rem', color: '#059669' }}
                  >
                    {language === 'FR' ? 'Terminer' : 'Complete'}
                  </button>
                )}

                {item.status !== 'CANCELLED' && (
                  <button
                    onClick={() => handleStatusChange(item.id, 'CANCELLED')}
                    className="btn-secondary"
                    style={{ padding: '5px 9px', fontSize: '0.75rem', color: '#EF4444' }}
                  >
                    {t('cancel')}
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  type="button"
                  onClick={() => handleEdit(item)}
                  className="btn-secondary"
                  style={{ padding: '5px 9px', fontSize: '0.75rem' }}
                >
                  <Edit2 size={13} />
                  <span>{t('edit')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="btn-secondary"
                  style={{ padding: '5px 9px', fontSize: '0.75rem', color: '#EF4444' }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        );
        })}

        {filteredMeetings.length === 0 && !loading && (
          <div className="empty-state-box">
            <Calendar size={36} style={{ color: 'var(--text-dim)', marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.25rem' }}>
              {t('noData')}
            </h3>
            <p style={{ fontSize: '0.825rem', marginBottom: '1.25rem', color: 'var(--text-muted)' }}>
              {language === 'FR' ? 'Aucune réunion dans cette catégorie.' : 'No meetings found in this category.'}
            </p>
            <button
              onClick={() => {
                setEditingId(null);
                setForm(defaultForm);
                setIsModalOpen(true);
              }}
              className="btn-primary"
            >
              <Plus size={16} />
              <span>{language === 'FR' ? 'Programmer une Réunion' : 'Schedule Meeting'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(7, 13, 25, 0.7)',
          backdropFilter: 'blur(6px)',
          zIndex: 1100,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1rem'
        }}>
          <div className="msd-modal-box" style={{
            width: '100%',
            maxWidth: '680px',
            padding: '1.75rem',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={18} style={{ color: 'var(--primary)' }} />
                <span>{editingId ? (language === 'FR' ? 'Modifier la Réunion' : 'Edit Meeting') : (language === 'FR' ? 'Programmer une Réunion' : 'Schedule Meeting')}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              {/* Date & Time Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.85rem', marginBottom: '1.1rem' }}>
                <div>
                  <label className="form-label">{t('date')}</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    required
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label className="form-label">{t('startTime')}</label>
                  <input
                    type="time"
                    value={form.start_time}
                    onChange={e => setForm({ ...form, start_time: e.target.value })}
                    required
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label className="form-label">{t('endTime')}</label>
                  <input
                    type="time"
                    value={form.end_time}
                    onChange={e => setForm({ ...form, end_time: e.target.value })}
                    required
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label className="form-label">{t('priority')}</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                    style={{ width: '100%' }}
                  >
                    <option value="NORMAL">{t('priorityNormal')}</option>
                    <option value="IMPORTANT">{t('priorityImportant')}</option>
                    <option value="URGENT">{t('priorityUrgent')}</option>
                  </select>
                </div>
              </div>

              {/* French Fields */}
              <div className="form-section">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                  <FlagBadge lang="FR" size="sm" />
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                    {t('titleFr')}
                  </label>
                </div>
                <input
                  type="text"
                  value={form.title_fr}
                  onChange={e => setForm({ ...form, title_fr: e.target.value })}
                  placeholder="Ex: Réunion de Cabinet Hebdomadaire"
                  required
                  style={{ width: '100%', marginBottom: '0.75rem' }}
                />

                <label className="form-label">{t('descFr')}</label>
                <textarea
                  rows={2}
                  value={form.description_fr}
                  onChange={e => setForm({ ...form, description_fr: e.target.value })}
                  placeholder="Ordre du jour ou détails..."
                  style={{ width: '100%' }}
                />
              </div>

              {/* English Fields */}
              <div className="form-section">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                  <FlagBadge lang="EN" size="sm" />
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                    {t('titleEn')}
                  </label>
                </div>
                <input
                  type="text"
                  value={form.title_en}
                  onChange={e => setForm({ ...form, title_en: e.target.value })}
                  placeholder="Ex: Weekly Cabinet Meeting"
                  required
                  style={{ width: '100%', marginBottom: '0.75rem' }}
                />

                <label className="form-label">{t('descEn')}</label>
                <textarea
                  rows={2}
                  value={form.description_en}
                  onChange={e => setForm({ ...form, description_en: e.target.value })}
                  placeholder="Agenda or meeting details..."
                  style={{ width: '100%' }}
                />
              </div>

              {/* Room & Participants */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.1rem' }}>
                <div>
                  <label className="form-label">{t('room')}</label>
                  <select
                    value={form.room_id}
                    onChange={e => setForm({ ...form, room_id: e.target.value })}
                    style={{ width: '100%' }}
                  >
                    <option value="1">Salle Polyvalente (RDC)</option>
                    <option value="2">Salle de Conférence B (2ème Étage)</option>
                    <option value="3">Salle de Réunion 304 (3ème Étage)</option>
                    <option value="4">Cabinet Ministre (4ème Étage)</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">{language === 'FR' ? 'Participants / Invités' : 'Participants'}</label>
                  <input
                    type="text"
                    value={form.participants_info}
                    onChange={e => setForm({ ...form, participants_info: e.target.value })}
                    placeholder="Ex: Directeurs et Conseillers"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Card Color Customization */}
              <ColorThemePicker
                value={form.card_color}
                onChange={(c) => setForm({ ...form, card_color: c })}
                label={language === 'FR' ? "Couleur du Cadre d'Affichage" : "Display Information Box Color"}
              />

              {/* Media Upload */}
              <MediaUploadInput
                value={form.media_url}
                onChange={(url) => setForm({ ...form, media_url: url })}
                label={language === 'FR' ? 'Document / Visuel de la réunion (Optionnel)' : 'Meeting Visual / Document (Optional)'}
              />

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
