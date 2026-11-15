import React, { useEffect, useState } from 'react';
import { X, Trophy, Activity, Zap, Shield, BarChart3, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { PlayerDetails } from '../types';
import { fetchPlayerDetails } from '../api';
import { getPlayerImage } from '../utils/playerImages';

interface PlayerModalProps {
  playerId: number | null;
  rolePreference?: string;
  onClose: () => void;
}

export const PlayerModal: React.FC<PlayerModalProps> = ({ playerId, rolePreference, onClose }) => {
  const [player, setPlayer] = useState<PlayerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!playerId) return;
    setLoading(true);
    setError(null);
    fetchPlayerDetails(playerId, rolePreference)
      .then(data => {
        setPlayer(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load player details');
        setLoading(false);
      });
  }, [playerId, rolePreference]);

  if (!playerId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-5xl rounded-3xl glass-panel-elevated bg-pitch-dark/95 border border-rr-pink/30 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/60">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rr-pink animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Verified Player Telemetry Profile
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 border-4 border-rr-pink border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-mono text-slate-400">Loading verified ball-by-ball performance records...</p>
            </div>
          ) : error || !player ? (
            <div className="py-16 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
              <p className="text-sm font-mono text-slate-300">{error || 'Player record unavailable'}</p>
              <button onClick={onClose} className="px-4 py-1.5 rounded-xl bg-white/10 text-xs font-medium">Close</button>
            </div>
          ) : (
            <>
              {/* 1. PLAYER HEADER (Immediately visible metrics) */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-pitch-panel to-slate-900 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center space-x-5">
                  {getPlayerImage(player.name) ? (
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-950 border-2 border-rr-pink/50 shadow-xl shadow-rr-pink/20 flex-shrink-0">
                      <img
                        src={getPlayerImage(player.name)!}
                        alt={player.name}
                        className="w-full h-full object-cover object-top filter brightness-105"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-[#1c0f2f] to-[#0c1228] border-2 border-rr-pink/40 flex items-center justify-center flex-shrink-0 shadow-lg shadow-rr-pink/10">
                      <span className="text-2xl font-display font-black text-rr-pink tracking-wider">
                        {player.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${
                        player.role === 'Batter' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}>
                        {player.role}
                      </span>
                      {player.is_eligible && player.rank ? (
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-rr-pink/20 text-rr-pink border border-rr-pink/30 flex items-center space-x-1">
                          <Trophy className="w-3 h-3 inline mr-1" />
                          <span>ROLE RANK #{player.rank}</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          OFFICIAL RANK UNAVAILABLE (INELIGIBLE)
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono text-slate-400 bg-black/40">
                        ID: {player.player_id}
                      </span>
                    </div>
                    <h2 className="text-3xl font-display font-black text-white tracking-wide">
                      {player.name}
                    </h2>
                    <p className="text-xs font-mono text-slate-400 mt-1">
                      Franchise / International Teams: <span className="text-slate-200">{player.teams.join(', ') || 'Independent'}</span>
                    </p>
                  </div>
                </div>

                {/* Main Score Badges */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="px-5 py-3 rounded-2xl bg-slate-950/80 border border-rr-pink/40 text-center shadow-lg shadow-rr-pink/10">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">PPI SCORE</span>
                    <span className="text-3xl font-display font-black text-rr-pink">
                      {player.ppi_score.toFixed(2)}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 block">/ 100</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
                      <span className="text-[10px] text-slate-400 block font-mono">RELIABILITY</span>
                      <span className="font-bold text-white text-sm font-mono">{player.reliability_pct}%</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
                      <span className="text-[10px] text-slate-400 block font-mono">PRESSURE BALLS</span>
                      <span className="font-bold text-white text-sm font-mono">{player.pressure_balls}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
                      <span className="text-[10px] text-slate-400 block font-mono">P-MATCHES</span>
                      <span className="font-bold text-white text-sm font-mono">{player.pressure_matches}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ineligibility Reason Callout (if applicable) */}
              {!player.is_eligible && (
                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-start space-x-3 text-xs">
                  <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-rose-200 block mb-1">Official Ranking Excluded — Failed Eligibility Criteria</span>
                    <p className="text-slate-300">
                      Recent activity ({player.eligibility_reasons.recent_appearances}), Pressure sample ({player.eligibility_reasons.pressure_balls}), Matches ({player.eligibility_reasons.pressure_matches}). Historical raw statistics are provided below for analytical evaluation.
                    </p>
                  </div>
                </div>
              )}

              {/* 2. AUTOMATIC ANALYTICAL SUMMARY */}
              <div className="p-4 rounded-xl bg-slate-900/60 border-l-4 border-rr-pink border-t border-r border-b border-white/5">
                <span className="text-[10px] font-mono uppercase text-rr-pink font-bold tracking-wider block mb-1">
                  CALCULATED ANALYTICAL NARRATIVE
                </span>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                  "{player.narrative}"
                </p>
              </div>

              {/* 3. VISUAL ANALYTICS (Pressure vs Baseline Graphs) */}
              <div>
                <h3 className="text-sm font-mono uppercase font-bold text-slate-300 tracking-wider mb-3 flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-rr-pink" />
                  <span>Pressure Performance Telemetry vs Baseline</span>
                </h3>

                {player.role === 'Batter' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Metric 1: Strike Rate */}
                    <div className="p-4 rounded-xl bg-slate-900/70 border border-white/10 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-mono text-slate-400">STRIKE RATE</span>
                        <span className="font-mono font-bold text-emerald-400">{player.stats.sr_uplift >= 0 ? `+${player.stats.sr_uplift}` : player.stats.sr_uplift} UPLIFT</span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400 font-mono">Pressure SR</span>
                            <span className="font-bold text-rr-pink font-mono">{player.stats.pressure_sr}</span>
                          </div>
                          <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-rr-pink to-rose-400 rounded-full" style={{ width: `${Math.min(100, (player.stats.pressure_sr / 250) * 100)}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400 font-mono">Baseline SR</span>
                            <span className="font-medium text-slate-300 font-mono">{player.stats.baseline_sr}</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div className="h-full bg-slate-500 rounded-full" style={{ width: `${Math.min(100, (player.stats.baseline_sr / 250) * 100)}%` }} />
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">Runs scored per 100 legal balls faced.</p>
                    </div>

                    {/* Metric 2: Boundary Rate */}
                    <div className="p-4 rounded-xl bg-slate-900/70 border border-white/10 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-mono text-slate-400">BOUNDARY STRIKE %</span>
                        <span className="font-mono font-bold text-amber-400">{player.stats.boundary_uplift >= 0 ? `+${player.stats.boundary_uplift}%` : `${player.stats.boundary_uplift}%`} UPLIFT</span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400 font-mono">Pressure Boundary %</span>
                            <span className="font-bold text-amber-400 font-mono">{player.stats.pressure_boundary_rate}%</span>
                          </div>
                          <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, player.stats.pressure_boundary_rate * 2.5)}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400 font-mono">Baseline Boundary %</span>
                            <span className="font-medium text-slate-300 font-mono">{player.stats.baseline_boundary_rate}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div className="h-full bg-slate-500 rounded-full" style={{ width: `${Math.min(100, player.stats.baseline_boundary_rate * 2.5)}%` }} />
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">(4s + 6s) percentage of pressure balls.</p>
                    </div>

                    {/* Metric 3: Dismissal Rate */}
                    <div className="p-4 rounded-xl bg-slate-900/70 border border-white/10 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-mono text-slate-400">DISMISSAL RESILIENCE</span>
                        <span className="font-mono text-slate-400 font-bold">{player.stats.pressure_dismissal_rate}% OUT RATE</span>
                      </div>
                      <div className="pt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400 font-mono">Inverse Wicket Safety</span>
                          <span className="font-bold text-cyan-400 font-mono">{(100 - player.stats.pressure_dismissal_rate).toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${Math.max(10, 100 - player.stats.pressure_dismissal_rate * 3)}%` }} />
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">Lower dismissal rate awards higher score in weighted PPI.</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Bowler Metric 1: Economy */}
                    <div className="p-4 rounded-xl bg-slate-900/70 border border-white/10 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-mono text-slate-400">PRESSURE ECONOMY</span>
                        <span className="font-mono font-bold text-emerald-400">{player.stats.economy_improvement >= 0 ? `+${player.stats.economy_improvement} RPO` : `${player.stats.economy_improvement} RPO`} IMP</span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400 font-mono">Pressure Economy</span>
                            <span className="font-bold text-rr-pink font-mono">{player.stats.pressure_economy} RPO</span>
                          </div>
                          <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-emerald-400 to-rr-pink rounded-full" style={{ width: `${Math.max(10, 100 - player.stats.pressure_economy * 7)}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400 font-mono">Baseline Economy</span>
                            <span className="font-medium text-slate-300 font-mono">{player.stats.baseline_economy} RPO</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div className="h-full bg-slate-500 rounded-full" style={{ width: `${Math.max(10, 100 - player.stats.baseline_economy * 7)}%` }} />
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">Runs conceded per 6 legal pressure balls.</p>
                    </div>

                    {/* Bowler Metric 2: Wickets per 100 */}
                    <div className="p-4 rounded-xl bg-slate-900/70 border border-white/10 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-mono text-slate-400">WICKET STRIKE FREQUENCY</span>
                        <span className="font-mono font-bold text-cyan-400">{player.stats.wicket_improvement >= 0 ? `+${player.stats.wicket_improvement}` : player.stats.wicket_improvement} UPLIFT</span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400 font-mono">Pressure Wkts/100</span>
                            <span className="font-bold text-cyan-400 font-mono">{player.stats.pressure_wkt_per_100}</span>
                          </div>
                          <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                            <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${Math.min(100, player.stats.pressure_wkt_per_100 * 5)}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400 font-mono">Baseline Wkts/100</span>
                            <span className="font-medium text-slate-300 font-mono">{player.stats.baseline_wkt_per_100}</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div className="h-full bg-slate-500 rounded-full" style={{ width: `${Math.min(100, player.stats.baseline_wkt_per_100 * 5)}%` }} />
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">Bowler wickets per 100 legal deliveries.</p>
                    </div>

                    {/* Bowler Metric 3: Dot Ball Rate */}
                    <div className="p-4 rounded-xl bg-slate-900/70 border border-white/10 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-mono text-slate-400">PRESSURE DOT BALL RATE</span>
                        <span className="font-mono text-white font-bold">{player.stats.dot_ball_rate}%</span>
                      </div>
                      <div className="pt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400 font-mono">Dot Ball Compression</span>
                          <span className="font-bold text-amber-400 font-mono">{player.stats.dot_ball_rate}%</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${player.stats.dot_ball_rate}%` }} />
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">Legal deliveries with zero bowler runs conceded.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. IPL VS T20I FORMAT SPLIT */}
              <div className="p-5 rounded-2xl bg-slate-900/40 border border-white/10">
                <h4 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider mb-3">
                  Competition Format Distribution
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-white/5">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">IPL Performances (Weight 1.15)</span>
                    <span className="text-xl font-display font-bold text-white">{player.comp_breakdown.ipl.pressure_balls} Balls</span>
                    <span className="text-xs text-slate-300 block font-mono mt-1">
                      {player.role === 'Batter' ? `Strike Rate: ${player.comp_breakdown.ipl.metric_val}` : `Economy: ${player.comp_breakdown.ipl.metric_val} RPO`}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-white/5">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">T20I Performances (Opponent Adjusted)</span>
                    <span className="text-xl font-display font-bold text-white">{player.comp_breakdown.t20i.pressure_balls} Balls</span>
                    <span className="text-xs text-slate-300 block font-mono mt-1">
                      {player.role === 'Batter' ? `Strike Rate: ${player.comp_breakdown.t20i.metric_val}` : `Economy: ${player.comp_breakdown.t20i.metric_val} RPO`}
                    </span>
                  </div>
                </div>
              </div>

              {/* 5. MATCH-BY-MATCH PERFORMANCE TIMELINE TABLE */}
              <div>
                <h3 className="text-sm font-mono uppercase font-bold text-slate-300 tracking-wider mb-3 flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-rr-pink" />
                  <span>Match-by-Match Pressure Performance Records ({player.match_history.length} Matches)</span>
                </h3>

                <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/60">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/90 text-slate-400 font-mono uppercase text-[10px]">
                      <tr>
                        <th className="px-4 py-2.5">Date</th>
                        <th className="px-4 py-2.5">Opponent</th>
                        <th className="px-3 py-2.5">Format</th>
                        <th className="px-3 py-2.5 text-right">P-Balls</th>
                        {player.role === 'Batter' ? (
                          <>
                            <th className="px-3 py-2.5 text-right">P-Runs</th>
                            <th className="px-3 py-2.5 text-right">Boundaries</th>
                            <th className="px-3 py-2.5 text-right">P-SR</th>
                            <th className="px-4 py-2.5 text-center">Status</th>
                          </>
                        ) : (
                          <>
                            <th className="px-3 py-2.5 text-right">Runs Conceded</th>
                            <th className="px-3 py-2.5 text-right">Wickets</th>
                            <th className="px-3 py-2.5 text-right">Dots</th>
                            <th className="px-4 py-2.5 text-right">Economy</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      {player.match_history.map((m, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-2.5 text-slate-300">{m.date}</td>
                          <td className="px-4 py-2.5 font-sans font-medium text-white">{m.opponent}</td>
                          <td className="px-3 py-2.5">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] ${m.format === 'IPL' ? 'bg-amber-500/20 text-amber-300' : 'bg-cyan-500/20 text-cyan-300'}`}>
                              {m.format}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-right font-bold text-white">{m.pressure_balls}</td>
                          {player.role === 'Batter' ? (
                            <>
                              <td className="px-3 py-2.5 text-right text-rr-pink font-bold">{m.pressure_runs}</td>
                              <td className="px-3 py-2.5 text-right text-slate-300">{m.boundaries}</td>
                              <td className="px-3 py-2.5 text-right text-emerald-400 font-bold">{m.sr}</td>
                              <td className="px-4 py-2.5 text-center">
                                {m.dismissed ? (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300">OUT</span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300">NOT OUT</span>
                                )}
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-3 py-2.5 text-right text-rose-300">{m.runs_conceded}</td>
                              <td className="px-3 py-2.5 text-right text-emerald-400 font-bold">{m.wickets}</td>
                              <td className="px-3 py-2.5 text-right text-slate-300">{m.dots}</td>
                              <td className="px-4 py-2.5 text-right text-rr-pink font-bold">{m.economy} RPO</td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
