import React, { useState, useRef } from 'react';
import { Trophy, ShieldCheck } from 'lucide-react';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  // Smooth mouse tilt parallax (constrained to 10 deg)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12; // -6deg to +6deg
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -10; // -5deg to +5deg
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const isRank1 = rank === 1;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full h-[520px] sm:h-[580px] max-w-[460px] mx-auto flex flex-col items-center justify-end select-none overflow-hidden ${className}`}
      style={{ perspective: '1200px' }}
    >
      {/* 1. Cinematic Stadium Spotlight & Ambient Lighting */}
      <div 
        className={`absolute inset-0 bg-gradient-to-b ${
          isRank1 ? 'from-amber-500/25 via-rr-pink/15 to-transparent' : 'from-rr-pink/25 via-purple-900/15 to-transparent'
        } opacity-80 blur-2xl pointer-events-none transition-all duration-700`} 
      />
      
      {/* Studio Radial Light Beams */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_75%_55%_at_50%_15%,rgba(234,26,136,0.25),transparent_75%)] pointer-events-none" />

      {/* 2. Holographic Ground Pedestal (Fixed Position for Foot Contact) */}
      <div className="absolute bottom-6 w-80 sm:w-96 h-20 pointer-events-none flex items-center justify-center z-0">
        {/* Outer Glowing Neon Ring */}
        <div className={`w-full h-full rounded-full border-2 ${
          isRank1 ? 'border-amber-400/60 shadow-amber-500/50' : 'border-rr-pink/60 shadow-rr-pink/50'
        } shadow-2xl transform -rotate-x-60`} />
        {/* Inner Core Disc */}
        <div className="absolute w-56 sm:w-68 h-14 rounded-full bg-slate-950/90 border border-white/20 transform -rotate-x-60 backdrop-blur-md" />
        {/* Floor Uplight Glow */}
        <div className={`absolute w-40 h-8 rounded-full ${
          isRank1 ? 'bg-amber-400/40' : 'bg-rr-pink/40'
        } blur-lg transform -rotate-x-60`} />
      </div>

      {/* 3. Standardized 2:3 Character Canvas Area (Locked Frame) */}
      <div
        className="relative z-10 w-full h-full max-h-[540px] sm:max-h-[580px] aspect-[2/3] flex items-end justify-center transition-transform duration-200 ease-out"
        style={{
          transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg) translateZ(15px)`
        }}
      >
        <div className="relative w-full h-full flex items-end justify-center">
          {/* Soft Ground Contact Shadow (Feet Contact Plane) */}
          <div className="absolute bottom-5 w-56 h-7 bg-black/75 rounded-full blur-md" />

          {/* Standardized Full-Body Character Cutout */}
          <img
            key={playerImage}
            src={playerImage}
            alt={name}
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-contain object-bottom filter drop-shadow-[0_15px_35px_rgba(0,0,0,0.9)] drop-shadow-[0_0_20px_${
              isRank1 ? 'rgba(229,169,60,0.35)' : 'rgba(234,26,136,0.35)'
            }] transition-all duration-400 ${
              imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-98'
            }`}
          />
        </div>
      </div>

      {/* 4. Bottom Authenticity & Character Spec Badge */}
      <div className="absolute bottom-2 z-20 flex items-center space-x-2 px-3.5 py-1 rounded-full bg-slate-950/90 border border-white/10 backdrop-blur-md text-[10px] font-mono text-slate-300 shadow-xl">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-bold text-white tracking-wider">STANDARDIZED CHARACTER ASSET</span>
        <span className="text-slate-500">•</span>
        <span className="text-slate-400 font-semibold">{role.toUpperCase()} #{rank}</span>
      </div>
    </div>
  );
};
