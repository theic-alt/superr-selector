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
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-rr-pink/25 bg-[#050814]/90 backdrop-blur-xl shadow-lg shadow-rr-pink/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div 
          onClick={() => setActiveTab('landing')}
          className="flex items-center space-x-3.5 cursor-pointer group"
        >
          {/* Rajasthan Royals Crest Badge */}
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rr-pink via-rose-600 to-rr-blue flex flex-col items-center justify-center shadow-lg shadow-rr-pink/40 border border-white/20 group-hover:scale-105 transition-transform relative overflow-hidden">
            <span className="text-[10px] leading-none">👑</span>
            <span className="font-display font-black text-sm text-white tracking-widest leading-none">RR</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-display font-black text-xl text-white tracking-wide">
                SUPERR <span className="bg-gradient-to-r from-rr-pink via-rose-400 to-rr-gold bg-clip-text text-transparent">SELECTOR</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rr-pink/20 text-rr-pink border border-rr-pink/40 shadow-sm">
                SEASON 2
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 tracking-tight flex items-center space-x-1.5">
              <span className="text-rr-gold font-bold">RAJASTHAN ROYALS</span>
              <span>•</span>
              <span>HALLA BOL INTELLIGENCE</span>
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center space-x-1 p-1 rounded-2xl bg-[#091124]/80 border border-rr-pink/20 shadow-inner">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-rr-pink via-rose-600 to-rr-darkPink text-white font-semibold shadow-md shadow-rr-pink/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
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
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0a142c] border border-rr-pink/30 text-[11px] font-mono shadow-sm">
            <span className={`w-2 h-2 rounded-full ${apiConnected ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
            <span className="text-slate-200">{apiConnected ? 'RR FastAPI Engine' : 'Local Pipeline'}</span>
          </div>

          <button
            onClick={() => setActiveTab('analyzer')}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rr-pink to-rose-600 hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-rr-pink/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Player</span>
          </button>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="lg:hidden flex overflow-x-auto px-4 py-2 space-x-2 border-t border-white/5 bg-slate-950/80">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === item.id
                ? 'bg-rr-pink text-white font-semibold'
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
