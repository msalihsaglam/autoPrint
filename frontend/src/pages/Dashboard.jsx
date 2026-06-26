// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import TrendChart from '../components/TrendChart';
import './Dashboard.css';

export const Dashboard = () => {
  const { lastReading, systemStatus, getLastReadingData } = useApp();
  
  // Arşiv State Yönetimleri
  const [historyReports, setHistoryReports] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // 🎯 Canlı veri refresh motoru (5 saniyede bir ana paneli günceller)
  useEffect(() => {
    getLastReadingData(); 
    const interval = setInterval(() => {
      getLastReadingData();
    }, 5000); 
    return () => clearInterval(interval);
  }, [getLastReadingData]);

  // 🎯 DB'den Çevrim Aralıklarını Listeleme Fonksiyonu
  const fetchHistoryReports = async () => {
    try {
      setHistoryLoading(true);
      const response = await fetch('http://localhost:3001/api/reports/history');
      const json = await response.json();
      if (json.success) {
        // Sadece son 5 batch'i gösteriyoruz
        setHistoryReports(json.data.slice(0, 5));
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

  // 🎯 Manuel Olarak Yazıcıya Gönderme (Reprint)
  const handleReprint = async (startTime, endTime) => {
    if (window.confirm("Bu zaman aralığına ait proses log raporunu fiziksel yazıcıya göndermek istiyor musunuz?")) {
      try {
        const response = await fetch('http://localhost:3001/api/reports/reprint', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ startTime, endTime })
        });
        await response.json();
        alert("📋 Seçilen aralık başarıyla yazıcı kuyruğuna gönderildi!");
      } catch (err) {
        alert("❌ Yazıcı sunucusuyla iletişim kurulamadı.");
      }
    }
  };

  const getValueColor = (success) => {
    return success ? 'value-success' : 'value-error';
  };

  return (
    <div className="dashboard-page" style={{ paddingTop: '20px' }}>
      <div className="container">

        {/* ANLIK SENSÖR KARTLARI ALANI */}
        {lastReading && lastReading.tags ? (
          <div className="tags-grid">
            {lastReading.tags
              .filter(tag => tag.id !== 'START_MEM' && tag.id !== 'WFI_SICAKLIGI' && tag.id !== 'URETIM_ADEDI')
              .map((tag) => (
                <div key={tag.id} className="tag-card" style={{ paddingBottom: '20px' }}>
                  <div className="tag-header">
                    <h3>{tag.name}</h3>
                    <span className={`tag-status ${tag.success ? 'success' : 'error'}`}>{tag.success ? '✓' : '✗'}</span>
                  </div>
                  <div className={`tag-value ${getValueColor(tag.success)}`} style={{ marginBottom: 0 }}>
                    <div className="value-number">
                      {typeof tag.value === 'number' ? (
                        (tag.id === 'TANK_SIVI_SEVIYESI' || tag.id === 'ILETKENLIK_DEGERI') ? parseInt(tag.value) : tag.value.toFixed(2)
                      ) : tag.value}
                    </div>
                    {/* 🎯 Birim font boyutu 14px'den 18px'e yükseltildi */}
                    <div className="value-unit" style={{ fontSize: '18px', fontWeight: 'bold' }}>{tag.unit}</div>
                  </div>
                  {/* 🎯 Alttaki tag name ve tarih kısımları tamamen kaldırıldı */}
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

        {/* SADELEŞTİRİLMİŞ ÜRETİM ÇEVRİM ARŞİVİ PANELİ */}
        <div className="card history-section" style={{ marginTop: '25px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <div>
              <h2>🗄️ Üretim Çevrim Arşivi</h2>
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
                    <tr key={report.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
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
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button 
                          onClick={() => handleReprint(report.startTime, report.endTime)}
                          style={{
                            backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px'
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

      </div>
    </div>
  );
};

export default Dashboard;