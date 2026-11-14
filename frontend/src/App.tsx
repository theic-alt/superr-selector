import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PlayerModal } from './components/PlayerModal';
import { LandingPage } from './pages/LandingPage';
import { CommandCentrePage } from './pages/CommandCentrePage';
import { SelectedArenaPage } from './pages/SelectedArenaPage';
import { PlayerAnalyzerPage } from './pages/PlayerAnalyzerPage';
import { PressureExplainerPage } from './pages/PressureExplainerPage';
import { ModelExplorerPage } from './pages/ModelExplorerPage';
import { OverviewStats, SelectedTop20 } from './types';
import { fetchOverview, fetchSelectedTop20 } from './api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [selectedTop20, setSelectedTop20] = useState<SelectedTop20 | null>(null);
  const [activeModalPlayer, setActiveModalPlayer] = useState<{ id: number; role?: string } | null>(null);
  const [apiConnected, setApiConnected] = useState<boolean>(true);

  // Initial Data Fetch
  useEffect(() => {
    fetchOverview()
      .then(data => {
        setOverview(data);
        setApiConnected(true);
      })
      .catch(err => {
        console.warn('Backend API connection check:', err.message);
        setApiConnected(false);
      });

    fetchSelectedTop20()
      .then(data => setSelectedTop20(data))
      .catch(err => console.warn('Top 20 fetch error:', err.message));
  }, []);

  const handleOpenPlayerModal = (playerId: number, role?: string) => {
    setActiveModalPlayer({ id: playerId, role });
  };

  const handleClosePlayerModal = () => {
    setActiveModalPlayer(null);
  };

  return (
    <div className="min-h-screen bg-pitch-dark text-slate-100 flex flex-col font-sans overflow-x-hidden w-full max-w-full">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        apiConnected={apiConnected}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full overflow-x-hidden">
        {activeTab === 'landing' && (
          <LandingPage
            overview={overview}
            selectedTop20={selectedTop20}
            onSelectPlayer={(id, role) => handleOpenPlayerModal(id, role)}
            onExploreSelected={() => setActiveTab('selected-arena')}
            onAnalyzeAny={() => setActiveTab('analyzer')}
          />
        )}

        {activeTab === 'command-centre' && (
          <CommandCentrePage
            overview={overview}
            onSelectPlayer={(id, role) => handleOpenPlayerModal(id, role)}
          />
        )}

        {activeTab === 'selected-arena' && (
          <SelectedArenaPage
            selectedTop20={selectedTop20}
            onSelectPlayer={(id, role) => handleOpenPlayerModal(id, role)}
          />
        )}

        {activeTab === 'analyzer' && (
          <PlayerAnalyzerPage
            onSelectPlayerModal={(id, role) => handleOpenPlayerModal(id, role)}
          />
        )}

        {activeTab === 'pressure-explainer' && (
          <PressureExplainerPage />
        )}

        {activeTab === 'model-explorer' && (
          <ModelExplorerPage />
        )}
      </main>

      {/* Global Detailed Player Analysis Modal */}
      {activeModalPlayer && (
        <PlayerModal
          playerId={activeModalPlayer.id}
          rolePreference={activeModalPlayer.role}
          onClose={handleClosePlayerModal}
        />
      )}

      {/* Footer with Rajasthan Royals Official Branding */}
      <footer className="border-t-2 border-rr-pink/30 bg-[#040714] py-8 text-xs font-mono text-slate-400 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <img 
              src="/rr-logo.png" 
              alt="Rajasthan Royals" 
              className="h-8 w-auto object-contain filter drop-shadow-[0_0_10px_rgba(234,26,136,0.5)]" 
            />
            <div className="border-l border-rr-pink/30 pl-3">
              <span className="text-white font-bold block">SupeRR Selector Season 2</span>
              <span className="text-rr-pink text-[11px] font-semibold">Official Rajasthan Royals Analytics Platform</span>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-[11px] text-slate-400">
            <span className="px-2 py-1 rounded bg-[#091124] border border-rr-pink/20 text-slate-300">FastAPI Backend Engine</span>
            <span>•</span>
            <span className="px-2 py-1 rounded bg-[#091124] border border-rr-pink/20 text-slate-300">Three.js Realtime Pitch</span>
            <span>•</span>
            <span className="px-2 py-1 rounded bg-[#091124] border border-rr-pink/20 text-rr-pink font-bold">Relative PPI v2.6</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
