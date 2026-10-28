import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudLightning, Wind } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function WeatherClockWidget({ lang: propLang }) {
  const { language: contextLang } = useLanguage();
  const language = propLang || contextLang || 'FR';
  const [time, setTime] = useState(new Date());
  
  // Real-time Yaoundé weather state
  const [weather, setWeather] = useState({
    temp: 26,
    condition: 'PARTLY_CLOUDY',
    condition_fr: 'Éclaircies',
    condition_en: 'Partly Cloudy',
    humidity: 60,
    source: 'initial'
  });

  // Clock tick every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real-time weather from backend API
  const fetchWeather = async () => {
    try {
      const res = await fetch('/api/weather');
      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success' && json.data) {
          setWeather({
            temp: json.data.temp,
            condition: json.data.condition || 'PARTLY_CLOUDY',
            condition_fr: json.data.condition_fr || 'Éclaircies',
            condition_en: json.data.condition_en || 'Partly Cloudy',
            humidity: json.data.humidity,
            source: json.data.source_label || json.data.source
          });
        }
      }
    } catch (err) {
      console.warn('[WEATHER WIDGET] Live fetch error:', err);
    }
  };

  useEffect(() => {
    fetchWeather();
    // Refresh weather every 15 minutes (900,000 ms)
    const weatherTimer = setInterval(fetchWeather, 900000);
    return () => clearInterval(weatherTimer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString(language === 'FR' ? 'fr-FR' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: language !== 'FR'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString(language === 'FR' ? 'fr-FR' : 'en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case 'SUNNY':
        return <Sun size={24} style={{ color: '#FCD34D' }} />;
      case 'CLOUDY':
        return <Cloud size={24} style={{ color: '#E2E8F0' }} />;
      case 'RAIN':
        return <CloudRain size={24} style={{ color: '#93C5FD' }} />;
      case 'THUNDERSTORM':
        return <CloudLightning size={24} style={{ color: '#FBBF24' }} />;
      case 'PARTLY_CLOUDY':
      default:
        return <Cloud size={24} style={{ color: '#FDE047' }} />;
    }
  };

  const getWeatherText = () => {
    if (language === 'FR') {
      return weather.condition_fr || 'Éclaircies';
    }
    return weather.condition_en || 'Partly Cloudy';
  };

  return (
    <div 
      title={weather.source ? `Météo Yaoundé (${weather.source})` : 'Météo Yaoundé'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(10px)',
        padding: '0.75rem 1.5rem',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#FFFFFF'
      }}
    >
      {/* Weather Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingRight: '1.5rem', borderRight: '1px solid rgba(255, 255, 255, 0.2)' }}>
        {getWeatherIcon(weather.condition)}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1 }}>{weather.temp}°C</span>
          <span style={{ fontSize: '0.75rem', color: '#CBD5E1', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Yaoundé • {getWeatherText()}
          </span>
        </div>
      </div>

      {/* Clock Section */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <span style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1, letterSpacing: '0.05em' }}>
          {formatTime(time)}
        </span>
        <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 500, textTransform: 'capitalize' }}>
          {formatDate(time)}
        </span>
      </div>
    </div>
  );
}
