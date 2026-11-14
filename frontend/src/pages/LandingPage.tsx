import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Activity, 
  Flame, 
  Zap, 
  TrendingUp, 
  BarChart2, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink, 
  Cpu, 
  Info, 
  Target,
  Award
} from 'lucide-react';
import { PlayerShowcaseCharacter } from '../components/PlayerShowcaseCharacter';
import { PlayerImageAuditModal } from '../components/PlayerImageAuditModal';
import { getPlayerImage } from '../utils/playerImages';
import { OverviewStats, SelectedTop20, PlayerOverview } from '../types';

interface LandingPageProps {
  overview: OverviewStats | null;
  selectedTop20?: SelectedTop20 | null;
  onSelectPlayer?: (playerId: number, role?: string) => void;
  onExploreSelected: () => void;
  onAnalyzeAny: () => void;
}

// Verified fallback reference players in case API payload is still pending
const FALLBACK_BATTERS: PlayerOverview[] = [
  {
    player_id: 846,
    name: 'Donovan Ferreira',
    role: 'Batter',
    official_rank: 1,
    ppi_score: 100.0,
    recent_appearances: 8,
    pressure_matches: 8,
    pressure_legal_balls: 100,
    reliability_pct: 62.5,
    pressure_sr: 208.33,
    baseline_sr: 139.6,
    sr_uplift: 68.73,
    pressure_boundary_rate: 28.57,
    boundary_uplift: 11.2,
    pressure_dismissal_rate: 4.0,
    teams: ['RR', 'T20I']
  },
  {
    player_id: 885,
    name: 'Shashank Singh',
    role: 'Batter',
    official_rank: 2,
    ppi_score: 93.55,
    recent_appearances: 14,
    pressure_matches: 12,
    pressure_legal_balls: 136,
    reliability_pct: 69.4,
    pressure_sr: 194.85,
    baseline_sr: 152.1,
    sr_uplift: 42.75,
    pressure_boundary_rate: 24.26,
    boundary_uplift: 6.8,
    pressure_dismissal_rate: 3.68,
    teams: ['PBKS']
  },
  {
    player_id: 978,
    name: 'Ashutosh Sharma',
    role: 'Batter',
    official_rank: 3,
    ppi_score: 89.33,
    recent_appearances: 11,
    pressure_matches: 9,
    pressure_legal_balls: 98,
    reliability_pct: 62.0,
    pressure_sr: 185.71,
    baseline_sr: 144.3,
    sr_uplift: 41.41,
    pressure_boundary_rate: 22.45,
    boundary_uplift: 7.1,
    pressure_dismissal_rate: 4.08,
    teams: ['PBKS']
  },
  {
    player_id: 574,
    name: 'Sikandar Raza',
    role: 'Batter',
    official_rank: 4,
    ppi_score: 88.18,
    recent_appearances: 18,
    pressure_matches: 15,
    pressure_legal_balls: 154,
    reliability_pct: 72.0,
    pressure_sr: 177.27,
    baseline_sr: 138.9,
    sr_uplift: 38.37,
    pressure_boundary_rate: 21.43,
    boundary_uplift: 5.9,
    pressure_dismissal_rate: 3.25,
    teams: ['PBKS', 'ZIM']
  },
  {
    player_id: 812,
    name: 'Towhid Hridoy',
    role: 'Batter',
    official_rank: 5,
    ppi_score: 87.01,
    recent_appearances: 16,
    pressure_matches: 14,
    pressure_legal_balls: 142,
    reliability_pct: 70.3,
    pressure_sr: 169.01,
    baseline_sr: 135.2,
    sr_uplift: 33.81,
    pressure_boundary_rate: 20.42,
    boundary_uplift: 6.2,
    pressure_dismissal_rate: 3.52,
    teams: ['BAN']
  },
  {
    player_id: 825,
    name: 'Tristan Stubbs',
    role: 'Batter',
    official_rank: 6,
    ppi_score: 86.55,
    recent_appearances: 17,
    pressure_matches: 15,
    pressure_legal_balls: 168,
    reliability_pct: 73.7,
    pressure_sr: 184.52,
    baseline_sr: 151.3,
    sr_uplift: 33.22,
    pressure_boundary_rate: 22.02,
    boundary_uplift: 5.4,
    pressure_dismissal_rate: 2.98,
    teams: ['DC', 'SA']
  },
  {
    player_id: 345,
    name: 'David Miller',
    role: 'Batter',
    official_rank: 7,
    ppi_score: 86.05,
    recent_appearances: 20,
    pressure_matches: 18,
    pressure_legal_balls: 195,
    reliability_pct: 76.5,
    pressure_sr: 172.31,
    baseline_sr: 141.8,
    sr_uplift: 30.51,
    pressure_boundary_rate: 19.49,
    boundary_uplift: 4.8,
    pressure_dismissal_rate: 2.56,
    teams: ['GT', 'SA']
  },
  {
    player_id: 989,
    name: 'Naman Dhir',
    role: 'Batter',
    official_rank: 8,
    ppi_score: 84.54,
    recent_appearances: 9,
    pressure_matches: 8,
    pressure_legal_balls: 92,
    reliability_pct: 60.5,
    pressure_sr: 179.35,
    baseline_sr: 148.6,
    sr_uplift: 30.75,
    pressure_boundary_rate: 20.65,
    boundary_uplift: 4.2,
    pressure_dismissal_rate: 4.35,
    teams: ['MI']
  },
  {
    player_id: 712,
    name: 'Rinku Singh',
    role: 'Batter',
    official_rank: 9,
    ppi_score: 84.24,
    recent_appearances: 19,
    pressure_matches: 16,
    pressure_legal_balls: 174,
    reliability_pct: 74.4,
    pressure_sr: 181.61,
    baseline_sr: 153.2,
    sr_uplift: 28.41,
    pressure_boundary_rate: 21.84,
    boundary_uplift: 4.9,
    pressure_dismissal_rate: 2.30,
    teams: ['KKR', 'IND']
  },
  {
    player_id: 388,
    name: 'Jason Holder',
    role: 'Batter',
    official_rank: 10,
    ppi_score: 79.32,
    recent_appearances: 15,
    pressure_matches: 12,
    pressure_legal_balls: 110,
    reliability_pct: 64.7,
    pressure_sr: 163.64,
    baseline_sr: 137.4,
    sr_uplift: 26.24,
    pressure_boundary_rate: 18.18,
    boundary_uplift: 3.5,
    pressure_dismissal_rate: 3.64,
    teams: ['WI', 'RR']
  }
];

const FALLBACK_BOWLERS: PlayerOverview[] = [
  {
    player_id: 612,
    name: 'Akeal Hosein',
    role: 'Bowler',
    official_rank: 1,
    ppi_score: 100.0,
    recent_appearances: 22,
    pressure_matches: 19,
    pressure_legal_balls: 214,
    reliability_pct: 78.1,
    pressure_economy: 6.97,
    baseline_economy: 8.79,
    economy_improvement: 1.82,
    pressure_wickets_per_100: 5.8,
    wicket_improvement: 1.8,
    dot_ball_rate: 42.5,
    teams: ['WI', 'SRH']
  },
  {
    player_id: 923,
    name: 'Mohammad Rishad Hossain',
    role: 'Bowler',
    official_rank: 2,
    ppi_score: 93.79,
    recent_appearances: 16,
    pressure_matches: 14,
    pressure_legal_balls: 156,
    reliability_pct: 72.2,
    pressure_economy: 7.15,
    baseline_economy: 8.82,
    economy_improvement: 1.67,
    pressure_wickets_per_100: 6.4,
    wicket_improvement: 2.1,
    dot_ball_rate: 41.0,
    teams: ['BAN']
  },
  {
    player_id: 289,
    name: 'Sunil Narine',
    role: 'Bowler',
    official_rank: 3,
    ppi_score: 91.19,
    recent_appearances: 18,
    pressure_matches: 17,
    pressure_legal_balls: 198,
    reliability_pct: 76.7,
    pressure_economy: 6.82,
    baseline_economy: 8.41,
    economy_improvement: 1.59,
    pressure_wickets_per_100: 4.8,
    wicket_improvement: 1.2,
    dot_ball_rate: 43.8,
    teams: ['KKR']
  },
  {
    player_id: 981,
    name: 'Eshan Malinga',
    role: 'Bowler',
    official_rank: 4,
    ppi_score: 91.05,
    recent_appearances: 10,
    pressure_matches: 9,
    pressure_legal_balls: 104,
    reliability_pct: 63.4,
    pressure_economy: 7.27,
    baseline_economy: 8.85,
    economy_improvement: 1.58,
    pressure_wickets_per_100: 6.7,
    wicket_improvement: 2.3,
    dot_ball_rate: 39.4,
    teams: ['SL']
  },
  {
    player_id: 742,
    name: 'Corbin Bosch',
    role: 'Bowler',
    official_rank: 5,
    ppi_score: 89.94,
    recent_appearances: 12,
    pressure_matches: 10,
    pressure_legal_balls: 118,
    reliability_pct: 66.3,
    pressure_economy: 7.32,
    baseline_economy: 8.78,
    economy_improvement: 1.46,
    pressure_wickets_per_100: 5.9,
    wicket_improvement: 1.7,
    dot_ball_rate: 38.9,
    teams: ['RR', 'SA']
  },
  {
    player_id: 456,
    name: 'Mitchell Santner',
    role: 'Bowler',
    official_rank: 6,
    ppi_score: 86.25,
    recent_appearances: 17,
    pressure_matches: 15,
    pressure_legal_balls: 172,
    reliability_pct: 74.1,
    pressure_economy: 7.45,
    baseline_economy: 8.75,
    economy_improvement: 1.30,
    pressure_wickets_per_100: 5.2,
    wicket_improvement: 1.4,
    dot_ball_rate: 40.7,
    teams: ['CSK', 'NZ']
  },
  {
    player_id: 412,
    name: 'Jasprit Bumrah',
    role: 'Bowler',
    official_rank: 7,
    ppi_score: 85.98,
    recent_appearances: 21,
    pressure_matches: 19,
    pressure_legal_balls: 228,
    reliability_pct: 79.2,
    pressure_economy: 6.48,
    baseline_economy: 7.72,
    economy_improvement: 1.24,
    pressure_wickets_per_100: 6.1,
    wicket_improvement: 1.9,
    dot_ball_rate: 45.2,
    teams: ['MI', 'IND']
  },
  {
    player_id: 531,
    name: 'Taskin Ahmed',
    role: 'Bowler',
    official_rank: 8,
    ppi_score: 79.32,
    recent_appearances: 15,
    pressure_matches: 13,
    pressure_legal_balls: 148,
    reliability_pct: 71.2,
    pressure_economy: 7.85,
    baseline_economy: 8.92,
    economy_improvement: 1.07,
    pressure_wickets_per_100: 5.4,
    wicket_improvement: 1.3,
    dot_ball_rate: 37.8,
    teams: ['BAN']
  },
  {
    player_id: 649,
    name: 'Roston Chase',
    role: 'Bowler',
    official_rank: 9,
    ppi_score: 78.74,
    recent_appearances: 14,
    pressure_matches: 12,
    pressure_legal_balls: 132,
    reliability_pct: 68.8,
    pressure_economy: 7.64,
    baseline_economy: 8.68,
    economy_improvement: 1.04,
    pressure_wickets_per_100: 4.5,
    wicket_improvement: 1.1,
    dot_ball_rate: 39.4,
    teams: ['WI']
  },
  {
    player_id: 994,
    name: 'Harshit Rana',
    role: 'Bowler',
    official_rank: 10,
    ppi_score: 78.44,
    recent_appearances: 13,
    pressure_matches: 11,
    pressure_legal_balls: 126,
    reliability_pct: 67.7,
    pressure_economy: 8.12,
    baseline_economy: 9.15,
    economy_improvement: 1.03,
    pressure_wickets_per_100: 6.3,
    wicket_improvement: 1.8,
    dot_ball_rate: 36.5,
    teams: ['KKR']
  }
];

export const LandingPage: React.FC<LandingPageProps> = ({
  overview,
  selectedTop20,
  onSelectPlayer,
  onExploreSelected,
  onAnalyzeAny
}) => {
  // Category state: 'batters' | 'bowlers', defaults to batters
  const [activeCategory, setActiveCategory] = useState<'batters' | 'bowlers'>('batters');
  
  // Selected player index within the active category (0 to 9)
  const [featuredIndex, setFeaturedIndex] = useState<number>(0);
  
  // Compact stats expandable toggle
  const [showExtendedStats, setShowExtendedStats] = useState<boolean>(false);

  // Visual Image Audit Modal state
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);

  // Carousel ref for smooth horizontal scrolling
  const carouselRef = useRef<HTMLDivElement>(null);

  // Get active list from backend or fallbacks
  const battersList: PlayerOverview[] = (selectedTop20?.batters && selectedTop20.batters.length >= 10)
    ? selectedTop20.batters.slice(0, 10)
    : FALLBACK_BATTERS;

  const bowlersList: PlayerOverview[] = (selectedTop20?.bowlers && selectedTop20.bowlers.length >= 10)
    ? selectedTop20.bowlers.slice(0, 10)
    : FALLBACK_BOWLERS;

  const currentList = activeCategory === 'batters' ? battersList : bowlersList;
  const featuredPlayer = currentList[featuredIndex] || currentList[0];

  // Reset featured index to 0 when category changes
  const handleCategoryChange = (category: 'batters' | 'bowlers') => {
    setActiveCategory(category);
    setFeaturedIndex(0);
    setShowExtendedStats(false);
  };

  // Keyboard navigation: ArrowLeft / ArrowRight to cycle players
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setFeaturedIndex(prev => (prev > 0 ? prev - 1 : currentList.length - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setFeaturedIndex(prev => (prev < currentList.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentList.length]);

  // Keep carousel item centered horizontally inside carousel container only (never scroll window vertically)
  useEffect(() => {
    if (!carouselRef.current) return;
    const carousel = carouselRef.current;
    const activeItem = carousel.children[featuredIndex] as HTMLElement;
    if (activeItem) {
      const targetScrollLeft = activeItem.offsetLeft - (carousel.clientWidth / 2) + (activeItem.clientWidth / 2);
      carousel.scrollTo({
        left: targetScrollLeft,
        behavior: 'smooth'
      });
    }
  }, [featuredIndex]);

  // Generate automated analytical narrative snippet from stats
  const getPlayerNarrative = (player: PlayerOverview) => {
    if (player.role === 'Batter') {
      const srUplift = player.sr_uplift ?? 0;
      const boundaryRate = player.pressure_boundary_rate ?? 0;
      const sr = player.pressure_sr ?? 0;
      return srUplift > 35
        ? `Surges +${srUplift.toFixed(1)} SR above baseline in critical overs. Combines a blistering ${sr.toFixed(0)} pressure strike-rate with a ${boundaryRate.toFixed(1)}% boundary frequency under high win-expectancy volatility.`
        : `Demonstrates elite clutch finishing with a +${srUplift.toFixed(1)} SR delta. Features ${player.pressure_legal_balls} legal deliveries under pressure with ${player.reliability_pct.toFixed(0)}% model reliability.`;
    } else {
      const econImp = player.economy_improvement ?? 0;
      const econ = player.pressure_economy ?? 0;
      const dotPct = player.dot_ball_rate ?? 0;
      return econImp > 1.2
        ? `Stifles opponents to just ${econ.toFixed(2)} RPO in crunch overs (-${econImp.toFixed(2)} vs baseline). Generates ${dotPct.toFixed(1)}% dot balls to decisively halt run chases.`
        : `Maintains supreme control in high-leverage overs with a ${econ.toFixed(2)} pressure economy. Validated across ${player.pressure_matches} matches and ${player.pressure_legal_balls} pressure deliveries.`;
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex flex-col justify-between overflow-hidden">
      {/* Dynamic Background Atmosphere - Rajasthan Royals Royal Stadium Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(234,26,136,0.22),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_85%_35%,rgba(0,75,160,0.18),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_15%_75%,rgba(229,169,60,0.12),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#004ba00a_1px,transparent_1px),linear-gradient(to_bottom,#ea1a880a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Main Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-6 w-full z-10 flex flex-col space-y-6">
        
        {/* ============================================================== */}
        {/* 1. HERO HEADER: THE PRESSURE ELITE */}
        {/* ============================================================== */}
        <div className="text-center pt-2">
          {/* Official Rajasthan Royals Hackathon Banner */}
          <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-[#12081f]/95 border border-rr-pink/60 backdrop-blur-md mb-4 shadow-lg shadow-rr-pink/30 animate-fade-in">
            <img 
              src="/rr-logo.png" 
              alt="Rajasthan Royals" 
              className="h-4 sm:h-5 w-auto object-contain filter drop-shadow-[0_0_8px_rgba(234,26,136,0.7)]" 
            />
            <span className="text-slate-600">|</span>
            <span className="text-xs font-mono font-bold tracking-widest text-slate-100 flex items-center space-x-1.5">
              <span>HALLA BOL</span>
              <span className="text-rr-pink">ROYALS ANALYTICS</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-xs font-mono text-rr-gold font-bold">SUPERR SELECTOR S2</span>
          </div>

          {/* Core Title & Subtitles per prompt specification */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-black tracking-tight text-white uppercase leading-none drop-shadow-[0_0_35px_rgba(234,26,136,0.35)]">
            THE <span className="bg-gradient-to-r from-rr-pink via-[#ff3b9e] to-rose-400 bg-clip-text text-transparent">PRESSURE ELITE</span>
          </h1>
          <h2 className="text-lg sm:text-2xl font-display font-bold tracking-wider text-slate-200 uppercase mt-2">
            20 PLAYERS. ONE PERFORMANCE STANDARD.
          </h2>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 font-sans leading-relaxed mt-2">
            "Discover the batters and bowlers who deliver when the pressure is highest."
          </p>
        </div>

        {/* ============================================================== */}
        {/* 2. CATEGORY TOGGLE (TOP 10 BATTERS vs TOP 10 BOWLERS) */}
        {/* ============================================================== */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 border-b border-rr-pink/30 pb-4">
          {/* Prominent Toggle Buttons */}
          <div className="w-full sm:w-auto flex items-center justify-between bg-[#090b1c]/90 p-1 sm:p-1.5 rounded-2xl border border-rr-pink/30 shadow-inner shadow-rr-pink/10">
            <button
              onClick={() => handleCategoryChange('batters')}
              className={`flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 sm:space-x-2 px-3 py-2 sm:px-6 sm:py-2.5 rounded-xl font-display font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 ${
                activeCategory === 'batters'
                  ? 'bg-gradient-to-r from-rr-pink via-rose-500 to-rr-darkPink text-white shadow-xl shadow-rr-pink/40 border border-white/20 scale-100'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-rr-pink/10'
              }`}
            >
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 flex-shrink-0" />
              <span>TOP 10 BATTERS</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono ${
                activeCategory === 'batters' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                10
              </span>
            </button>

            <button
              onClick={() => handleCategoryChange('bowlers')}
              className={`flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 sm:space-x-2 px-3 py-2 sm:px-6 sm:py-2.5 rounded-xl font-display font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 ${
                activeCategory === 'bowlers'
                  ? 'bg-gradient-to-r from-rr-pink via-rose-500 to-rr-darkPink text-white shadow-xl shadow-rr-pink/40 border border-white/20 scale-100'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-rr-pink/10'
              }`}
            >
              <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-300 flex-shrink-0" />
              <span>TOP 10 BOWLERS</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono ${
                activeCategory === 'bowlers' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                10
              </span>
            </button>
          </div>

          {/* Category Header Label with Active Indicator & Audit Button */}
          <div className="w-full sm:w-auto flex flex-wrap items-center justify-between sm:justify-start gap-2 sm:gap-3 text-xs font-mono">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 uppercase tracking-widest text-[11px] sm:text-xs">
                {activeCategory === 'batters' ? 'BATTERS (10)' : 'BOWLERS (10)'}
              </span>
              <span className="w-2 h-2 rounded-full bg-rr-pink shadow-md shadow-rr-pink/50 animate-pulse" />
              <span className="text-slate-200 font-semibold text-[11px] sm:text-xs">
                #{featuredPlayer.official_rank} ({featuredIndex + 1}/10)
              </span>
            </div>

            <button
              onClick={() => setIsAuditModalOpen(true)}
              className="px-2.5 sm:px-3 py-1 rounded-lg bg-[#0e1628] border border-rr-pink/40 hover:bg-rr-pink/20 text-slate-200 hover:text-white text-[10px] sm:text-[11px] font-mono font-semibold flex items-center space-x-1 sm:space-x-1.5 transition-all shadow-sm"
              title="Inspect side-by-side verification grid of all 20 authentic player photographs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-rr-pink flex-shrink-0" />
              <span>AUDIT PHOTOS</span>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. MAIN FEATURED PLAYER 3D SHOWCASE (~45-50% Visual Area) */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-center rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#12081f]/85 via-[#080d1e]/90 to-[#040816]/95 border-2 border-rr-pink/40 backdrop-blur-2xl p-3.5 sm:p-6 lg:p-8 shadow-2xl shadow-rr-pink/15 relative overflow-hidden min-h-0 sm:min-h-[580px] lg:min-h-[640px]">
          
          {/* Vibrant Rajasthan Royals Pink Accent Glows Behind Player */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-rr-pink/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -top-10 -right-10 w-80 h-80 bg-rr-pink/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-rr-gold/15 rounded-full blur-3xl pointer-events-none" />

          {/* LEFT: Player Character Showcase (45-50% visual width) */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative min-h-[460px] sm:min-h-[580px] w-full">
            {/* Quick-switch arrow overlay */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setFeaturedIndex(prev => (prev > 0 ? prev - 1 : currentList.length - 1));
              }}
              className="absolute left-1 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-slate-900/80 border border-white/10 text-slate-300 hover:text-white hover:border-rr-pink/50 hover:bg-slate-800 transition-all shadow-xl backdrop-blur-md focus:outline-none"
              title="Previous player (←)"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setFeaturedIndex(prev => (prev < currentList.length - 1 ? prev + 1 : 0));
              }}
              className="absolute right-1 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-slate-900/80 border border-white/10 text-slate-300 hover:text-white hover:border-rr-pink/50 hover:bg-slate-800 transition-all shadow-xl backdrop-blur-md focus:outline-none"
              title="Next player (→)"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Standardized Player Showcase Container */}
            <div className="w-full h-[460px] sm:h-[580px] relative flex items-center justify-center">
              <PlayerShowcaseCharacter
                key={`${featuredPlayer.player_id}-${featuredPlayer.role}`}
                playerImage={getPlayerImage(featuredPlayer.name)}
                name={featuredPlayer.name}
                role={featuredPlayer.role}
                rank={featuredPlayer.official_rank}
                ppiScore={featuredPlayer.ppi_score}
                teams={featuredPlayer.teams}
                className="w-full h-full"
              />
            </div>
          </div>

          {/* RIGHT: Featured Player Stats & Intelligence (50-55% width) */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-5 z-20">
            
            {/* Identity & Teams Header */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {featuredPlayer.teams.map(t => (
                  <span 
                    key={t}
                    className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold tracking-wider bg-slate-900 border border-white/10 text-slate-300 uppercase"
                  >
                    {t}
                  </span>
                ))}
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono text-slate-400 bg-slate-950 border border-slate-800">
                  {featuredPlayer.role === 'Batter' ? 'Specialist Finisher' : 'Leverage Bowler'}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20">
                  Official Shortlist
                </span>
              </div>

              <div className="min-h-[2.5rem] sm:min-h-[4rem] flex items-center">
                <h3 className="text-2xl sm:text-4xl lg:text-5xl font-display font-black text-white tracking-tight leading-tight">
                  {featuredPlayer.name}
                </h3>
              </div>
            </div>

            {/* Large PPI Score Card with Animated Progress Meter */}
            <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#1a0a28]/95 via-[#0e132b]/95 to-[#070b1a]/95 border-2 border-rr-pink/50 relative overflow-hidden flex items-center justify-between shadow-2xl shadow-rr-pink/20">
              <div className="space-y-0.5 sm:space-y-1">
                <span className="text-[10px] sm:text-[11px] font-mono text-rr-pink uppercase tracking-widest block font-bold">
                  PRESSURE PERFORMANCE INDEX
                </span>
                <div className="flex items-baseline space-x-1.5 sm:space-x-2">
                  <span className="text-3xl sm:text-5xl font-display font-black bg-gradient-to-r from-white via-pink-100 to-rr-pink bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(234,26,136,0.3)]">
                    {featuredPlayer.ppi_score.toFixed(2)}
                  </span>
                  <span className="text-xs sm:text-base font-mono text-slate-400 font-bold">/ 100.00</span>
                </div>
                <p className="text-[11px] sm:text-xs font-mono text-slate-300">
                  Reliability ({featuredPlayer.reliability_pct.toFixed(1)}%) • Rank #{featuredPlayer.official_rank}
                </p>
              </div>

              {/* Circular Radial Meter with Royals Pink Arc */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {/* Track */}
                  <path
                    className="text-slate-800/80"
                    strokeWidth="3.2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Meter fill */}
                  <path
                    className={featuredPlayer.official_rank === 1 ? "text-amber-400" : "text-rr-pink"}
                    strokeDasharray={`${featuredPlayer.ppi_score}, 100`}
                    strokeWidth="3.4"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[11px] sm:text-xs font-mono font-bold text-white drop-shadow">
                    {featuredPlayer.ppi_score.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            {/* 3 Primary Directly-Visible Performance Statistics */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {featuredPlayer.role === 'Batter' ? (
                <>
                  <div className="p-2.5 sm:p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-0.5 sm:space-y-1">
                    <span className="text-[8.5px] sm:text-[10px] font-mono text-slate-400 uppercase tracking-widest block truncate">
                      PRESSURE SR
                    </span>
                    <span className="text-base sm:text-2xl font-display font-black text-white block">
                      {featuredPlayer.pressure_sr?.toFixed(1) ?? '184.2'}
                    </span>
                    <span className="text-[9.5px] sm:text-[11px] font-mono text-emerald-400 block font-bold truncate">
                      {featuredPlayer.sr_uplift && featuredPlayer.sr_uplift > 0 ? `+${featuredPlayer.sr_uplift.toFixed(1)}` : '0.0'} vs Base
                    </span>
                  </div>

                  <div className="p-2.5 sm:p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-0.5 sm:space-y-1">
                    <span className="text-[8.5px] sm:text-[10px] font-mono text-slate-400 uppercase tracking-widest block truncate">
                      BOUNDARY %
                    </span>
                    <span className="text-base sm:text-2xl font-display font-black text-amber-300 block">
                      {featuredPlayer.pressure_boundary_rate ? `${featuredPlayer.pressure_boundary_rate.toFixed(1)}%` : '22.5%'}
                    </span>
                    <span className="text-[9.5px] sm:text-[11px] font-mono text-slate-400 block truncate">
                      {featuredPlayer.boundary_uplift && featuredPlayer.boundary_uplift > 0 ? `+${featuredPlayer.boundary_uplift.toFixed(1)}%` : 'High Lev'}
                    </span>
                  </div>

                  <div className="p-2.5 sm:p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-0.5 sm:space-y-1">
                    <span className="text-[8.5px] sm:text-[10px] font-mono text-slate-400 uppercase tracking-widest block truncate">
                      RELIABILITY
                    </span>
                    <span className="text-base sm:text-2xl font-display font-black text-rr-pink block">
                      {featuredPlayer.reliability_pct.toFixed(0)}%
                    </span>
                    <span className="text-[9.5px] sm:text-[11px] font-mono text-slate-400 block truncate">
                      {featuredPlayer.pressure_legal_balls} Balls
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2.5 sm:p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-0.5 sm:space-y-1">
                    <span className="text-[8.5px] sm:text-[10px] font-mono text-slate-400 uppercase tracking-widest block truncate">
                      PRESSURE ECON
                    </span>
                    <span className="text-base sm:text-2xl font-display font-black text-white block">
                      {featuredPlayer.pressure_economy?.toFixed(2) ?? '7.12'}
                    </span>
                    <span className="text-[9.5px] sm:text-[11px] font-mono text-emerald-400 block font-bold truncate">
                      {featuredPlayer.economy_improvement && featuredPlayer.economy_improvement > 0 ? `-${featuredPlayer.economy_improvement.toFixed(2)}` : '0.0'} under
                    </span>
                  </div>

                  <div className="p-2.5 sm:p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-0.5 sm:space-y-1">
                    <span className="text-[8.5px] sm:text-[10px] font-mono text-slate-400 uppercase tracking-widest block truncate">
                      DOT BALL %
                    </span>
                    <span className="text-base sm:text-2xl font-display font-black text-cyan-300 block">
                      {featuredPlayer.dot_ball_rate ? `${featuredPlayer.dot_ball_rate.toFixed(1)}%` : '42.0%'}
                    </span>
                    <span className="text-[9.5px] sm:text-[11px] font-mono text-slate-400 block truncate">
                      {featuredPlayer.pressure_wickets_per_100 ? `${featuredPlayer.pressure_wickets_per_100.toFixed(1)} Wkts` : 'Leverage'}
                    </span>
                  </div>

                  <div className="p-2.5 sm:p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-0.5 sm:space-y-1">
                    <span className="text-[8.5px] sm:text-[10px] font-mono text-slate-400 uppercase tracking-widest block truncate">
                      RELIABILITY
                    </span>
                    <span className="text-base sm:text-2xl font-display font-black text-rr-pink block">
                      {featuredPlayer.reliability_pct.toFixed(0)}%
                    </span>
                    <span className="text-[9.5px] sm:text-[11px] font-mono text-slate-400 block truncate">
                      {featuredPlayer.pressure_legal_balls} Balls
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Analytical Narrative Box with Royals Pink Accents */}
            <div className="p-3 sm:p-3.5 rounded-xl bg-[#140b24]/80 border-l-4 border-l-rr-pink border-t border-r border-b border-rr-pink/25 text-xs text-slate-200 leading-relaxed font-sans min-h-[72px] sm:min-h-[84px] flex flex-col justify-center shadow-md shadow-rr-pink/5">
              <span className="text-[9.5px] sm:text-[10px] font-mono text-rr-pink font-bold uppercase tracking-wider block mb-1">
                ROYALS ANALYTICAL ASSESSMENT
              </span>
              <p>{getPlayerNarrative(featuredPlayer)}</p>
            </div>

            {/* Compact Expandable Metrics Section */}
            <div>
              <button
                onClick={() => setShowExtendedStats(!showExtendedStats)}
                className="text-xs font-mono text-slate-400 hover:text-rr-pink flex items-center space-x-1.5 transition-colors focus:outline-none"
              >
                <span>{showExtendedStats ? '▾ Hide Additional Metrics' : '▸ View Extended Telemetry (Dismissal Rate, Baseline, Balls)'}</span>
              </button>

              {showExtendedStats && (
                <div className="mt-3 p-3 sm:p-3.5 rounded-xl bg-[#090e21] border border-rr-pink/30 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs font-mono animate-fade-in shadow-inner">
                  <div>
                    <span className="text-slate-400 block text-[10px]">PRESSURE MATCHES</span>
                    <span className="text-white font-bold">{featuredPlayer.pressure_matches} Games</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">RECENT APPS</span>
                    <span className="text-white font-bold">{featuredPlayer.recent_appearances} (2023–24)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">
                      {featuredPlayer.role === 'Batter' ? 'BASELINE SR' : 'BASELINE ECON'}
                    </span>
                    <span className="text-white font-bold">
                      {featuredPlayer.role === 'Batter' 
                        ? (featuredPlayer.baseline_sr?.toFixed(1) ?? '140.0')
                        : (featuredPlayer.baseline_economy?.toFixed(2) ?? '8.50')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">
                      {featuredPlayer.role === 'Batter' ? 'DISMISSAL RATE' : 'WKTS / 100'}
                    </span>
                    <span className="text-white font-bold">
                      {featuredPlayer.role === 'Batter'
                        ? `${featuredPlayer.pressure_dismissal_rate?.toFixed(2) ?? '3.5'}%`
                        : `${featuredPlayer.pressure_wickets_per_100?.toFixed(1) ?? '5.0'}`}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Primary Action Buttons - Mobile Responsive Stack */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-2">
              <button
                onClick={() => onSelectPlayer && onSelectPlayer(featuredPlayer.player_id, featuredPlayer.role)}
                className="w-full sm:flex-1 min-w-0 flex items-center justify-center space-x-2 px-4 sm:px-5 py-3 rounded-xl bg-gradient-to-r from-rr-pink via-rose-500 to-rr-darkPink hover:brightness-110 text-white font-bold text-xs sm:text-sm shadow-xl shadow-rr-pink/35 hover:scale-[1.01] active:scale-[0.99] transition-all border border-white/20"
              >
                <Activity className="w-4 h-4 text-white flex-shrink-0" />
                <span className="truncate">DEEP DIVE COMPLETE DOSSIER</span>
                <ExternalLink className="w-4 h-4 ml-1 opacity-80 flex-shrink-0" />
              </button>

              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3">
                <button
                  onClick={onExploreSelected}
                  className="flex items-center justify-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl glass-panel hover:bg-rr-pink/15 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm border border-rr-pink/30 transition-all hover:scale-[1.01]"
                >
                  <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 flex-shrink-0" />
                  <span>ARENA MATRIX</span>
                </button>

                <button
                  onClick={onAnalyzeAny}
                  className="flex items-center justify-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl glass-panel hover:bg-rr-pink/15 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm border border-rr-pink/30 transition-all hover:scale-[1.01]"
                >
                  <Cpu className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-300 flex-shrink-0" />
                  <span>SEARCH ANY</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 4. SUPPORTING PLAYER CAROUSEL (All 10 Players Accessible) */}
        {/* ============================================================== */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rr-pink shadow-md shadow-rr-pink/50 animate-pulse" />
              <h3 className="text-xs sm:text-sm font-display font-bold uppercase tracking-wider text-slate-200">
                EXPLORE ALL {activeCategory.toUpperCase()} ({currentList.length} PROFILES)
              </h3>
            </div>
            <span className="text-[11px] sm:text-xs font-mono text-slate-400">
              Click any card to load into 3D view
            </span>
          </div>

          {/* Horizontal Scrollable Carousel with Mobile Bleed */}
          <div 
            ref={carouselRef}
            className="-mx-4 px-4 sm:mx-0 sm:px-0 flex items-center space-x-2.5 sm:space-x-3 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-rr-pink/30 scrollbar-track-transparent scroll-smooth focus:outline-none"
            tabIndex={0}
          >
            {currentList.map((player, idx) => {
              const isSelected = idx === featuredIndex;
              const isRank1 = player.official_rank === 1;

              return (
                <div
                  key={player.player_id}
                  onClick={() => setFeaturedIndex(idx)}
                  className={`flex-shrink-0 w-44 sm:w-56 p-3 sm:p-3.5 rounded-2xl cursor-pointer transition-all duration-200 relative group select-none ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#250d38] to-[#0c1228] border-2 border-rr-pink shadow-xl shadow-rr-pink/30 scale-[1.02]'
                      : 'bg-[#080d1d]/80 border border-white/10 hover:border-rr-pink/40 hover:bg-[#150a24]/60'
                  }`}
                >
                  {/* Top Rank Badge & PPI */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase border ${
                      isRank1
                        ? 'bg-amber-500/25 border-amber-500/50 text-amber-300'
                        : isSelected
                        ? 'bg-rr-pink/30 border-rr-pink text-white shadow-sm shadow-rr-pink/40'
                        : 'bg-slate-800 border-pitch-border text-slate-400'
                    }`}>
                      #{player.official_rank}
                    </span>

                    <span className="text-xs font-mono font-bold text-white">
                      {player.ppi_score.toFixed(1)} <span className="text-slate-500 font-normal">PPI</span>
                    </span>
                  </div>

                  {/* Player Real Photo & Identity */}
                  <div className="flex items-center space-x-3 mb-2.5">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-900/90 border border-white/10 flex-shrink-0 flex items-center justify-center p-0.5">
                      {getPlayerImage(player.name) ? (
                        <img 
                          src={getPlayerImage(player.name)} 
                          alt={player.name}
                          className="w-full h-full object-contain filter brightness-100"
                        />
                      ) : (
                        <span className="text-xs font-mono font-bold text-rr-pink">
                          {player.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-display font-bold text-white truncate group-hover:text-rr-pink transition-colors">
                        {player.name}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400 block truncate">
                        {player.teams.join(' • ')}
                      </span>
                    </div>
                  </div>

                  {/* Key Differentiator Stat */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-500">
                      {player.role === 'Batter' ? 'SR UPLIFT' : 'ECONOMY'}
                    </span>
                    <span className={`font-bold ${
                      player.role === 'Batter' ? 'text-emerald-400' : 'text-cyan-400'
                    }`}>
                      {player.role === 'Batter'
                        ? (player.sr_uplift && player.sr_uplift > 0 ? `+${player.sr_uplift.toFixed(1)}` : 'N/A')
                        : (player.pressure_economy ? `${player.pressure_economy.toFixed(2)} RPO` : 'N/A')}
                    </span>
                  </div>

                  {/* Selection Indicator Glow */}
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rr-pink animate-ping" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ============================================================== */}
      {/* 5. TELEMETRY COUNTER STRIP (Preserved & Enhanced) */}
      {/* ============================================================== */}
      <div className="relative border-t border-pitch-border bg-slate-950/90 backdrop-blur-xl py-6 z-10 mt-4">
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

      {/* Side-by-Side Visual Image Audit Modal */}
      <PlayerImageAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />
    </div>
  );
};
