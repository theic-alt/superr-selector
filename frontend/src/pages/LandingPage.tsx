import React from 'react';
import { ArrowRight, Trophy, Sparkles, Activity, ShieldCheck, Zap, Globe, Cpu } from 'lucide-react';
import { Stadium3D } from '../components/Stadium3D';
import { OverviewStats } from '../types';

interface LandingPageProps {
  overview: OverviewStats | null;
  onExploreSelected: () => void;
  onAnalyzeAny: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  overview,
  onExploreSelected,
  onAnalyzeAny
}) => {
  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex flex-col justify-between overflow-hidden">
      {/* Background Ambience & Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(234,26,136,0.15),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Hero Header Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6 w-full text-center z-10">
        {/* Rajasthan Royals Top Pill */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-rr-pink/40 backdrop-blur-md mb-6 shadow-lg shadow-rr-pink/10 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-rr-pink animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-widest text-slate-200">
            RAJASTHAN ROYALS HACKATHON // SEASON 2
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-xs font-mono text-rr-pink font-semibold">PRODUCTION ENGINE</span>
        </div>

        {/* Cinematic Main Title */}
        <h1 className="text-5xl sm:text-7xl font-display font-black tracking-tight text-white mb-4 uppercase leading-none">
          SUPERR <span className="bg-gradient-to-r from-rr-pink via-rose-400 to-rr-gold bg-clip-text text-transparent">SELECTOR</span>
        </h1>
        <div className="text-xl sm:text-2xl font-display font-semibold tracking-wide text-slate-300 uppercase mb-4">
          PRESSURE PERFORMANCE INTELLIGENCE
        </div>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-400 font-sans leading-relaxed mb-8">
          "Identifying the players who deliver when the game is on the line."
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
          <button
            onClick={onExploreSelected}
            className="group flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rr-pink via-rr-pinkHover to-rr-darkPink hover:brightness-110 text-white font-semibold text-sm shadow-xl shadow-rr-pink/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Trophy className="w-4 h-4 text-white" />
            <span>EXPLORE SELECTED PLAYERS</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onAnalyzeAny}
            className="flex items-center space-x-2 px-6 py-3.5 rounded-2xl glass-panel hover:bg-white/10 text-slate-200 hover:text-white font-semibold text-sm border border-white/10 hover:border-rr-pink/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Cpu className="w-4 h-4 text-rr-pink" />
            <span>ANALYSE ANY PLAYER</span>
          </button>
        </div>
      </div>

      {/* 3D Stadium Interactive Showcase */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 mb-8">
        <Stadium3D height="480px" activeScenario="all" />
      </div>

      {/* Telemetry Counter Strip (Animated Stats) */}
      <div className="relative border-t border-pitch-border bg-slate-950/80 backdrop-blur-xl py-6 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-center">
          <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">SHORTLISTED</span>
            <span className="text-3xl font-display font-black text-white">20</span>
            <span className="text-[11px] font-mono text-rr-pink block font-bold">10 Batters + 10 Bowlers</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">PPI SCORING</span>
            <span className="text-3xl font-display font-black text-rr-pink">0 – 100</span>
            <span className="text-[11px] font-mono text-slate-400 block">Relative Composite Index</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">PRESSURE DELIVERIES</span>
            <span className="text-3xl font-display font-black text-white">
              {overview ? `${(overview.pressure_deliveries_batter / 1000).toFixed(1)}k` : '42.4k'}
            </span>
            <span className="text-[11px] font-mono text-emerald-400 block font-bold">21.8% of Total Balls</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">DATASET SCOPE</span>
            <span className="text-3xl font-display font-black text-white">
              {overview ? overview.total_matches_analysed : '853'}
            </span>
            <span className="text-[11px] font-mono text-slate-400 block">IPL & T20I Matches</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">ELIGIBLE POOL</span>
            <span className="text-3xl font-display font-black text-white">
              {overview ? overview.eligible_batters_count + overview.eligible_bowlers_count : '152'}
            </span>
            <span className="text-[11px] font-mono text-amber-400 block font-bold">Filtered on 3 App + 90 Balls</span>
          </div>
        </div>
      </div>
    </div>
  );
};
