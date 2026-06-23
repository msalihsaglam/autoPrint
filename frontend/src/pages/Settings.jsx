import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import './Settings.css';

export const Settings = () => {
  const { systemStatus, lastReading, loading, error } = useApp();
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString('tr-TR'));
  }, [systemStatus]);

  const getReadingStatus = () => {
    if (systemStatus.startMemState) {
      return {
        label: 'AKTIF ✓',
        emoji: '🟢',
        color: '#10b981',
        detail: 'Ana tag okumalar devam ediyor'
      };
    } else {
      return {
        label: 'DURDU ✗',
        emoji: '🔴',
        color: '#ef4444',
        detail: 'Ana tag okumalar durdurulmuş'
      };
    }
  };

  const statusInfo = getReadingStatus();

  return (
    <div className="settings-page">
      <div className="container">
        <h1>⚙️ Sistem Ayarları</h1>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Sistem Durumu Paneli */}
        <div className="card status-card">
          <div className="card-header">
            <h2>🔍 Sistem Durumu</h2>
            <p className="card-subtitle">Okuma işleminin gerçek zamanlı durumu</p>
          </div>
          <div className="card-body">
            <div className="status-display" style={{ borderLeft: `4px solid ${statusInfo.color}` }}>
              <div className="status-main">
                <span className="status-emoji">{statusInfo.emoji}</span>
                <div className="status-info">
                  <h3>START_MEM Durumu</h3>
                  <p className="status-value" style={{ color: statusInfo.color }}>
                    {statusInfo.label}
                  </p>
                </div>
              </div>
              <p className="status-detail">{statusInfo.detail}</p>
            </div>

            {/* Durumu Açıklaması */}
            <div className="status-explanation">
              <div className="explanation-item">
                <span className="exp-icon">📌</span>
                <div>
                  <strong>START_MEM Etkin:</strong> {systemStatus.startMemState ? 'Evet' : 'Hayır'}
                </div>
              </div>
              <div className="explanation-item">
                <span className="exp-icon">📊</span>
                <div>
                  <strong>Ana Tag Okuma:</strong> {systemStatus.isMainReadingActive ? 'Çalışıyor' : 'Durmada'}
                </div>
              </div>
              {lastReading && (
                <div className="explanation-item">
                  <span className="exp-icon">⏰</span>
                  <div>
                    <strong>Son Okuma:</strong> {new Date(lastReading.reading_timestamp).toLocaleTimeString('tr-TR')}
                  </div>
                </div>
              )}
              <div className="explanation-item">
                <span className="exp-icon">🔄</span>
                <div>
                  <strong>Güncelleme:</strong> {lastUpdated}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Okuma Sistemi Açıklaması */}
        <div className="card info-card">
          <h3>📖 Okuma Sistemi Nasıl Çalışır?</h3>
          <div className="info-content">
            <div className="info-section">
              <h4>🟢 START_MEM = TRUE (Aktif)</h4>
              <ul>
                <li>Ana tag okumalar hemen başlar</li>
                <li>Sonra <strong>dakikada bir</strong> otomatik olarak tekrar okunur</li>
                <li>Tank Sıcaklığı, Basınç, Sıvı Seviyesi, İletkenlik, WiFi Sıcaklığı okunur</li>
              </ul>
            </div>

            <div className="info-section">
              <h4>🔴 START_MEM = FALSE (Durdu)</h4>
              <ul>
                <li>Ana tag okumalar durdurulur</li>
                <li>Mevcut değerler bellekte tutulur</li>
                <li>START_MEM tekrar TRUE olana kadar yeni okuma yapılmaz</li>
              </ul>
            </div>

            <div className="info-section">
              <h4>⏱️ Kontrol Frekansı</h4>
              <ul>
                <li>START_MEM etiketi <strong>20 saniyede bir</strong> kontrol edilir</li>
                <li>Etikette değişiklik tespit edilirse, okuma durdurulur veya başlatılır</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Teknik Bilgiler */}
        <div className="card tech-card">
          <h3>⚡ Teknik Detaylar</h3>
          <div className="tech-grid">
            <div className="tech-item">
              <span className="tech-label">API Endpoint</span>
              <span className="tech-value">/api/system/status</span>
            </div>
            <div className="tech-item">
              <span className="tech-label">Kontrol Etiketi</span>
              <span className="tech-value">START_MEM (%M0.5)</span>
            </div>
            <div className="tech-item">
              <span className="tech-label">Okuma Aralığı</span>
              <span className="tech-value">60 saniye</span>
            </div>
            <div className="tech-item">
              <span className="tech-label">Kontrol Frekansı</span>
              <span className="tech-value">20 saniye</span>
            </div>
          </div>
        </div>

        {/* Son Okuma İstatistikleri */}
        {lastReading && (
          <div className="card stats-card">
            <h3>📈 Son Okuma İstatistikleri</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Başarılı Tag</span>
                <span className="stat-value" style={{ color: '#10b981' }}>
                  {lastReading.reading_timestamp ? '✓' : '✗'}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Zaman Damgası</span>
                <span className="stat-value">
                  {new Date(lastReading.reading_timestamp).toLocaleString('tr-TR')}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
