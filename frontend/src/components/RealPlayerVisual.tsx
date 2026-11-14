import React, { useState, useRef, useEffect } from 'react';
import { getPlayerImage } from '../utils/playerImages';
import { Trophy, Shield } from 'lucide-react';

interface RealPlayerVisualProps {
  name: string;
  role: 'Batter' | 'Bowler';
  rank: number;
  teams: string[];
  ppiScore: number;
  className?: string;
}

export const RealPlayerVisual: React.FC<RealPlayerVisualProps> = ({
  name,
  role,
  rank,
  teams,
  ppiScore,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const imageSrc = getPlayerImage(name);

  // Smooth mouse tilt parallax
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16; // -8deg to +8deg
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -12; // -6deg to +6deg
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const isRank1 = rank === 1;
  const accentColor = isRank1 ? 'from-amber-500/30 to-rr-gold/20' : 'from-rr-pink/30 to-purple-600/20';
  const glowBorder = isRank1 ? 'border-amber-400/40 shadow-amber-500/20' : 'border-rr-pink/40 shadow-rr-pink/20';

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full h-full flex flex-col items-center justify-end select-none overflow-hidden ${className}`}
      style={{ perspective: '1200px' }}
    >
      {/* 1. Cinematic Stadium Spotlight & Ambient Glow */}
      <div 
        className={`absolute inset-0 bg-gradient-to-b ${accentColor} opacity-70 blur-2xl pointer-events-none transition-all duration-700`} 
      />
      
      {/* Dynamic Stadium Radial Beams */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_70%_50%_at_50%_15%,rgba(234,26,136,0.22),transparent_70%)] pointer-events-none" />

      {/* 2. Holographic Ground Pedestal */}
      <div className="absolute bottom-6 w-72 sm:w-88 h-20 pointer-events-none flex items-center justify-center">
        {/* Outer Glowing Ring */}
        <div className={`w-full h-full rounded-full border-2 ${isRank1 ? 'border-amber-400/50' : 'border-rr-pink/50'} shadow-2xl ${isRank1 ? 'shadow-amber-500/40' : 'shadow-rr-pink/40'} transform -rotate-x-60`} />
        {/* Inner Core Disc */}
        <div className="absolute w-48 sm:w-60 h-12 rounded-full bg-slate-900/90 border border-white/20 transform -rotate-x-60 backdrop-blur-md" />
        {/* Floor Uplight Glow */}
        <div className={`absolute w-36 h-8 rounded-full ${isRank1 ? 'bg-amber-400/40' : 'bg-rr-pink/40'} blur-lg transform -rotate-x-60`} />
      </div>

      {/* 3. Real Player Portrait / Cutout with Interactive 3D Tilt */}
      <div
        className="relative z-10 w-full max-w-[340px] sm:max-w-[420px] h-[400px] sm:h-[480px] flex items-end justify-center transition-transform duration-200 ease-out"
        style={{
          transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg) translateZ(20px)`
        }}
      >
        {imageSrc ? (
          <div className="relative w-full h-full flex items-end justify-center group">
            {/* Soft Ambient Shadow Under Cutout */}
            <div className="absolute bottom-2 w-48 h-8 bg-black/60 rounded-full blur-md" />

            {/* Real Player Image */}
            <img
              src={imageSrc}
              alt={name}
              onLoad={() => setImageLoaded(true)}
              className={`max-h-[380px] sm:max-h-[450px] w-auto max-w-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.85)] drop-shadow-[0_0_25px_${isRank1 ? 'rgba(229,169,60,0.35)' : 'rgba(234,26,136,0.35)'}] transition-all duration-500 ${
                imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
            />
          </div>
        ) : (
          /* Graceful Fallback if image not matched */
          <div className="w-56 h-72 rounded-3xl bg-slate-900/80 border border-white/10 flex flex-col items-center justify-center p-6 text-center shadow-2xl backdrop-blur-md">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-rr-pink to-rose-600 flex items-center justify-center text-3xl font-display font-black text-white mb-4 shadow-lg shadow-rr-pink/40">
              {name.split(' ').map(n => n[0]).join('')}
            </div>
            <h4 className="text-lg font-display font-bold text-white">{name}</h4>
            <span className="text-xs font-mono text-slate-400 mt-1">{role} • Rank #{rank}</span>
          </div>
        )}
      </div>

      {/* 4. Bottom Authenticity Badge */}
      <div className="absolute bottom-2 z-20 flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-950/90 border border-white/10 backdrop-blur-md text-[10px] font-mono text-slate-300 shadow-xl">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-semibold text-white">VERIFIED OFFICIAL ROSTER ASSET</span>
        <span className="text-slate-500">•</span>
        <span className="text-slate-400">{teams[0] || 'T20'}</span>
      </div>
    </div>
  );
};
