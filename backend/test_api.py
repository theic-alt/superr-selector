import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_root():
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "online"

def test_overview():
    res = client.get("/api/overview")
    assert res.status_code == 200
    data = res.json()
    assert data["total_players_in_dataset"] > 800
    assert data["total_matches_analysed"] > 800
    assert data["eligible_batters_count"] > 50
    assert data["eligible_bowlers_count"] > 50

def test_selected_top_20():
    res = client.get("/api/players/selected")
    assert res.status_code == 200
    data = res.json()
    assert len(data["batters"]) == 10
    assert len(data["bowlers"]) == 10
    assert data["batters"][0]["name"] == "Donovan Ferreira"
    assert data["batters"][0]["ppi_score"] == 100.0
    assert data["bowlers"][0]["name"] == "Akeal Hosein"
    assert data["bowlers"][0]["ppi_score"] == 100.0

def test_player_search():
    res = client.get("/api/players/search?q=Bumrah")
    assert res.status_code == 200
    players = res.json()
    assert len(players) > 0
    assert any("Bumrah" in p["name"] for p in players)

def test_player_details():
    res = client.get("/api/players/8182")
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "Donovan Ferreira"
    assert data["role"] == "Batter"
    assert data["rank"] == 1
    assert "stats" in data
    assert "narrative" in data

def test_pressure_live_evaluator():
    payload = {
        "innings": 2,
        "balls_remaining": 48,
        "runs_required": 82,
        "runs_scored": 97,
        "legal_balls_bowled": 72,
        "wickets_lost": 4
    }
    res = client.post("/api/pressure/evaluate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["is_pressure"] is True
    assert len(data["triggered_conditions"]) > 0

def test_what_if_simulator():
    payload = {
        "role": "batter",
        "reliability_denominator": 50.0,
        "w_sr": 0.40,
        "w_br": 0.20,
        "w_dr": 0.10,
        "w_sru": 0.20,
        "w_bu": 0.10
    }
    res = client.post("/api/model/simulate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert len(data["top10"]) == 10

if __name__ == "__main__":
    test_root()
    test_overview()
    test_selected_top_20()
    test_player_search()
    test_player_details()
    test_pressure_live_evaluator()
    test_what_if_simulator()
    print("ALL API & MODEL TESTS PASSED SUCCESSFULLY!")
