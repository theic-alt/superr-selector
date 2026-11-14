import pandas as pd
import numpy as np

data_dir = r"C:\Users\sumed\.gemini\antigravity\scratch\superr-selector\data"
bbb = pd.read_pickle(f"{data_dir}/bbb_processed.pkl")
matches = pd.read_csv(f"{data_dir}/matches.csv")
p11 = pd.read_csv(f"{data_dir}/playing_eleven.csv")

# Recent activity: At least 3 played matches in window 2026-05-11 to 2026-11-11
matches["match_date"] = pd.to_datetime(matches["match_date"])
recent_mids = set(matches[(matches["match_date"] >= "2026-05-11") & (matches["match_date"] <= "2026-11-11")]["match_id"])
p11_recent = p11[(p11["match_id"].isin(recent_mids)) & (p11["is_played"] == True)]
recent_counts = p11_recent.groupby("player_id")["match_id"].nunique().to_dict()

# --- BATTERS AGGREGATION ---
# Legal balls faced by striker
bbb_legal = bbb[bbb["is_legal"]].copy()

# Pressure vs Non-pressure
p_bat = bbb_legal[bbb_legal["is_batter_pressure"]].copy()
np_bat = bbb_legal[~bbb_legal["is_batter_pressure"]].copy()

# Weighted deliveries:
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
    striker_name=("striker_name", "first")
)

bat_np_agg = np_bat.groupby("striker_id").agg(
    np_runs=("w_runs", "sum"),
    np_balls_w=("w_balls", "sum"),
    np_boundaries=("w_boundary", "sum")
)

batters = bat_p_agg.join(bat_np_agg, how="left").fillna(0)
batters["recent_matches"] = batters.index.map(lambda pid: recent_counts.get(pid, 0))

# Eligibility:
# At least 3 recent appearances
# At least 90 pressure legal balls across at least 8 matches
batters["eligible_recent"] = batters["recent_matches"] >= 3
batters["eligible_sample"] = (batters["p_balls_raw"] >= 90) & (batters["p_matches"] >= 8)
batters["is_eligible"] = batters["eligible_recent"] & batters["eligible_sample"]

# Metrics:
# Pressure SR = p_runs / p_balls_w * 100
batters["pressure_sr"] = (batters["p_runs"] / batters["p_balls_w"]) * 100
batters["pressure_boundary_rate"] = (batters["p_boundaries"] / batters["p_balls_w"]) * 100
batters["pressure_dismissal_rate"] = (batters["p_dismissals"] / batters["p_balls_w"]) * 100

batters["np_sr"] = np.where(batters["np_balls_w"] > 0, (batters["np_runs"] / batters["np_balls_w"]) * 100, batters["pressure_sr"])
batters["np_boundary_rate"] = np.where(batters["np_balls_w"] > 0, (batters["np_boundaries"] / batters["np_balls_w"]) * 100, batters["pressure_boundary_rate"])

batters["sr_uplift"] = batters["pressure_sr"] - batters["np_sr"]
batters["boundary_uplift"] = batters["pressure_boundary_rate"] - batters["np_boundary_rate"]

# Eligible pool for Z-scores
el_bat = batters[batters["is_eligible"]].copy()
print(f"Total eligible batters: {len(el_bat)}")

def z_score(series):
    return (series - series.mean()) / series.std()

# Batter Raw PPI:
# 0.35 * z(Pressure SR) + 0.20 * z(Boundary Rate) + 0.15 * z(Inverse Dismissal Rate) + 0.20 * z(SR Uplift) + 0.10 * z(Boundary Uplift)
z_psr = z_score(el_bat["pressure_sr"])
z_br = z_score(el_bat["pressure_boundary_rate"])
z_inv_dr = -z_score(el_bat["pressure_dismissal_rate"])
z_sru = z_score(el_bat["sr_uplift"])
z_bu = z_score(el_bat["boundary_uplift"])

el_bat["raw_ppi"] = (
    0.35 * z_psr +
    0.20 * z_br +
    0.15 * z_inv_dr +
    0.20 * z_sru +
    0.10 * z_bu
)

# Reliability = p_balls_raw / (p_balls_raw + 60)
el_bat["reliability"] = el_bat["p_balls_raw"] / (el_bat["p_balls_raw"] + 60)
el_bat["adjusted_ppi"] = el_bat["raw_ppi"] * el_bat["reliability"]

# PPI / 100
ppi_min = el_bat["adjusted_ppi"].min()
ppi_max = el_bat["adjusted_ppi"].max()
el_bat["ppi_score"] = 100.0 * (el_bat["adjusted_ppi"] - ppi_min) / (ppi_max - ppi_min)

el_bat.sort_values(by="ppi_score", ascending=False, inplace=True)
print("\n--- TOP 15 BATTERS (CALCULATED) ---")
print(el_bat[["striker_name", "ppi_score", "p_balls_raw", "p_matches", "pressure_sr", "sr_uplift", "reliability"]].head(15))
