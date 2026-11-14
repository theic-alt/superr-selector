import React, { useState, useEffect } from 'react';
import { PlayCircle, ShieldCheck, AlertCircle, Sparkles, Sliders, CheckCircle2, RotateCcw } from 'lucide-react';
import { Stadium3D } from '../components/Stadium3D';
import { evaluateLivePressure } from '../api';
import { PressureEvaluationResult } from '../types';

export const PressureExplainerPage: React.FC = () => {
  const [innings, setInnings] = useState<1 | 2>(2);
  const [ballsRemaining, setBallsRemaining] = useState<number>(48);
  const [runsRequired, setRunsRequired] = useState<number>(82);
  const [runsScored, setRunsScored] = useState<number>(97);
  const [legalBallsBowled, setLegalBallsBowled] = useState<number>(72);
  const [wicketsLost, setWicketsLost] = useState<number>(4);

  const [evaluation, setEvaluation] = useState<PressureEvaluationResult | null>(null);

  useEffect(() => {
    evaluateLivePressure({
      innings,
      balls_remaining: ballsRemaining,
      runs_required: runsRequired,
      runs_scored: runsScored,
      legal_balls_bowled: legalBallsBowled,
      wickets_lost: wicketsLost
    })
      .then(res => setEvaluation(res))
      .catch(err => console.error(err));
  }, [innings, ballsRemaining, runsRequired, runsScored, legalBallsBowled, wicketsLost]);

  // Derived metrics
  const crr = ((runsScored / Math.max(1, legalBallsBowled)) * 6.0).toFixed(2);
  const rrr = innings === 2 ? ((runsRequired / Math.max(1, ballsRemaining)) * 6.0).toFixed(2) : null;
  const gap = innings === 2 && rrr ? (parseFloat(rrr) - parseFloat(crr)).toFixed(2) : null;
  const wicketsInHand = Math.max(0, 10 - wicketsLost);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-pitch-border pb-6">
        <div className="flex items-center space-x-2 text-xs font-mono text-rr-pink mb-1 font-bold">
          <PlayCircle className="w-3.5 h-3.5" />
          <span>MATHEMATICAL SPECIFICATION & SIMULATOR</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-wide uppercase">
          How Does Our Model Identify Pressure?
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 font-mono mt-1">
          Pressure is evaluated strictly immediately before each delivery without look-ahead bias. Use the live match-state simulator below to explore exact trigger conditions.
        </p>
      </div>

      {/* Main Grid: Interactive Controls & 3D Pitch */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Match-State Simulator (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl glass-panel-elevated border border-white/10 space-y-6">
            {/* Mode Switcher */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <span className="text-xs font-mono font-bold uppercase text-slate-300">
                Match Scenario Mode
              </span>
              <div className="flex items-center space-x-2 p-1 rounded-xl bg-slate-950/80 border border-white/10 font-mono text-xs">
                <button
                  onClick={() => {
                    setInnings(2);
                    setBallsRemaining(48);
                    setRunsRequired(82);
                    setRunsScored(97);
                    setLegalBallsBowled(72);
                    setWicketsLost(4);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    innings === 2 ? 'bg-rr-pink text-white shadow-md shadow-rr-pink/30' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Second Innings (Chase)
                </button>
                <button
                  onClick={() => {
                    setInnings(1);
                    setBallsRemaining(24);
                    setRunsScored(155);
                    setLegalBallsBowled(96);
                    setWicketsLost(5);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    innings === 1 ? 'bg-rr-pink text-white shadow-md shadow-rr-pink/30' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  First Innings (1st Inn)
                </button>
              </div>
            </div>

            {/* Sliders Area */}
            <div className="space-y-5">
              {/* Slider 1: Balls Remaining */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Legal Balls Remaining:</span>
                  <span className="font-bold text-white text-sm">{ballsRemaining} balls ({Math.floor(ballsRemaining / 6)}.{ballsRemaining % 6} ov)</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="120"
                  value={ballsRemaining}
                  onChange={e => setBallsRemaining(Number(e.target.value))}
                  className="w-full h-2 rounded-lg bg-slate-800 accent-rr-pink cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 font-mono block">
                  Threshold: &lt;= 60 for chase; &lt;= 30 for 1st innings.
                </span>
              </div>

              {/* Slider 2: Runs Required (Innings 2 only) */}
              {innings === 2 && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Runs Required to Win:</span>
                    <span className="font-bold text-rr-pink text-sm">{runsRequired} runs</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="180"
                    value={runsRequired}
                    onChange={e => setRunsRequired(Number(e.target.value))}
                    className="w-full h-2 rounded-lg bg-slate-800 accent-rr-pink cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>RRR: <b className="text-slate-300">{rrr} RPO</b></span>
                    <span>Target Gap: <b className="text-slate-300">{gap} RPO</b></span>
                  </div>
                </div>
              )}

              {/* Slider 3: Wickets Lost */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Wickets Lost so Far:</span>
                  <span className="font-bold text-amber-400 text-sm">{wicketsLost} wkts ({wicketsInHand} in hand)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="9"
                  value={wicketsLost}
                  onChange={e => setWicketsLost(Number(e.target.value))}
                  className="w-full h-2 rounded-lg bg-slate-800 accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Slider 4: Runs Scored & Balls Bowled (CRR Controller) */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400 block">Runs Scored:</label>
                  <input
                    type="number"
                    min="0"
                    max="280"
                    value={runsScored}
                    onChange={e => setRunsScored(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/90 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-rr-pink"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400 block">Balls Bowled:</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={legalBallsBowled}
                    onChange={e => setLegalBallsBowled(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/90 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-rr-pink"
                  />
                </div>
              </div>
            </div>

            {/* Live Verdict Display */}
            {evaluation && (
              <div className={`p-5 rounded-2xl border transition-all ${
                evaluation.is_pressure
                  ? 'bg-gradient-to-r from-rose-950/50 via-pitch-panel to-slate-950 border-rr-pink shadow-xl shadow-rr-pink/20'
                  : 'bg-slate-950/80 border-white/10'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono uppercase font-bold tracking-widest text-slate-400">
                    LIVE CLASSIFICATION STATUS
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-black uppercase tracking-wider flex items-center space-x-1.5 ${
                    evaluation.is_pressure
                      ? 'bg-rr-pink text-white animate-pulse'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${evaluation.is_pressure ? 'bg-white' : 'bg-slate-500'}`} />
                    <span>{evaluation.is_pressure ? 'PRESSURE DELIVERY' : 'NORMAL DELIVERY'}</span>
                  </span>
                </div>

                <p className="text-xs text-slate-200 font-mono mb-3">
                  {evaluation.reason}
                </p>

                {evaluation.triggered_conditions.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-white/10">
                    <span className="text-[10px] font-mono uppercase text-rr-pink font-bold block">
                      Triggered Pressure Rule(s):
                    </span>
                    {evaluation.triggered_conditions.map((cond, i) => (
                      <div key={i} className="flex items-center space-x-2 text-xs text-emerald-300 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>{cond}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: 3D Pitch & Educational Architecture (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Stadium3D height="380px" activeScenario={evaluation?.is_pressure ? 'six' : 'yorker'} showControls={false} />

          {/* Mathematical Reference Rules Box */}
          <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-300 tracking-wider flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-rr-pink" />
              <span>Exact Mathematical Decision Rules</span>
            </h3>

            <div className="space-y-3 text-xs font-mono text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                <span className="text-rr-pink font-bold block">Second Innings (Chase Pressure):</span>
                <p className="text-[11px] text-slate-400">
                  Balls remaining &lt;= 60 <b className="text-white">AND</b> at least ONE of:
                </p>
                <ul className="list-disc pl-4 text-[11px] text-slate-300 space-y-0.5">
                  <li>Required Run Rate (RRR) &gt;= 9.5 RPO</li>
                  <li>Wickets in hand &lt;= 4 (Tail or collapse)</li>
                  <li>RRR - CRR Gap &gt;= 2.5 RPO (Steep acceleration)</li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                <span className="text-amber-400 font-bold block">First Innings Batter Pressure:</span>
                <p className="text-[11px] text-slate-400">
                  Balls remaining &lt;= 30 <b className="text-white">AND</b> at least 5 wickets lost (Death rebuilding).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
                <span className="text-cyan-400 font-bold block">First Innings Bowler Pressure:</span>
                <p className="text-[11px] text-slate-400">
                  Balls remaining &lt;= 30 <b className="text-white">AND</b> at least 5 wickets in hand <b className="text-white">AND</b> CRR &gt;= 8.0 RPO.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
