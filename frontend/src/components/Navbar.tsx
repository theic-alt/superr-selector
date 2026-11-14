import React from 'react';
import { ShieldAlert, Activity, Users, Search, PlayCircle, Sliders, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  apiConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, apiConnected }) => {
  const navItems = [
    { id: 'landing', label: 'The Pressure Elite', icon: Sparkles },
    { id: 'command-centre', label: 'Command Centre', icon: Activity },
    { id: 'selected-arena', label: 'Selected Arena (Top 20)', icon: Users },
    { id: 'analyzer', label: 'PPI Analyzer', icon: Search },
    { id: 'pressure-explainer', label: 'Pressure Simulator', icon: PlayCircle },
    { id: 'model-explorer', label: 'Model Explorer & What-If', icon: Sliders },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b-2 border-rr-pink/60 bg-[#050814]/95 backdrop-blur-2xl shadow-xl shadow-rr-pink/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Rajasthan Royals Official Logo & Platform Identity */}
        <div 
          onClick={() => setActiveTab('landing')}
          className="flex items-center space-x-3.5 cursor-pointer group"
        >
          {/* Rajasthan Royals Official Logo */}
          <div className="relative py-1 flex items-center justify-center group-hover:scale-105 transition-all duration-300">
            <img 
              src="/rr-logo.png" 
              alt="Rajasthan Royals" 
              className="h-10 sm:h-12 w-auto object-contain filter drop-shadow-[0_2px_14px_rgba(234,26,136,0.65)]" 
            />
          </div>

          <div className="border-l border-rr-pink/40 pl-3">
            <div className="flex items-center space-x-2">
              <span className="font-display font-black text-lg sm:text-xl text-white tracking-wide">
                SUPERR <span className="bg-gradient-to-r from-rr-pink via-rose-400 to-rr-gold bg-clip-text text-transparent">SELECTOR</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rr-pink/25 text-white border border-rr-pink shadow-sm shadow-rr-pink/40">
                SEASON 2
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-300 tracking-tight flex items-center space-x-1.5">
              <span className="text-rr-pink font-bold">RAJASTHAN ROYALS</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">HALLA BOL INTELLIGENCE</span>
            </p>
          </div>
        </div>

        {/* Navigation Tabs with Signature RR Pink Theme */}
        <nav className="hidden lg:flex items-center space-x-1 p-1 rounded-2xl bg-[#091124]/90 border border-rr-pink/30 shadow-inner shadow-rr-pink/10">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-rr-pink via-rose-600 to-rr-darkPink text-white font-bold shadow-lg shadow-rr-pink/40 border border-white/20'
                    : 'text-slate-300 hover:text-white hover:bg-rr-pink/10'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Telemetry Status & Search Action */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0a142c] border border-rr-pink/40 text-[11px] font-mono shadow-sm shadow-rr-pink/10">
            <span className={`w-2 h-2 rounded-full ${apiConnected ? 'bg-rr-pink animate-pulse' : 'bg-amber-400 animate-pulse'}`} />
            <span className="text-slate-200">{apiConnected ? 'RR FastAPI Engine' : 'Local Pipeline'}</span>
          </div>

          <button
            onClick={() => setActiveTab('analyzer')}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rr-pink via-rose-500 to-rr-darkPink hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-rr-pink/40 hover:scale-[1.02] active:scale-[0.98] transition-all border border-white/10"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Player</span>
          </button>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="lg:hidden flex overflow-x-auto px-4 py-2 space-x-2 border-t border-rr-pink/30 bg-slate-950/90">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === item.id
                ? 'bg-rr-pink text-white font-bold shadow-md shadow-rr-pink/40'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
