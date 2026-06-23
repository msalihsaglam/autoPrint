import { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import './styles/global.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  return (
    <AppProvider>
      <div className="app">
        <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
        
        <main className="main-content">
          {currentPage === 'dashboard' && <Dashboard />}
          {currentPage === 'settings' && <Settings />}
        </main>
      </div>
    </AppProvider>
  );
}

export default App;
