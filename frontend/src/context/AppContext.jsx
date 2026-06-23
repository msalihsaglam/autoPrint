import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [tags, setTags] = useState([]); // Tag listesi
  const [lastReading, setLastReading] = useState(null); // Son okuma
  const [systemStatus, setSystemStatus] = useState({ // Start_MEM durum
    isRunning: false,
    startMemState: false,
    isMainReadingActive: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // API base URL
  const API_URL = 'http://localhost:3001/api';

  // Tag'ları yükle
  const loadTags = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/tags`);
      // Filter out START_MEM control tag from display
      const mainTags = response.data.filter(tag => tag.id !== 'START_MEM');
      setTags(mainTags);
      setError(null);
    } catch (err) {
      setError(`Tag'lar yüklenemedi: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sistem durumunu kontrol et
  const getSystemStatus = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/system/status`);
      setSystemStatus(response.data);
      setError(null);
      return response.data;
    } catch (err) {
      setError(`Sistem durumu alınamadı: ${err.message}`);
      console.error(err);
    }
  }, []);

  // Son okuma verilerini getir
  const getLastReadingData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/reading/last`);
      setLastReading(response.data);
      setError(null);
      return response.data;
    } catch (err) {
      setError(`Son veriler alınamadı: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Trend verilerini getir (son N okumayı al)
  const getTrendData = useCallback(async (limit = 100) => {
    try {
      const response = await axios.get(`${API_URL}/reading/all?limit=${limit}`);
      return response.data.data || [];
    } catch (err) {
      console.error('Trend verileri alınamadı:', err);
      return [];
    }
  }, []);

  // Otomatik status güncelleme (dakikada bir)
  useEffect(() => {
    loadTags();
    getSystemStatus();
    getLastReadingData();

    const statusInterval = setInterval(() => {
      getSystemStatus();
      getLastReadingData();
    }, 60000); // 60 saniye (dakikada bir)

    return () => clearInterval(statusInterval);
  }, []);

  const value = {
    // State
    tags,
    lastReading,
    systemStatus,
    loading,
    error,

    // Methods
    loadTags,
    getLastReadingData,
    getTrendData,
    getSystemStatus,
    setError,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
