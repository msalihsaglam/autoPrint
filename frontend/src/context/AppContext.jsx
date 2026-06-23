import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [mode, setMode] = useState('manual'); // 'manual' | 'auto'
  const [cycle, setCycle] = useState('EVERY_24_HOURS'); // Okuma cycle'ı
  const [tags, setTags] = useState([]); // Tag listesi
  const [lastReading, setLastReading] = useState(null); // Son okuma
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // API base URL
  const API_URL = 'http://localhost:3001/api';

  // Tag'ları yükle
  const loadTags = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/tags`);
      setTags(response.data);
      setError(null);
    } catch (err) {
      setError(`Tag'lar yüklenemedi: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sistem modu değiştir
  const setSystemMode = useCallback(async (newMode) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/system/mode`, { mode: newMode });
      setMode(newMode);
      setError(null);
      return response.data;
    } catch (err) {
      setError(`Mod değiştirilemedi: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cycle değiştir (otomatik mod için)
  const setReadingCycle = useCallback(async (newCycle) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/system/cycle`, { cycle: newCycle });
      setCycle(newCycle);
      setError(null);
      return response.data;
    } catch (err) {
      setError(`Cycle değiştirilemedi: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Manuel trigger - anında tag oku
  const triggerReading = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/reading/trigger`);
      setLastReading(response.data);
      setError(null);
      return response.data;
    } catch (err) {
      setError(`Okuma başarısız: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
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

  // Sistem durumunu getir
  const getSystemStatus = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/system/status`);
      return response.data;
    } catch (err) {
      console.error('Sistem durumu alınamadı:', err);
    }
  }, []);

  const value = {
    // State
    mode,
    cycle,
    tags,
    lastReading,
    loading,
    error,

    // Methods
    setSystemMode,
    setReadingCycle,
    triggerReading,
    loadTags,
    getLastReadingData,
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
