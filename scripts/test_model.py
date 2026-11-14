import pandas as pd
import numpy as np

data_dir = r"C:\Users\sumed\.gemini\antigravity\scratch\superr-selector\data"
bbb = pd.read_csv(f"{data_dir}/ball_by_ball.csv")
matches = pd.read_csv(f"{data_dir}/matches.csv")
comps = pd.read_csv(f"{data_dir}/competitions.csv")
p11 = pd.read_csv(f"{data_dir}/playing_eleven.csv")

# 1. Identify IPL and T20I competitions
# Scope: IPL and T20I
comps["is_ipl"] = comps["comp_name"].str.contains("IPL|Indian Premier League", case=False, na=False)
comps["is_t20i"] = comps["match_format"] == "T20I"

# Filter matches to IPL and T20I
valid_comps = comps[comps["is_ipl"] | comps["is_t20i"]]
matches_scoped = matches[matches["comp_id"].isin(valid_comps["comp_id"])].copy()

# 2. Opponent win rate in T20I
t20i_comps = set(comps[comps["is_t20i"]]["comp_id"])
t20i_matches = matches[matches["comp_id"].isin(t20i_comps)]

t20i_played = {}
t20i_won = {}

for _, row in t20i_matches.iterrows():
    h = row["home_team_id"]
    a = row["away_team_id"]
    w = row["win_team_id"]
    for t in [h, a]:
        if pd.notna(t):
            t = int(t)
            t20i_played[t] = t20i_played.get(t, 0) + 1
    if pd.notna(w) and int(w) > 0:
        w = int(w)
        t20i_won[w] = t20i_won.get(w, 0) + 1

t20i_win_rate = {}
for t in t20i_played:
    t20i_win_rate[t] = t20i_won.get(t, 0) / t20i_played[t]

print(f"Computed T20I win rates for {len(t20i_win_rate)} teams.")

# Merge match & comp info into bbb
match_meta = matches_scoped.set_index("match_id")[["comp_id", "first_inn_revised_overs", "second_inn_revised_overs", "revised_target", "win_team_id"]].to_dict("index")
comp_meta = valid_comps.set_index("comp_id")[["is_ipl", "is_t20i"]].to_dict("index")

bbb_scoped = bbb[bbb["match_id"].isin(match_meta)].copy()
print(f"Scoped balls: {len(bbb_scoped)}")

