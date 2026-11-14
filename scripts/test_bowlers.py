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

# --- BOWLERS AGGREGATION ---
bbb_legal = bbb[bbb["is_legal"]].copy()

p_bowl = bbb_legal[bbb_legal["is_bowler_pressure"]].copy()
np_bowl = bbb_legal[~bbb_legal["is_bowler_pressure"]].copy()

# Bowler weighted metrics:
# For bowler economy: runs conceded / legal pressure balls * 6
# Runs conceded uses bowler_runs_conceded * bowler_weight
# Legal balls bowled uses bowler_weight
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
    bowler_name=("bowler_name", "first")
)

bowl_np_agg = np_bowl.groupby("bowler_id").agg(
    np_runs=("w_runs", "sum"),
    np_balls_w=("w_balls", "sum"),
    np_wickets=("w_wickets", "sum")
)

bowlers = bowl_p_agg.join(bowl_np_agg, how="left").fillna(0)
bowlers["recent_matches"] = bowlers.index.map(lambda pid: recent_counts.get(pid, 0))

# Eligibility:
bowlers["eligible_recent"] = bowlers["recent_matches"] >= 3
bowlers["eligible_sample"] = (bowlers["p_balls_raw"] >= 90) & (bowlers["p_matches"] >= 8)
bowlers["is_eligible"] = bowlers["eligible_recent"] & bowlers["eligible_sample"]

# Metrics:
# Pressure economy = p_runs / p_balls_w * 6
bowlers["pressure_econ"] = (bowlers["p_runs"] / bowlers["p_balls_w"]) * 6.0
bowlers["pressure_wkt_per_100"] = (bowlers["p_wickets"] / bowlers["p_balls_w"]) * 100.0
bowlers["pressure_dot_rate"] = (bowlers["p_dots"] / bowlers["p_balls_w"]) * 100.0

bowlers["np_econ"] = np.where(bowlers["np_balls_w"] > 0, (bowlers["np_runs"] / bowlers["np_balls_w"]) * 6.0, bowlers["pressure_econ"])
bowlers["np_wkt_per_100"] = np.where(bowlers["np_balls_w"] > 0, (bowlers["np_wickets"] / bowlers["np_balls_w"]) * 100.0, bowlers["pressure_wkt_per_100"])

bowlers["econ_improvement"] = bowlers["np_econ"] - bowlers["pressure_econ"]
bowlers["wkt_rate_improvement"] = bowlers["pressure_wkt_per_100"] - bowlers["np_wkt_per_100"]

el_bowl = bowlers[bowlers["is_eligible"]].copy()
print(f"Total eligible bowlers: {len(el_bowl)}")

def z_score(series):
    return (series - series.mean()) / series.std()

# Bowler Raw PPI:
# 0.30 * z(Inverse Economy) + 0.25 * z(Wickets per 100) + 0.15 * z(Dot Rate) + 0.20 * z(Economy Improvement) + 0.10 * z(Wicket-rate Improvement)
z_inv_econ = -z_score(el_bowl["pressure_econ"])
z_w100 = z_score(el_bowl["pressure_wkt_per_100"])
z_dot = z_score(el_bowl["pressure_dot_rate"])
z_econ_imp = z_score(el_bowl["econ_improvement"])
z_wkt_imp = z_score(el_bowl["wkt_rate_improvement"])

el_bowl["raw_ppi"] = (
    0.30 * z_inv_econ +
    0.25 * z_w100 +
    0.15 * z_dot +
    0.20 * z_econ_imp +
    0.10 * z_wkt_imp
)

el_bowl["reliability"] = el_bowl["p_balls_raw"] / (el_bowl["p_balls_raw"] + 60)
el_bowl["adjusted_ppi"] = el_bowl["raw_ppi"] * el_bowl["reliability"]

ppi_min = el_bowl["adjusted_ppi"].min()
ppi_max = el_bowl["adjusted_ppi"].max()
el_bowl["ppi_score"] = 100.0 * (el_bowl["adjusted_ppi"] - ppi_min) / (ppi_max - ppi_min)

el_bowl.sort_values(by="ppi_score", ascending=False, inplace=True)
print("\n--- TOP 15 BOWLERS (CALCULATED) ---")
print(el_bowl[["bowler_name", "ppi_score", "p_balls_raw", "p_matches", "pressure_econ", "econ_improvement", "reliability"]].head(15))
