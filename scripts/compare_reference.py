import pandas as pd
import numpy as np

data_dir = r"C:\Users\sumed\.gemini\antigravity\scratch\superr-selector\data"
bbb = pd.read_pickle(f"{data_dir}/bbb_processed.pkl")
matches = pd.read_csv(f"{data_dir}/matches.csv")
p11 = pd.read_csv(f"{data_dir}/playing_eleven.csv")

matches["match_date"] = pd.to_datetime(matches["match_date"])
recent_mids = set(matches[(matches["match_date"] >= "2026-05-11") & (matches["match_date"] <= "2026-11-11")]["match_id"])
p11_recent = p11[(p11["match_id"].isin(recent_mids)) & (p11["is_played"] == True)]
recent_counts = p11_recent.groupby("player_id")["match_id"].nunique().to_dict()

# Batters
bbb_legal = bbb[bbb["is_legal"]].copy()
p_bat = bbb_legal[bbb_legal["is_batter_pressure"]].copy()
np_bat = bbb_legal[~bbb_legal["is_batter_pressure"]].copy()

p_bat["w_runs"] = p_bat["runs"] * p_bat["batter_weight"]
p_bat["w_balls"] = p_bat["batter_weight"]
p_bat["w_boundary"] = p_bat["is_boundary"] * p_bat["batter_weight"]
p_bat["w_dismissal"] = p_bat["is_striker_out"] * p_bat["batter_weight"]

np_bat["w_runs"] = np_bat["runs"] * np_bat["batter_weight"]
np_bat["w_balls"] = np_bat["batter_weight"]
np_bat["w_boundary"] = np_bat["is_boundary"] * np_bat["batter_weight"]

bat_p_agg = p_bat.groupby("striker_id").agg(
    p_runs=("w_runs", "sum"),
    p_balls_w=("w_balls", "sum"),
    p_balls_raw=("is_legal", "count"),
    p_boundaries=("w_boundary", "sum"),
    p_dismissals=("w_dismissal", "sum"),
    p_matches=("match_id", "nunique"),
    player_name=("striker_name", "first")
)
bat_np_agg = np_bat.groupby("striker_id").agg(
    np_runs=("w_runs", "sum"),
    np_balls_w=("w_balls", "sum"),
    np_boundaries=("w_boundary", "sum")
)
batters = bat_p_agg.join(bat_np_agg, how="left").fillna(0)
batters["recent_matches"] = batters.index.map(lambda pid: recent_counts.get(pid, 0))
batters["is_eligible"] = (batters["recent_matches"] >= 3) & (batters["p_balls_raw"] >= 90) & (batters["p_matches"] >= 8)

batters["pressure_sr"] = (batters["p_runs"] / batters["p_balls_w"]) * 100
batters["pressure_boundary_rate"] = (batters["p_boundaries"] / batters["p_balls_w"]) * 100
batters["pressure_dismissal_rate"] = (batters["p_dismissals"] / batters["p_balls_w"]) * 100
batters["np_sr"] = np.where(batters["np_balls_w"] > 0, (batters["np_runs"] / batters["np_balls_w"]) * 100, batters["pressure_sr"])
batters["np_boundary_rate"] = np.where(batters["np_balls_w"] > 0, (batters["np_boundaries"] / batters["np_balls_w"]) * 100, batters["pressure_boundary_rate"])
batters["sr_uplift"] = batters["pressure_sr"] - batters["np_sr"]
batters["boundary_uplift"] = batters["pressure_boundary_rate"] - batters["np_boundary_rate"]

el_bat = batters[batters["is_eligible"]].copy()
def z_score(series): return (series - series.mean()) / series.std()

el_bat["raw_ppi"] = (
    0.35 * z_score(el_bat["pressure_sr"]) +
    0.20 * z_score(el_bat["pressure_boundary_rate"]) -
    0.15 * z_score(el_bat["pressure_dismissal_rate"]) +
    0.20 * z_score(el_bat["sr_uplift"]) +
    0.10 * z_score(el_bat["boundary_uplift"])
)
el_bat["reliability"] = el_bat["p_balls_raw"] / (el_bat["p_balls_raw"] + 60)
el_bat["adjusted_ppi"] = el_bat["raw_ppi"] * el_bat["reliability"]
b_min, b_max = el_bat["adjusted_ppi"].min(), el_bat["adjusted_ppi"].max()
el_bat["ppi_score"] = 100.0 * (el_bat["adjusted_ppi"] - b_min) / (b_max - b_min)
el_bat["rank"] = el_bat["ppi_score"].rank(ascending=False, method="min").astype(int)

# Reference Batters
ref_batters = [
    ("Donovan Ferreira", 8182, 100.00),
    ("Shashank Singh", 2756, 93.55),
    ("Ashutosh Sharma", 8101, 89.33),
    ("Sikandar Raza", 2984, 88.18),
    ("Towhid Hridoy", 6651, 87.01),
    ("Tristan Stubbs", 20702, 86.55),
    ("David Miller", 1077, 86.05),
    ("Naman Dhir", 37052, 84.54),
    ("Rinku Singh", 4708, 84.24),
    ("Jason Holder", 2633, 79.32)
]

print("=== BATTERS COMPARISON ===")
print(f"{'Player':<20} {'Ref Score':<10} {'Calc Score':<12} {'Diff':<8} {'Calc Rank':<10} {'Balls':<8} {'Matches':<8}")
for name, pid, ref in ref_batters:
    if pid in el_bat.index:
        row = el_bat.loc[pid]
        diff = row["ppi_score"] - ref
        print(f"{name:<20} {ref:<10.2f} {row['ppi_score']:<12.2f} {diff:<+8.2f} {row['rank']:<10} {row['p_balls_raw']:<8} {row['p_matches']:<8}")
    else:
        print(f"{name:<20} {ref:<10.2f} NOT ELIGIBLE")

# Bowlers
p_bowl = bbb_legal[bbb_legal["is_bowler_pressure"]].copy()
np_bowl = bbb_legal[~bbb_legal["is_bowler_pressure"]].copy()

p_bowl["w_runs"] = p_bowl["bowler_runs_conceded"] * p_bowl["bowler_weight"]
p_bowl["w_balls"] = p_bowl["bowler_weight"]
p_bowl["w_wickets"] = p_bowl["is_bowler_wicket"] * p_bowl["bowler_weight"]
p_bowl["w_dots"] = p_bowl["is_dot_ball"] * p_bowl["bowler_weight"]

np_bowl["w_runs"] = np_bowl["bowler_runs_conceded"] * np_bowl["bowler_weight"]
np_bowl["w_balls"] = np_bowl["bowler_weight"]
np_bowl["w_wickets"] = np_bowl["is_bowler_wicket"] * np_bowl["bowler_weight"]

bowl_p_agg = p_bowl.groupby("bowler_id").agg(
    p_runs=("w_runs", "sum"),
    p_balls_w=("w_balls", "sum"),
    p_balls_raw=("is_legal", "count"),
    p_wickets=("w_wickets", "sum"),
    p_dots=("w_dots", "sum"),
    p_matches=("match_id", "nunique"),
    player_name=("bowler_name", "first")
)
bowl_np_agg = np_bowl.groupby("bowler_id").agg(
    np_runs=("w_runs", "sum"),
    np_balls_w=("w_balls", "sum"),
    np_wickets=("w_wickets", "sum")
)
bowlers = bowl_p_agg.join(bowl_np_agg, how="left").fillna(0)
bowlers["recent_matches"] = bowlers.index.map(lambda pid: recent_counts.get(pid, 0))
bowlers["is_eligible"] = (bowlers["recent_matches"] >= 3) & (bowlers["p_balls_raw"] >= 90) & (bowlers["p_matches"] >= 8)

bowlers["pressure_econ"] = (bowlers["p_runs"] / bowlers["p_balls_w"]) * 6.0
bowlers["pressure_wkt_per_100"] = (bowlers["p_wickets"] / bowlers["p_balls_w"]) * 100.0
bowlers["pressure_dot_rate"] = (bowlers["p_dots"] / bowlers["p_balls_w"]) * 100.0
bowlers["np_econ"] = np.where(bowlers["np_balls_w"] > 0, (bowlers["np_runs"] / bowlers["np_balls_w"]) * 6.0, bowlers["pressure_econ"])
bowlers["np_wkt_per_100"] = np.where(bowlers["np_balls_w"] > 0, (bowlers["np_wickets"] / bowlers["np_balls_w"]) * 100.0, bowlers["pressure_wkt_per_100"])
bowlers["econ_improvement"] = bowlers["np_econ"] - bowlers["pressure_econ"]
bowlers["wkt_rate_improvement"] = bowlers["pressure_wkt_per_100"] - bowlers["np_wkt_per_100"]

el_bowl = bowlers[bowlers["is_eligible"]].copy()

el_bowl["raw_ppi"] = (
    -0.30 * z_score(el_bowl["pressure_econ"]) +
    0.25 * z_score(el_bowl["pressure_wkt_per_100"]) +
    0.15 * z_score(el_bowl["pressure_dot_rate"]) +
    0.20 * z_score(el_bowl["econ_improvement"]) +
    0.10 * z_score(el_bowl["wkt_rate_improvement"])
)
el_bowl["reliability"] = el_bowl["p_balls_raw"] / (el_bowl["p_balls_raw"] + 60)
el_bowl["adjusted_ppi"] = el_bowl["raw_ppi"] * el_bowl["reliability"]
bw_min, bw_max = el_bowl["adjusted_ppi"].min(), el_bowl["adjusted_ppi"].max()
el_bowl["ppi_score"] = 100.0 * (el_bowl["adjusted_ppi"] - bw_min) / (bw_max - bw_min)
el_bowl["rank"] = el_bowl["ppi_score"].rank(ascending=False, method="min").astype(int)

# Reference Bowlers
ref_bowlers = [
    ("Akeal Hosein", 2417, 100.00),
    ("Mohammad Rishad Hossain", 8380, 93.79),
    ("Sunil Narine", 781, 91.19),
    ("Eshan Malinga", 39657, 91.05),
    ("Corbin Bosch", 3629, 89.94),
    ("Mitchell Santner", 4101, 86.25),
    ("Jasprit Bumrah", 2933, 85.98),
    ("Taskin Ahmed", 2681, 79.32),
    ("Roston Chase", 2687, 78.74),
    ("Harshit Rana", 29888, 78.44)
]

print("\n=== BOWLERS COMPARISON ===")
print(f"{'Player':<25} {'Ref Score':<10} {'Calc Score':<12} {'Diff':<8} {'Calc Rank':<10} {'Balls':<8} {'Matches':<8}")
for name, pid, ref in ref_bowlers:
    if pid in el_bowl.index:
        row = el_bowl.loc[pid]
        diff = row["ppi_score"] - ref
        print(f"{name:<25} {ref:<10.2f} {row['ppi_score']:<12.2f} {diff:<+8.2f} {row['rank']:<10} {row['p_balls_raw']:<8} {row['p_matches']:<8}")
    else:
        print(f"{name:<25} {ref:<10.2f} NOT ELIGIBLE")
