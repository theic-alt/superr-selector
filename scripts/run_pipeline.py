import pandas as pd
import numpy as np
import time

t0 = time.time()
data_dir = r"C:\Users\sumed\.gemini\antigravity\scratch\superr-selector\data"
bbb = pd.read_csv(f"{data_dir}/ball_by_ball.csv")
matches = pd.read_csv(f"{data_dir}/matches.csv")
comps = pd.read_csv(f"{data_dir}/competitions.csv")
p11 = pd.read_csv(f"{data_dir}/playing_eleven.csv")

# 1. Scope: IPL and T20I
comps["is_ipl"] = comps["comp_name"].str.contains("IPL|Indian Premier League", case=False, na=False)
comps["is_t20i"] = comps["match_format"] == "T20I"
valid_comp_ids = set(comps[comps["is_ipl"] | comps["is_t20i"]]["comp_id"])
ipl_comp_ids = set(comps[comps["is_ipl"]]["comp_id"])
t20i_comp_ids = set(comps[comps["is_t20i"]]["comp_id"])

matches_scoped = matches[matches["comp_id"].isin(valid_comp_ids)].copy()
scoped_match_ids = set(matches_scoped["match_id"])
bbb = bbb[bbb["match_id"].isin(scoped_match_ids)].copy()

# Sort deliveries strictly by match, innings, innings_ball_num
bbb.sort_values(by=["match_id", "innings", "innings_ball_num"], inplace=True)
bbb.reset_index(drop=True, inplace=True)

# 2. T20I opponent win rate
t20i_matches = matches[matches["comp_id"].isin(t20i_comp_ids)]
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

t20i_win_rate = {t: t20i_won.get(t, 0) / t20i_played[t] for t in t20i_played}

# 3. Match metadata
match_info = {}
for _, row in matches_scoped.iterrows():
    match_info[row["match_id"]] = {
        "comp_id": row["comp_id"],
        "is_ipl": row["comp_id"] in ipl_comp_ids,
        "is_t20i": row["comp_id"] in t20i_comp_ids,
        "first_revised": row["first_inn_revised_overs"],
        "second_revised": row["second_inn_revised_overs"],
        "revised_target": row["revised_target"]
    }

inn1_runs_map = bbb[bbb["innings"] == 1].groupby("match_id").apply(
    lambda df: (df["runs"] + df["extras1_runs"] + df["extras_2_runs"]).sum(),
    include_groups=False
).to_dict()

for mid, info in match_info.items():
    if pd.notna(info["revised_target"]) and info["revised_target"] > 0:
        info["target"] = float(info["revised_target"])
    elif mid in inn1_runs_map:
        info["target"] = float(inn1_runs_map[mid] + 1)
    else:
        info["target"] = None

# 4. Mark legal ball
bbb["is_illegal"] = bbb["extras_type"].isin(["wide", "Overstep", "other"])
bbb["is_legal"] = ~bbb["is_illegal"]
bbb["ball_runs"] = bbb["runs"] + bbb["extras1_runs"] + bbb["extras_2_runs"]

# Bowler runs conceded: runs + extras unless legbyes/byes/Penalty
bbb["bowler_extras"] = np.where(bbb["extras_type"].isin(["legbyes", "byes", "Penalty"]), 0, bbb["extras1_runs"] + bbb["extras_2_runs"])
bbb["bowler_runs_conceded"] = bbb["runs"] + bbb["bowler_extras"]

# Bowler wicket: is_wicket & dismissal_type in ['Bowled', 'Caught', 'LBW', 'Stump', 'Hit Wicket']
bbb["is_bowler_wicket"] = bbb["is_wicket"] & bbb["dismissal_type"].isin(["Bowled", "Caught", "LBW", "Stump", "Hit Wicket"])
# Striker dismissal: is_wicket & (dismissed_player_id == striker_id | dismissed_player_id is null)
bbb["is_striker_out"] = bbb["is_wicket"] & ((bbb["dismissed_player_id"] == bbb["striker_id"]) | bbb["dismissed_player_id"].isna())
# Bowler dot ball: is_legal & bowler_runs_conceded == 0
bbb["is_dot_ball"] = bbb["is_legal"] & (bbb["bowler_runs_conceded"] == 0)

# Boundary: is_four | is_six
bbb["is_boundary"] = bbb["is_four"] | bbb["is_six"]

print("Computing pre-delivery cumulative sums...")
grouped = bbb.groupby(["match_id", "innings"])
bbb["cum_legal_balls"] = grouped["is_legal"].cumsum() - bbb["is_legal"]
bbb["cum_runs"] = grouped["ball_runs"].cumsum() - bbb["ball_runs"]
bbb["cum_wickets"] = grouped["is_wicket"].cumsum() - bbb["is_wicket"]

# Map match-level limits
m_first_rev = bbb["match_id"].map(lambda m: match_info[m]["first_revised"])
m_second_rev = bbb["match_id"].map(lambda m: match_info[m]["second_revised"])
m_target = bbb["match_id"].map(lambda m: match_info[m]["target"])

ball_limit = np.where(
    bbb["innings"] == 1,
    np.where(m_first_rev.notna() & (m_first_rev > 0), m_first_rev, 120),
    np.where(m_second_rev.notna() & (m_second_rev > 0), m_second_rev, 120)
)
bbb["ball_limit"] = ball_limit
bbb["balls_remaining"] = np.maximum(0, bbb["ball_limit"] - bbb["cum_legal_balls"])
bbb["wickets_in_hand"] = np.maximum(0, 10 - bbb["cum_wickets"])

# CRR = (cum_runs / cum_legal_balls) * 6
bbb["crr"] = np.where(bbb["cum_legal_balls"] > 0, (bbb["cum_runs"] / bbb["cum_legal_balls"]) * 6.0, 0.0)

# For Innings 2: runs_remaining = target - cum_runs
bbb["runs_remaining"] = np.maximum(0, m_target - bbb["cum_runs"])
# RRR = (runs_remaining / balls_remaining) * 6
bbb["rrr"] = np.where(
    bbb["balls_remaining"] > 0,
    (bbb["runs_remaining"] / bbb["balls_remaining"]) * 6.0,
    np.where(bbb["runs_remaining"] > 0, 99.0, 0.0)
)
bbb["rrr_crr_gap"] = bbb["rrr"] - bbb["crr"]

# PRESSURE CONDITIONS:
# Second innings: balls_remaining <= 60 AND (rrr >= 9.5 | wickets_in_hand <= 4 | rrr_crr_gap >= 2.5)
chase_pressure = (bbb["innings"] == 2) & (bbb["balls_remaining"] <= 60) & (
    (bbb["rrr"] >= 9.5) | (bbb["wickets_in_hand"] <= 4) | (bbb["rrr_crr_gap"] >= 2.5)
)

# First innings batter pressure: balls_remaining <= 30 AND cum_wickets >= 5
inn1_batter_pressure = (bbb["innings"] == 1) & (bbb["balls_remaining"] <= 30) & (bbb["cum_wickets"] >= 5)

# First innings bowler pressure: balls_remaining <= 30 AND wickets_in_hand >= 5 AND crr >= 8.0
inn1_bowler_pressure = (bbb["innings"] == 1) & (bbb["balls_remaining"] <= 30) & (bbb["wickets_in_hand"] >= 5) & (bbb["crr"] >= 8.0)

bbb["is_batter_pressure"] = chase_pressure | inn1_batter_pressure
bbb["is_bowler_pressure"] = chase_pressure | inn1_bowler_pressure

# Competition weights
m_is_ipl = bbb["match_id"].map(lambda m: match_info[m]["is_ipl"])
m_is_t20i = bbb["match_id"].map(lambda m: match_info[m]["is_t20i"])

# Batter opponent is bowling_team_id
batter_opp_wr = bbb["bowling_team_id"].map(t20i_win_rate).fillna(0.5)
batter_t20i_w = np.clip(0.85 + 0.60 * batter_opp_wr, 0.85, 1.25)
bbb["batter_weight"] = np.where(m_is_ipl, 1.15, np.where(m_is_t20i, batter_t20i_w, 1.0))

# Bowler opponent is batting_team_id
bowler_opp_wr = bbb["batting_team_id"].map(t20i_win_rate).fillna(0.5)
bowler_t20i_w = np.clip(0.85 + 0.60 * bowler_opp_wr, 0.85, 1.25)
bbb["bowler_weight"] = np.where(m_is_ipl, 1.15, np.where(m_is_t20i, bowler_t20i_w, 1.0))

print(f"State computed in {time.time() - t0:.2f}s.")
print(f"Batter pressure balls: {bbb['is_batter_pressure'].sum()} / {len(bbb)} ({bbb['is_batter_pressure'].mean()*100:.1f}%)")
print(f"Bowler pressure balls: {bbb['is_bowler_pressure'].sum()} / {len(bbb)} ({bbb['is_bowler_pressure'].mean()*100:.1f}%)")

bbb.to_pickle(f"{data_dir}/bbb_processed.pkl")
