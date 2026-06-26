// frontend/src/components/TrendChart.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { useApp } from '../context/AppContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// ChartJS bileşenlerini kaydet
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const TrendChart = ({ tagId = null }) => {
  const { systemStatus, lastReading } = useApp();
  const [liveDataPoints, setLiveDataPoints] = useState([]);
  
  // Çevrimin başlangıç durumunu izlemek için bir referans tutuyoruz
  const wasActive = useRef(false);

  // 🎯 YENİ REAKSİYON MOTORU: Start_Mem durumunu anlık izle
  useEffect(() => {
    // SENARYO 1: Çevrim yeni başladıysa (Beklemeden Aktife Geçiş) veya Manuel Start Verildiyse
    if (systemStatus.startMemState && !wasActive.current) {
      console.log("🔄 Yeni üretim çevrimi algılandı! Grafik hafızası tamamen sıfırlanıyor...");
      setLiveDataPoints([]); // Eski çevrimin tüm verilerini tek seferde uçur, ekranı sıfırla
      wasActive.current = true;
    }
    
    // SENARYO 2: Çevrim bittiyse durumu güncelle
    if (!systemStatus.startMemState) {
      wasActive.current = false;
    }
  }, [systemStatus.startMemState]);

  // 🎯 CANLI VERİ EKLEME MOTORU: Her yeni okuma geldiğinde sadece aktif çevrimdeysek hafızaya ekle
  useEffect(() => {
    if (systemStatus.startMemState && lastReading && lastReading.tags) {
      const timestamp = new Date(lastReading.timestamp).toLocaleTimeString('tr-TR');
      
      // Gelen paketteki etiketleri süzüp grafik formatına dönüştür
      const newReadings = lastReading.tags
        .filter(tag => tag.id !== 'START_MEM' && tag.id !== 'WFI_SICAKLIGI' && tag.id !== 'URETIM_ADEDI')
        .map(tag => ({
          tag_id: tag.id,
          tag_name: tag.name,
          value: tag.value,
          time: timestamp
        }));

      if (newReadings.length > 0) {
        setLiveDataPoints(prevPoints => {
          // Aynı zaman damgasına sahip mükerrer kayıt kontrolü
          const isAlreadyAdded = prevPoints.some(p => p.time === timestamp);
          if (isAlreadyAdded) return prevPoints;
          
          // Yeni noktaları mevcut listenin üzerine ekle
          return [...prevPoints, ...newReadings];
        });
      }
    }
  }, [lastReading, systemStatus.startMemState]);

  // Eğer hafızada hiç veri yoksa (Sistem beklemedeyse) kullanıcıya bilgi ekranı göster
  if (!systemStatus.startMemState || liveDataPoints.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-secondary)', background: '#fafafa', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-border)' }}>
        📊 Çevrim başlatıldığında yeni grafik gerçek zamanlı olarak burada çizilecektir...
      </div>
    );
  }

  // --- GRAFİK DATA HAZIRLAMA SÜRECİ ---
  
  // Belirli bir bireysel tag grafiği istenmiş mi kontrolü (Eğer Dashboard altındaki bireysel kartlar kullanılıyorsa)
  let filteredPoints = [...liveDataPoints];
  if (tagId) {
    filteredPoints = filteredPoints.filter(item => item.tag_id === tagId);
  }

  // Benzersiz zaman etiketlerini yatay eksen (X) yap
  const labels = [...new Set(filteredPoints.map(item => item.time))];
  const uniqueTagIds = tagId ? [tagId] : [...new Set(filteredPoints.map(item => item.tag_id))];

  // Keskin endüstriyel renk paleti
  const colors = {
    'TANK_SICAKLIGI': '#ef4444',     
    'TANK_BASINCI': '#3b82f6',       
    'TANK_SIVI_SEVIYESI': '#10b981',  
    'ILETKENLIK_DEGERI': '#f59e0b'
  };

  const datasets = uniqueTagIds.map(id => {
    const tagSamples = filteredPoints.filter(item => item.tag_id === id);
    const name = tagSamples[0]?.tag_name || id;
    
    // Zaman etiketlerine karşılık gelen değerleri hizala
    const dataPoints = labels.map(label => {
      const match = tagSamples.find(item => item.time === label);
      return match ? parseFloat(match.value) : null;
    });

    return {
      label: name,
      data: dataPoints,
      borderColor: colors[id] || '#6b7280',
      backgroundColor: 'transparent',
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5,
      tension: 0.1, 
      spanGaps: true
    };
  });

  const chartData = { labels, datasets };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { font: { size: 11, weight: '600' } }
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 } }
      },
      y: {
        grid: { color: 'var(--color-border)' },
        ticks: { font: { size: 10 } }
      }
    }
  };

  return (
    <div style={{ height: '300px', width: '100%', marginTop: '10px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default TrendChart;