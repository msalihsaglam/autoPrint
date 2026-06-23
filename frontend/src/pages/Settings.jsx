import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import './Settings.css';

const CYCLE_OPTIONS = {
  EVERY_24_HOURS: { label: 'Günde Bir Kere (24 saat)', value: 'EVERY_24_HOURS' },
  EVERY_3_HOURS: { label: '3 Saatte Bir', value: 'EVERY_3_HOURS' },
  EVERY_HOUR: { label: 'Saatlik (1 saat)', value: 'EVERY_HOUR' },
  EVERY_30_MINUTES: { label: '30 Dakikada Bir', value: 'EVERY_30_MINUTES' },
  DAILY_AT_14_00: { label: 'Her Gün 14:00\'te', value: 'DAILY_AT_14_00' },
};

export const Settings = () => {
  const { mode, cycle, setSystemMode, setReadingCycle, triggerReading, loading, error } = useApp();
  const [selectedMode, setSelectedMode] = useState(mode);
  const [selectedCycle, setSelectedCycle] = useState(cycle);
  const [triggerLoading, setTriggerLoading] = useState(false);

  useEffect(() => {
    setSelectedMode(mode);
    setSelectedCycle(cycle);
  }, [mode, cycle]);

  const handleModeChange = async (newMode) => {
    setSelectedMode(newMode);
    await setSystemMode(newMode);
  };

  const handleCycleChange = async (newCycle) => {
    setSelectedCycle(newCycle);
    await setReadingCycle(newCycle);
  };

  const handleTrigger = async () => {
    setTriggerLoading(true);
    await triggerReading();
    setTriggerLoading(false);
  };

  return (
    <div className="settings-page">
      <div className="container">
        <h1>⚙️ Sistem Ayarları</h1>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Mod Seçimi */}
        <div className="card">
          <div className="card-header">
            <h2>Çalışma Modu</h2>
            <p className="card-subtitle">Sistemi otomatik veya manuel modda çalıştırabilirsiniz</p>
          </div>
          <div className="card-body">
            <div className="mode-selector">
              <button
                className={`mode-btn ${selectedMode === 'auto' ? 'active' : ''}`}
                onClick={() => handleModeChange('auto')}
                disabled={loading}
              >
                <span className="mode-icon">🤖</span>
                <span>Otomatik Mod</span>
              </button>

              <button
                className={`mode-btn ${selectedMode === 'manual' ? 'active' : ''}`}
                onClick={() => handleModeChange('manual')}
                disabled={loading}
              >
                <span className="mode-icon">👆</span>
                <span>Manuel Mod</span>
              </button>
            </div>

            <p className="mode-description">
              {selectedMode === 'auto'
                ? '✓ Sistem otomatik olarak seçili cycle\'da veri okuyacak'
                : '✓ Sistem manuel kontrolde olacak. Trigger butonu ile anlık veri okuyabilirsiniz'}
            </p>
          </div>
        </div>

        {/* Cycle Seçimi - Sadece Otomatik Modda */}
        {selectedMode === 'auto' && (
          <div className="card">
            <div className="card-header">
              <h2>Okuma Döngüsü (Cycle)</h2>
              <p className="card-subtitle">Otomatik okumalar ne sıklıkta yapılacak?</p>
            </div>
            <div className="card-body">
              <div className="cycle-selector">
                {Object.entries(CYCLE_OPTIONS).map(([key, option]) => (
                  <button
                    key={key}
                    className={`cycle-btn ${selectedCycle === option.value ? 'active' : ''}`}
                    onClick={() => handleCycleChange(option.value)}
                    disabled={loading}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Manuel Trigger - Sadece Manuel Modda */}
        {selectedMode === 'manual' && (
          <div className="card">
            <div className="card-header">
              <h2>Anlık Okuma</h2>
              <p className="card-subtitle">Tag değerlerini hemen almak için trigger et</p>
            </div>
            <div className="card-body manual-trigger">
              <p>Aşağıdaki butona tıklayarak tüm tag'ların anlık değerlerini okuyabilirsiniz.</p>

              <button
                className="btn-primary btn-lg"
                onClick={handleTrigger}
                disabled={triggerLoading}
              >
                {triggerLoading ? (
                  <>
                    <span className="spinner"></span>
                    Okunuyor...
                  </>
                ) : (
                  <>
                    ▶ Trigger - Şimdi Oku
                  </>
                )}
              </button>

              <p className="trigger-note">
                💡 Okuma başlatılacak ve sonuçlar Dashboard'da gösterilecek
              </p>
            </div>
          </div>
        )}

        {/* Bilgi Paneli */}
        <div className="card info-card">
          <h3>📖 Bilgi</h3>
          <ul>
            <li>
              <strong>Otomatik Mod:</strong> Seçili cycle'da sistem otomatik olarak veri okur
            </li>
            <li>
              <strong>Manuel Mod:</strong> Trigger butonu ile istediğiniz zaman veri okuyabilirsiniz
            </li>
            <li>
              <strong>Okuma Verileri:</strong> Dashboard'dan tüm tag'ların anlık veya son değerlerini görebilirsiniz
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
