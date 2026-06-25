// frontend/src/context/AppContext.js
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [tags, setTags] = useState([]);
  const [lastReading, setLastReading] = useState(null);
  const [systemStatus, setSystemStatus] = useState({
    isRunning: false,
    startMemState: false,
    isMainReadingActive: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = 'http://localhost:3001/api';

  const loadTags = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/tags`);
      const mainTags = response.data.filter(tag => tag.id !== 'START_MEM');
      setTags(mainTags);
      setError(null);
    } catch (err) {
      setError(`Tag'lar yüklenemedi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const getSystemStatus = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/system/status`);
      setSystemStatus(response.data);
      setError(null);
      return response.data;
    } catch (err) {
      setError(`Sistem durumu alınamadı: ${err.message}`);
    }
  }, []);

  const getLastReadingData = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/reading/last`);
      setLastReading(response.data);
      setError(null);
      return response.data;
    } catch (err) {
      setError(`Son veriler alınamadı: ${err.message}`);
    }
  }, []);

  const getTrendData = useCallback(async (limit = 100) => {
    try {
      const response = await axios.get(`${API_URL}/reading/all?limit=${limit}`);
      return response.data.data || [];
    } catch (err) {
      console.error('Trend verileri alınamadı:', err);
      return [];
    }
  }, []);

  // Manuel Döngüyü Tetikle (Arayüz Butonu İçin)
  const startManualCycle = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/system/start-manual`);
      await getSystemStatus();
      return response.data;
    } catch (err) {
      setError(`Manuel başlatma hatası: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Manuel Döngüyü Kapat ve Yazdır (Arayüz Butonu İçin)
  const stopManualCycle = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/system/stop-manual`);
      await getSystemStatus();
      return response.data;
    } catch (err) {
      setError(`Manuel durdurma hatası: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTags();
    getSystemStatus();
    getLastReadingData();

    const statusInterval = setInterval(() => {
      getSystemStatus();
      getLastReadingData();
    }, 5000); 

    return () => clearInterval(statusInterval);
  }, []);

  const value = {
    tags,
    lastReading,
    systemStatus,
    loading,
    error,
    loadTags,
    getLastReadingData,
    getTrendData,
    getSystemStatus,
    startManualCycle,
    stopManualCycle,
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