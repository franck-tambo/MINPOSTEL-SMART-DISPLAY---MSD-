import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Edit2, Trash2, Globe, Eye, EyeOff, X, CheckCircle, AlertCircle, Search, Calendar } from 'lucide-react';
import FlagBadge from '../components/FlagBadge';
import MediaUploadInput from '../components/MediaUploadInput';
import ColorThemePicker from '../components/ColorThemePicker';
import { useLanguage } from '../context/LanguageContext';

import { getCached, setCached } from '../utils/apiCache';
import { isItemExpired, getItemComputedStatus, getStatusLabel } from '../utils/expiration.util';

export default function AnnouncementsPage() {
  const { language, t } = useLanguage();
  const [announcements, setAnnouncements] = useState(() => getCached('announcements') || []);
  const [loading, setLoading] = useState(() => !getCached('announcements'));
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [toast, setToast] = useState(null);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  // Clock ticker to auto-update computed status
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 5000);
    return () => clearInterval(timer);
  }, []);

  // Form State
  const [form, setForm] = useState({
    title_fr: '',
    title_en: '',
    description_fr: '',
    description_en: '',
    priority: 'NORMAL',
    media_url: '',
    card_color: '#134074',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAnnouncements = (silent = false) => {
    if (!silent && !getCached('announcements')) setLoading(true);
    fetch('/api/announcements')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && data.data) {
          setAnnouncements(data.data);
          setCached('announcements', data.data);
        }
      })
      .catch(err => console.error('Failed to load announcements', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAnnouncements(true);
  }, []);

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setForm({
        title_fr: item.title_fr || '',
        title_en: item.title_en || '',
        description_fr: item.description_fr || '',
        description_en: item.description_en || '',
        priority: item.priority || 'NORMAL',
        media_url: item.media_url || '',
        card_color: item.card_color || '#134074',
        start_date: item.start_date ? item.start_date.split('T')[0] : '',
        end_date: item.end_date ? item.end_date.split('T')[0] : ''
      });
    } else {
      setEditingItem(null);
      setForm({
        title_fr: '',
        title_en: '',
        description_fr: '',
        description_en: '',
        priority: 'NORMAL',
        media_url: '',
        card_color: '#134074',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const url = editingItem ? `/api/announcements/${editingItem.id}` : '/api/announcements';
    const method = editingItem ? 'PUT' : 'POST';

    try {
      const token = localStorage.getItem('msd_auth_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        showToast(editingItem ? (language === 'FR' ? 'Annonce mise à jour avec succès' : 'Announcement updated successfully') : (language === 'FR' ? 'Annonce créée et diffusée' : 'Announcement created and published'));
        closeModal();
        fetchAnnouncements();
      } else {
        showToast(data.message || (language === 'FR' ? 'Erreur lors de la sauvegarde' : 'Save error'), 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleTogglePublish = async (id, currentStatus) => {
    const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      const token = localStorage.getItem('msd_auth_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/announcements/${id}/publish`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showToast(newStatus === 'PUBLISHED' ? (language === 'FR' ? "Annonce publiée sur l'écran" : 'Announcement published on display') : (language === 'FR' ? "Annonce retirée de l'affichage" : 'Announcement unpublished'));
        fetchAnnouncements();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('confirmDelete'))) return;
    try {
      const token = localStorage.getItem('msd_auth_token');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/announcements/${id}`, { method: 'DELETE', headers });
      if (res.ok) {
        showToast(t('successDeleted'));
        fetchAnnouncements();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filteredAnnouncements = announcements.filter(item => {
    const computed = getItemComputedStatus(item, currentTime);
    if (activeTab === 'PUBLISHED' && (item.status !== 'PUBLISHED' || computed === 'COMPLETED')) return false;
    if (activeTab === 'COMPLETED' && computed !== 'COMPLETED') return false;
    if (activeTab === 'DRAFT' && item.status !== 'DRAFT') return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.title_fr?.toLowerCase().includes(q) ||
        item.title_en?.toLowerCase().includes(q) ||
        item.description_fr?.toLowerCase().includes(q) ||
        item.description_en?.toLowerCase().includes(q)
      );
    }
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
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="page-header-container">
        <div>
          <h2 className="page-title">
            <Megaphone size={22} style={{ color: 'var(--primary)' }} />
            <span>{language === 'FR' ? 'Gestion des Annonces Ministère' : 'Ministry Announcements Management'}</span>
          </h2>
          <p className="page-subtitle">
            {language === 'FR' ? "Diffusez des annonces bilingues (FR/EN) sur l'écran d'accueil." : 'Broadcast bilingual announcements (FR/EN) on the lobby screen.'}
          </p>
        </div>

        <button
          onClick={() => openModal()}
          className="btn-primary"
        >
          <Plus size={16} />
          <span>{language === 'FR' ? 'Nouvelle Annonce' : 'New Announcement'}</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="filter-container">
        {/* Search */}
        <div style={{ position: 'relative', minWidth: '240px', flex: 1, maxWidth: '360px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            type="text"
            placeholder={t('search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '36px' }}
          />
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['ALL', 'PUBLISHED', 'COMPLETED', 'DRAFT'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`filter-tab ${activeTab === tab ? 'active' : ''}`}
            >
              {tab === 'ALL' 
                ? t('filterAll') 
                : (tab === 'PUBLISHED' 
                    ? t('statusPublished') 
                    : (tab === 'COMPLETED' 
                        ? (language === 'FR' ? 'Terminées' : 'Completed') 
                        : t('statusDraft')))}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.25rem' }}>
        {filteredAnnouncements.map((item) => {
          const computedStatus = getItemComputedStatus(item, currentTime);
          return (
          <div key={item.id} className="admin-card" style={{
            padding: '1.35rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <span className={`badge ${item.priority === 'URGENT' ? 'badge-subtle-red' : item.priority === 'IMPORTANT' ? 'badge-subtle-amber' : 'badge-subtle-blue'}`}>
                  {item.priority}
                </span>

                <span className={`badge ${computedStatus === 'COMPLETED' ? 'badge-subtle-green' : (item.status === 'PUBLISHED' ? 'badge-online' : 'badge-offline')}`}>
                  <span className={`status-dot ${computedStatus === 'COMPLETED' ? 'online' : (item.status === 'PUBLISHED' ? 'online' : 'offline')}`}></span>
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
                    <img src={item.media_url} alt="Announcement media" style={{ maxHeight: '150px', maxWidth: '100%', objectFit: 'contain' }} />
                  )}
                </div>
              ) : null}

              {/* French Title & Content */}
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FlagBadge lang="FR" size="sm" />
                <span>{item.title_fr}</span>
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                {item.description_fr}
              </p>

              {/* English Title & Content */}
              <div style={{ padding: '0.65rem 0.85rem', backgroundColor: 'var(--surface-subtle)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--primary)', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FlagBadge lang="EN" size="sm" />
                  <span>{item.title_en}</span>
                </h4>
                <p style={{ fontSize: '0.785rem', color: 'var(--text-dim)', fontStyle: 'italic', marginTop: '0.2rem', lineHeight: 1.4 }}>
                  {item.description_en}
                </p>
              </div>
            </div>

            {/* Actions Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '0.85rem',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.785rem',
              color: 'var(--text-dim)'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
                <span>{item.start_date?.split('T')[0]} → {item.end_date?.split('T')[0]}</span>
              </span>

              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  type="button"
                  onClick={() => handleTogglePublish(item.id, item.status)}
                  title={item.status === 'PUBLISHED' ? t('unpublish') : t('publish')}
                  className="btn-secondary"
                  style={{ padding: '5px 9px', fontSize: '0.75rem' }}
                >
                  {item.status === 'PUBLISHED' ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>

                <button
                  type="button"
                  onClick={() => openModal(item)}
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

        {filteredAnnouncements.length === 0 && !loading && (
          <div className="empty-state-box">
            <Megaphone size={36} style={{ color: 'var(--text-dim)', marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.25rem' }}>
              {t('noData')}
            </h3>
            <p style={{ fontSize: '0.825rem', marginBottom: '1.25rem', color: 'var(--text-muted)' }}>
              {language === 'FR' ? 'Aucune annonce ne correspond à vos filtres.' : 'No announcements found matching your criteria.'}
            </p>
            <button
              onClick={() => openModal()}
              className="btn-primary"
            >
              <Plus size={16} />
              <span>{language === 'FR' ? 'Créer une Annonce' : 'Create Announcement'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal Form Create/Edit */}
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
                <Megaphone size={18} style={{ color: 'var(--primary)' }} />
                <span>{editingItem ? (language === 'FR' ? "Éditer l'Annonce" : 'Edit Announcement') : (language === 'FR' ? 'Créer une Nouvelle Annonce' : 'Create New Announcement')}</span>
              </h3>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              {/* Priority & Dates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem', marginBottom: '1.1rem' }}>
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

                <div>
                  <label className="form-label">{t('startDate')}</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={e => setForm({ ...form, start_date: e.target.value })}
                    required
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label className="form-label">{t('endDate')}</label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={e => setForm({ ...form, end_date: e.target.value })}
                    required
                    style={{ width: '100%' }}
                  />
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
                <div style={{ marginBottom: '0.75rem' }}>
                  <input
                    type="text"
                    value={form.title_fr}
                    onChange={e => setForm({ ...form, title_fr: e.target.value })}
                    placeholder="Ex: Digitalisation des services postaux"
                    required
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label className="form-label">{t('descFr')}</label>
                  <textarea
                    rows={3}
                    value={form.description_fr}
                    onChange={e => setForm({ ...form, description_fr: e.target.value })}
                    placeholder="Détails de l'annonce en français..."
                    required
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* English Fields */}
              <div className="form-section">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                  <FlagBadge lang="EN" size="sm" />
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                    {t('titleEn')}
                  </label>
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <input
                    type="text"
                    value={form.title_en}
                    onChange={e => setForm({ ...form, title_en: e.target.value })}
                    placeholder="Ex: Digitalization of postal services"
                    required
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label className="form-label">{t('descEn')}</label>
                  <textarea
                    rows={3}
                    value={form.description_en}
                    onChange={e => setForm({ ...form, description_en: e.target.value })}
                    placeholder="Announcement details in English..."
                    required
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

              {/* Media Upload (Image or Video) */}
              <MediaUploadInput
                value={form.media_url}
                onChange={(url) => setForm({ ...form, media_url: url })}
                label={language === 'FR' ? 'Image ou Vidéo à diffuser (Optionnel)' : 'Broadcast Image or Video (Optional)'}
              />

              {/* Form Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={closeModal}
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
