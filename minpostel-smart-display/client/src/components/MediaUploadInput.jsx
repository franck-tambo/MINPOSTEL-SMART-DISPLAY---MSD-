import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Video, X, CheckCircle, Loader2, Link as LinkIcon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function MediaUploadInput({ value, onChange, label }) {
  const { t } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 25MB
    if (file.size > 25 * 1024 * 1024) {
      setError('Taille maximale autorisée : 25 Mo / Maximum allowed size: 25MB');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', 'BOTH');
    formData.append('description', file.name);

    try {
      const token = localStorage.getItem('msd_auth_token');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers,
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        const uploadedUrl = data.data.file_path;
        onChange(uploadedUrl);
      } else {
        setError(data.message || t('uploadError'));
      }
    } catch (err) {
      setError(err.message || t('uploadError'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    onChange('');
    setError(null);
  };

  const isVideo = value && (value.endsWith('.mp4') || value.endsWith('.webm') || value.includes('video'));

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
        <label style={{ fontSize: '0.825rem', fontWeight: 600, color: '#334155' }}>
          {label || t('media')}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          style={{
            background: 'none',
            border: 'none',
            color: '#2660A4',
            fontSize: '0.75rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            fontWeight: 500
          }}
        >
          <LinkIcon size={12} />
          <span>{showUrlInput ? 'Téléverser un fichier' : 'Saisir une URL'}</span>
        </button>
      </div>

      {showUrlInput ? (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <input
            type="url"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/image.jpg ou /uploads/video.mp4"
            style={{
              flex: 1,
              padding: '9px 12px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '0.85rem'
            }}
          />
        </div>
      ) : null}

      {/* Preview Card if Media Selected */}
      {value ? (
        <div style={{
          position: 'relative',
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: '#0B2545',
          border: '1px solid #CBD5E1',
          padding: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          {isVideo ? (
            <video
              src={value}
              controls
              style={{ maxHeight: '180px', maxWidth: '100%', borderRadius: '8px' }}
            />
          ) : (
            <img
              src={value}
              alt="Media preview"
              style={{ maxHeight: '180px', maxWidth: '100%', objectFit: 'contain', borderRadius: '8px' }}
            />
          )}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            marginTop: '0.5rem',
            padding: '0 0.5rem'
          }}>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
              {value}
            </span>
            <button
              type="button"
              onClick={handleRemove}
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                color: '#EF4444',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontWeight: 600
              }}
            >
              <X size={14} />
              <span>{t('delete')}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Dropzone & Upload Input */
        <div
          onClick={() => fileInputRef.current?.click()}
          className="msd-upload-zone"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
            style={{ display: 'none' }}
          />

          {uploading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: '#134074', padding: '0.5rem 0' }}>
              <Loader2 size={28} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Téléversement en cours... / Uploading...</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: '#E6F0FA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#134074'
              }}>
                <UploadCloud size={22} />
              </div>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E293B', margin: 0 }}>
                {t('uploadMedia')}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>
                {t('mediaDropHint')}
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.35rem', fontWeight: 500 }}>
          {error}
        </p>
      )}
    </div>
  );
}
