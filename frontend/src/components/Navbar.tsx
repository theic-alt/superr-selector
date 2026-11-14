import React, { useState } from 'react';
import { 
  Sparkles, 
  Activity, 
  Users, 
  Search, 
  PlayCircle, 
  Sliders, 
  Menu, 
  X 
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  apiConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, apiConnected }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'landing', label: 'The Pressure Elite', icon: Sparkles },
    { id: 'command-centre', label: 'Command Centre', icon: Activity },
    { id: 'selected-arena', label: 'Selected Arena', icon: Users },
    { id: 'analyzer', label: 'PPI Analyzer', icon: Search },
    { id: 'pressure-explainer', label: 'Pressure Simulator', icon: PlayCircle },
    { id: 'model-explorer', label: 'Model Explorer', icon: Sliders },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#101629]/95 backdrop-blur-md border-b border-[#EA1A85]/20 select-none">
      <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-6 xl:px-8 h-18 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* ============================================================== */}
        {/* LEFT — BRANDING                                                */}
        {/* ============================================================== */}
        <div 
          onClick={() => handleTabClick('landing')}
          className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer group flex-shrink-0 min-w-0"
        >
          {/* Rajasthan Royals Official Logo */}
          <div className="py-0.5 flex items-center justify-center flex-shrink-0">
            <img 
              src="/rr-logo.png" 
              alt="Rajasthan Royals" 
              className="h-8 sm:h-9 xl:h-10 w-auto object-contain transition-opacity group-hover:opacity-90" 
            />
          </div>

          {/* Project Title & Subtitle */}
          <div className="flex flex-col justify-center min-w-0 border-l border-white/10 pl-2.5 sm:pl-3">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <span className="font-display font-black text-sm sm:text-base xl:text-lg tracking-wide text-white uppercase whitespace-nowrap leading-tight">
                SUPERR <span className="text-[#EA1A85]">SELECTOR</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider bg-[#254AA5]/30 text-white border border-[#254AA5]/60 uppercase whitespace-nowrap leading-none flex-shrink-0">
                S2
              </span>
            </div>
            {/* Subtitle hidden on small screens and compact laptops, visible on xl+ to prevent overflow */}
            <span className="hidden xl:block text-[9.5px] 2xl:text-[10px] font-mono tracking-widest text-[#C7CEDA] uppercase whitespace-nowrap mt-0.5">
              PRESSURE PERFORMANCE INTELLIGENCE
            </span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* CENTRE — NAVIGATION (DESKTOP)                                  */}
        {/* ============================================================== */}
        <nav className="hidden lg:flex items-center space-x-0.5 xl:space-x-1 h-full flex-shrink-0">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabClick(item.id)}
                className={`relative h-18 flex items-center space-x-1.5 px-2 xl:px-2.5 2xl:px-3 text-[11.5px] xl:text-xs 2xl:text-[13px] font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-[#C7CEDA] hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 xl:w-4 xl:h-4 flex-shrink-0 transition-colors ${
                  isActive ? 'text-[#EA1A85]' : 'text-[#C7CEDA]/70'
                }`} />
                <span className="whitespace-nowrap">{item.label}</span>
                
                {/* Refined subtle bottom indicator for active state */}
                {isActive && (
                  <span className="absolute bottom-0 left-1.5 right-1.5 h-[2.5px] bg-[#EA1A85] rounded-t-full shadow-[0_-1px_6px_rgba(234,26,133,0.5)]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* ============================================================== */}
        {/* RIGHT — STATUS AND SEARCH                                      */}
        {/* ============================================================== */}
        <div className="flex items-center space-x-2 sm:space-x-2.5 xl:space-x-3 flex-shrink-0">
          {/* FastAPI Engine Status Pill */}
          <div className="hidden md:flex items-center space-x-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-[#141b33] border border-white/10 text-[10px] sm:text-[11px] font-mono text-[#C7CEDA]">
            <span 
              className={`w-2 h-2 rounded-full ${
                apiConnected ? 'bg-emerald-400' : 'bg-[#EA1A85] animate-pulse'
              }`} 
            />
            <span className="whitespace-nowrap">
              {apiConnected ? 'FastAPI Online' : 'Local Pipeline'}
            </span>
          </div>

          {/* Search Player CTA Button */}
          <button
            type="button"
            onClick={() => handleTabClick('analyzer')}
            className="flex items-center space-x-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-[#EA1A85] hover:bg-[#d41575] text-white text-xs font-semibold tracking-wide shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">Search Player</span>
            <span className="sm:hidden whitespace-nowrap">Search</span>
          </button>

          {/* Mobile Menu Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="lg:hidden p-1.5 rounded-lg text-[#C7CEDA] hover:text-white hover:bg-white/5 transition-colors cursor-pointer focus:outline-none flex-shrink-0"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MOBILE DROPDOWN NAVIGATION                                     */}
      {/* ============================================================== */}
      {mobileMenuOpen && (
        <div className="lg:hidden w-full bg-[#101629] border-t border-b border-[#EA1A85]/20 px-4 py-3 space-y-1 shadow-2xl">
          <div className="pb-2 mb-2 border-b border-white/5 flex items-center justify-between text-[11px] font-mono text-[#C7CEDA]">
            <span>PLATFORM NAVIGATION</span>
            <div className="flex items-center space-x-1.5">
              <span className={`w-2 h-2 rounded-full ${apiConnected ? 'bg-emerald-400' : 'bg-[#EA1A85]'}`} />
              <span>{apiConnected ? 'FastAPI Connected' : 'Local Pipeline'}</span>
            </div>
          </div>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#EA1A85]/15 text-white font-semibold border-l-2 border-[#EA1A85]'
                    : 'text-[#C7CEDA] hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#EA1A85]' : 'text-[#C7CEDA]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
