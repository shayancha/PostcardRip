# NYC Congestion Pricing Tool — Project Plan

## Research Summary

### NYC Congestion Relief Zone — Current Policy

**Zone boundary:** All of Manhattan south of and including 60th Street, excluding the FDR Drive and West Side Highway/Route 9A (pure throughways).

**Entry points charged:** Lincoln Tunnel, Holland Tunnel, Hugh L. Carey Tunnel, Queensboro Bridge, Queens-Midtown Tunnel, Williamsburg Bridge, Manhattan Bridge, Brooklyn Bridge.

**Current toll rates (launched Jan 5, 2025):**

| Vehicle Type | Peak | Overnight |
|---|---|---|
| Passenger cars/SUVs | $9.00 | $2.25 |
| Motorcycles | $4.50 | $1.05 |
| Small trucks | $14.40 | $3.60 |
| Large trucks/tour buses | $21.60 | $5.40 |
| Taxis & FHV (per trip) | $0.75 | $0.75 |

- **Peak hours:** 5am–9pm weekdays, 9am–9pm weekends
- **Overnight:** 9pm–5am weekdays, 9pm–9am weekends
- Toll-by-mail adds ~50% surcharge vs E-ZPass
- Planned increases: **$12** in 2028, **$15** in 2031

**Early results (1 year in):** Traffic down ~10–15%, transit ridership up, taxi trips up, noise complaints and collision injuries down. Controversial for equity reasons — lower-income commuters who must drive are disproportionately burdened.

---

### Congestion Pricing Theory

- **Optimal toll** = marginal external cost imposed on other drivers (delay, pollution) above what the individual driver already pays
- **Static pricing** — flat rates (NYC's current approach)
- **Variable/time-of-day pricing** — set in advance for known peak periods
- **Dynamic pricing** — recalibrates every few minutes based on live traffic
- **Multi-objective tradeoffs:** revenue, traffic reduction, travel time savings, equity (income fairness), and emissions — these often conflict, making optimization non-trivial
- **Genetic algorithms** have been used in academic literature specifically for optimal toll ring design (NSGA-II for multi-objective, adaptive GAs for hybrid upper/lower-level problems)

---

## Project Plan

### 1. Overview

A web app that lets users plan NYC trips with:
1. A route map (origin → destination, with path visualization)
2. Travel time + cost estimates under **any toll policy**
3. A **Genetic Algorithm Policy Optimizer** that generates a toll policy optimized for a user-specified tradeoff (minimize time vs. minimize cost burden)
4. A **side-by-side comparison** with the current MTA baseline

---

### 2. Architecture

```
+------------------------------------------+
|              Frontend (React)             |
|  - Map view (Mapbox or Google Maps)       |
|  - Route input (origin / destination)     |
|  - Policy comparison panel                |
|  - GA controls (objective sliders)        |
+------------------+-----------------------+
                   | REST / WebSocket
+------------------v-----------------------+
|           Backend (Python FastAPI)        |
|  - Routing engine (OSRM or Google API)   |
|  - Toll calculation engine               |
|  - Genetic Algorithm optimizer           |
|  - Policy store (baseline + generated)   |
+------------------------------------------+
```

**Tech stack:**
- **Frontend:** React + TypeScript, Mapbox GL JS (free tier generous, great for custom zones)
- **Backend:** Python + FastAPI
- **Routing:** Google Directions API (real traffic data) or OSRM (open-source, self-hosted)
- **GA library:** DEAP (Python) — built for multi-objective optimization with NSGA-II
- **Data:** MTA toll schedule hard-coded; OpenStreetMap for zone geometry

---

### 3. Core Modules

#### Module A — Route + Time Estimation
- Accept origin/destination (address or lat/lng)
- Call routing API → get path geometry, duration, distance
- Detect if route enters/passes through the Congestion Relief Zone (geospatial check against zone polygon)
- Identify entry point (which bridge/tunnel)
- Determine if trip is a through-trip or a destination trip (affects charge)

#### Module B — Toll Calculation Engine
```
inputs:  route, vehicle_type, departure_time, policy
outputs: toll_charge, total_trip_cost_estimate
```
- `policy` is a data structure defining toll rates per time window per vehicle class
- The **baseline policy** is the current MTA schedule hard-coded
- Any GA-generated policy plugs into the same engine — clean separation

**Policy schema (simplified):**
```json
{
  "time_windows": [
    { "label": "peak_weekday",   "hours": [[5,21]], "days": [0,1,2,3,4] },
    { "label": "peak_weekend",   "hours": [[9,21]], "days": [5,6] },
    { "label": "overnight",      "hours": [[21,24],[0,5]], "days": "all" }
  ],
  "rates": {
    "passenger":  { "peak_weekday": 9.00, "peak_weekend": 9.00, "overnight": 2.25 },
    "motorcycle": { "peak_weekday": 4.50, "peak_weekend": 4.50, "overnight": 1.05 },
    "small_truck":{ "peak_weekday": 14.40, "..." : "..." },
    "large_truck":{ "peak_weekday": 21.60, "..." : "..." }
  }
}
```

#### Module C — Genetic Algorithm Policy Optimizer

**What gets optimized:** The toll rates across time windows and vehicle classes.

**Chromosome representation:**
Each individual = a flat vector of toll rates, e.g.:
```
[ passenger_peak, passenger_offpeak, motorcycle_peak, motorcycle_offpeak,
  small_truck_peak, small_truck_offpeak, large_truck_peak, large_truck_offpeak ]
```
With bounds: rates must stay >= $0 and <= some ceiling (e.g. $30).

**Multi-objective fitness function (two objectives):**
1. **Traffic volume proxy** — estimated vehicles entering zone under this policy (higher toll → fewer vehicles → lower congestion → lower travel time). Model this with a simple demand elasticity curve calibrated to NYC data.
2. **Cost burden index** — average toll paid per trip, weighted by income distribution (penalizes policies that are regressive). Can use a simple Gini-like metric on toll/income ratios across income brackets.

**Algorithm:** NSGA-II (Non-dominated Sorting Genetic Algorithm II) — produces a **Pareto frontier** of policies showing the tradeoff between traffic reduction and cost equity.

**User controls:**
- A slider: "Prioritize traffic reduction <---> Prioritize affordability"
- The slider selects a point on the Pareto frontier to display

#### Module D — Comparison View
- Show current MTA policy and GA-optimized policy side by side
- For a given route + departure time: display toll charged, estimated travel time, and cost-burden score under each policy
- Visual chart of Pareto frontier with current policy plotted as a reference point

---

### 4. Build Phases

**Phase 1 — Map + Routing foundation**
- Set up React app with Mapbox
- Draw the Congestion Relief Zone polygon (GeoJSON)
- Origin/destination search with autocomplete
- Display route on map
- Detect zone entry

**Phase 2 — Toll calculator**
- Implement policy schema and toll engine
- Wire in vehicle type + departure time selectors
- Show toll + total cost estimate for current MTA baseline

**Phase 3 — Genetic Algorithm**
- Implement demand elasticity model (literature-calibrated)
- Implement fitness functions (congestion reduction + equity)
- Run NSGA-II in backend, expose results via API
- Pareto frontier visualization in UI

**Phase 4 — Policy comparison UI**
- Side-by-side panel: baseline vs. optimized
- Pareto slider
- Trip-level cost comparison

**Phase 5 — Polish**
- Mobile-responsive layout
- Loading states, error handling
- Edge cases (through-trips, credits for low-income drivers, tunnel vs. bridge entries)

---

### 5. Key Data Sources

| Data | Source |
|---|---|
| Zone boundary polygon | MTA / NYC Open Data GeoJSON |
| Current toll rates | Hard-coded from MTA schedule |
| Routing & traffic | Google Directions API or OSRM |
| Demand elasticity estimates | Academic literature (~-0.3 to -0.5 elasticity for urban tolls) |
| Income distribution by zip | US Census ACS |
| Traffic volume baselines | NYC DOT / MTA open data |

---

### 6. Interesting Extensions (post-MVP)
- **Time-of-travel optimizer:** given a destination, recommend the cheapest departure time
- **Mode comparison:** show cost of driving vs. subway vs. taxi for same trip
- **Credit/exemption modeling:** low-income credit (MTA offers $60/year for qualifying drivers), simulate effect on equity score
- **Dynamic pricing simulation:** GA that sets rates that update every 15 minutes based on traffic (like Express Lanes on US highways)

---

## Sources
- [MTA Congestion Relief Zone Tolling](https://congestionreliefzone.mta.info/tolling)
- [Congestion pricing in New York City — Wikipedia](https://en.wikipedia.org/wiki/Congestion_pricing_in_New_York_City)
- [Vital City — Congestion Pricing, One Year In](https://www.vitalcitynyc.org/articles/one-year-into-congestion-pricing-in-new-york-city)
- [Congestion pricing — Wikipedia](https://en.wikipedia.org/wiki/Congestion_pricing)
- [Dynamic Pricing Algorithms for Toll Roads — GI Hub](https://www.gihub.org/infrastructure-technology-use-cases/case-studies/dynamic-pricing-algorithms-for-toll-roads/)
- [Optimal congestion pricing toll design — ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S2213624X16300050)
- [Genetic Algorithm for Constraint Optimal Toll Ring Design — Springer](https://link.springer.com/chapter/10.1007/978-3-540-69390-1_3)
- [NYC Congestion Pricing Map — NY Tolls Info](https://nytollsinfo.com/nyc-congestion-pricing-map-updated/)
