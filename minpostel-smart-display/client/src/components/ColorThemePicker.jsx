import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const COLOR_PRESETS = [
  { id: 'bleu_institutionnel', name_fr: 'Bleu Institutionnel', name_en: 'Institutional Blue', hex: '#134074' },
  { id: 'bleu_nuit', name_fr: 'Bleu Nuit', name_en: 'Midnight Navy', hex: '#0B2545' },
  { id: 'bleu_ocean', name_fr: 'Bleu Océan', name_en: 'Ocean Blue', hex: '#2563EB' },
  { id: 'vert_emeraude', name_fr: 'Vert Émeraude', name_en: 'Emerald Green', hex: '#059669' },
  { id: 'rouge_bordeaux', name_fr: 'Rouge Bordeaux', name_en: 'Burgundy Red', hex: '#991B1B' },
  { id: 'violet_royal', name_fr: 'Violet Royal', name_en: 'Royal Purple', hex: '#7C3AED' },
  { id: 'or_ambre', name_fr: 'Doré / Or', name_en: 'Amber Gold', hex: '#D97706' },
  { id: 'gris_anthracite', name_fr: 'Gris Anthracite', name_en: 'Slate Charcoal', hex: '#334155' }
];

export default function ColorThemePicker({ value, onChange, label }) {
  const { language } = useLanguage();
  const currentColor = value || '#134074';

  const getActiveColorName = () => {
    const found = COLOR_PRESETS.find(c => c.hex.toLowerCase() === currentColor.toLowerCase());
    if (found) return language === 'FR' ? found.name_fr : found.name_en;
    return language === 'FR' ? 'Nuance Personnalisée' : 'Custom Tint';
  };

  return (
    <div style={{
      background: 'var(--surface-admin-subtle, #F8FAFC)',
      padding: '1.25rem',
      borderRadius: '12px',
      border: '1px solid var(--border-admin-slate, #E2E8F0)',
      marginBottom: '1.25rem'
    }}>
      {/* Title & Active Color Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.85rem',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div>
          <h4 style={{
            fontSize: '0.9rem',
            fontWeight: 800,
            color: 'var(--text-dark, #0F172A)',
            margin: '0 0 0.2rem 0'
          }}>
            {label || (language === 'FR' ? "Personnalisation de la Couleur d'Affichage" : "Display Box Color Customization")}
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748B)', fontWeight: 600 }}>
              {language === 'FR' ? "Couleur d'Accent Actuelle :" : "Active Box Color:"}
            </span>
            <span style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              backgroundColor: currentColor,
              border: '2px solid #FFF',
              boxShadow: '0 0 4px rgba(0,0,0,0.25)',
              display: 'inline-block'
            }}></span>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: currentColor === '#134074' ? 'var(--primary-600, #134074)' : currentColor }}>
              {getActiveColorName()}
            </span>
          </div>
        </div>

        {/* Dropdown Select with Clean Named Colors */}
        <div style={{ minWidth: '180px' }}>
          <select
            value={COLOR_PRESETS.some(c => c.hex.toLowerCase() === currentColor.toLowerCase()) ? currentColor : 'custom'}
            onChange={e => {
              if (e.target.value !== 'custom') {
                onChange(e.target.value);
              }
            }}
            style={{
              width: '100%',
              padding: '7px 10px',
              borderRadius: '8px',
              border: '1px solid var(--border-admin-subtle, #CBD5E1)',
              fontSize: '0.825rem',
              fontWeight: 600,
              backgroundColor: 'var(--input-bg, #FFFFFF)',
              color: 'var(--input-text, #0F172A)'
            }}
          >
            {COLOR_PRESETS.map(p => (
              <option key={p.id} value={p.hex}>
                {language === 'FR' ? p.name_fr : p.name_en}
              </option>
            ))}
            <option value="custom">
              {language === 'FR' ? '🎨 Autre Nuance...' : '🎨 Custom Tint...'}
            </option>
          </select>
        </div>
      </div>

      {/* Quick Clickable Color Swatches */}
      <label style={{
        display: 'block',
        fontSize: '0.75rem',
        fontWeight: 700,
        color: 'var(--text-muted, #64748B)',
        marginBottom: '0.5rem',
        textTransform: 'uppercase',
        letterSpacing: '0.04em'
      }}>
        {language === 'FR' ? 'Choisir une Couleur de Base :' : 'Select a Basic Color:'}
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '0.85rem' }}>
        {COLOR_PRESETS.map((p) => {
          const isSelected = currentColor.toLowerCase() === p.hex.toLowerCase();
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onChange(p.hex)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '6px 12px',
                borderRadius: '20px',
                border: isSelected ? `2px solid ${p.hex}` : '1px solid var(--border-admin-subtle, #CBD5E1)',
                backgroundColor: isSelected ? `${p.hex}22` : 'var(--surface-admin-card, #FFFFFF)',
                color: isSelected ? (p.hex === '#134074' ? 'var(--primary-600, #134074)' : p.hex) : 'var(--text-dark, #0F172A)',
                fontWeight: isSelected ? 800 : 500,
                fontSize: '0.785rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? `0 2px 6px ${p.hex}30` : 'none'
              }}
            >
              <span style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: p.hex,
                display: 'inline-block',
                boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }}></span>
              <span>{language === 'FR' ? p.name_fr : p.name_en}</span>
            </button>
          );
        })}
      </div>

      {/* Free Color Tint Picker */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        paddingTop: '0.65rem',
        borderTop: '1px dashed var(--border-admin-slate, #E2E8F0)'
      }}>
        <label style={{ fontSize: '0.785rem', fontWeight: 600, color: 'var(--text-muted, #64748B)' }}>
          {language === 'FR' ? 'Ajustement Nuance Libre :' : 'Fine Color Tint Picker:'}
        </label>
        <input
          type="color"
          value={currentColor}
          onChange={e => onChange(e.target.value)}
          style={{
            width: '36px',
            height: '30px',
            padding: '0',
            border: '1px solid var(--border-admin-subtle, #CBD5E1)',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        />
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim, #94A3B8)', fontStyle: 'italic' }}>
          {language === 'FR' ? 'Cliquez pour ouvrir la palette' : 'Click to open palette'}
        </span>
      </div>
    </div>
  );
}
