// Central registry of standardized full-body player character images
export const STANDARDIZED_PLAYER_IMAGES: Record<string, string> = {
  // Top 10 Batters
  'donovan ferreira': '/players/standardized/donovan_ferreira.png',
  'shashank singh': '/players/standardized/shashank_singh.png',
  'ashutosh sharma': '/players/standardized/ashutosh_sharma.png',
  'sikandar raza': '/players/standardized/sikandar_raza.png',
  'towhid hridoy': '/players/standardized/towhid_hridoy.png',
  'tristan stubbs': '/players/standardized/tristan_stubbs.png',
  'david miller': '/players/standardized/david_miller.png',
  'naman dhir': '/players/standardized/naman_dhir.png',
  'rinku singh': '/players/standardized/rinku_singh.png',
  'jason holder': '/players/standardized/jason_holder.png',

  // Top 10 Bowlers
  'akeal hosein': '/players/standardized/akeal_hosein.png',
  'mohammad rishad hossain': '/players/standardized/mohammad_rishad_hossain.png',
  'rishad hossain': '/players/standardized/mohammad_rishad_hossain.png',
  'sunil narine': '/players/standardized/sunil_narine.png',
  'eshan malinga': '/players/standardized/eshan_malinga.png',
  'corbin bosch': '/players/standardized/corbin_bosch.png',
  'mitchell santner': '/players/standardized/mitchell_santner.png',
  'jasprit bumrah': '/players/standardized/jasprit_bumrah.png',
  'taskin ahmed': '/players/standardized/taskin_ahmed.png',
  'roston chase': '/players/standardized/roston_chase.png',
  'harshit rana': '/players/standardized/harshit_rana.png',
};

export function getPlayerImage(name?: string): string {
  if (!name) return '/players/standardized/donovan_ferreira.png';
  const key = name.toLowerCase().trim();
  if (STANDARDIZED_PLAYER_IMAGES[key]) return STANDARDIZED_PLAYER_IMAGES[key];

  // Try substring matching
  for (const [k, v] of Object.entries(STANDARDIZED_PLAYER_IMAGES)) {
    if (key.includes(k) || k.includes(key)) {
      return v;
    }
  }
  return '/players/standardized/donovan_ferreira.png';
}
