import React, { useState } from 'react';
import { Trophy, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { getPlayerImageInfo } from '../utils/playerImages';

interface PlayerShowcaseCharacterProps {
  playerImage: string;
  name: string;
  role: 'Batter' | 'Bowler';
  rank: number;
  ppiScore: number;
  teams?: string[];
  className?: string;
}

export const PlayerShowcaseCharacter: React.FC<PlayerShowcaseCharacterProps> = ({
  playerImage,
  name,
  role,
  rank,
  ppiScore,
  teams = [],
  className = ''
}) => {
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const isRank1 = rank === 1;
  const info = getPlayerImageInfo(name);
  const isTransparent = info ? info.isTransparentCutout : playerImage.endsWith('.png');

  return (
    <div
      className={`relative w-full max-w-[460px] h-[490px] sm:h-[540px] min-h-[490px] sm:min-h-[540px] mx-auto rounded-3xl overflow-hidden border-2 border-rr-pink/50 shadow-2xl shadow-rr-pink/20 flex flex-col justify-between p-5 select-none bg-gradient-to-b from-[#1a0a2c] via-[#0c1228] to-[#040714] ${className}`}
    >
      {/* 1. Atmospheric Ambient Stadium Lighting - Rajasthan Royals Signature Glow */}
      <div 
        className={`absolute -top-24 -left-24 w-72 h-72 rounded-full ${
          isRank1 ? 'bg-amber-500/25' : 'bg-rr-pink/35'
        } blur-3xl pointer-events-none transition-all duration-700`} 
      />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-rr-pink/20 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_20%,rgba(234,26,136,0.20),transparent_75%)] pointer-events-none" />

      {/* 2. Top Header Bar: Rank & Verification Tag */}
      <div className="relative z-20 flex items-center justify-between w-full">
        {/* Rank Badge & Benchmark Tag */}
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase border shadow-lg ${
            isRank1
              ? 'bg-amber-950/80 border-amber-500/60 text-amber-300 shadow-amber-500/20'
              : 'bg-[#180a26]/90 border-rr-pink/50 text-white shadow-rr-pink/20'
          }`}>
            {isRank1 && <Trophy className="w-3.5 h-3.5 text-amber-400" />}
            <span>RANK #{rank} {role.toUpperCase()}</span>
          </span>

          {isRank1 && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-gradient-to-r from-amber-400 via-rose-500 to-rr-pink text-slate-950 shadow-md">
              BENCHMARK (100.0)
            </span>
          )}
        </div>

        {/* Authenticity Verified Tag */}
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#091522]/90 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 shadow-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold">AUTHENTIC PHOTO</span>
        </div>
      </div>

      {/* 3. Central Authentic Player Image (Fixed Container, object-contain, natural proportions) */}
      <div className="relative z-10 flex-1 w-full flex items-center justify-center my-2 overflow-hidden h-[360px] sm:h-[410px] min-h-[360px] sm:min-h-[410px]">
        {/* Soft Radial Backlight behind the photograph */}
        <div className="absolute w-64 h-64 rounded-full bg-rr-pink/10 blur-2xl pointer-events-none" />

        {isTransparent ? (
          /* Transparent Cutout Presentation with Royals Rim Lighting */
          <img
            key={playerImage}
            src={playerImage}
            alt={name}
            onLoad={() => setImageLoaded(true)}
            className={`max-h-[360px] sm:max-h-[410px] w-auto max-w-[92%] object-contain object-bottom filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.85)] drop-shadow-[0_0_24px_${
              isRank1 ? 'rgba(229,169,60,0.35)' : 'rgba(234,26,136,0.40)'
            }] transition-all duration-300 ${
              imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          />
        ) : (
          /* Framed Portrait Photograph Presentation */
          <div className="relative max-h-[350px] sm:max-h-[390px] w-auto max-w-[85%] rounded-2xl overflow-hidden border-2 border-rr-pink/30 shadow-2xl bg-slate-950/80 group">
            <img
              key={playerImage}
              src={playerImage}
              alt={name}
              onLoad={() => setImageLoaded(true)}
              className={`max-h-[350px] sm:max-h-[390px] w-auto object-contain filter brightness-100 contrast-105 transition-all duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
            {/* Subtle gloss gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
          </div>
        )}
      </div>

      {/* 4. Bottom Identity Bar */}
      <div className="relative z-20 pt-3 border-t border-rr-pink/30 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-2">
          <span className="text-white font-display font-bold text-sm tracking-wide">
            {name}
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300 font-semibold">
            {teams.slice(0, 2).join(' / ') || role}
          </span>
        </div>

        <div className="flex items-center space-x-1.5 text-rr-pink font-bold">
          <span className="text-white font-mono">{ppiScore.toFixed(1)}</span>
          <span className="text-[10px] text-rr-pink font-bold">PPI</span>
        </div>
      </div>
    </div>
  );
};
