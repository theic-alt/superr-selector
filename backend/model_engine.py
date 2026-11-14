import os
import json
import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")

class CricketModelEngine:
    def __init__(self, data_dir: str = DATA_DIR):
        self.data_dir = data_dir
        self.bbb: Optional[pd.DataFrame] = None
        self.matches: Optional[pd.DataFrame] = None
        self.comps: Optional[pd.DataFrame] = None
        self.p11: Optional[pd.DataFrame] = None
        self.teams: Optional[pd.DataFrame] = None
        self.player_mapping: Optional[pd.DataFrame] = None
        
        self.t20i_win_rates: Dict[int, float] = {}
        self.match_info: Dict[int, Dict[str, Any]] = {}
        self.recent_match_counts: Dict[int, int] = {}
        
        self.batters_df: Optional[pd.DataFrame] = None
        self.bowlers_df: Optional[pd.DataFrame] = None
        self.player_meta: Dict[int, Dict[str, Any]] = {}
        
        self.is_initialized = False

    def initialize(self):
        if self.is_initialized:
            return
            
        print("Initializing SupeRR Selector Model Engine...")
        self.matches = pd.read_csv(os.path.join(self.data_dir, "matches.csv"))
        self.comps = pd.read_csv(os.path.join(self.data_dir, "competitions.csv"))
        self.p11 = pd.read_csv(os.path.join(self.data_dir, "playing_eleven.csv"))
        self.teams = pd.read_csv(os.path.join(self.data_dir, "teams.csv"))
        self.player_mapping = pd.read_csv(os.path.join(self.data_dir, "competition_team_player_mapping.csv"))
        
        # 1. Scoping: IPL and T20I only
        self.comps["is_ipl"] = self.comps["comp_name"].str.contains("IPL|Indian Premier League", case=False, na=False)
        self.comps["is_t20i"] = self.comps["match_format"] == "T20I"
        valid_comp_ids = set(self.comps[self.comps["is_ipl"] | self.comps["is_t20i"]]["comp_id"])
        ipl_comp_ids = set(self.comps[self.comps["is_ipl"]]["comp_id"])
        t20i_comp_ids = set(self.comps[self.comps["is_t20i"]]["comp_id"])
        
        self.matches["match_date"] = pd.to_datetime(self.matches["match_date"])
        scoped_matches = self.matches[self.matches["comp_id"].isin(valid_comp_ids)].copy()
        scoped_match_ids = set(scoped_matches["match_id"])
        
        # 2. T20I Opponent Win Rates
        t20i_m = scoped_matches[scoped_matches["comp_id"].isin(t20i_comp_ids)]
        t20i_played = {}
        t20i_won = {}
        for _, row in t20i_m.iterrows():
            h, a, w = row["home_team_id"], row["away_team_id"], row["win_team_id"]
            for t in [h, a]:
                if pd.notna(t):
                    t = int(t)
                    t20i_played[t] = t20i_played.get(t, 0) + 1
            if pd.notna(w) and int(w) > 0:
                w = int(w)
                t20i_won[w] = t20i_won.get(w, 0) + 1
                
        self.t20i_win_rates = {t: t20i_won.get(t, 0) / t20i_played[t] for t in t20i_played}
        
        # 3. Match Metadata
        for _, row in scoped_matches.iterrows():
            self.match_info[row["match_id"]] = {
                "comp_id": row["comp_id"],
                "match_number": row.get("match_number", 0),
                "is_ipl": row["comp_id"] in ipl_comp_ids,
                "is_t20i": row["comp_id"] in t20i_comp_ids,
                "first_revised": row["first_inn_revised_overs"],
                "second_revised": row["second_inn_revised_overs"],
                "revised_target": row["revised_target"],
                "match_date": str(row["match_date"].date()),
                "home_team": row["home_team"],
                "away_team": row["away_team"],
                "result": str(row.get("result", ""))
            }
            
        # Recent activity: Matches between 11 May 2026 and 11 November 2026
        recent_mids = set(scoped_matches[(scoped_matches["match_date"] >= "2026-05-11") & (scoped_matches["match_date"] <= "2026-11-11")]["match_id"])
        p11_recent = self.p11[(self.p11["match_id"].isin(recent_mids)) & (self.p11["is_played"] == True)]
        self.recent_match_counts = p11_recent.groupby("player_id")["match_id"].nunique().to_dict()
        
        # Load or compute processed ball-by-ball
        pkl_path = os.path.join(self.data_dir, "bbb_processed.pkl")
        if os.path.exists(pkl_path):
            print("Loading precomputed ball_by_ball data...")
            self.bbb = pd.read_pickle(pkl_path)
        else:
            print("Processing ball_by_ball data from scratch...")
            raw_bbb = pd.read_csv(os.path.join(self.data_dir, "ball_by_ball.csv"))
            self.bbb = self._process_ball_by_ball(raw_bbb, scoped_match_ids)
            self.bbb.to_pickle(pkl_path)
            
        # Build player metadata cache
        self._build_player_metadata()
        
        # Compute baseline and official PPI rankings
        self._compute_official_rankings()
        self.is_initialized = True
        print("Engine initialized successfully.")

    def _process_ball_by_ball(self, bbb: pd.DataFrame, scoped_match_ids: set) -> pd.DataFrame:
        bbb = bbb[bbb["match_id"].isin(scoped_match_ids)].copy()
        bbb.sort_values(by=["match_id", "innings", "innings_ball_num"], inplace=True)
        bbb.reset_index(drop=True, inplace=True)
        
        # Targets for inn 2
        inn1_runs_map = bbb[bbb["innings"] == 1].groupby("match_id").apply(
            lambda df: (df["runs"] + df["extras1_runs"] + df["extras_2_runs"]).sum(),
            include_groups=False
        ).to_dict()
        
        for mid, info in self.match_info.items():
            if pd.notna(info["revised_target"]) and info["revised_target"] > 0:
                info["target"] = float(info["revised_target"])
            elif mid in inn1_runs_map:
                info["target"] = float(inn1_runs_map[mid] + 1)
            else:
                info["target"] = None
                
        bbb["is_illegal"] = bbb["extras_type"].isin(["wide", "Overstep", "other"])
        bbb["is_legal"] = ~bbb["is_illegal"]
        bbb["ball_runs"] = bbb["runs"] + bbb["extras1_runs"] + bbb["extras_2_runs"]
        
        bbb["bowler_extras"] = np.where(bbb["extras_type"].isin(["legbyes", "byes", "Penalty"]), 0, bbb["extras1_runs"] + bbb["extras_2_runs"])
        bbb["bowler_runs_conceded"] = bbb["runs"] + bbb["bowler_extras"]
        bbb["is_bowler_wicket"] = bbb["is_wicket"] & bbb["dismissal_type"].isin(["Bowled", "Caught", "LBW", "Stump", "Hit Wicket"])
        bbb["is_striker_out"] = bbb["is_wicket"] & ((bbb["dismissed_player_id"] == bbb["striker_id"]) | bbb["dismissed_player_id"].isna())
        bbb["is_dot_ball"] = bbb["is_legal"] & (bbb["bowler_runs_conceded"] == 0)
        bbb["is_boundary"] = bbb["is_four"] | bbb["is_six"]
        
        grouped = bbb.groupby(["match_id", "innings"])
        bbb["cum_legal_balls"] = grouped["is_legal"].cumsum() - bbb["is_legal"]
        bbb["cum_runs"] = grouped["ball_runs"].cumsum() - bbb["ball_runs"]
        bbb["cum_wickets"] = grouped["is_wicket"].cumsum() - bbb["is_wicket"]
        
        m_first_rev = bbb["match_id"].map(lambda m: self.match_info[m]["first_revised"])
        m_second_rev = bbb["match_id"].map(lambda m: self.match_info[m]["second_revised"])
        m_target = bbb["match_id"].map(lambda m: self.match_info[m]["target"])
        
        ball_limit = np.where(
            bbb["innings"] == 1,
            np.where(m_first_rev.notna() & (m_first_rev > 0), m_first_rev, 120),
            np.where(m_second_rev.notna() & (m_second_rev > 0), m_second_rev, 120)
        )
        bbb["ball_limit"] = ball_limit
        bbb["balls_remaining"] = np.maximum(0, bbb["ball_limit"] - bbb["cum_legal_balls"])
        bbb["wickets_in_hand"] = np.maximum(0, 10 - bbb["cum_wickets"])
        
        bbb["crr"] = np.where(bbb["cum_legal_balls"] > 0, (bbb["cum_runs"] / bbb["cum_legal_balls"]) * 6.0, 0.0)
        bbb["runs_remaining"] = np.maximum(0, m_target - bbb["cum_runs"])
        bbb["rrr"] = np.where(
            bbb["balls_remaining"] > 0,
            (bbb["runs_remaining"] / bbb["balls_remaining"]) * 6.0,
            np.where(bbb["runs_remaining"] > 0, 99.0, 0.0)
        )
        bbb["rrr_crr_gap"] = bbb["rrr"] - bbb["crr"]
        
        chase_pressure = (bbb["innings"] == 2) & (bbb["balls_remaining"] <= 60) & (
            (bbb["rrr"] >= 9.5) | (bbb["wickets_in_hand"] <= 4) | (bbb["rrr_crr_gap"] >= 2.5)
        )
        inn1_batter_pressure = (bbb["innings"] == 1) & (bbb["balls_remaining"] <= 30) & (bbb["cum_wickets"] >= 5)
        inn1_bowler_pressure = (bbb["innings"] == 1) & (bbb["balls_remaining"] <= 30) & (bbb["wickets_in_hand"] >= 5) & (bbb["crr"] >= 8.0)
        
        bbb["is_batter_pressure"] = chase_pressure | inn1_batter_pressure
        bbb["is_bowler_pressure"] = chase_pressure | inn1_bowler_pressure
        
        m_is_ipl = bbb["match_id"].map(lambda m: self.match_info[m]["is_ipl"])
        m_is_t20i = bbb["match_id"].map(lambda m: self.match_info[m]["is_t20i"])
        
        batter_opp_wr = bbb["bowling_team_id"].map(self.t20i_win_rates).fillna(0.5)
        batter_t20i_w = np.clip(0.85 + 0.60 * batter_opp_wr, 0.85, 1.25)
        bbb["batter_weight"] = np.where(m_is_ipl, 1.15, np.where(m_is_t20i, batter_t20i_w, 1.0))
        
        bowler_opp_wr = bbb["batting_team_id"].map(self.t20i_win_rates).fillna(0.5)
        bowler_t20i_w = np.clip(0.85 + 0.60 * bowler_opp_wr, 0.85, 1.25)
        bbb["bowler_weight"] = np.where(m_is_ipl, 1.15, np.where(m_is_t20i, bowler_t20i_w, 1.0))
        
        return bbb

    def _build_player_metadata(self):
        strikers = self.bbb[["striker_id", "striker_name"]].drop_duplicates().rename(columns={"striker_id": "player_id", "striker_name": "name"})
        bowlers = self.bbb[["bowler_id", "bowler_name"]].drop_duplicates().rename(columns={"bowler_id": "player_id", "bowler_name": "name"})
        all_players = pd.concat([strikers, bowlers]).drop_duplicates(subset=["player_id"])
        
        team_map = {}
        for _, row in self.player_mapping.iterrows():
            pid = row["player_id"]
            tname = row["team_name"]
            if pid not in team_map:
                team_map[pid] = set()
            team_map[pid].add(tname)
            
        for _, row in all_players.iterrows():
            pid = int(row["player_id"])
            pname = str(row["name"])
            self.player_meta[pid] = {
                "player_id": pid,
                "name": pname,
                "teams": list(team_map.get(pid, ["Independent"])),
                "recent_appearances": self.recent_match_counts.get(pid, 0)
            }

    def _compute_official_rankings(self):
        bbb_legal = self.bbb[self.bbb["is_legal"]].copy()
        
        # --- BATTERS ---
        p_bat = bbb_legal[bbb_legal["is_batter_pressure"]].copy()
        np_bat = bbb_legal[~bbb_legal["is_batter_pressure"]].copy()
        
        p_bat["w_runs"] = p_bat["runs"] * p_bat["batter_weight"]
        p_bat["w_balls"] = p_bat["batter_weight"]
        p_bat["w_boundary"] = p_bat["is_boundary"] * p_bat["batter_weight"]
        p_bat["w_dismissal"] = p_bat["is_striker_out"] * p_bat["batter_weight"]
        
        np_bat["w_runs"] = np_bat["runs"] * np_bat["batter_weight"]
        np_bat["w_balls"] = np_bat["batter_weight"]
        np_bat["w_boundary"] = np_bat["is_boundary"] * np_bat["batter_weight"]
        
        bat_p = p_bat.groupby("striker_id").agg(
            p_runs=("w_runs", "sum"),
            p_balls_w=("w_balls", "sum"),
            p_balls_raw=("is_legal", "count"),
            p_boundaries=("w_boundary", "sum"),
            p_dismissals=("w_dismissal", "sum"),
            p_matches=("match_id", "nunique"),
            player_name=("striker_name", "first")
        )
        bat_np = np_bat.groupby("striker_id").agg(
            np_runs=("w_runs", "sum"),
            np_balls_w=("w_balls", "sum"),
            np_boundaries=("w_boundary", "sum")
        )
        
        self.batters_df = bat_p.join(bat_np, how="left").fillna(0)
        self.batters_df["recent_matches"] = self.batters_df.index.map(lambda pid: self.recent_match_counts.get(pid, 0))
        
        self.batters_df["eligible_recent"] = self.batters_df["recent_matches"] >= 3
        self.batters_df["eligible_sample"] = (self.batters_df["p_balls_raw"] >= 90) & (self.batters_df["p_matches"] >= 8)
        self.batters_df["is_eligible"] = self.batters_df["eligible_recent"] & self.batters_df["eligible_sample"]
        
        self.batters_df["pressure_sr"] = (self.batters_df["p_runs"] / self.batters_df["p_balls_w"]) * 100
        self.batters_df["pressure_boundary_rate"] = (self.batters_df["p_boundaries"] / self.batters_df["p_balls_w"]) * 100
        self.batters_df["pressure_dismissal_rate"] = (self.batters_df["p_dismissals"] / self.batters_df["p_balls_w"]) * 100
        self.batters_df["np_sr"] = np.where(self.batters_df["np_balls_w"] > 0, (self.batters_df["np_runs"] / self.batters_df["np_balls_w"]) * 100, self.batters_df["pressure_sr"])
        self.batters_df["np_boundary_rate"] = np.where(self.batters_df["np_balls_w"] > 0, (self.batters_df["np_boundaries"] / self.batters_df["np_balls_w"]) * 100, self.batters_df["pressure_boundary_rate"])
        self.batters_df["sr_uplift"] = self.batters_df["pressure_sr"] - self.batters_df["np_sr"]
        self.batters_df["boundary_uplift"] = self.batters_df["pressure_boundary_rate"] - self.batters_df["np_boundary_rate"]
        
        el_bat = self.batters_df[self.batters_df["is_eligible"]].copy()
        
        def z(s, m, sd): return (s - m) / (sd if sd > 0 else 1.0)
        m_psr, sd_psr = el_bat["pressure_sr"].mean(), el_bat["pressure_sr"].std()
        m_pbr, sd_pbr = el_bat["pressure_boundary_rate"].mean(), el_bat["pressure_boundary_rate"].std()
        m_pdr, sd_pdr = el_bat["pressure_dismissal_rate"].mean(), el_bat["pressure_dismissal_rate"].std()
        m_sru, sd_sru = el_bat["sr_uplift"].mean(), el_bat["sr_uplift"].std()
        m_bu, sd_bu = el_bat["boundary_uplift"].mean(), el_bat["boundary_uplift"].std()
        
        z_psr = z(self.batters_df["pressure_sr"], m_psr, sd_psr)
        z_pbr = z(self.batters_df["pressure_boundary_rate"], m_pbr, sd_pbr)
        z_pdr = -z(self.batters_df["pressure_dismissal_rate"], m_pdr, sd_pdr)
        z_sru = z(self.batters_df["sr_uplift"], m_sru, sd_sru)
        z_bu = z(self.batters_df["boundary_uplift"], m_bu, sd_bu)
        
        self.batters_df["raw_ppi"] = (
            0.35 * z_psr +
            0.20 * z_pbr +
            0.15 * z_pdr +
            0.20 * z_sru +
            0.10 * z_bu
        )
        self.batters_df["reliability"] = self.batters_df["p_balls_raw"] / (self.batters_df["p_balls_raw"] + 60.0)
        self.batters_df["adjusted_ppi"] = self.batters_df["raw_ppi"] * self.batters_df["reliability"]
        
        el_adj = self.batters_df.loc[self.batters_df["is_eligible"], "adjusted_ppi"]
        b_min, b_max = el_adj.min(), el_adj.max()
        self.batters_df["ppi_score"] = np.clip(100.0 * (self.batters_df["adjusted_ppi"] - b_min) / (b_max - b_min), 0, 100)
        
        self.batters_df["rank"] = np.nan
        self.batters_df.loc[self.batters_df["is_eligible"], "rank"] = (
            self.batters_df.loc[self.batters_df["is_eligible"], "ppi_score"].rank(ascending=False, method="min").astype(int)
        )
        
        # --- BOWLERS ---
        p_bowl = bbb_legal[bbb_legal["is_bowler_pressure"]].copy()
        np_bowl = bbb_legal[~bbb_legal["is_bowler_pressure"]].copy()
        
        p_bowl["w_runs"] = p_bowl["bowler_runs_conceded"] * p_bowl["bowler_weight"]
        p_bowl["w_balls"] = p_bowl["bowler_weight"]
        p_bowl["w_wickets"] = p_bowl["is_bowler_wicket"] * p_bowl["bowler_weight"]
        p_bowl["w_dots"] = p_bowl["is_dot_ball"] * p_bowl["bowler_weight"]
        
        np_bowl["w_runs"] = np_bowl["bowler_runs_conceded"] * np_bowl["bowler_weight"]
        np_bowl["w_balls"] = np_bowl["bowler_weight"]
        np_bowl["w_wickets"] = np_bowl["is_bowler_wicket"] * np_bowl["bowler_weight"]
        
        bowl_p = p_bowl.groupby("bowler_id").agg(
            p_runs=("w_runs", "sum"),
            p_balls_w=("w_balls", "sum"),
            p_balls_raw=("is_legal", "count"),
            p_wickets=("w_wickets", "sum"),
            p_dots=("w_dots", "sum"),
            p_matches=("match_id", "nunique"),
            player_name=("bowler_name", "first")
        )
        bowl_np = np_bowl.groupby("bowler_id").agg(
            np_runs=("w_runs", "sum"),
            np_balls_w=("w_balls", "sum"),
            np_wickets=("w_wickets", "sum")
        )
        
        self.bowlers_df = bowl_p.join(bowl_np, how="left").fillna(0)
        self.bowlers_df["recent_matches"] = self.bowlers_df.index.map(lambda pid: self.recent_match_counts.get(pid, 0))
        
        self.bowlers_df["eligible_recent"] = self.bowlers_df["recent_matches"] >= 3
        self.bowlers_df["eligible_sample"] = (self.bowlers_df["p_balls_raw"] >= 90) & (self.bowlers_df["p_matches"] >= 8)
        self.bowlers_df["is_eligible"] = self.bowlers_df["eligible_recent"] & self.bowlers_df["eligible_sample"]
        
        self.bowlers_df["pressure_econ"] = (self.bowlers_df["p_runs"] / self.bowlers_df["p_balls_w"]) * 6.0
        self.bowlers_df["pressure_wkt_per_100"] = (self.bowlers_df["p_wickets"] / self.bowlers_df["p_balls_w"]) * 100.0
        self.bowlers_df["pressure_dot_rate"] = (self.bowlers_df["p_dots"] / self.bowlers_df["p_balls_w"]) * 100.0
        self.bowlers_df["np_econ"] = np.where(self.bowlers_df["np_balls_w"] > 0, (self.bowlers_df["np_runs"] / self.bowlers_df["np_balls_w"]) * 6.0, self.bowlers_df["pressure_econ"])
        self.bowlers_df["np_wkt_per_100"] = np.where(self.bowlers_df["np_balls_w"] > 0, (self.bowlers_df["np_wickets"] / self.bowlers_df["np_balls_w"]) * 100.0, self.bowlers_df["pressure_wkt_per_100"])
        self.bowlers_df["econ_improvement"] = self.bowlers_df["np_econ"] - self.bowlers_df["pressure_econ"]
        self.bowlers_df["wkt_rate_improvement"] = self.bowlers_df["pressure_wkt_per_100"] - self.bowlers_df["np_wkt_per_100"]
        
        el_bowl = self.bowlers_df[self.bowlers_df["is_eligible"]].copy()
        m_pe, sd_pe = el_bowl["pressure_econ"].mean(), el_bowl["pressure_econ"].std()
        m_pw, sd_pw = el_bowl["pressure_wkt_per_100"].mean(), el_bowl["pressure_wkt_per_100"].std()
        m_pd, sd_pd = el_bowl["pressure_dot_rate"].mean(), el_bowl["pressure_dot_rate"].std()
        m_ei, sd_ei = el_bowl["econ_improvement"].mean(), el_bowl["econ_improvement"].std()
        m_wi, sd_wi = el_bowl["wkt_rate_improvement"].mean(), el_bowl["wkt_rate_improvement"].std()
        
        z_pe = -z(self.bowlers_df["pressure_econ"], m_pe, sd_pe)
        z_pw = z(self.bowlers_df["pressure_wkt_per_100"], m_pw, sd_pw)
        z_pd = z(self.bowlers_df["pressure_dot_rate"], m_pd, sd_pd)
        z_ei = z(self.bowlers_df["econ_improvement"], m_ei, sd_ei)
        z_wi = z(self.bowlers_df["wkt_rate_improvement"], m_wi, sd_wi)
        
        self.bowlers_df["raw_ppi"] = (
            0.30 * z_pe +
            0.25 * z_pw +
            0.15 * z_pd +
            0.20 * z_ei +
            0.10 * z_wi
        )
        self.bowlers_df["reliability"] = self.bowlers_df["p_balls_raw"] / (self.bowlers_df["p_balls_raw"] + 60.0)
        self.bowlers_df["adjusted_ppi"] = self.bowlers_df["raw_ppi"] * self.bowlers_df["reliability"]
        
        el_bw_adj = self.bowlers_df.loc[self.bowlers_df["is_eligible"], "adjusted_ppi"]
        bw_min, bw_max = el_bw_adj.min(), el_bw_adj.max()
        self.bowlers_df["ppi_score"] = np.clip(100.0 * (self.bowlers_df["adjusted_ppi"] - bw_min) / (bw_max - bw_min), 0, 100)
        
        self.bowlers_df["rank"] = np.nan
        self.bowlers_df.loc[self.bowlers_df["is_eligible"], "rank"] = (
            self.bowlers_df.loc[self.bowlers_df["is_eligible"], "ppi_score"].rank(ascending=False, method="min").astype(int)
        )

    def get_overview_stats(self) -> Dict[str, Any]:
        self.initialize()
        total_players = len(self.player_meta)
        total_matches = len(self.match_info)
        total_balls = len(self.bbb)
        pressure_balls_bat = int(self.bbb["is_batter_pressure"].sum())
        pressure_balls_bowl = int(self.bbb["is_bowler_pressure"].sum())
        
        el_batters = self.batters_df[self.batters_df["is_eligible"]]
        el_bowlers = self.bowlers_df[self.bowlers_df["is_eligible"]]
        
        return {
            "total_players_in_dataset": total_players,
            "total_matches_analysed": total_matches,
            "total_deliveries": total_balls,
            "pressure_deliveries_batter": pressure_balls_bat,
            "pressure_deliveries_bowler": pressure_balls_bowl,
            "eligible_batters_count": len(el_batters),
            "eligible_bowlers_count": len(el_bowlers),
            "avg_batter_ppi": round(float(el_batters["ppi_score"].mean()), 2),
            "avg_bowler_ppi": round(float(el_bowlers["ppi_score"].mean()), 2),
            "activity_window": "11 May 2026 - 11 November 2026",
            "dataset_cutoff_date": "1 November 2026",
            "competitions_coverage": ["IPL (2022-2026)", "ICC T20 Internationals (2022-2026)"],
            "shortlisted_count": 20
        }

    def get_selected_top_20(self) -> Dict[str, List[Dict[str, Any]]]:
        self.initialize()
        shortlist_batters_ids = [8182, 2756, 8101, 2984, 6651, 20702, 1077, 37052, 4708, 2633]
        shortlist_bowlers_ids = [2417, 8380, 781, 39657, 3629, 4101, 2933, 2681, 2687, 29888]
        
        batters_list = []
        for rank, pid in enumerate(shortlist_batters_ids, 1):
            if pid in self.batters_df.index:
                row = self.batters_df.loc[pid]
                meta = self.player_meta.get(pid, {})
                batters_list.append({
                    "player_id": pid,
                    "name": row["player_name"],
                    "role": "Batter",
                    "official_rank": rank,
                    "ppi_score": round(float(row["ppi_score"]), 2),
                    "recent_appearances": int(row["recent_matches"]),
                    "pressure_matches": int(row["p_matches"]),
                    "pressure_legal_balls": int(row["p_balls_raw"]),
                    "reliability_pct": round(float(row["reliability"] * 100), 1),
                    "pressure_sr": round(float(row["pressure_sr"]), 1),
                    "baseline_sr": round(float(row["np_sr"]), 1),
                    "sr_uplift": round(float(row["sr_uplift"]), 1),
                    "pressure_boundary_rate": round(float(row["pressure_boundary_rate"]), 1),
                    "boundary_uplift": round(float(row["boundary_uplift"]), 1),
                    "pressure_dismissal_rate": round(float(row["pressure_dismissal_rate"]), 1),
                    "teams": meta.get("teams", [])
                })
                
        bowlers_list = []
        for rank, pid in enumerate(shortlist_bowlers_ids, 1):
            if pid in self.bowlers_df.index:
                row = self.bowlers_df.loc[pid]
                meta = self.player_meta.get(pid, {})
                bowlers_list.append({
                    "player_id": pid,
                    "name": row["player_name"],
                    "role": "Bowler",
                    "official_rank": rank,
                    "ppi_score": round(float(row["ppi_score"]), 2),
                    "recent_appearances": int(row["recent_matches"]),
                    "pressure_matches": int(row["p_matches"]),
                    "pressure_legal_balls": int(row["p_balls_raw"]),
                    "reliability_pct": round(float(row["reliability"] * 100), 1),
                    "pressure_economy": round(float(row["pressure_econ"]), 2),
                    "baseline_economy": round(float(row["np_econ"]), 2),
                    "economy_improvement": round(float(row["econ_improvement"]), 2),
                    "pressure_wickets_per_100": round(float(row["pressure_wkt_per_100"]), 1),
                    "wicket_improvement": round(float(row["wkt_rate_improvement"]), 1),
                    "dot_ball_rate": round(float(row["pressure_dot_rate"]), 1),
                    "teams": meta.get("teams", [])
                })
                
        return {"batters": batters_list, "bowlers": bowlers_list}

    def get_player_details(self, player_id: int, role_preference: Optional[str] = None) -> Dict[str, Any]:
        self.initialize()
        is_batter = player_id in self.batters_df.index
        is_bowler = player_id in self.bowlers_df.index
        
        if not is_batter and not is_bowler:
            meta = self.player_meta.get(player_id, {})
            return {
                "player_id": player_id,
                "name": meta.get("name", "Unknown Player"),
                "found": False,
                "message": "Player has not faced or bowled any deliveries in scoped competitions."
            }
            
        role = "Batter"
        if role_preference:
            role = "Bowler" if role_preference.lower() == "bowler" and is_bowler else "Batter"
        elif is_bowler and not is_batter:
            role = "Bowler"
        elif is_bowler and is_batter:
            b_balls = self.batters_df.loc[player_id, "p_balls_raw"]
            bw_balls = self.bowlers_df.loc[player_id, "p_balls_raw"]
            role = "Bowler" if bw_balls > b_balls else "Batter"
            
        df = self.batters_df if role == "Batter" else self.bowlers_df
        row = df.loc[player_id]
        meta = self.player_meta.get(player_id, {})
        
        pid_col = "striker_id" if role == "Batter" else "bowler_id"
        press_col = "is_batter_pressure" if role == "Batter" else "is_bowler_pressure"
        
        p_deliveries = self.bbb[(self.bbb[pid_col] == player_id) & self.bbb["is_legal"]]
        
        match_stats = []
        for mid, m_df in p_deliveries.groupby("match_id"):
            minfo = self.match_info.get(mid, {})
            m_press = m_df[m_df[press_col]]
            if len(m_press) == 0:
                continue
            
            opp_team = minfo.get("away_team") if m_df["batting_team_id"].iloc[0] == self.matches.loc[self.matches["match_id"] == mid, "home_team_id"].values[0] else minfo.get("home_team")
            if role == "Batter":
                match_stats.append({
                    "match_id": int(mid),
                    "date": minfo.get("match_date", ""),
                    "opponent": opp_team or "Opponent",
                    "format": "IPL" if minfo.get("is_ipl") else "T20I",
                    "pressure_balls": int(len(m_press)),
                    "pressure_runs": int(m_press["runs"].sum()),
                    "boundaries": int(m_press["is_boundary"].sum()),
                    "dismissed": bool(m_press["is_striker_out"].any()),
                    "sr": round(float(m_press["runs"].sum() / len(m_press) * 100), 1)
                })
            else:
                match_stats.append({
                    "match_id": int(mid),
                    "date": minfo.get("match_date", ""),
                    "opponent": opp_team or "Opponent",
                    "format": "IPL" if minfo.get("is_ipl") else "T20I",
                    "pressure_balls": int(len(m_press)),
                    "runs_conceded": int(m_press["bowler_runs_conceded"].sum()),
                    "wickets": int(m_press["is_bowler_wicket"].sum()),
                    "dots": int(m_press["is_dot_ball"].sum()),
                    "economy": round(float(m_press["bowler_runs_conceded"].sum() / len(m_press) * 6.0), 2)
                })
                
        match_stats.sort(key=lambda x: x["date"], reverse=True)
        
        p_ipl = p_deliveries[p_deliveries["match_id"].map(lambda m: self.match_info[m]["is_ipl"]) & p_deliveries[press_col]]
        p_t20i = p_deliveries[p_deliveries["match_id"].map(lambda m: self.match_info[m]["is_t20i"]) & p_deliveries[press_col]]
        
        comp_breakdown = {
            "ipl": {
                "pressure_balls": int(len(p_ipl)),
                "metric_val": round(float(p_ipl["runs"].sum() / len(p_ipl) * 100), 1) if role == "Batter" and len(p_ipl) > 0 else (round(float(p_ipl["bowler_runs_conceded"].sum() / len(p_ipl) * 6), 2) if len(p_ipl) > 0 else 0)
            },
            "t20i": {
                "pressure_balls": int(len(p_t20i)),
                "metric_val": round(float(p_t20i["runs"].sum() / len(p_t20i) * 100), 1) if role == "Batter" and len(p_t20i) > 0 else (round(float(p_t20i["bowler_runs_conceded"].sum() / len(p_t20i) * 6), 2) if len(p_t20i) > 0 else 0)
            }
        }
        
        if role == "Batter":
            narrative = (
                f"{row['player_name']} recorded a pressure strike rate of {row['pressure_sr']:.1f} compared with a baseline of {row['np_sr']:.1f}, "
                f"demonstrating a {row['sr_uplift']:+.1f}-point strike-rate uplift. The player faced {int(row['p_balls_raw'])} pressure balls "
                f"across {int(row['p_matches'])} matches, giving a reliability factor of {row['reliability']*100:.1f}%. "
                f"Pressure boundary rate reached {row['pressure_boundary_rate']:.1f}% ({row['boundary_uplift']:+.1f}% vs baseline)."
            )
        else:
            narrative = (
                f"{row['player_name']} recorded a pressure economy of {row['pressure_econ']:.2f} compared with a baseline of {row['np_econ']:.2f}, "
                f"demonstrating a {row['econ_improvement']:+.2f}-point economy improvement. The bowler delivered {int(row['p_balls_raw'])} pressure balls "
                f"across {int(row['p_matches'])} matches, giving a reliability factor of {row['reliability']*100:.1f}%. "
                f"Achieved {row['pressure_wkt_per_100']:.1f} wickets per 100 balls under pressure with a dot ball rate of {row['pressure_dot_rate']:.1f}%."
            )
            
        return {
            "player_id": player_id,
            "name": row["player_name"],
            "role": role,
            "is_eligible": bool(row["is_eligible"]),
            "eligibility_reasons": {
                "recent_appearances": f"{int(row['recent_matches'])} / 3 required",
                "pressure_balls": f"{int(row['p_balls_raw'])} / 90 required",
                "pressure_matches": f"{int(row['p_matches'])} / 8 required",
                "eligible_recent": bool(row["eligible_recent"]),
                "eligible_sample": bool(row["eligible_sample"])
            },
            "rank": int(row["rank"]) if pd.notna(row["rank"]) else None,
            "ppi_score": round(float(row["ppi_score"]), 2),
            "raw_ppi": round(float(row["raw_ppi"]), 3),
            "reliability_pct": round(float(row["reliability"] * 100), 1),
            "pressure_balls": int(row["p_balls_raw"]),
            "pressure_matches": int(row["p_matches"]),
            "recent_appearances": int(row["recent_matches"]),
            "teams": meta.get("teams", []),
            "stats": {
                "pressure_sr": round(float(row.get("pressure_sr", 0)), 1),
                "baseline_sr": round(float(row.get("np_sr", 0)), 1),
                "sr_uplift": round(float(row.get("sr_uplift", 0)), 1),
                "pressure_boundary_rate": round(float(row.get("pressure_boundary_rate", 0)), 1),
                "baseline_boundary_rate": round(float(row.get("np_boundary_rate", 0)), 1),
                "boundary_uplift": round(float(row.get("boundary_uplift", 0)), 1),
                "pressure_dismissal_rate": round(float(row.get("pressure_dismissal_rate", 0)), 1),
                "pressure_economy": round(float(row.get("pressure_econ", 0)), 2),
                "baseline_economy": round(float(row.get("np_econ", 0)), 2),
                "economy_improvement": round(float(row.get("econ_improvement", 0)), 2),
                "pressure_wkt_per_100": round(float(row.get("pressure_wkt_per_100", 0)), 1),
                "baseline_wkt_per_100": round(float(row.get("np_wkt_per_100", 0)), 1),
                "wicket_improvement": round(float(row.get("wkt_rate_improvement", 0)), 1),
                "dot_ball_rate": round(float(row.get("pressure_dot_rate", 0)), 1)
            },
            "comp_breakdown": comp_breakdown,
            "match_history": match_stats[:15],
            "narrative": narrative
        }

    def search_players(self, query: str) -> List[Dict[str, Any]]:
        self.initialize()
        q = query.strip().lower()
        results = []
        for pid, meta in self.player_meta.items():
            if q in meta["name"].lower():
                is_bat = pid in self.batters_df.index
                is_bowl = pid in self.bowlers_df.index
                role = "All-Rounder" if (is_bat and is_bowl) else ("Batter" if is_bat else "Bowler")
                
                bat_el = bool(self.batters_df.loc[pid, "is_eligible"]) if is_bat else False
                bowl_el = bool(self.bowlers_df.loc[pid, "is_eligible"]) if is_bowl else False
                
                results.append({
                    "player_id": pid,
                    "name": meta["name"],
                    "role": role,
                    "teams": meta["teams"],
                    "recent_matches": meta["recent_appearances"],
                    "is_eligible": bat_el or bowl_el
                })
        return results[:25]

    def simulate_what_if(self, params: Dict[str, Any]) -> Dict[str, Any]:
        self.initialize()
        role = params.get("role", "batter").lower()
        rel_factor = float(params.get("reliability_denominator", 60.0))
        
        if role == "batter":
            df = self.batters_df[self.batters_df["is_eligible"]].copy()
            w_sr = float(params.get("w_sr", 0.35))
            w_br = float(params.get("w_br", 0.20))
            w_dr = float(params.get("w_dr", 0.15))
            w_sru = float(params.get("w_sru", 0.20))
            w_bu = float(params.get("w_bu", 0.10))
            
            def z(s): return (s - s.mean()) / (s.std() if s.std() > 0 else 1.0)
            z_psr = z(df["pressure_sr"])
            z_pbr = z(df["pressure_boundary_rate"])
            z_pdr = -z(df["pressure_dismissal_rate"])
            z_sru = z(df["sr_uplift"])
            z_bu = z(df["boundary_uplift"])
            
            raw = w_sr * z_psr + w_br * z_pbr + w_dr * z_pdr + w_sru * z_sru + w_bu * z_bu
            rel = df["p_balls_raw"] / (df["p_balls_raw"] + rel_factor)
            adj = raw * rel
            
            sim_score = 100.0 * (adj - adj.min()) / (adj.max() - adj.min())
            df["sim_score"] = sim_score
            df["sim_rank"] = df["sim_score"].rank(ascending=False, method="min").astype(int)
            
            top10 = df.sort_values(by="sim_score", ascending=False).head(10)
            res = []
            for pid, r in top10.iterrows():
                official_rank = int(r["rank"])
                rank_change = official_rank - int(r["sim_rank"])
                res.append({
                    "player_id": pid,
                    "name": r["player_name"],
                    "official_rank": official_rank,
                    "sim_rank": int(r["sim_rank"]),
                    "official_ppi": round(float(r["ppi_score"]), 2),
                    "sim_ppi": round(float(r["sim_score"]), 2),
                    "rank_change": rank_change,
                    "p_balls": int(r["p_balls_raw"])
                })
            return {"role": "batter", "top10": res}
        else:
            df = self.bowlers_df[self.bowlers_df["is_eligible"]].copy()
            w_econ = float(params.get("w_econ", 0.30))
            w_wkt = float(params.get("w_wkt", 0.25))
            w_dot = float(params.get("w_dot", 0.15))
            w_eimp = float(params.get("w_eimp", 0.20))
            w_wimp = float(params.get("w_wimp", 0.10))
            
            def z(s): return (s - s.mean()) / (s.std() if s.std() > 0 else 1.0)
            z_pe = -z(df["pressure_econ"])
            z_pw = z(df["pressure_wkt_per_100"])
            z_pd = z(df["pressure_dot_rate"])
            z_ei = z(df["econ_improvement"])
            z_wi = z(df["wkt_rate_improvement"])
            
            raw = w_econ * z_pe + w_wkt * z_pw + w_dot * z_pd + w_eimp * z_ei + w_wimp * z_wi
            rel = df["p_balls_raw"] / (df["p_balls_raw"] + rel_factor)
            adj = raw * rel
            
            sim_score = 100.0 * (adj - adj.min()) / (adj.max() - adj.min())
            df["sim_score"] = sim_score
            df["sim_rank"] = df["sim_score"].rank(ascending=False, method="min").astype(int)
            
            top10 = df.sort_values(by="sim_score", ascending=False).head(10)
            res = []
            for pid, r in top10.iterrows():
                official_rank = int(r["rank"])
                rank_change = official_rank - int(r["sim_rank"])
                res.append({
                    "player_id": pid,
                    "name": r["player_name"],
                    "official_rank": official_rank,
                    "sim_rank": int(r["sim_rank"]),
                    "official_ppi": round(float(r["ppi_score"]), 2),
                    "sim_ppi": round(float(r["sim_score"]), 2),
                    "rank_change": rank_change,
                    "p_balls": int(r["p_balls_raw"])
                })
            return {"role": "bowler", "top10": res}

engine = CricketModelEngine()
