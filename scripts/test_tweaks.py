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

# Test Variation: Bowlers
# Check if bowler runs includes byes or legbyes? No, in cricket byes/legbyes never belong to bowler.
# What if dot ball definition is bowler_runs_conceded == 0 and extras == 0?
# What if we only include the top 20 shortlisted players as the reference pool or compare across all?
print("Done checking basic setup.")
