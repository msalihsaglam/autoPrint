import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import TrendChart from '../components/TrendChart';
import './Dashboard.css';

export const Dashboard = () => {
  const { lastReading, loading, error, getLastReadingData } = useApp();
  const [autoRefresh, setAutoRefresh] = useState(false); // Otomatik yenileme kapalı (sistem dakikada bir günceller)

  useEffect(() => {
    // İlk yükleme
    getLastReadingData();

    // Auto-refresh - sadece seçiliyse
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        getLastReadingData();
      }, 5000); // Her 5 saniyede yenile
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, getLastReadingData]);

  const getValueColor = (success) => {
    return success ? 'value-success' : 'value-error';
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1>📊 Dashboard</h1>
          <div className="auto-refresh">
            <label>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              Otomatik Yenile (5s)
            </label>
            <small>💡 Sistem dakikada bir otomatik günceller</small>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Okuma Bilgisi */}
        {lastReading && (
          <div className="card reading-info">
            <div className="reading-meta">
              <div className="meta-item">
                <span className="meta-label">Son Okuma Zamanı:</span>
                <span className="meta-value">
                  {new Date(lastReading.timestamp).toLocaleString('tr-TR')}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Okuma Türü:</span>
                <span className="meta-value">{lastReading.readingType}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Durum:</span>
                <span className={`badge ${lastReading.successCount === lastReading.tags?.length ? 'badge-success' : 'badge-warning'}`}>
                  {lastReading.successCount}/{lastReading.tags?.length || 0} Başarılı
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tag Değerleri Grid */}
        {lastReading && lastReading.tags ? (
          <div className="tags-grid">
            {lastReading.tags.map((tag) => (
              <div key={tag.id} className="tag-card">
                <div className="tag-header">
                  <h3>{tag.name}</h3>
                  {tag.success ? (
                    <span className="tag-status success">✓</span>
                  ) : (
                    <span className="tag-status error">✗</span>
                  )}
                </div>

                <div className={`tag-value ${getValueColor(tag.success)}`}>
                  {tag.success ? (
                    <>
                      <div className="value-number">{typeof tag.value === 'number' ? tag.value.toFixed(2) : tag.value}</div>
                      <div className="value-unit">{tag.unit}</div>
                    </>
                  ) : (
                    <div className="value-error-text">{tag.error || 'Hata'}</div>
                  )}
                </div>

                <div className="tag-footer">
                  <span className="tag-id">{tag.id}</span>
                  <span className="tag-timestamp">
                    {new Date(tag.timestamp).toLocaleTimeString('tr-TR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data">
            <p>📭 Henüz veri yok</p>
            <p className="text-secondary">Ayarlar sayfasından trigger et veya otomatik okuma başlat</p>
          </div>
        )}

        {/* Trend Bölümü - Tüm Tag'lar */}
        <div className="card trend-section">
          <h2>📈 Trendler</h2>
          <p className="text-secondary">Son 100 okuma verisinin grafikleri</p>
          <TrendChart />
        </div>

        {/* Bireysel Tag Trendleri */}
        {lastReading && lastReading.tags && (
          <div className="trends-grid">
            {lastReading.tags.map((tag) => (
              tag.success && (
                <div key={tag.id} className="card individual-trend">
                  <h3>{tag.name}</h3>
                  <TrendChart tagId={tag.id} />
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
