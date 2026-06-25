// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import TrendChart from '../components/TrendChart';
import './Dashboard.css';

export const Dashboard = () => {
  const { lastReading, systemStatus, loading, error, getLastReadingData, startManualCycle, stopManualCycle } = useApp();
  
  // Arşiv ve Detay State Yönetimleri
  const [historyReports, setHistoryReports] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [cycleDetails, setCycleDetails] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // 🎯 Canlı veri refresh motoru (5 saniyede bir ana paneli günceller)
  useEffect(() => {
    getLastReadingData(); 
    const interval = setInterval(() => {
      getLastReadingData();
    }, 5000); 
    return () => clearInterval(interval);
  }, [getLastReadingData]);

  // 🎯 1. DB'den Çevrim Aralıklarını Listeleme Fonksiyonu
  const fetchHistoryReports = async () => {
    try {
      setHistoryLoading(true);
      const response = await fetch('http://localhost:3001/api/reports/history');
      const json = await response.json();
      if (json.success) {
        setHistoryReports(json.data);
      }
    } catch (err) {
      console.error("Geçmiş çevrimler çekilemedi:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryReports();
  }, [systemStatus.startMemState]);

  // 🎯 2. Seçilen İki Zaman Aralığındaki Verileri Ekrana Listeleme
  const handleViewDetails = async (cycle) => {
    try {
      setSelectedCycle(cycle);
      setDetailsLoading(true);
      setCycleDetails([]);

      // Backend'deki tarih aralığı sorgusunu tetikliyoruz
      // Geriye dönük raporlama için index.js'deki generateAndPrintReport mantığının API karşılığını kullanabiliriz
      // Veya mevcut API'lerde tarih aralığı sorgusu varsa doğrudan oraya istek atıyoruz.
      const response = await fetch(`http://localhost:3001/api/reports/reprint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startTime: cycle.startTime, endTime: cycle.endTime, onlyData: true }) 
        // Not: reprint endpoint'i normalde direkt yazdırıyor, 
        // buraya sadece veri çekmek için eldeki verileri birleştiren mantığı simüle edeceğiz veya direkt yazdıracağız.
      });
      
      // Ekranda göstermek üzere iki zaman aralığını canlandırmak için lokal simülasyon/fetch yapısı kurabiliriz.
      // Yazdırma komutunu ise bağımsız tetikleyeceğiz.
      // Şimdilik operatörün aralığı görmesi için seçilen aralık bilgisini state'e kilitliyoruz.
      
      // Süreci basitleştirmek için: Seçilen aralık bilgilerini onaylayıp direkt yazıcı motoruna paslayalım.
    } catch (err) {
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  // 🎯 3. Manuel Olarak Yazıcıya Gönderme (Reprint)
  const handleReprint = async (startTime, endTime) => {
    if (window.confirm("Bu zaman aralığına ait proses log raporunu fiziksel yazıcıya göndermek istiyor musunuz?")) {
      try {
        const response = await fetch('http://localhost:3001/api/reports/reprint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ startTime, endTime })
        });
        const json = await response.json();
        alert("📋 Seçilen aralık başarıyla yazıcı kuyruğuna gönderildi!");
      } catch (err) {
        alert("❌ Yazıcı sunucusuyla iletişim kurulamadı.");
      }
    }
  };

  const getValueColor = (success) => {
    return success ? 'value-success' : 'value-error';
  };

  const handleToggleCycle = async () => {
    if (systemStatus.startMemState) {
      if (window.confirm("Üretim periyodunu bitirmek ve otomatik rapor çıktısı almak istiyor musunuz?")) {
        await stopManualCycle();
      }
    } else {
      await startManualCycle();
    }
  };

  return (
    <div className="dashboard-page">
      <div className="container">
        
        {/* ÜST PANEL: Canlı Başlık ve Kontrol */}
        <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1>📊 Canlı İzleme Paneli</h1>
            <small style={{ color: 'var(--color-text-secondary)' }}>⚡ GEM MEKATRONİK Endüstriyel Data Logger Arayüzü</small>
          </div>
          
          <div className="manual-control-panel">
            <button
              onClick={handleToggleCycle}
              disabled={loading}
              style={{
                padding: '12px 28px',
                fontSize: '15px',
                fontWeight: '700',
                borderRadius: 'var(--radius-sm)', 
                border: 'none',
                cursor: 'pointer',
                backgroundColor: systemStatus.startMemState ? 'var(--color-danger)' : 'var(--color-success)',
                color: 'white',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              {systemStatus.startMemState ? '🛑 ÇEVRİMİ BİTİR VE YAZDIR' : '🟢 MANUEL ÇEVRİM BAŞLAT'}
            </button>
          </div>
        </div>

        {/* ANLIK SENSÖR KARTLARI ALANI */}
        {lastReading && lastReading.tags ? (
          <div className="tags-grid" style={{ marginTop: '20px' }}>
            {lastReading.tags
              .filter(tag => tag.id !== 'START_MEM')
              .map((tag) => (
                <div key={tag.id} className="tag-card">
                  <div className="tag-header">
                    <h3>{tag.name}</h3>
                    <span className={`tag-status ${tag.success ? 'success' : 'error'}`}>{tag.success ? '✓' : '✗'}</span>
                  </div>
                  <div className={`tag-value ${getValueColor(tag.success)}`}>
                    <div className="value-number">
                      {typeof tag.value === 'number' ? (
                        (tag.id === 'TANK_SIVI_SEVIYESI' || tag.id === 'WFI_SICAKLIGI') ? parseInt(tag.value) : tag.value.toFixed(2)
                      ) : tag.value}
                    </div>
                    <div className="value-unit">{tag.unit}</div>
                  </div>
                  <div className="tag-footer">
                    <span className="tag-id">{tag.id}</span>
                    <span className="tag-timestamp">{new Date(tag.timestamp).toLocaleTimeString('tr-TR')}</span>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="no-data" style={{ marginTop: '20px' }}>📭 Sistem Beklemede</div>
        )}

        {/* CANLI TREND GRAFİĞİ */}
        <div className="card trend-section" style={{ marginTop: '20px' }}>
          <h2>📈 Aktif Proses Trend Grafiği</h2>
          <TrendChart />
        </div>

        {/* 🎯 KAFANIZDAKİ SENARYO: DOCKER DB GEÇMİŞ ÜRETİM ARŞİV PANELİ */}
        <div className="card history-section" style={{ marginTop: '25px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <div>
              <h2>🗄️ Üretim Çevrim Arşivi (Docker DB)</h2>
              <p className="text-secondary">Yükselen ve düşen kenar sinyalleriyle mühürlenmiş gerçek üretim aralıkları</p>
            </div>
            <button className="btn-refresh" onClick={fetchHistoryReports} style={{ padding: '8px 16px', cursor: 'pointer', fontWeight: 'bold' }}>🔄 Listeyi Yenile</button>
          </div>

          {historyLoading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>Üretim kayıtları sorgulanıyor...</div>
          ) : historyReports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-secondary)' }}>📭 Henüz kayıtlı bir üretim çevrimi bulunamadı.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-primary)', color: 'white', fontSize: '14px' }}>
                    <th style={{ padding: '12px' }}>Çevrim No</th>
                    <th style={{ padding: '12px' }}>Başlangıç (Yükselen Kenar)</th>
                    <th style={{ padding: '12px' }}>Bitiş (Düşen Kenar)</th>
                    <th style={{ padding: '12px' }}>Durum</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {historyReports.map((report) => (
                    <tr key={report.id} style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: selectedCycle?.id === report.id ? '#eff6ff' : 'transparent' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>#Batch-{report.id}</td>
                      <td style={{ padding: '12px' }}>{new Date(report.startTime).toLocaleString('tr-TR')}</td>
                      <td style={{ padding: '12px' }}>{new Date(report.endTime).toLocaleString('tr-TR')}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold',
                          backgroundColor: report.status === 'Tamamlandı' ? '#d1fae5' : '#fef3c7', 
                          color: report.status === 'Tamamlandı' ? '#065f46' : '#92400e' 
                        }}>
                          {report.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                        {/* Aralığı Seçme Butonu */}
                        <button 
                          onClick={() => setSelectedCycle(report)}
                          style={{
                            backgroundColor: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px'
                          }}
                        >
                          🔍 Aralığı Seç
                        </button>
                        
                        {/* Doğrudan Yazdırma Butonu */}
                        <button 
                          onClick={() => handleReprint(report.startTime, report.endTime)}
                          style={{
                            backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px'
                          }}
                        >
                          🖨️ Manuel Yazdır
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 🎯 SEÇİLEN ARALIK DETAY PANELİ VE MANUEL YAZDIRMA */}
        {selectedCycle && (
          <div className="card selected-cycle-panel" style={{ marginTop: '25px', padding: '20px', borderColor: '#2563eb', borderLeftWidth: '5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <div>
                <h3 style={{ color: '#2563eb', margin: 0 }}>🎯 Seçili Aralık Detayları: #Batch-{selectedCycle.id}</h3>
                <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  📅 <strong>Başlangıç:</strong> {new Date(selectedCycle.startTime).toLocaleString('tr-TR')} | <strong>Bitiş:</strong> {new Date(selectedCycle.endTime).toLocaleString('tr-TR')}
                </p>
              </div>
              <button
                onClick={() => handleReprint(selectedCycle.startTime, selectedCycle.endTime)}
                style={{
                  backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', boxShadow: 'var(--shadow-md)'
                }}
              >
                🖨️ BU ARALIĞIN RAPORUNU MANUEL YAZDIR
              </button>
            </div>
            
            <div style={{ marginTop: '15px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '4px', fontSize: '13px', color: '#475569' }}>
              ℹ️ <strong>Operatör Bilgisi:</strong> Bu aralığı seçtiniz. Yukarıdaki mavi butona bastığınızda, sistem otomatik olarak Docker DB'ye giderek bu iki mühürlü zaman damgası arasındaki tüm sıcaklık, basınç, seviye ve iletkenlik verilerini derleyecek, 6 sütunlu endüstriyel tablonuzu oluşturup fiziksel yazıcıya elden (manuel) gönderecektir.
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;