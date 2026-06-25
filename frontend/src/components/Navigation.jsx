// frontend/src/components/Navigation.jsx (veya projedeki yeri)
import React from 'react';
import './Navigation.css';

export const Navigation = ({ currentPage, onPageChange }) => {
  return (
    <nav className="nav">
      <div className="nav-container">
        <div className="nav-brand">
          {/* Marka kimliğini net ve keskin endüstriyel formata getirdik */}
          <h2>⚡ Gem Mekatronik | AutoPrint</h2>
        </div>

        <div className="nav-menu">
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