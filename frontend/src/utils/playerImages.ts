// Verified authentic player photographs mapping
export interface PlayerImageInfo {
  name: string;
  imagePath: string;
  isTransparentCutout: boolean;
  source: string;
  team: string;
  role: 'Batter' | 'Bowler';
  rank: number;
}

export const AUTHENTIC_PLAYERS: Record<string, PlayerImageInfo> = {
  // Top 10 Batters
  'donovan ferreira': {
    name: 'Donovan Ferreira',
    imagePath: '/players/donovan_ferreira.png',
    isTransparentCutout: true,
    source: 'Rajasthan Royals Official Roster Cutout',
    team: 'RR',
    role: 'Batter',
    rank: 1
  },
  'shashank singh': {
    name: 'Shashank Singh',
    imagePath: '/players/shashank_singh.png',
    isTransparentCutout: true,
    source: 'Punjab Kings Official Roster Cutout',
    team: 'PBKS',
    role: 'Batter',
    rank: 2
  },
  'ashutosh sharma': {
    name: 'Ashutosh Sharma',
    imagePath: '/players/ashutosh_sharma.png',
    isTransparentCutout: true,
    source: 'Punjab Kings Official Roster Cutout',
    team: 'PBKS',
    role: 'Batter',
    rank: 3
  },
  'sikandar raza': {
    name: 'Sikandar Raza',
    imagePath: '/players/sikandar_raza.jpg',
    isTransparentCutout: false,
    source: 'Official Zimbabwe T20 Photograph',
    team: 'PBKS / ZIM',
    role: 'Batter',
    rank: 4
  },
  'towhid hridoy': {
    name: 'Towhid Hridoy',
    imagePath: '/players/towhid_hridoy.jpg',
    isTransparentCutout: false,
    source: 'Official Bangladesh T20 Photograph',
    team: 'BAN',
    role: 'Batter',
    rank: 5
  },
  'tristan stubbs': {
    name: 'Tristan Stubbs',
    imagePath: '/players/tristan_stubbs.png',
    isTransparentCutout: true,
    source: 'Delhi Capitals Official Roster Cutout',
    team: 'DC',
    role: 'Batter',
    rank: 6
  },
  'david miller': {
    name: 'David Miller',
    imagePath: '/players/david_miller.png',
    isTransparentCutout: true,
    source: 'Official South Africa / GT Photograph',
    team: 'GT / SA',
    role: 'Batter',
    rank: 7
  },
  'naman dhir': {
    name: 'Naman Dhir',
    imagePath: '/players/naman_dhir.png',
    isTransparentCutout: true,
    source: 'Mumbai Indians Official Roster Cutout',
    team: 'MI',
    role: 'Batter',
    rank: 8
  },
  'rinku singh': {
    name: 'Rinku Singh',
    imagePath: '/players/rinku_singh.png',
    isTransparentCutout: true,
    source: 'Kolkata Knight Riders Official Roster Cutout',
    team: 'KKR',
    role: 'Batter',
    rank: 9
  },
  'jason holder': {
    name: 'Jason Holder',
    imagePath: '/players/jason_holder.jpg',
    isTransparentCutout: false,
    source: 'Official West Indies T20 Photograph',
    team: 'RR / WI',
    role: 'Batter',
    rank: 10
  },

  // Top 10 Bowlers
  'akeal hosein': {
    name: 'Akeal Hosein',
    imagePath: '/players/akeal_hosein.png',
    isTransparentCutout: true,
    source: 'ICC Official Roster Profile Cutout',
    team: 'WI / SRH',
    role: 'Bowler',
    rank: 1
  },
  'mohammad rishad hossain': {
    name: 'Mohammad Rishad Hossain',
    imagePath: '/players/mohammad_rishad_hossain.jpg',
    isTransparentCutout: false,
    source: 'Official Bangladesh Cricket Photograph',
    team: 'BAN',
    role: 'Bowler',
    rank: 2
  },
  'rishad hossain': {
    name: 'Mohammad Rishad Hossain',
    imagePath: '/players/mohammad_rishad_hossain.jpg',
    isTransparentCutout: false,
    source: 'Official Bangladesh Cricket Photograph',
    team: 'BAN',
    role: 'Bowler',
    rank: 2
  },
  'sunil narine': {
    name: 'Sunil Narine',
    imagePath: '/players/sunil_narine.png',
    isTransparentCutout: true,
    source: 'Kolkata Knight Riders Official Roster Cutout',
    team: 'KKR',
    role: 'Bowler',
    rank: 3
  },
  'eshan malinga': {
    name: 'Eshan Malinga',
    imagePath: '/players/eshan_malinga.png',
    isTransparentCutout: true,
    source: 'Paarl Royals Official Roster Cutout',
    team: 'Paarl Royals / SL',
    role: 'Bowler',
    rank: 4
  },
  'corbin bosch': {
    name: 'Corbin Bosch',
    imagePath: '/players/corbin_bosch.jpg',
    isTransparentCutout: false,
    source: 'Rajasthan Royals Official Media Photograph',
    team: 'RR / SA',
    role: 'Bowler',
    rank: 5
  },
  'mitchell santner': {
    name: 'Mitchell Santner',
    imagePath: '/players/mitchell_santner.png',
    isTransparentCutout: true,
    source: 'Mumbai Indians Official Action Cutout',
    team: 'CSK / NZ',
    role: 'Bowler',
    rank: 6
  },
  'jasprit bumrah': {
    name: 'Jasprit Bumrah',
    imagePath: '/players/jasprit_bumrah.png',
    isTransparentCutout: true,
    source: 'Mumbai Indians Official Action Cutout',
    team: 'MI / IND',
    role: 'Bowler',
    rank: 7
  },
  'taskin ahmed': {
    name: 'Taskin Ahmed',
    imagePath: '/players/taskin_ahmed.jpg',
    isTransparentCutout: false,
    source: 'Official Bangladesh Cricket Photograph',
    team: 'BAN',
    role: 'Bowler',
    rank: 8
  },
  'roston chase': {
    name: 'Roston Chase',
    imagePath: '/players/roston_chase.jpg',
    isTransparentCutout: false,
    source: 'Official West Indies Match Photograph',
    team: 'WI',
    role: 'Bowler',
    rank: 9
  },
  'harshit rana': {
    name: 'Harshit Rana',
    imagePath: '/players/harshit_rana.png',
    isTransparentCutout: true,
    source: 'Kolkata Knight Riders Official Roster Cutout',
    team: 'KKR',
    role: 'Bowler',
    rank: 10
  }
};

export function getPlayerImageInfo(name?: string): PlayerImageInfo | null {
  if (!name) return null;
  const key = name.toLowerCase().trim();
  if (AUTHENTIC_PLAYERS[key]) return AUTHENTIC_PLAYERS[key];

  for (const [k, v] of Object.entries(AUTHENTIC_PLAYERS)) {
    if (key.includes(k) || k.includes(key)) {
      return v;
    }
  }
  return null;
}

export function getPlayerImage(name?: string): string {
  const info = getPlayerImageInfo(name);
  return info ? info.imagePath : '/players/donovan_ferreira.png';
}

export function getAllAuthenticPlayersList(): PlayerImageInfo[] {
  // Return deduped list of 20 players in order
  const seen = new Set<string>();
  const list: PlayerImageInfo[] = [];
  for (const info of Object.values(AUTHENTIC_PLAYERS)) {
    if (!seen.has(info.name)) {
      seen.add(info.name);
      list.push(info);
    }
  }
  return list;
}
