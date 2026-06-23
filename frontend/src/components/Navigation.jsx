import React from 'react';
import './Navigation.css';

export const Navigation = ({ currentPage, onPageChange }) => {
  return (
    <nav className="nav">
      <div className="nav-container">
        <div className="nav-brand">
          <h2>🔷 PLC System</h2>
        </div>

        <div className="nav-menu">
          <button
            className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => onPageChange('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={`nav-link ${currentPage === 'settings' ? 'active' : ''}`}
            onClick={() => onPageChange('settings')}
          >
            ⚙️ Ayarlar
          </button>
        </div>
      </div>
    </nav>
  );
};
