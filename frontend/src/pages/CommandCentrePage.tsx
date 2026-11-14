import React, { useState, useEffect } from 'react';
import { Activity, Filter, Search, Trophy, TrendingUp, BarChart2, CheckCircle2, Shield, Eye } from 'lucide-react';
import { OverviewStats } from '../types';
import { fetchPlayersList } from '../api';

interface CommandCentrePageProps {
  overview: OverviewStats | null;
  onSelectPlayer: (playerId: number, role: string) => void;
}

export const CommandCentrePage: React.FC<CommandCentrePageProps> = ({ overview, onSelectPlayer }) => {
  const [role, setRole] = useState<'batter' | 'bowler'>('batter');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rank');
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchPlayersList(role, sortBy, 50)
      .then(res => {
        setPlayers(res.players || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [role, sortBy]);

  const filteredPlayers = players.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Mission Telemetry */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-pitch-border pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-rr-pink mb-1 font-bold">
            <Activity className="w-3.5 h-3.5" />
            <span>OPERATIONAL ANALYTICS HUB</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-wide uppercase">
            Analytics Command Centre
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-mono mt-1">
            Real-time telemetry, eligible pool rankings, and pressure-performance distributions.
          </p>
        </div>

        {/* Global Dataset Snapshot Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-right">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Eligible Pool</span>
            <span className="text-lg font-display font-bold text-white">
              {overview ? `${overview.eligible_batters_count} Batters / ${overview.eligible_bowlers_count} Bowlers` : '79 / 73'}
            </span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-right">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Matches Analysed</span>
            <span className="text-lg font-display font-bold text-rr-pink">
              {overview ? overview.total_matches_analysed : '853'}
            </span>
          </div>
        </div>
      </div>

      {/* 5 Macro Metrics Cards - Mobile Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl glass-panel border border-white/10">
          <span className="text-[9.5px] sm:text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-0.5 sm:mb-1 truncate">Total Deliveries</span>
          <span className="text-xl sm:text-2xl font-display font-black text-white">
            {overview ? overview.total_deliveries.toLocaleString() : '194,014'}
          </span>
          <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 block mt-0.5 sm:mt-1 truncate">Scoped IPL & T20I</span>
        </div>

        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl glass-panel border border-rr-pink/30 shadow-lg shadow-rr-pink/5">
          <span className="text-[9.5px] sm:text-[10px] font-mono text-rr-pink uppercase tracking-wider block mb-0.5 sm:mb-1 font-bold truncate">Pressure Deliveries</span>
          <span className="text-xl sm:text-2xl font-display font-black text-rr-pink">
            {overview ? `${(overview.pressure_deliveries_batter).toLocaleString()} balls` : '42,369 balls'}
          </span>
          <span className="text-[10px] sm:text-[11px] font-mono text-emerald-400 block mt-0.5 sm:mt-1 truncate">21.8% Pressure</span>
        </div>

        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl glass-panel border border-white/10">
          <span className="text-[9.5px] sm:text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-0.5 sm:mb-1 truncate">Avg Batter PPI</span>
          <span className="text-xl sm:text-2xl font-display font-black text-white">
            {overview ? overview.avg_batter_ppi : '60.25'}
          </span>
          <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 block mt-0.5 sm:mt-1 truncate">Top: 100.00</span>
        </div>

        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl glass-panel border border-white/10">
          <span className="text-[9.5px] sm:text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-0.5 sm:mb-1 truncate">Avg Bowler PPI</span>
          <span className="text-xl sm:text-2xl font-display font-black text-white">
            {overview ? overview.avg_bowler_ppi : '54.85'}
          </span>
          <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 block mt-0.5 sm:mt-1 truncate">Top: 100.00</span>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3 sm:p-4 rounded-xl sm:rounded-2xl glass-panel border border-white/10">
          <span className="text-[9.5px] sm:text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-0.5 sm:mb-1 truncate">Eligibility Filter</span>
          <span className="text-xl sm:text-2xl font-display font-black text-amber-400">3 / 90 / 8</span>
          <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 block mt-0.5 sm:mt-1 truncate">Matches / Balls / P-Matches</span>
        </div>
      </div>

      {/* Role Filters & Search Controls - Mobile Responsive */}
      <div className="p-3.5 sm:p-4 rounded-2xl glass-panel border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        {/* Role Toggle */}
        <div className="w-full sm:w-auto flex items-center justify-between p-1 rounded-xl bg-slate-900/80 border border-white/10">
          <button
            onClick={() => setRole('batter')}
            className={`flex-1 sm:flex-initial text-center px-3 sm:px-5 py-2 rounded-lg text-[11px] sm:text-xs font-bold font-mono transition-all whitespace-nowrap ${
              role === 'batter'
                ? 'bg-gradient-to-r from-rr-pink to-rr-darkPink text-white shadow-md shadow-rr-pink/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            BATTERS ({overview ? overview.eligible_batters_count : 79})
          </button>
          <button
            onClick={() => setRole('bowler')}
            className={`flex-1 sm:flex-initial text-center px-3 sm:px-5 py-2 rounded-lg text-[11px] sm:text-xs font-bold font-mono transition-all whitespace-nowrap ${
              role === 'bowler'
                ? 'bg-gradient-to-r from-rr-pink to-rr-darkPink text-white shadow-md shadow-rr-pink/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            BOWLERS ({overview ? overview.eligible_bowlers_count : 73})
          </button>
        </div>

        {/* Search Bar & Sorter */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by player name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rr-pink w-60"
            />
          </div>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-rr-pink font-mono"
          >
            <option value="rank">Sort: Rank (High to Low)</option>
            <option value="ppi_score">Sort: PPI Score</option>
            <option value="p_balls_raw">Sort: Pressure Balls</option>
          </select>
        </div>
      </div>

      {/* Main Leaderboard Table */}
      <div className="rounded-2xl glass-panel border border-white/10 overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-white/10 bg-slate-900/70 flex justify-between items-center">
          <span className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider">
            Eligible {role === 'batter' ? 'Batters' : 'Bowlers'} (Official Verified Model Calculations)
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Showing {filteredPlayers.length} verified records
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-rr-pink border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono text-slate-400">Loading rankings from backend analytics engine...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/5">
                <tr>
                  <th className="px-6 py-3 text-center">Rank</th>
                  <th className="px-6 py-3">Player</th>
                  <th className="px-4 py-3 text-right">PPI Score</th>
                  <th className="px-4 py-3 text-right">P-Balls</th>
                  <th className="px-4 py-3 text-right">P-Matches</th>
                  <th className="px-4 py-3 text-right">Reliability</th>
                  {role === 'batter' ? (
                    <>
                      <th className="px-4 py-3 text-right">Pressure SR</th>
                      <th className="px-4 py-3 text-right">Baseline SR</th>
                      <th className="px-4 py-3 text-right">SR Uplift</th>
                      <th className="px-4 py-3 text-right">Boundary %</th>
                    </>
                  ) : (
                    <>
                      <th className="px-4 py-3 text-right">Pressure Econ</th>
                      <th className="px-4 py-3 text-right">Baseline Econ</th>
                      <th className="px-4 py-3 text-right">Econ Imp</th>
                      <th className="px-4 py-3 text-right">Wkts/100</th>
                      <th className="px-4 py-3 text-right">Dot Ball %</th>
                    </>
                  )}
                  <th className="px-6 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPlayers.map(p => (
                  <tr
                    key={p.player_id}
                    onClick={() => onSelectPlayer(p.player_id, p.role)}
                    className="hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-3.5 text-center">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-bold text-xs ${
                        p.rank === 1
                          ? 'bg-rr-gold text-black shadow-lg shadow-rr-gold/20'
                          : p.rank <= 3
                          ? 'bg-rr-pink/20 text-rr-pink border border-rr-pink/30'
                          : p.rank <= 10
                          ? 'bg-white/10 text-white font-semibold'
                          : 'text-slate-400'
                      }`}>
                        #{p.rank}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="font-sans font-bold text-white group-hover:text-rr-pink transition-colors">
                        {p.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {p.teams.slice(0, 2).join(', ') || 'Independent'}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-black text-base text-rr-pink">
                      {p.ppi_score.toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 text-right text-slate-200 font-bold">{p.pressure_balls}</td>
                    <td className="px-4 py-3.5 text-right text-slate-300">{p.pressure_matches}</td>
                    <td className="px-4 py-3.5 text-right text-slate-300">{p.reliability_pct}%</td>
                    {role === 'batter' ? (
                      <>
                        <td className="px-4 py-3.5 text-right font-bold text-white">{p.pressure_sr}</td>
                        <td className="px-4 py-3.5 text-right text-slate-400">{p.baseline_sr}</td>
                        <td className="px-4 py-3.5 text-right font-bold text-emerald-400">
                          {p.sr_uplift >= 0 ? `+${p.sr_uplift}` : p.sr_uplift}
                        </td>
                        <td className="px-4 py-3.5 text-right text-amber-400 font-bold">{p.pressure_boundary_rate}%</td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3.5 text-right font-bold text-white">{p.pressure_economy}</td>
                        <td className="px-4 py-3.5 text-right text-slate-400">{p.baseline_economy}</td>
                        <td className="px-4 py-3.5 text-right font-bold text-emerald-400">
                          {p.economy_improvement >= 0 ? `+${p.economy_improvement}` : p.economy_improvement}
                        </td>
                        <td className="px-4 py-3.5 text-right text-cyan-400 font-bold">{p.pressure_wickets_per_100}</td>
                        <td className="px-4 py-3.5 text-right text-amber-400">{p.dot_ball_rate}%</td>
                      </>
                    )}
                    <td className="px-6 py-3.5 text-center">
                      <button className="px-3 py-1 rounded-lg bg-white/5 hover:bg-rr-pink hover:text-white text-slate-300 text-xs transition-colors flex items-center space-x-1 mx-auto">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
