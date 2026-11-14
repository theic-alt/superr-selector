import os
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, Query, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.model_engine import engine

app = FastAPI(
    title="SupeRR Selector — 3D Pressure Performance Intelligence Platform API",
    description="Backend Analytics Engine for Rajasthan Royals SupeRR Selector Season 2 Hackathon",
    version="1.0.0"
)

# Enable CORS for local Vite dev server and production clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    print("Starting FastAPI and warming up model engine...")
    engine.initialize()

@app.get("/")
def root():
    return {
        "status": "online",
        "system": "SupeRR Selector 3D Pressure Performance Intelligence Platform",
        "version": "1.0.0",
        "model": "Pressure Performance Index (PPI) v2.6",
        "endpoints": [
            "/api/overview",
            "/api/players/selected",
            "/api/players",
            "/api/players/{player_id}",
            "/api/players/search",
            "/api/analyze-player",
            "/api/model/methodology",
            "/api/model/simulate",
            "/api/pressure/evaluate"
        ]
    }

@app.get("/api/overview")
def get_overview():
    """Returns overarching dataset statistics, model metrics, and activity scope."""
    return engine.get_overview_stats()

@app.get("/api/players/selected")
def get_selected_top_20():
    """Returns the official shortlisted Top 10 Batters and Top 10 Bowlers."""
    return engine.get_selected_top_20()

@app.get("/api/players")
def list_players(
    role: str = Query("batter", pattern="^(batter|bowler)$"),
    sort_by: str = Query("rank", pattern="^(rank|ppi_score|pressure_sr|pressure_econ|p_balls_raw)$"),
    limit: int = Query(50, ge=1, le=200)
):
    """Returns ranked eligible players for a specific role."""
    engine.initialize()
    df = engine.batters_df if role == "batter" else engine.bowlers_df
    el_df = df[df["is_eligible"]].copy()
    
    ascending = True if sort_by in ["rank", "pressure_econ"] else False
    if sort_by in el_df.columns:
        el_df.sort_values(by=sort_by, ascending=ascending, inplace=True)
    else:
        el_df.sort_values(by="ppi_score", ascending=False, inplace=True)
        
    records = []
    for pid, r in el_df.head(limit).iterrows():
        meta = engine.player_meta.get(pid, {})
        base_record = {
            "player_id": int(pid),
            "name": r["player_name"],
            "role": "Batter" if role == "batter" else "Bowler",
            "rank": int(r["rank"]) if pd_notna(r["rank"]) else None,
            "ppi_score": round(float(r["ppi_score"]), 2),
            "pressure_balls": int(r["p_balls_raw"]),
            "pressure_matches": int(r["p_matches"]),
            "recent_appearances": int(r["recent_matches"]),
            "reliability_pct": round(float(r["reliability"] * 100), 1),
            "teams": meta.get("teams", [])
        }
        if role == "batter":
            base_record.update({
                "pressure_sr": round(float(r["pressure_sr"]), 1),
                "baseline_sr": round(float(r["np_sr"]), 1),
                "sr_uplift": round(float(r["sr_uplift"]), 1),
                "pressure_boundary_rate": round(float(r["pressure_boundary_rate"]), 1)
            })
        else:
            base_record.update({
                "pressure_economy": round(float(r["pressure_econ"]), 2),
                "baseline_economy": round(float(r["np_econ"]), 2),
                "economy_improvement": round(float(r["econ_improvement"]), 2),
                "pressure_wickets_per_100": round(float(r["pressure_wkt_per_100"]), 1),
                "dot_ball_rate": round(float(r["pressure_dot_rate"]), 1)
            })
        records.append(base_record)
        
    return {"role": role, "total_eligible": len(el_df), "players": records}

def pd_notna(val):
    import pandas as pd
    return pd.notna(val)

@app.get("/api/players/search")
def search_players(q: str = Query("", min_length=1)):
    """Search for any player in the dataset with name autocomplete."""
    return engine.search_players(q)

@app.get("/api/players/{player_id}")
def get_player(player_id: int, role: Optional[str] = None):
    """Retrieve full dynamic analytical profile for a single player."""
    res = engine.get_player_details(player_id, role_preference=role)
    if not res.get("found", True):
        raise HTTPException(status_code=404, detail="Player not found in active records.")
    return res

class AnalyzeRequest(BaseModel):
    player_id: int
    role: Optional[str] = "Batter"

@app.post("/api/analyze-player")
def analyze_player(req: AnalyzeRequest):
    """Calculate and return on-demand PPI analysis for any player."""
    res = engine.get_player_details(req.player_id, role_preference=req.role)
    if not res.get("found", True):
        raise HTTPException(status_code=404, detail="Player not found.")
    return res

@app.get("/api/model/methodology")
def get_methodology():
    """Returns official methodology documentation, equations, weights, and rules."""
    return {
        "title": "SupeRR Selector Pressure Performance Intelligence (PPI) Model",
        "version": "2.6",
        "pressure_definition": {
            "description": "Pressure is strictly evaluated from the match state immediately BEFORE each delivery to prevent look-ahead bias.",
            "second_innings_chase": {
                "window": "Legal balls remaining <= 60",
                "conditions_or": [
                    "Required Run Rate (RRR) >= 9.5",
                    "Wickets in hand <= 4 (Wickets lost >= 6)",
                    "RRR - Current Run Rate (CRR) gap >= 2.5"
                ]
            },
            "first_innings_batter": {
                "window": "Legal balls remaining <= 30",
                "condition": "At least 5 wickets have already fallen (Wickets lost >= 5)"
            },
            "first_innings_bowler": {
                "window": "Legal balls remaining <= 30",
                "condition": "At least 5 wickets in hand (Wickets lost <= 5) AND Current Run Rate (CRR) >= 8.0"
            }
        },
        "weights": {
            "batter": {
                "pressure_sr": 0.35,
                "pressure_boundary_rate": 0.20,
                "inverse_dismissal_rate": 0.15,
                "sr_uplift": 0.20,
                "boundary_uplift": 0.10
            },
            "bowler": {
                "inverse_pressure_economy": 0.30,
                "pressure_wickets_per_100": 0.25,
                "pressure_dot_rate": 0.15,
                "economy_improvement": 0.20,
                "wicket_rate_improvement": 0.10
            }
        },
        "reliability": {
            "formula": "Pressure Legal Balls / (Pressure Legal Balls + 60)",
            "purpose": "Bayesian shrinkage damping extreme variance from small pressure sample sizes."
        },
        "competition_adjustment": {
            "ipl_multiplier": 1.15,
            "t20i_formula": "clip(0.85 + 0.60 * Opponent_Win_Rate, 0.85, 1.25)",
            "applied_at": "Delivery aggregation level to both pressure and baseline aggregates."
        },
        "eligibility_thresholds": {
            "recent_activity": "At least 3 played matches between 11 May 2026 and 11 November 2026",
            "pressure_balls": ">= 90 pressure legal balls",
            "pressure_matches": ">= 8 matches with pressure deliveries",
            "competition_scope": "IPL and ICC T20I matches only (2022-2026)"
        },
        "limitations_disclosure": [
            "Dataset ends on 1 November 2026; remaining 10 days of activity window have no matches.",
            "PPI is a historical composite index, not a probability or predictive guarantee.",
            "Opponent win rate is a proxy for competition strength, not team quality."
        ]
    }

class SimulateRequest(BaseModel):
    role: str = "batter"
    reliability_denominator: float = 60.0
    w_sr: Optional[float] = 0.35
    w_br: Optional[float] = 0.20
    w_dr: Optional[float] = 0.15
    w_sru: Optional[float] = 0.20
    w_bu: Optional[float] = 0.10
    w_econ: Optional[float] = 0.30
    w_wkt: Optional[float] = 0.25
    w_dot: Optional[float] = 0.15
    w_eimp: Optional[float] = 0.20
    w_wimp: Optional[float] = 0.10

@app.post("/api/model/simulate")
def simulate_model(req: SimulateRequest):
    """Run experimental What-If model simulation without altering official rankings."""
    return engine.simulate_what_if(req.dict())

class PressureSimulatorInput(BaseModel):
    innings: int = 2
    balls_remaining: int = 48
    runs_required: Optional[int] = 82
    runs_scored: int = 80
    legal_balls_bowled: int = 72
    wickets_lost: int = 4

@app.post("/api/pressure/evaluate")
def evaluate_pressure_live(input_data: PressureSimulatorInput):
    """Interactive match-state simulator demonstrating how the model classifies delivery pressure."""
    inn = input_data.innings
    balls_rem = input_data.balls_remaining
    w_lost = input_data.wickets_lost
    w_hand = max(0, 10 - w_lost)
    balls_bowled = max(1, input_data.legal_balls_bowled)
    runs_scored = input_data.runs_scored
    
    crr = round((runs_scored / balls_bowled) * 6.0, 2)
    
    triggered_conditions = []
    is_pressure = False
    details = {}
    
    if inn == 2:
        runs_req = input_data.runs_required or 0
        rrr = round((runs_req / max(1, balls_rem)) * 6.0, 2)
        gap = round(rrr - crr, 2)
        
        details = {
            "legal_balls_remaining": balls_rem,
            "runs_remaining": runs_req,
            "crr": crr,
            "rrr": rrr,
            "gap": gap,
            "wickets_in_hand": w_hand
        }
        
        c1 = rrr >= 9.5
        c2 = w_hand <= 4
        c3 = gap >= 2.5
        
        if c1: triggered_conditions.append("Condition 1: Required Run Rate (RRR) >= 9.5 runs/over")
        if c2: triggered_conditions.append("Condition 2: Wickets in hand <= 4 (Severe collapse / lower order)")
        if c3: triggered_conditions.append("Condition 3: RRR - CRR Gap >= 2.5 runs/over (Steep accelerating chase)")
        
        if balls_rem <= 60 and (c1 or c2 or c3):
            is_pressure = True
            reason = f"Chase Pressure: Balls remaining ({balls_rem} <= 60) AND {len(triggered_conditions)} trigger condition(s) satisfied."
        else:
            reason = f"Normal Match State: {'Balls remaining > 60' if balls_rem > 60 else 'None of the 3 RRR / Wicket / Gap thresholds triggered'}."
            
        return {
            "is_pressure": is_pressure,
            "mode": "Second Innings (Chase)",
            "reason": reason,
            "triggered_conditions": triggered_conditions,
            "metrics": details
        }
    else:
        # First Innings
        details = {
            "legal_balls_remaining": balls_rem,
            "crr": crr,
            "wickets_lost": w_lost,
            "wickets_in_hand": w_hand
        }
        
        # Batter check
        bat_pressure = (balls_rem <= 30) and (w_lost >= 5)
        if balls_rem <= 30 and w_lost >= 5:
            triggered_conditions.append("Batter Pressure: Balls <= 30 AND Wickets lost >= 5 (Death overs rebuilding)")
            
        # Bowler check
        bowl_pressure = (balls_rem <= 30) and (w_hand >= 5) and (crr >= 8.0)
        if balls_rem <= 30 and w_hand >= 5 and crr >= 8.0:
            triggered_conditions.append("Bowler Pressure: Balls <= 30 AND Wickets in hand >= 5 AND CRR >= 8.0 (Death overs bowling under assault)")
            
        return {
            "is_batter_pressure": bat_pressure,
            "is_bowler_pressure": bowl_pressure,
            "is_pressure": bat_pressure or bowl_pressure,
            "mode": "First Innings",
            "triggered_conditions": triggered_conditions,
            "metrics": details
        }
