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
      className={`relative w-full max-w-[460px] h-[490px] sm:h-[540px] mx-auto rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col justify-between p-5 select-none bg-gradient-to-b from-[#0c1427] via-[#070b15] to-[#04060b] ${className}`}
    >
      {/* 1. Atmospheric Ambient Stadium Lighting */}
      <div 
        className={`absolute -top-24 -left-24 w-72 h-72 rounded-full ${
          isRank1 ? 'bg-amber-500/20' : 'bg-rr-pink/20'
        } blur-3xl pointer-events-none transition-all duration-700`} 
      />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_20%,rgba(234,26,136,0.12),transparent_75%)] pointer-events-none" />

      {/* 2. Top Header Bar: Rank & Verification Tag */}
      <div className="relative z-20 flex items-center justify-between w-full">
        {/* Rank Badge */}
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase border shadow-lg ${
            isRank1
              ? 'bg-amber-950/70 border-amber-500/50 text-amber-300 shadow-amber-500/20'
              : 'bg-slate-900/80 border-pitch-border text-slate-300'
          }`}>
            {isRank1 && <Trophy className="w-3.5 h-3.5 text-amber-400" />}
            <span>RANK #{rank} {role.toUpperCase()}</span>
          </span>

          {isRank1 && (
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950">
              BENCHMARK
            </span>
          )}
        </div>

        {/* Authenticity Verified Tag */}
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-emerald-500/30 text-[10px] font-mono text-emerald-300 shadow-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold">AUTHENTIC PHOTO</span>
        </div>
      </div>

      {/* 3. Central Authentic Player Image (Fixed Container, object-contain, natural proportions) */}
      <div className="relative z-10 flex-1 w-full flex items-center justify-center my-2 overflow-hidden">
        {/* Soft Radial Backlight behind the photograph */}
        <div className="absolute w-60 h-60 rounded-full bg-white/[0.03] blur-xl pointer-events-none" />

        {isTransparent ? (
          /* Transparent Cutout Presentation */
          <img
            key={playerImage}
            src={playerImage}
            alt={name}
            onLoad={() => setImageLoaded(true)}
            className={`max-h-[360px] sm:max-h-[410px] w-auto max-w-[92%] object-contain object-bottom filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.85)] drop-shadow-[0_0_20px_${
              isRank1 ? 'rgba(229,169,60,0.25)' : 'rgba(234,26,136,0.25)'
            }] transition-all duration-300 ${
              imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          />
        ) : (
          /* Framed Portrait Photograph Presentation */
          <div className="relative max-h-[350px] sm:max-h-[390px] w-auto max-w-[85%] rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-slate-950/80 group">
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
      <div className="relative z-20 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-2">
          <span className="text-white font-display font-bold text-sm tracking-wide">
            {name}
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 font-semibold">
            {teams.slice(0, 2).join(' / ') || role}
          </span>
        </div>

        <div className="flex items-center space-x-1.5 text-rr-pink font-bold">
          <span className="text-white">{ppiScore.toFixed(1)}</span>
          <span className="text-[10px] text-slate-400 font-normal">PPI</span>
        </div>
      </div>
    </div>
  );
};
