import {
  OverviewStats,
  SelectedTop20,
  PlayerDetails,
  PlayerMeta,
  PressureEvaluationResult,
  SimPlayerResult
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? '' : 'http://localhost:8000');

export async function fetchOverview(): Promise<OverviewStats> {
  const res = await fetch(`${API_BASE_URL}/api/overview`);
  if (!res.ok) throw new Error('Failed to fetch overview statistics');
  return res.json();
}

export async function fetchSelectedTop20(): Promise<SelectedTop20> {
  const res = await fetch(`${API_BASE_URL}/api/players/selected`);
  if (!res.ok) throw new Error('Failed to fetch selected Top 20 players');
  return res.json();
}

export async function fetchPlayersList(role: 'batter' | 'bowler', sortBy = 'rank', limit = 50) {
  const res = await fetch(`${API_BASE_URL}/api/players?role=${role}&sort_by=${sortBy}&limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch players list');
  return res.json();
}

export async function searchPlayers(query: string): Promise<PlayerMeta[]> {
  if (!query.trim()) return [];
  const res = await fetch(`${API_BASE_URL}/api/players/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Failed to search players');
  return res.json();
}

export async function fetchPlayerDetails(playerId: number, role?: string): Promise<PlayerDetails> {
  const url = role 
    ? `${API_BASE_URL}/api/players/${playerId}?role=${encodeURIComponent(role)}`
    : `${API_BASE_URL}/api/players/${playerId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch player details');
  return res.json();
}

export async function evaluateLivePressure(params: {
  innings: number;
  balls_remaining: number;
  runs_required?: number;
  runs_scored: number;
  legal_balls_bowled: number;
  wickets_lost: number;
}): Promise<PressureEvaluationResult> {
  const res = await fetch(`${API_BASE_URL}/api/pressure/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error('Failed to evaluate pressure');
  return res.json();
}

export async function simulateWhatIf(params: Record<string, any>): Promise<{ role: string; top10: SimPlayerResult[] }> {
  const res = await fetch(`${API_BASE_URL}/api/model/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error('Failed to run what-if simulation');
  return res.json();
}

export async function fetchMethodology(): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/model/methodology`);
  if (!res.ok) throw new Error('Failed to fetch methodology');
  return res.json();
}
