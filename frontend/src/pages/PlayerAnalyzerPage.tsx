import React, { useState, useEffect } from 'react';
import { Search, Trophy, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, Zap, Activity, Info, BarChart3, Calendar } from 'lucide-react';
import { PlayerMeta, PlayerDetails } from '../types';
import { searchPlayers, fetchPlayerDetails } from '../api';

interface PlayerAnalyzerPageProps {
  onSelectPlayerModal: (playerId: number, role: string) => void;
}

export const PlayerAnalyzerPage: React.FC<PlayerAnalyzerPageProps> = ({ onSelectPlayerModal }) => {
  const [query, setQuery] = useState('');
  const [rolePref, setRolePref] = useState<'Batter' | 'Bowler'>('Batter');
  const [suggestions, setSuggestions] = useState<PlayerMeta[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerDetails | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Autocomplete debounce
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      setIsSearching(true);
      searchPlayers(query)
        .then(res => {
          setSuggestions(res);
          setIsSearching(false);
        })
        .catch(() => setIsSearching(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  // Load a player on selection
  const handleSelectPlayer = (playerId: number, role: string) => {
    setIsAnalyzing(true);
    setSuggestions([]);
    fetchPlayerDetails(playerId, role)
      .then(res => {
        setSelectedPlayer(res);
        setIsAnalyzing(false);
      })
      .catch(err => {
        console.error(err);
        setIsAnalyzing(false);
      });
  };

  // Pre-fill quick sample chips from real dataset
  const sampleSuggestions = [
    { id: 4260, name: 'Heinrich Klaasen', role: 'Batter' },
    { id: 6396, name: 'Tim David', role: 'Batter' },
    { id: 2933, name: 'Jasprit Bumrah', role: 'Bowler' },
    { id: 2636, name: 'Adam Zampa', role: 'Bowler' },
    { id: 813, name: 'Jos Buttler', role: 'Batter' },
    { id: 4816, name: 'Khaleel Ahmed', role: 'Bowler' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="border-b border-pitch-border pb-6">
        <div className="flex items-center space-x-2 text-xs font-mono text-rr-pink mb-1 font-bold">
          <Zap className="w-3.5 h-3.5" />
          <span>ON-DEMAND HISTORICAL INTELLIGENCE ENGINE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-wide uppercase">
          Player PPI Analyzer
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 font-mono mt-1">
          Search for any of the 891+ players in the supplied datasets to execute dynamic, verifiable Pressure Performance Index calculation.
        </p>
      </div>

      {/* Search Input & Quick Samples */}
      <div className="p-6 rounded-3xl glass-panel-elevated border border-rr-pink/30 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Autocomplete Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by player name (e.g. Klaasen, Bumrah, Buttler, Zampa)..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-950/90 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rr-pink font-sans shadow-inner"
            />
            {isSearching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-rr-pink border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Dropdown Suggestions */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 z-30 rounded-2xl bg-slate-900 border border-white/15 shadow-2xl overflow-hidden max-h-72 overflow-y-auto divide-y divide-white/5">
                {suggestions.map(s => (
                  <div
                    key={s.player_id}
                    onClick={() => {
                      setQuery(s.name);
                      handleSelectPlayer(s.player_id, rolePref);
                    }}
                    className="p-3.5 hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-white text-sm block">{s.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {s.role} • {s.teams.join(', ') || 'Independent'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {s.is_eligible ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Eligible
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
                          Raw Only
                        </span>
                      )}
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Role Preference Filter */}
          <div className="flex items-center space-x-1 p-1 rounded-2xl bg-slate-950/80 border border-white/10 font-mono text-xs w-full md:w-auto justify-center">
            <button
              onClick={() => {
                setRolePref('Batter');
                if (selectedPlayer) handleSelectPlayer(selectedPlayer.player_id, 'Batter');
              }}
              className={`px-4 py-2.5 rounded-xl font-bold transition-all ${
                rolePref === 'Batter' ? 'bg-rr-pink text-white shadow-md shadow-rr-pink/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Analyze as Batter
            </button>
            <button
              onClick={() => {
                setRolePref('Bowler');
                if (selectedPlayer) handleSelectPlayer(selectedPlayer.player_id, 'Bowler');
              }}
              className={`px-4 py-2.5 rounded-xl font-bold transition-all ${
                rolePref === 'Bowler' ? 'bg-rr-pink text-white shadow-md shadow-rr-pink/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Analyze as Bowler
            </button>
          </div>
        </div>

        {/* Quick Sample Selector Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-[11px] font-mono text-slate-400 mr-1">Quick Benchmarks:</span>
          {sampleSuggestions.map(s => (
            <button
              key={s.id}
              onClick={() => {
                setQuery(s.name);
                setRolePref(s.role as any);
                handleSelectPlayer(s.id, s.role);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900/60 hover:bg-rr-pink/20 hover:border-rr-pink/40 border border-white/5 text-xs font-mono text-slate-300 hover:text-white transition-all"
            >
              {s.name} ({s.role})
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Results Presentation */}
      {isAnalyzing ? (
        <div className="py-24 text-center space-y-4">
          <div className="w-12 h-12 border-4 border-rr-pink border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-mono text-slate-300">
            Querying ball-by-ball deliveries, applying pressure logic, standardizing against eligible pool...
          </p>
        </div>
      ) : selectedPlayer ? (
        <div className="space-y-6">
          {/* Main Card */}
          <div className="p-8 rounded-3xl glass-panel border border-white/10 space-y-6">
            {/* Header Telemetry */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase ${
                    selectedPlayer.role === 'Batter' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  }`}>
                    {selectedPlayer.role}
                  </span>
                  {selectedPlayer.is_eligible && selectedPlayer.rank ? (
                    <span className="px-3 py-0.5 rounded-md text-xs font-mono font-bold bg-rr-pink/20 text-rr-pink border border-rr-pink/30 flex items-center space-x-1">
                      <Trophy className="w-3.5 h-3.5 inline mr-1" />
                      <span>OFFICIAL RANK #{selectedPlayer.rank} IN {selectedPlayer.role.toUpperCase()} POOL</span>
                    </span>
                  ) : (
                    <span className="px-3 py-0.5 rounded-md text-xs font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      OFFICIAL RANK EXCLUDED (INELIGIBLE)
                    </span>
                  )}
                </div>
                <h2 className="text-4xl font-display font-black text-white tracking-wide">
                  {selectedPlayer.name}
                </h2>
                <p className="text-xs font-mono text-slate-400 mt-1">
                  Teams: {selectedPlayer.teams.join(', ') || 'Independent'} • ID: {selectedPlayer.player_id}
                </p>
              </div>

              {/* Dynamic PPI Meter */}
              <div className="flex items-center space-x-4">
                <div className="px-6 py-4 rounded-3xl bg-slate-950/90 border border-rr-pink/50 text-center shadow-xl shadow-rr-pink/15">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-widest">CALCULATED PPI</span>
                  <span className="text-4xl font-display font-black text-rr-pink">
                    {selectedPlayer.ppi_score.toFixed(2)}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 block">/ 100</span>
                </div>
              </div>
            </div>

            {/* Eligibility Diagnostic Grid */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/5 space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                Eligibility Audit Checklist (Official Model Rules)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  selectedPlayer.eligibility_reasons.eligible_recent
                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                }`}>
                  <span>Recent Matches (&gt;= 3):</span>
                  <span className="font-bold">{selectedPlayer.eligibility_reasons.recent_appearances}</span>
                </div>

                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  selectedPlayer.eligibility_reasons.eligible_sample
                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                }`}>
                  <span>Pressure Balls (&gt;= 90):</span>
                  <span className="font-bold">{selectedPlayer.eligibility_reasons.pressure_balls}</span>
                </div>

                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  selectedPlayer.eligibility_reasons.eligible_sample
                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                }`}>
                  <span>Pressure Matches (&gt;= 8):</span>
                  <span className="font-bold">{selectedPlayer.eligibility_reasons.pressure_matches}</span>
                </div>
              </div>
            </div>

            {/* Analytical Summary */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border-l-4 border-rr-pink border-t border-r border-b border-white/5">
              <span className="text-[10px] font-mono uppercase text-rr-pink font-bold tracking-wider block mb-1">
                DYNAMIC ANALYTICAL REPORT
              </span>
              <p className="text-sm text-slate-200 leading-relaxed font-sans">
                "{selectedPlayer.narrative}"
              </p>
            </div>

            {/* Detailed Visual Telemetry Grid */}
            <div>
              <h3 className="text-xs font-mono uppercase font-bold text-slate-300 tracking-wider mb-3 flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-rr-pink" />
                <span>Pressure vs Baseline Granular Metrics</span>
              </h3>

              {selectedPlayer.role === 'Batter' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5">
                    <span className="text-slate-400 block text-[10px] uppercase">Pressure Strike Rate</span>
                    <span className="text-2xl font-display font-bold text-white">{selectedPlayer.stats.pressure_sr}</span>
                    <span className="text-[11px] text-emerald-400 block mt-1">+{selectedPlayer.stats.sr_uplift} Uplift</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5">
                    <span className="text-slate-400 block text-[10px] uppercase">Pressure Boundary %</span>
                    <span className="text-2xl font-display font-bold text-amber-400">{selectedPlayer.stats.pressure_boundary_rate}%</span>
                    <span className="text-[11px] text-slate-400 block mt-1">+{selectedPlayer.stats.boundary_uplift}% Uplift</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5">
                    <span className="text-slate-400 block text-[10px] uppercase">Dismissal Rate</span>
                    <span className="text-2xl font-display font-bold text-rose-400">{selectedPlayer.stats.pressure_dismissal_rate}%</span>
                    <span className="text-[11px] text-slate-400 block mt-1">Per Pressure Ball</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5">
                    <span className="text-slate-400 block text-[10px] uppercase">Sample Reliability</span>
                    <span className="text-2xl font-display font-bold text-emerald-400">{selectedPlayer.reliability_pct}%</span>
                    <span className="text-[11px] text-slate-400 block mt-1">{selectedPlayer.pressure_balls} Legal Balls</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5">
                    <span className="text-slate-400 block text-[10px] uppercase">Pressure Economy</span>
                    <span className="text-2xl font-display font-bold text-white">{selectedPlayer.stats.pressure_economy} RPO</span>
                    <span className="text-[11px] text-emerald-400 block mt-1">+{selectedPlayer.stats.economy_improvement} Imp</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5">
                    <span className="text-slate-400 block text-[10px] uppercase">Wkts / 100 Balls</span>
                    <span className="text-2xl font-display font-bold text-cyan-400">{selectedPlayer.stats.pressure_wkt_per_100}</span>
                    <span className="text-[11px] text-slate-400 block mt-1">+{selectedPlayer.stats.wicket_improvement} Imp</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5">
                    <span className="text-slate-400 block text-[10px] uppercase">Dot Ball Rate</span>
                    <span className="text-2xl font-display font-bold text-amber-400">{selectedPlayer.stats.dot_ball_rate}%</span>
                    <span className="text-[11px] text-slate-400 block mt-1">Compression %</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5">
                    <span className="text-slate-400 block text-[10px] uppercase">Sample Reliability</span>
                    <span className="text-2xl font-display font-bold text-emerald-400">{selectedPlayer.reliability_pct}%</span>
                    <span className="text-[11px] text-slate-400 block mt-1">{selectedPlayer.pressure_balls} Legal Balls</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => onSelectPlayerModal(selectedPlayer.player_id, selectedPlayer.role)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rr-pink to-rr-darkPink hover:from-rr-pinkHover hover:to-rr-pink text-white text-xs font-bold font-mono shadow-lg shadow-rr-pink/20 transition-all flex items-center space-x-2"
              >
                <span>OPEN COMPLETE MATCH RECORD AUDIT</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center glass-panel rounded-3xl p-8 border border-white/5 space-y-3">
          <Search className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-lg font-display font-bold text-slate-200">Ready to Analyze</h3>
          <p className="text-xs font-mono text-slate-400 max-w-md mx-auto">
            Type any player's name above or click one of the quick benchmark buttons to retrieve real match deliveries and compute their exact historical PPI score.
          </p>
        </div>
      )}
    </div>
  );
};
