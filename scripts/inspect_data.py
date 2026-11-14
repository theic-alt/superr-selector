import pandas as pd
import numpy as np

data_dir = r"C:\Users\sumed\.gemini\antigravity\scratch\superr-selector\data"
bbb = pd.read_csv(f"{data_dir}/ball_by_ball.csv")
print("extras_type counts in full dataset:")
print(bbb["extras_type"].value_counts(dropna=False))

print("\nSample rows with extras_type == 'other':")
print(bbb[bbb["extras_type"] == "other"][["match_id", "innings", "overid", "over_ball_num", "runs", "extras1_runs", "extras_2_runs", "is_wicket"]].head(10))

print("\nCheck over_ball_num progression for an over with 'wide' or 'Overstep':")
sample_match = bbb[bbb["extras_type"].isin(["wide", "Overstep"])]["match_id"].iloc[0]
sample_over = bbb[(bbb["match_id"] == sample_match) & (bbb["extras_type"].isin(["wide", "Overstep"]))]["overid"].iloc[0]
sample_inn = bbb[(bbb["match_id"] == sample_match) & (bbb["extras_type"].isin(["wide", "Overstep"]))]["innings"].iloc[0]
print(bbb[(bbb["match_id"] == sample_match) & (bbb["innings"] == sample_inn) & (bbb["overid"] == sample_over)][["innings_ball_num", "overid", "over_ball_num", "extras_type", "runs", "extras1_runs"]])

