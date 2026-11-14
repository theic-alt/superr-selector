import pandas as pd
import numpy as np

data_dir = r"C:\Users\sumed\.gemini\antigravity\scratch\superr-selector\data"
bbb = pd.read_csv(f"{data_dir}/ball_by_ball.csv")
matches = pd.read_csv(f"{data_dir}/matches.csv")
comps = pd.read_csv(f"{data_dir}/competitions.csv")
p11 = pd.read_csv(f"{data_dir}/playing_eleven.csv")

print("Checking match dates in dataset:")
matches["match_date"] = pd.to_datetime(matches["match_date"])
print("Min match date:", matches["match_date"].min())
print("Max match date:", matches["match_date"].max())

recent_matches = matches[(matches["match_date"] >= "2026-05-11") & (matches["match_date"] <= "2026-11-11")]
print(f"Matches in recent activity window (2026-05-11 to 2026-11-11): {len(recent_matches)}")

# Check players with >= 3 played matches in this window
p11_recent = p11[p11["match_id"].isin(recent_matches["match_id"])]
# Check if is_played matters
print("p11_recent is_played counts:")
print(p11_recent["is_played"].value_counts())

played_counts = p11_recent[p11_recent["is_played"] == True].groupby("player_id")["match_id"].nunique()
print(f"Total players with >= 3 matches in window: {(played_counts >= 3).sum()}")

# Check our top 20 players
sample_players = {
    8182: "Donovan Ferreira", 2756: "Shashank Singh", 8101: "Ashutosh Sharma", 
    2984: "Sikandar Raza", 6651: "Towhid Hridoy", 20702: "Tristan Stubbs",
    1077: "David Miller", 37052: "Naman Dhir", 4708: "Rinku Singh", 2633: "Jason Holder",
    2417: "Akeal Hosein", 8380: "Mohammad Rishad Hossain", 781: "Sunil Narine",
    39657: "Eshan Malinga", 3629: "Corbin Bosch", 4101: "Mitchell Santner",
    2933: "Jasprit Bumrah", 2681: "Taskin Ahmed", 2687: "Roston Chase", 29888: "Harshit Rana"
}

for pid, name in sample_players.items():
    cnt = played_counts.get(pid, 0)
    print(f"  {name} ({pid}): {cnt} recent matches")
