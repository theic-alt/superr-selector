import React, { useState } from 'react';
import { Trophy, Shield, Zap, Sparkles, Activity, ArrowUpRight, Flame, Target } from 'lucide-react';
import { SelectedTop20, PlayerOverview } from '../types';

interface SelectedArenaPageProps {
  selectedTop20: SelectedTop20 | null;
  onSelectPlayer: (playerId: number, role: string) => void;
}

export const SelectedArenaPage: React.FC<SelectedArenaPageProps> = ({
  selectedTop20,
  onSelectPlayer
}) => {
  const [activeCategory, setActiveCategory] = useState<'both' | 'batters' | 'bowlers'>('both');

  const renderPlayerCard = (p: PlayerOverview, isBatter: boolean) => {
    return (
      <div
        key={p.player_id}
        onClick={() => onSelectPlayer(p.player_id, p.role)}
        className="group relative rounded-3xl p-6 glass-panel border border-white/10 hover:border-rr-pink/70 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-rr-pink/25 cursor-pointer overflow-hidden flex flex-col justify-between"
      >
        {/* Subtle Ambient Radial Glow on Hover */}
        <div className="absolute -top-20 -right-20 w-44 h-44 rounded-full bg-gradient-to-br from-rr-pink/20 to-transparent blur-2xl group-hover:bg-rr-pink/35 transition-all duration-500 pointer-events-none" />

        {/* Card Header (Rank Badge & Silhouette Avatar) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className={`w-8 h-8 rounded-xl font-display font-black text-sm flex items-center justify-center shadow-lg ${
                p.official_rank === 1
                  ? 'bg-gradient-to-br from-amber-300 to-amber-600 text-slate-950 font-black shadow-amber-500/30'
                  : p.official_rank <= 3
                  ? 'bg-gradient-to-br from-rr-pink to-rr-darkPink text-white shadow-rr-pink/30'
                  : 'bg-slate-800 text-slate-200 border border-white/10'
              }`}>
                #{p.official_rank}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                isBatter ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              }`}>
                {p.role}
              </span>
            </div>

            {/* Verification Tag */}
            <span className="text-[10px] font-mono text-slate-400 bg-black/40 px-2 py-0.5 rounded border border-white/5">
              Verified RR Shortlist
            </span>
          </div>

          {/* Abstract 3D Player Shield / Initials */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 flex items-center justify-center group-hover:border-rr-pink/60 transition-colors shadow-inner">
              <span className="text-xl font-display font-black text-white tracking-wider group-hover:scale-110 transition-transform">
                {p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-display font-black text-white truncate group-hover:text-rr-pink transition-colors">
                {p.name}
              </h3>
              <p className="text-xs text-slate-400 font-mono truncate">
                {p.teams.slice(0, 2).join(' / ') || 'Independent'}
              </p>
            </div>
          </div>

          {/* PPI Highlight Meter */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/5 mb-4 group-hover:border-rr-pink/30 transition-colors">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">PPI Rating</span>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-display font-black text-rr-pink">
                  {p.ppi_score.toFixed(2)}
                </span>
                <span className="text-[10px] font-mono text-slate-500">/ 100</span>
              </div>
            </div>
            {/* Mini Progress Track */}
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rr-pink to-rose-400 rounded-full group-hover:brightness-125 transition-all"
                style={{ width: `${Math.max(15, p.ppi_score)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card Footer (Key Performance Previews) */}
        <div className="pt-3 border-t border-white/5 space-y-2 text-xs font-mono">
          <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
            <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
              <span className="text-[9px] text-slate-500 block">P-BALLS</span>
              <span className="font-bold text-white">{p.pressure_legal_balls}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
              <span className="text-[9px] text-slate-500 block">P-MATCHES</span>
              <span className="font-bold text-white">{p.pressure_matches}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
              <span className="text-[9px] text-slate-500 block">RELIABILITY</span>
              <span className="font-bold text-emerald-400">{p.reliability_pct}%</span>
            </div>
          </div>

          {/* Key Metric Preview */}
          <div className="p-2.5 rounded-xl bg-slate-900/40 border border-white/5 flex items-center justify-between text-[11px]">
            {isBatter ? (
              <>
                <span className="text-slate-400">Pressure SR: <b className="text-white">{p.pressure_sr}</b></span>
                <span className="text-emerald-400 font-bold">+{p.sr_uplift} Uplift</span>
              </>
            ) : (
              <>
                <span className="text-slate-400">Pressure Econ: <b className="text-white">{p.pressure_economy}</b></span>
                <span className="text-emerald-400 font-bold">+{p.economy_improvement} Imp</span>
              </>
            )}
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-rr-pink group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>
        </div>
      </div>
    );
  };

  const batters = selectedTop20?.batters || [];
  const bowlers = selectedTop20?.bowlers || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-pitch-border pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-rr-pink mb-1 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>3D SELECTION PAVILION</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-wide uppercase">
            3D Selected Player Arena
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-mono mt-1">
            Explore the official shortlisted 10 Batters and 10 Bowlers identified by the Pressure Performance Index.
          </p>
        </div>

        {/* Category Toggles */}
        <div className="flex items-center space-x-2 p-1 rounded-xl bg-slate-900/80 border border-white/10 font-mono text-xs">
          <button
            onClick={() => setActiveCategory('both')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeCategory === 'both' ? 'bg-rr-pink text-white shadow-md shadow-rr-pink/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            ALL 20 PLAYERS
          </button>
          <button
            onClick={() => setActiveCategory('batters')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeCategory === 'batters' ? 'bg-rr-pink text-white shadow-md shadow-rr-pink/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            TOP 10 BATTERS
          </button>
          <button
            onClick={() => setActiveCategory('bowlers')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeCategory === 'bowlers' ? 'bg-rr-pink text-white shadow-md shadow-rr-pink/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            TOP 10 BOWLERS
          </button>
        </div>
      </div>

      {/* SECTION 1: BATTERS — TOP 10 */}
      {(activeCategory === 'both' || activeCategory === 'batters') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="w-3 h-3 rounded-full bg-amber-400 shadow-md shadow-amber-400/50" />
              <h2 className="text-2xl font-display font-black text-white uppercase tracking-wider">
                Batters — Top 10 Shortlist
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Evaluated on Pressure SR (35%), Boundary % (20%), Safety (15%), Uplifts (30%)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {batters.map(p => renderPlayerCard(p, true))}
          </div>
        </section>
      )}

      {/* SECTION 2: BOWLERS — TOP 10 */}
      {(activeCategory === 'both' || activeCategory === 'bowlers') && (
        <section className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-md shadow-cyan-400/50" />
              <h2 className="text-2xl font-display font-black text-white uppercase tracking-wider">
                Bowlers — Top 10 Shortlist
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Evaluated on Pressure Economy (30%), Wkts/100 (25%), Dot % (15%), Improvements (30%)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {bowlers.map(p => renderPlayerCard(p, false))}
          </div>
        </section>
      )}
    </div>
  );
};
