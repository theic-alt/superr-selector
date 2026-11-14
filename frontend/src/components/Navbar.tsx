import React from 'react';
import { ShieldAlert, Activity, Users, Search, PlayCircle, Sliders, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  apiConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, apiConnected }) => {
  const navItems = [
    { id: 'landing', label: '3D Stadium', icon: Sparkles },
    { id: 'command-centre', label: 'Command Centre', icon: Activity },
    { id: 'selected-arena', label: 'Selected Arena (Top 20)', icon: Users },
    { id: 'analyzer', label: 'PPI Analyzer', icon: Search },
    { id: 'pressure-explainer', label: 'Pressure Simulator', icon: PlayCircle },
    { id: 'model-explorer', label: 'Model Explorer & What-If', icon: Sliders },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-pitch-border bg-pitch-dark/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div 
          onClick={() => setActiveTab('landing')}
          className="flex items-center space-x-3.5 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rr-pink via-rr-darkPink to-rr-blue flex items-center justify-center shadow-lg shadow-rr-pink/30 border border-white/20 group-hover:scale-105 transition-transform">
            <span className="font-display font-black text-xl text-white tracking-wider">RR</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-display font-bold text-lg text-white tracking-wide">
                SUPERR <span className="text-rr-pink">SELECTOR</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rr-pink/20 text-rr-pink border border-rr-pink/30">
                SEASON 2
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 tracking-tight">
              3D Pressure Performance Intelligence Platform
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center space-x-1 p-1 rounded-2xl bg-slate-900/60 border border-white/5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-rr-pink to-rr-darkPink text-white font-semibold shadow-md shadow-rr-pink/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
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
          <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-900/80 border border-white/10 text-[11px] font-mono">
            <span className={`w-2 h-2 rounded-full ${apiConnected ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
            <span className="text-slate-300">{apiConnected ? 'FastAPI 8000' : 'Local Pipeline'}</span>
          </div>

          <button
            onClick={() => setActiveTab('analyzer')}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rr-pink to-rr-darkPink hover:from-rr-pinkHover hover:to-rr-pink text-white text-xs font-semibold shadow-lg shadow-rr-pink/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
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
