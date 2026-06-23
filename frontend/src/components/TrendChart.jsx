import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { useApp } from '../context/AppContext';
import './TrendChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const TrendChart = ({ tagId = null, title = null }) => {
  const { getTrendData } = useApp();
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrendData();
    const interval = setInterval(() => {
      loadTrendData();
    }, 60000); // 60 saniye
    return () => clearInterval(interval);
  }, [tagId]);

  const loadTrendData = async () => {
    try {
      setLoading(true);
      const data = await getTrendData(100);
      
      if (!data || data.length === 0) {
        setChartData(null);
        setLoading(false);
        return;
      }

      // Reverse for chronological order
      const sortedData = [...data].reverse();

      if (tagId) {
        // Single tag trend
        const filteredData = sortedData.filter(d => d.tag_id === tagId);
        if (filteredData.length === 0) {
          setChartData(null);
          setLoading(false);
          return;
        }

        setChartData({
          labels: filteredData.map((d, i) => {
            const date = new Date(d.reading_timestamp);
            return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
          }),
          datasets: [
            {
              label: filteredData[0]?.tag_name || tagId,
              data: filteredData.map(d => parseFloat(d.value) || 0),
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              fill: true,
              tension: 0.4,
              pointRadius: 3,
              pointHoverRadius: 5,
              borderWidth: 2,
            }
          ]
        });
      } else {
        // All tags trend
        const tagGroups = {};
        const labels = new Set();

        sortedData.forEach(d => {
          if (!tagGroups[d.tag_id]) {
            tagGroups[d.tag_id] = [];
          }
          tagGroups[d.tag_id].push(d);
          const date = new Date(d.reading_timestamp);
          labels.add(date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
        });

        const labelArray = Array.from(labels);
        const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

        const datasets = Object.entries(tagGroups).map(([tagIdKey, readings], index) => ({
          label: readings[0]?.tag_name || tagIdKey,
          data: readings.map(d => parseFloat(d.value) || 0),
          borderColor: colors[index % colors.length],
          backgroundColor: `rgba(${colors[index % colors.length].slice(1).match(/.{1,2}/g).map(x => parseInt(x, 16)).join(', ')}, 0.1)`,
          fill: false,
          tension: 0.4,
          pointRadius: 2,
          pointHoverRadius: 4,
          borderWidth: 2,
        }));

        setChartData({
          labels: labelArray,
          datasets
        });
      }
    } catch (error) {
      console.error('Trend verisi alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="trend-chart loading">📊 Trend verileri yükleniyor...</div>;
  }

  if (!chartData || !chartData.labels || chartData.labels.length === 0) {
    return <div className="trend-chart empty">📊 Henüz veri yok. Sistemin veri toplamaya başlamasını bekleyin.</div>;
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: !!title,
        text: title || '',
        font: {
          size: 14,
          weight: 'bold'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(2);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          drawBorder: true,
        }
      },
      x: {
        grid: {
          display: false,
        }
      }
    }
  };

  return (
    <div className="trend-chart">
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default TrendChart;
