export interface PlayerMeta {
  player_id: number;
  name: string;
  role: 'Batter' | 'Bowler' | 'All-Rounder';
  teams: string[];
  recent_matches: number;
  is_eligible: boolean;
}

export interface PlayerOverview {
  player_id: number;
  name: string;
  role: 'Batter' | 'Bowler';
  official_rank: number;
  ppi_score: number;
  recent_appearances: number;
  pressure_matches: number;
  pressure_legal_balls: number;
  reliability_pct: number;
  pressure_sr?: number;
  baseline_sr?: number;
  sr_uplift?: number;
  pressure_boundary_rate?: number;
  boundary_uplift?: number;
  pressure_dismissal_rate?: number;
  pressure_economy?: number;
  baseline_economy?: number;
  economy_improvement?: number;
  pressure_wickets_per_100?: number;
  wicket_improvement?: number;
  dot_ball_rate?: number;
  teams: string[];
}

export interface SelectedTop20 {
  batters: PlayerOverview[];
  bowlers: PlayerOverview[];
}

export interface MatchHistoryItem {
  match_id: number;
  date: string;
  opponent: string;
  format: string;
  pressure_balls: number;
  pressure_runs?: number;
  boundaries?: number;
  dismissed?: boolean;
  sr?: number;
  runs_conceded?: number;
  wickets?: number;
  dots?: number;
  economy?: number;
}

export interface PlayerDetails {
  player_id: number;
  name: string;
  role: 'Batter' | 'Bowler';
  is_eligible: boolean;
  eligibility_reasons: {
    recent_appearances: string;
    pressure_balls: string;
    pressure_matches: string;
    eligible_recent: boolean;
    eligible_sample: boolean;
  };
  rank: number | null;
  ppi_score: number;
  raw_ppi: number;
  reliability_pct: number;
  pressure_balls: number;
  pressure_matches: number;
  recent_appearances: number;
  teams: string[];
  stats: {
    pressure_sr: number;
    baseline_sr: number;
    sr_uplift: number;
    pressure_boundary_rate: number;
    baseline_boundary_rate: number;
    boundary_uplift: number;
    pressure_dismissal_rate: number;
    pressure_economy: number;
    baseline_economy: number;
    economy_improvement: number;
    pressure_wkt_per_100: number;
    baseline_wkt_per_100: number;
    wicket_improvement: number;
    dot_ball_rate: number;
  };
  comp_breakdown: {
    ipl: { pressure_balls: number; metric_val: number };
    t20i: { pressure_balls: number; metric_val: number };
  };
  match_history: MatchHistoryItem[];
  narrative: string;
}

export interface OverviewStats {
  total_players_in_dataset: number;
  total_matches_analysed: number;
  total_deliveries: number;
  pressure_deliveries_batter: number;
  pressure_deliveries_bowler: number;
  eligible_batters_count: number;
  eligible_bowlers_count: number;
  avg_batter_ppi: number;
  avg_bowler_ppi: number;
  activity_window: string;
  dataset_cutoff_date: string;
  competitions_coverage: string[];
  shortlisted_count: number;
}

export interface PressureEvaluationResult {
  is_pressure: boolean;
  is_batter_pressure?: boolean;
  is_bowler_pressure?: boolean;
  mode: string;
  reason: string;
  triggered_conditions: string[];
  metrics: {
    legal_balls_remaining: number;
    runs_remaining?: number;
    crr: number;
    rrr?: number;
    gap?: number;
    wickets_in_hand?: number;
    wickets_lost?: number;
  };
}

export interface SimPlayerResult {
  player_id: number;
  name: string;
  official_rank: number;
  sim_rank: number;
  official_ppi: number;
  sim_ppi: number;
  rank_change: number;
  p_balls: number;
}
