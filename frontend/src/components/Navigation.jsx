// frontend/src/components/Navigation.jsx (veya projedeki yeri)
import React from 'react';
import { useApp } from '../context/AppContext';
import './Navigation.css';

export const Navigation = ({ currentPage, onPageChange }) => {
  const { systemStatus } = useApp();

  return (
    <nav className="nav">
      <div className="nav-container">
        <div className="nav-brand">
          {/* Marka kimliğini net ve keskin endüstriyel formata getirdik */}
          <h2>⚡ Gem Mekatronik | AutoPrint</h2>
        </div>

        <div className="nav-menu">
          <div className={`plc-status ${systemStatus.plcConnected ? 'plc-status--online' : 'plc-status--offline'}`}>
            <span className="plc-status__dot"></span>
            <span className="plc-status__text">
              {systemStatus.plcConnected ? 'PLC Haberleşmesi Var' : 'PLC Haberleşmesi Yok'}
            </span>
          </div>

          <button
            className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => onPageChange('dashboard')}
          >
            📊 Canlı İzleme Paneli
          </button>
          
          {/* ⚙️ Ayarlar butonu buradan tamamen kaldırıldı */}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;