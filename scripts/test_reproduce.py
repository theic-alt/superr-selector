import pandas as pd
import numpy as np

data_dir = r"C:\Users\sumed\.gemini\antigravity\scratch\superr-selector\data"
bbb = pd.read_csv(f"{data_dir}/ball_by_ball.csv")
matches = pd.read_csv(f"{data_dir}/matches.csv")
comps = pd.read_csv(f"{data_dir}/competitions.csv")
p11 = pd.read_csv(f"{data_dir}/playing_eleven.csv")

print(f"Loaded {len(bbb)} balls, {len(matches)} matches, {len(comps)} comps, {len(p11)} p11 entries.")
