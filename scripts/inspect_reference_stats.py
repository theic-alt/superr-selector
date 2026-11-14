import pandas as pd
import numpy as np

data_dir = r"C:\Users\sumed\.gemini\antigravity\scratch\superr-selector\data"
bbb = pd.read_pickle(f"{data_dir}/bbb_processed.pkl")
matches = pd.read_csv(f"{data_dir}/matches.csv")
p11 = pd.read_csv(f"{data_dir}/playing_eleven.csv")

# Let us print the exact stats for Donovan Ferreira and Akeal Hosein
ferreira_balls = bbb[(bbb["striker_id"] == 8182) & bbb["is_legal"]]
ferreira_p = ferreira_balls[ferreira_balls["is_batter_pressure"]]
print("Donovan Ferreira:")
print(f"  Total legal balls: {len(ferreira_balls)}")
print(f"  Pressure legal balls: {len(ferreira_p)}")
print(f"  Pressure matches: {ferreira_p['match_id'].nunique()}")
print(f"  Pressure runs: {ferreira_p['runs'].sum()}")
print(f"  Pressure weighted runs: {(ferreira_p['runs'] * ferreira_p['batter_weight']).sum():.2f}")
print(f"  Pressure weighted balls: {ferreira_p['batter_weight'].sum():.2f}")
print(f"  Pressure SR (unweighted): {ferreira_p['runs'].sum() / len(ferreira_p) * 100:.2f}")
print(f"  Pressure SR (weighted): {(ferreira_p['runs'] * ferreira_p['batter_weight']).sum() / ferreira_p['batter_weight'].sum() * 100:.2f}")

akeal_balls = bbb[(bbb["bowler_id"] == 2417) & bbb["is_legal"]]
akeal_p = akeal_balls[akeal_balls["is_bowler_pressure"]]
print("\nAkeal Hosein:")
print(f"  Total legal balls: {len(akeal_balls)}")
print(f"  Pressure legal balls: {len(akeal_p)}")
print(f"  Pressure matches: {akeal_p['match_id'].nunique()}")
print(f"  Pressure runs conceded: {akeal_p['bowler_runs_conceded'].sum()}")
print(f"  Pressure wickets: {akeal_p['is_bowler_wicket'].sum()}")
print(f"  Pressure dots: {akeal_p['is_dot_ball'].sum()}")
