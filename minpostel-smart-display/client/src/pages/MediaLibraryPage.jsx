import React, { useState, useEffect } from 'react';
import { Images, Upload, Trash2, Image, Video, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function MediaLibraryPage() {
  const { language, t } = useLanguage();
  const [mediaList, setMediaList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchMedia = () => {
    fetch('/api/media')
      .then(r => r.json())
      .then(d => { if (d.status === 'success') setMediaList(d.data || []); });
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', 'BOTH');
    formData.append('description', file.name);

    setUploading(true);
    try {
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setToast(language === 'FR' ? 'Média téléversé avec succès' : 'Media uploaded successfully');
        fetchMedia();
        setTimeout(() => setToast(null), 4000);
      } else {
        alert(data.message || (language === 'FR' ? 'Erreur téléversement' : 'Upload error'));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(language === 'FR' ? 'Supprimer ce média ?' : 'Delete this media item?')) return;
    try {
      await fetch(`/api/media/${id}`, { method: 'DELETE' });
      setToast(language === 'FR' ? 'Média supprimé' : 'Media deleted');
      fetchMedia();
      setTimeout(() => setToast(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container">
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 9999,
          backgroundColor: 'var(--status-online)',
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
          <CheckCircle2 size={18} />
          <span>{toast}</span>
        </div>
      )}

      <div className="page-header-container">
        <div>
          <h2 className="page-title">
            <Images size={22} style={{ color: 'var(--primary)' }} />
            <span>{language === 'FR' ? 'Bibliothèque Média Institutionnelle' : 'Institutional Media Library'}</span>
          </h2>
          <p className="page-subtitle">
            {language === 'FR' 
              ? 'Gestionnaire central des images et vidéos associées aux annonces et événements.' 
              : 'Central repository for images and videos associated with announcements and events.'}
          </p>
        </div>

        <label className="btn-primary" style={{ cursor: 'pointer' }}>
          <Upload size={16} />
          <span>{uploading ? (language === 'FR' ? 'Téléversement...' : 'Uploading...') : (language === 'FR' ? 'Téléverser Image/Vidéo' : 'Upload Media')}</span>
          <input type="file" onChange={handleFileUpload} accept="image/*,video/*" style={{ display: 'none' }} />
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
        {mediaList.map(item => (
          <div key={item.id} className="admin-card" style={{
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div style={{
              height: '130px',
              backgroundColor: 'var(--navy-deep)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              borderBottom: '1px solid var(--border-subtle)'
            }}>
              {item.mime_type?.startsWith('video') ? <Video size={40} /> : <Image size={40} />}
            </div>

            <div style={{ padding: '0.9rem 1rem' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.original_name}
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                {(item.file_size / 1024).toFixed(1)} KB • {item.mime_type}
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="btn-secondary"
                  style={{ padding: '4px 8px', color: '#EF4444' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {mediaList.length === 0 && (
          <div className="empty-state-box">
            <Images size={36} style={{ color: 'var(--text-dim)', marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.25rem' }}>
              {t('noData')}
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              {language === 'FR' ? 'Aucun média dans la bibliothèque.' : 'No media items in library.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
