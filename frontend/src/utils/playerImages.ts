// Central registry of verified real player images
export const PLAYER_IMAGES: Record<string, string> = {
  // Top 10 Batters
  'donovan ferreira': '/players/donovan_ferreira.png',
  'shashank singh': '/players/shashank_singh.png',
  'ashutosh sharma': '/players/ashutosh_sharma.png',
  'sikandar raza': '/players/sikandar_raza.jpg',
  'towhid hridoy': '/players/towhid_hridoy.jpg',
  'tristan stubbs': '/players/tristan_stubbs.png',
  'david miller': '/players/david_miller.png',
  'naman dhir': '/players/naman_dhir.png',
  'rinku singh': '/players/rinku_singh.png',
  'jason holder': '/players/jason_holder.jpg',

  // Top 10 Bowlers
  'akeal hosein': '/players/akeal_hosein.png',
  'mohammad rishad hossain': '/players/mohammad_rishad_hossain.jpg',
  'rishad hossain': '/players/mohammad_rishad_hossain.jpg',
  'sunil narine': '/players/sunil_narine.png',
  'eshan malinga': '/players/eshan_malinga.png',
  'corbin bosch': '/players/corbin_bosch.jpg',
  'mitchell santner': '/players/mitchell_santner.png',
  'jasprit bumrah': '/players/jasprit_bumrah.png',
  'taskin ahmed': '/players/taskin_ahmed.jpg',
  'roston chase': '/players/roston_chase.jpg',
  'harshit rana': '/players/harshit_rana.png',
};

export function getPlayerImage(name?: string): string | null {
  if (!name) return null;
  const key = name.toLowerCase().trim();
  if (PLAYER_IMAGES[key]) return PLAYER_IMAGES[key];

  // Try substring matching (e.g., "Rishad Hossain" inside "Mohammad Rishad Hossain")
  for (const [k, v] of Object.entries(PLAYER_IMAGES)) {
    if (key.includes(k) || k.includes(key)) {
      return v;
    }
  }
  return null;
}
