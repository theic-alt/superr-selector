import React, { useState, useEffect } from 'react';
import { Sliders, RotateCcw, AlertTriangle, ArrowUp, ArrowDown, Minus, Info, CheckCircle2, Shield, BookOpen } from 'lucide-react';
import { simulateWhatIf, fetchMethodology } from '../api';
import { SimPlayerResult } from '../types';

export const ModelExplorerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'simulator' | 'methodology'>('simulator');
  const [role, setRole] = useState<'batter' | 'bowler'>('batter');

  // Batter weight parameters
  const [wSr, setWSr] = useState(0.35);
  const [wBr, setWBr] = useState(0.20);
  const [wDr, setWDr] = useState(0.15);
  const [wSru, setWSru] = useState(0.20);
  const [wBu, setWBu] = useState(0.10);

  // Bowler weight parameters
  const [wEcon, setWEcon] = useState(0.30);
  const [wWkt, setWWkt] = useState(0.25);
  const [wDot, setWDot] = useState(0.15);
  const [wEimp, setWEimp] = useState(0.20);
  const [wWimp, setWWimp] = useState(0.10);

  // Reliability parameter
  const [relDenominator, setRelDenominator] = useState(60.0);

  const [simResults, setSimResults] = useState<SimPlayerResult[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [methodology, setMethodology] = useState<any>(null);

  const runSimulation = () => {
    setIsSimulating(true);
    const params: Record<string, any> = {
      role,
      reliability_denominator: relDenominator,
      w_sr: wSr,
      w_br: wBr,
      w_dr: wDr,
      w_sru: wSru,
      w_bu: wBu,
      w_econ: wEcon,
      w_wkt: wWkt,
      w_dot: wDot,
      w_eimp: wEimp,
      w_wimp: wWimp
    };

    simulateWhatIf(params)
      .then(res => {
        setSimResults(res.top10 || []);
        setIsSimulating(false);
      })
      .catch(err => {
        console.error(err);
        setIsSimulating(false);
      });
  };

  useEffect(() => {
    runSimulation();
  }, [role, wSr, wBr, wDr, wSru, wBu, wEcon, wWkt, wDot, wEimp, wWimp, relDenominator]);

  useEffect(() => {
    fetchMethodology().then(res => setMethodology(res)).catch(console.error);
  }, []);

  const resetToOfficial = () => {
    if (role === 'batter') {
      setWSr(0.35);
      setWBr(0.20);
      setWDr(0.15);
      setWSru(0.20);
      setWBu(0.10);
    } else {
      setWEcon(0.30);
      setWWkt(0.25);
      setWDot(0.15);
      setWEimp(0.20);
      setWWimp(0.10);
    }
    setRelDenominator(60.0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-pitch-border pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-rr-pink mb-1 font-bold">
            <Sliders className="w-3.5 h-3.5" />
            <span>MODEL TRANSPARENCY & EXPERIMENTATION</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-wide uppercase">
            Model Explorer & What-If Simulator
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-mono mt-1">
            Audit official weights and conduct live What-If sensitivity tests. Official rankings are protected and never overwritten.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-2 p-1 rounded-xl bg-slate-900/80 border border-white/10 font-mono text-xs">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'simulator' ? 'bg-rr-pink text-white shadow-md shadow-rr-pink/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            What-If Simulator
          </button>
          <button
            onClick={() => setActiveTab('methodology')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'methodology' ? 'bg-rr-pink text-white shadow-md shadow-rr-pink/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Methodology & Formulas
          </button>
        </div>
      </div>

      {activeTab === 'simulator' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl glass-panel-elevated border border-white/10 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-mono font-bold uppercase text-slate-300">
                  Parameter Controls
                </span>
                <button
                  onClick={resetToOfficial}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-mono text-slate-300 flex items-center space-x-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Official</span>
                </button>
              </div>

              {/* Role Toggle */}
              <div className="flex rounded-xl bg-slate-950 p-1 border border-white/5 font-mono text-xs">
                <button
                  onClick={() => setRole('batter')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                    role === 'batter' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Batters Model
                </button>
                <button
                  onClick={() => setRole('bowler')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                    role === 'bowler' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Bowlers Model
                </button>
              </div>

              {/* Dynamic Weights Sliders */}
              <div className="space-y-4">
                {role === 'batter' ? (
                  <>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-400">Pressure Strike Rate:</span>
                        <span className="font-bold text-white">{(wSr * 100).toFixed(0)}% (Official: 35%)</span>
                      </div>
                      <input
                        type="range"
                        min="0.10"
                        max="0.60"
                        step="0.05"
                        value={wSr}
                        onChange={e => setWSr(Number(e.target.value))}
                        className="w-full h-1.5 rounded bg-slate-800 accent-rr-pink cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-400">Pressure Boundary %:</span>
                        <span className="font-bold text-white">{(wBr * 100).toFixed(0)}% (Official: 20%)</span>
                      </div>
                      <input
                        type="range"
                        min="0.05"
                        max="0.40"
                        step="0.05"
                        value={wBr}
                        onChange={e => setWBr(Number(e.target.value))}
                        className="w-full h-1.5 rounded bg-slate-800 accent-rr-pink cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-400">Inverse Dismissal Rate:</span>
                        <span className="font-bold text-white">{(wDr * 100).toFixed(0)}% (Official: 15%)</span>
                      </div>
                      <input
                        type="range"
                        min="0.05"
                        max="0.30"
                        step="0.05"
                        value={wDr}
                        onChange={e => setWDr(Number(e.target.value))}
                        className="w-full h-1.5 rounded bg-slate-800 accent-rr-pink cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-400">Strike-Rate Uplift:</span>
                        <span className="font-bold text-white">{(wSru * 100).toFixed(0)}% (Official: 20%)</span>
                      </div>
                      <input
                        type="range"
                        min="0.05"
                        max="0.40"
                        step="0.05"
                        value={wSru}
                        onChange={e => setWSru(Number(e.target.value))}
                        className="w-full h-1.5 rounded bg-slate-800 accent-rr-pink cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-400">Boundary Uplift:</span>
                        <span className="font-bold text-white">{(wBu * 100).toFixed(0)}% (Official: 10%)</span>
                      </div>
                      <input
                        type="range"
                        min="0.05"
                        max="0.25"
                        step="0.05"
                        value={wBu}
                        onChange={e => setWBu(Number(e.target.value))}
                        className="w-full h-1.5 rounded bg-slate-800 accent-rr-pink cursor-pointer"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-400">Inverse Pressure Economy:</span>
                        <span className="font-bold text-white">{(wEcon * 100).toFixed(0)}% (Official: 30%)</span>
                      </div>
                      <input
                        type="range"
                        min="0.10"
                        max="0.50"
                        step="0.05"
                        value={wEcon}
                        onChange={e => setWEcon(Number(e.target.value))}
                        className="w-full h-1.5 rounded bg-slate-800 accent-rr-pink cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-400">Pressure Wkts / 100 Balls:</span>
                        <span className="font-bold text-white">{(wWkt * 100).toFixed(0)}% (Official: 25%)</span>
                      </div>
                      <input
                        type="range"
                        min="0.10"
                        max="0.50"
                        step="0.05"
                        value={wWkt}
                        onChange={e => setWWkt(Number(e.target.value))}
                        className="w-full h-1.5 rounded bg-slate-800 accent-rr-pink cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-400">Pressure Dot Ball %:</span>
                        <span className="font-bold text-white">{(wDot * 100).toFixed(0)}% (Official: 15%)</span>
                      </div>
                      <input
                        type="range"
                        min="0.05"
                        max="0.30"
                        step="0.05"
                        value={wDot}
                        onChange={e => setWDot(Number(e.target.value))}
                        className="w-full h-1.5 rounded bg-slate-800 accent-rr-pink cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-400">Economy Improvement:</span>
                        <span className="font-bold text-white">{(wEimp * 100).toFixed(0)}% (Official: 20%)</span>
                      </div>
                      <input
                        type="range"
                        min="0.05"
                        max="0.40"
                        step="0.05"
                        value={wEimp}
                        onChange={e => setWEimp(Number(e.target.value))}
                        className="w-full h-1.5 rounded bg-slate-800 accent-rr-pink cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-400">Wicket Rate Improvement:</span>
                        <span className="font-bold text-white">{(wWimp * 100).toFixed(0)}% (Official: 10%)</span>
                      </div>
                      <input
                        type="range"
                        min="0.05"
                        max="0.25"
                        step="0.05"
                        value={wWimp}
                        onChange={e => setWWimp(Number(e.target.value))}
                        className="w-full h-1.5 rounded bg-slate-800 accent-rr-pink cursor-pointer"
                      />
                    </div>
                  </>
                )}

                {/* Reliability Denominator Shrinkage Factor */}
                <div className="pt-3 border-t border-white/5 space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Reliability Shrinkage Denominator:</span>
                    <span className="font-bold text-emerald-400">+{relDenominator} balls (Official: 60)</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="120"
                    step="10"
                    value={relDenominator}
                    onChange={e => setRelDenominator(Number(e.target.value))}
                    className="w-full h-1.5 rounded bg-slate-800 accent-emerald-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 font-mono block">
                    Formula: Balls / (Balls + {relDenominator}). Smaller values favor small samples.
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs font-mono text-amber-300 flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                What-If results are strictly experimental and designed for sensitivity analysis. Official scores remain untouched.
              </span>
            </div>
          </div>

          {/* Results Table Column (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-base font-display font-bold text-white uppercase tracking-wider">
                    Simulated Top 10 vs Official Rankings
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400">
                    Observing ranking movements under altered weights & reliability parameters.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded bg-black/40 border border-white/10 text-[11px] font-mono text-rr-pink font-bold">
                  {role.toUpperCase()} POOL
                </span>
              </div>

              {isSimulating ? (
                <div className="py-16 text-center">
                  <div className="w-8 h-8 border-4 border-rr-pink border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span className="text-xs font-mono text-slate-400">Recalculating What-If rankings...</span>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/70">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
                      <tr>
                        <th className="px-4 py-2.5 text-center">Sim Rank</th>
                        <th className="px-4 py-2.5">Player</th>
                        <th className="px-3 py-2.5 text-center">Movement</th>
                        <th className="px-3 py-2.5 text-right">Official PPI</th>
                        <th className="px-3 py-2.5 text-right">Sim PPI</th>
                        <th className="px-3 py-2.5 text-right">P-Balls</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {simResults.map(p => {
                        const rankUp = p.rank_change > 0;
                        const rankDown = p.rank_change < 0;
                        return (
                          <tr key={p.player_id} className="hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3 text-center font-bold text-white">
                              #{p.sim_rank}
                            </td>
                            <td className="px-4 py-3 font-sans font-bold text-white">
                              {p.name}
                            </td>
                            <td className="px-3 py-3 text-center">
                              {rankUp ? (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-bold">
                                  <ArrowUp className="w-3 h-3" />
                                  <span>+{p.rank_change}</span>
                                </span>
                              ) : rankDown ? (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-400 font-bold">
                                  <ArrowDown className="w-3 h-3" />
                                  <span>{p.rank_change}</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
                                  <Minus className="w-3 h-3" />
                                  <span>0</span>
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-3 text-right text-slate-400">
                              {p.official_ppi.toFixed(1)}
                            </td>
                            <td className="px-3 py-3 text-right font-bold text-rr-pink">
                              {p.sim_ppi.toFixed(1)}
                            </td>
                            <td className="px-3 py-3 text-right text-slate-300">
                              {p.p_balls}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Full Methodology Documentation Tab */
        <div className="space-y-6">
          <div className="p-8 rounded-3xl glass-panel border border-white/10 space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-white/10">
              <BookOpen className="w-6 h-6 text-rr-pink" />
              <div>
                <h2 className="text-xl font-display font-bold text-white uppercase tracking-wider">
                  Mathematical Methodology & Validation Architecture
                </h2>
                <p className="text-xs font-mono text-slate-400">
                  Full transparent disclosure of equations, normalization, competition weights, and known dataset boundaries.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono text-slate-300">
              {/* Box 1: Batter Formulas */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-white/5 space-y-3">
                <span className="text-sm font-bold text-amber-400 uppercase block">1. Batter Raw PPI Formula</span>
                <p className="text-slate-300 leading-relaxed">
                  Raw PPI = 0.35 × z(Pressure SR) + 0.20 × z(Boundary Rate) + 0.15 × z(Inverse Dismissal Rate) + 0.20 × z(SR Uplift) + 0.10 × z(Boundary Uplift)
                </p>
                <div className="p-3 rounded-xl bg-slate-900 border border-white/5 space-y-1 text-[11px] text-slate-400">
                  <div>• Pressure SR: Pressure Runs / Pressure Legal Balls × 100</div>
                  <div>• Boundary Rate: (Fours + Sixes) / Pressure Legal Balls × 100</div>
                  <div>• Inverse Dismissal: Reversal of dismissal frequency (higher safety = higher score)</div>
                  <div>• Uplifts: Pressure metric minus baseline non-pressure metric</div>
                </div>
              </div>

              {/* Box 2: Bowler Formulas */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-white/5 space-y-3">
                <span className="text-sm font-bold text-cyan-400 uppercase block">2. Bowler Raw PPI Formula</span>
                <p className="text-slate-300 leading-relaxed">
                  Raw PPI = 0.30 × z(Inverse Economy) + 0.25 × z(Wkts / 100 Balls) + 0.15 × z(Dot Rate) + 0.20 × z(Economy Improvement) + 0.10 × z(Wicket Improvement)
                </p>
                <div className="p-3 rounded-xl bg-slate-900 border border-white/5 space-y-1 text-[11px] text-slate-400">
                  <div>• Pressure Economy: Runs Conceded / Legal Pressure Balls × 6</div>
                  <div>• Wkts per 100: Bowler Wickets (Caught, Bowled, LBW, Stump, Hit Wicket) / Balls × 100</div>
                  <div>• Dot Rate: Zero-run legal balls / Pressure Balls × 100</div>
                  <div>• Economy Improvement: Baseline economy minus pressure economy</div>
                </div>
              </div>

              {/* Box 3: Reliability & Scaling */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-white/5 space-y-3">
                <span className="text-sm font-bold text-emerald-400 uppercase block">3. Sample Reliability & Scaling</span>
                <p className="text-slate-300 leading-relaxed">
                  Reliability = Pressure Legal Balls / (Pressure Legal Balls + 60)<br />
                  Adjusted PPI = Raw PPI × Reliability<br />
                  PPI / 100 = 100 × (Adjusted PPI - Pool Min) / (Pool Max - Pool Min)
                </p>
                <p className="text-[11px] text-slate-400">
                  Reliability acts as a Bayesian shrinkage prior, preventing extreme statistical noise from small samples while allowing true large-sample performers to maintain their high rating.
                </p>
              </div>

              {/* Box 4: Competition Strength Adjustment */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-white/5 space-y-3">
                <span className="text-sm font-bold text-rr-pink uppercase block">4. Competition Strength Adjustment</span>
                <p className="text-slate-300 leading-relaxed">
                  IPL Delivery Weight = 1.15<br />
                  T20I Opponent Strength Factor = clip(0.85 + 0.60 × Opponent Win Rate, 0.85, 1.25)
                </p>
                <p className="text-[11px] text-slate-400">
                  For batters, opponent is the bowling team; for bowlers, opponent is the batting team. Applied at the delivery aggregation level to both pressure and baseline aggregates.
                </p>
              </div>
            </div>

            {/* Limitations Callout */}
            <div className="p-5 rounded-2xl bg-slate-950/90 border border-white/10 space-y-2 text-xs font-mono">
              <span className="text-slate-400 uppercase font-bold tracking-wider block">Model Disclaimers & Known Boundaries:</span>
              <ul className="list-disc pl-5 text-slate-300 space-y-1 text-[11px]">
                <li>Dataset Cutoff: Supplied data ends on 1 November 2026; recent window spans 11 May 2026 to 11 November 2026.</li>
                <li>Scope Restriction: Calculations use strictly IPL and T20I matches represented in supplied files without importing outside leagues.</li>
                <li>Non-Predictive Metric: PPI is a historical composite index quantifying clutch performance in historical pressure states, not a probabilistic guarantee of future match outcomes.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
