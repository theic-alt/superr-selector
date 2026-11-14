# SupeRR Selector — 3D Pressure Performance Intelligence Platform

Production-grade cricket analytics intelligence platform built for the **Rajasthan Royals SupeRR Selector Season 2 Hackathon**.

The platform is designed to identify, evaluate, and rank professional T20 cricketers based on their ability to perform in high-pressure match situations, implementing the **Pressure Performance Index (PPI)** model.

---

## Architecture Overview

```
superr-selector/
├── backend/
│   ├── main.py                  # FastAPI server with RESTful endpoints
│   ├── model_engine.py          # Complete verifiable Pressure Performance Index calculation engine
│   └── test_api.py              # Automated test suite for endpoints & pressure formulas
├── data/
│   ├── ball_by_ball.csv         # 194,014 delivery-level records (IPL & T20I)
│   ├── matches.csv              # Match metadata, revised overs, target revisions
│   ├── competitions.csv         # Competition scopes (IPL 2022-2026 & ICC T20Is)
│   ├── teams.csv                # Franchise & international teams
│   ├── playing_eleven.csv       # Playing XIs & appearances
│   ├── competition_team_player_mapping.csv
│   └── bbb_processed.pkl        # Precomputed high-speed delivery state cache
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx       # Brand header with live telemetry indicator
│   │   │   ├── Stadium3D.tsx    # Procedural Three.js 3D stadium & pressure trajectories
│   │   │   └── PlayerModal.tsx  # Detailed player analysis with match breakdown
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx          # 3D cinematic opening page
│   │   │   ├── CommandCentrePage.tsx    # Analytics dashboard & leaderboards
│   │   │   ├── SelectedArenaPage.tsx    # 3D interactive Top 20 cards
│   │   │   ├── PlayerAnalyzerPage.tsx   # Search & on-demand PPI calculator
│   │   │   ├── PressureExplainerPage.tsx# Live match-state simulator
│   │   │   └── ModelExplorerPage.tsx    # What-If simulator & methodology documentation
│   │   ├── api.ts               # Type-safe API client
│   │   └── types.ts             # TypeScript domain interfaces
│   ├── tailwind.config.js       # Rajasthan Royals custom design palette
│   └── package.json
└── scripts/
    ├── inspect_data.py          # Data validation & schema diagnostics
    └── run_pipeline.py          # Standalone end-to-end model pipeline execution
```

---

## 1. Pressure Classification Model

Pressure is evaluated strictly **immediately BEFORE each delivery** without look-ahead bias:

### Second Innings — Chase Pressure
A delivery is classified as pressure when:
$$\text{Legal balls remaining} \le 60$$
AND at least **ONE** of the following conditions is satisfied:
1. **Required Run Rate (RRR)** $\ge 9.5 \text{ RPO}$
2. **Wickets in hand** $\le 4$ (at least 6 wickets lost)
3. **RRR - CRR Gap** $\ge 2.5 \text{ RPO}$

### First Innings — Batter Pressure
$$\text{Legal balls remaining} \le 30 \quad \text{AND} \quad \text{Wickets lost} \ge 5$$

### First Innings — Bowler Pressure
$$\text{Legal balls remaining} \le 30 \quad \text{AND} \quad \text{Wickets in hand} \ge 5 \quad \text{AND} \quad \text{CRR} \ge 8.0 \text{ RPO}$$

---

## 2. Competition Strength Adjustment

- **IPL Delivery Weight**: $1.15$
- **T20I Opponent Strength Factor**:
  $$\text{Factor} = \text{clip}(0.85 + 0.60 \times \text{Opponent Win Rate}, 0.85, 1.25)$$
- Weights are applied directly at the delivery aggregation stage to both pressure and baseline aggregates.

---

## 3. Weighting & Scoring Formulas

### Batter Raw PPI
$$\text{Raw PPI} = 0.35 \times z(\text{Pressure SR}) + 0.20 \times z(\text{Boundary Rate}) - 0.15 \times z(\text{Dismissal Rate}) + 0.20 \times z(\text{SR Uplift}) + 0.10 \times z(\text{Boundary Uplift})$$

### Bowler Raw PPI
$$\text{Bowler Raw PPI} = -0.30 \times z(\text{Pressure Economy}) + 0.25 \times z(\text{Wkts/100}) + 0.15 \times z(\text{Dot Rate}) + 0.20 \times z(\text{Economy Imp}) + 0.10 \times z(\text{Wicket Imp})$$

### Reliability Factor
$$\text{Reliability} = \frac{\text{Pressure Legal Balls}}{\text{Pressure Legal Balls} + 60}$$
$$\text{Adjusted PPI} = \text{Raw PPI} \times \text{Reliability}$$

### Scaled PPI / 100
$$\text{PPI}_{100} = 100 \times \frac{\text{Adjusted PPI} - \text{Pool Min}}{\text{Pool Max} - \text{Pool Min}}$$

---

## 4. Official Shortlist & Model Validation

### Top 10 Batters
| Rank | Player | Official Ref | Model Output | Diff | Reliability | Status |
|---|---|---|---|---|---|---|
| **1** | **Donovan Ferreira** | 100.00 | **100.00** | 0.00 | 63.0% | Shortlisted |
| **2** | **Shashank Singh** | 93.55 | **97.53** | +3.98 | 83.4% | Shortlisted |
| **3** | **Ashutosh Sharma** | 89.33 | **87.03** | -2.30 | 79.8% | Shortlisted |
| **4** | **Sikandar Raza** | 88.18 | **76.82** | -11.36 | 78.8% | Shortlisted |
| **5** | **Towhid Hridoy** | 87.01 | **80.07** | -6.94 | 67.4% | Shortlisted |
| **6** | **Tristan Stubbs** | 86.55 | **88.44** | +1.89 | 85.8% | Shortlisted |
| **7** | **David Miller** | 86.05 | **89.00** | +2.95 | 88.8% | Shortlisted |
| **8** | **Naman Dhir** | 84.54 | **94.77** | +10.23 | 74.7% | Shortlisted |
| **9** | **Rinku Singh** | 84.24 | **82.58** | -1.66 | 87.7% | Shortlisted |
| **10** | **Jason Holder** | 79.32 | **71.13** | -8.19 | 80.8% | Shortlisted |

### Top 10 Bowlers
| Rank | Player | Official Ref | Model Output | Diff | Reliability | Status |
|---|---|---|---|---|---|---|
| **1** | **Akeal Hosein** | 100.00 | **100.00** | 0.00 | 75.1% | Shortlisted |
| **2** | **Sunil Narine** | 91.19 | **91.33** | +0.14 | 82.6% | Shortlisted |
| **3** | **Mohammad Rishad Hossain** | 93.79 | **91.12** | -2.67 | 71.8% | Shortlisted |
| **4** | **Mitchell Santner** | 86.25 | **91.08** | +4.83 | 82.6% | Shortlisted |
| **5** | **Corbin Bosch** | 89.94 | **89.14** | -0.80 | 65.5% | Shortlisted |
| **6** | **Eshan Malinga** | 91.05 | **84.92** | -6.13 | 77.6% | Shortlisted |
| **7** | **Roston Chase** | 78.74 | **83.35** | +4.61 | 61.0% | Shortlisted |
| **8** | **Jasprit Bumrah** | 85.98 | **79.80** | -6.18 | 88.1% | Shortlisted |
| **9** | **Taskin Ahmed** | 79.32 | **78.93** | -0.39 | 78.6% | Shortlisted |
| **10** | **Harshit Rana** | 78.44 | **73.61** | -4.83 | 74.9% | Shortlisted |

---

## 5. Startup & Execution Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm

### Backend Startup
```bash
cd superr-selector
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
Backend Swagger Documentation: `http://127.0.0.1:8000/docs`

### Frontend Startup
```bash
cd superr-selector/frontend
npm install
npm run dev
```
Open `http://localhost:5173/` in your browser.

### Automated Testing
```bash
python backend/test_api.py
```
Outputs: `ALL API & MODEL TESTS PASSED SUCCESSFULLY!`

---

## 6. API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/overview` | Macro telemetry and dataset activity scope |
| `GET` | `/api/players/selected` | Official shortlisted Top 10 Batters & Top 10 Bowlers |
| `GET` | `/api/players?role=batter` | Ranked list of eligible players |
| `GET` | `/api/players/{id}` | Detailed historical match performance profile |
| `GET` | `/api/players/search?q={name}` | Autocomplete player search across 891 players |
| `POST` | `/api/analyze-player` | On-demand dynamic PPI calculation |
| `POST` | `/api/pressure/evaluate` | Interactive delivery-level pressure classifier |
| `POST` | `/api/model/simulate` | What-If model simulation with custom parameters |
| `GET` | `/api/model/methodology` | Mathematical documentation & disclosures |
