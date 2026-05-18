from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from ml.event_tfidf import EventClassifier
from ml.pipeline import load_data, aggregate, build_features
from ml.surge_engine import compute_fare
from ml.rl_dqn import DQN, Agent
from graph.build_graph import build_graph
from ml.gnn_model import DemandGNN

import random
import torch
from datetime import datetime

app = FastAPI()

# ✅ CORS (safe)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # 🔥 TEMP allow all (fixes dev issues)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ======================
# GLOBAL INIT
# ======================
classifier = EventClassifier()

FEATURE_DIM = 5
gnn = DemandGNN(in_channels=FEATURE_DIM)

dqn_model = DQN(5, 5)
agent = Agent(dqn_model)

trips = None
zones = None
df = None


# ======================
# FIXED TIME CONTEXT
# ======================
def detect_time_context(current_hour, df):
    df = df.copy()
    df["hour"] = df["hour"].astype(int)  # 🔥 CRITICAL FIX

    peak_hours = df.groupby("hour")["demand"].mean().nlargest(3).index.tolist()

    rush_hour = current_hour in peak_hours

    if rush_hour:
        factor = 1.5
    elif any(abs(current_hour - h) <= 2 for h in peak_hours):
        factor = 1.3
    else:
        factor = 1.0

    return {
        "rush_hour": rush_hour,
        "factor": factor,
        "peak_hours": peak_hours
    }


# ======================
# DATA LOADER
# ======================
def get_data():
    global trips, zones, df

    if df is None:
        try:
            trips, zones = load_data()
            df = aggregate(trips)
        except Exception as e:
            print("⚠️ Using mock data:", e)

            import pandas as pd
            df = pd.DataFrame({
                "PULocationID": [1, 2, 3, 4, 5],
                "demand": [10, 20, 15, 25, 30],
                "trip_distance": [2.0, 3.0, 1.5, 4.0, 2.5],
                "fare_amount": [10.0, 15.0, 8.0, 20.0, 12.0],
                "hour": [10, 12, 14, 16, 18],
            })

    return df


@app.get("/")
def home():
    return {"message": "Backend Running ✅"}


# ======================
# MAIN API (FULL SAFE)
# ======================
@app.post("/predict")
def predict(payload: dict):
    try:
        text = payload.get("text", "").strip()

        if not text:
            return JSONResponse(status_code=400, content={"error": "Empty input"})

        event = classifier.predict(text)

        if event.get("error"):
            return JSONResponse(status_code=422, content={"error": event["error"]})

        base_fare = 10
        fare = compute_fare(base_fare, event)

        data_df = get_data()

        # ======================
        # FEATURES
        # ======================
        current_hour = datetime.now().hour
        print("🕒 Current hour:", current_hour)

        features = build_features(data_df, event, current_hour)

        # ======================
        # GRAPH
        # ======================
        graph_data = build_graph(features)

        # ======================
        # GNN
        # ======================
        with torch.no_grad():
            demand_pred = gnn(graph_data.x, graph_data.edge_index).squeeze().numpy()

        # ======================
        # TIME BOOST
        # ======================
        time_ctx = detect_time_context(current_hour, data_df)

        demand_final = [
            float(d) * time_ctx["factor"]
            for d in demand_pred
        ]

        time_info = {
            "hour": current_hour,
            "factor": time_ctx["factor"],
            "rush": time_ctx["rush_hour"],
            "peaks": time_ctx["peak_hours"]
        }

        # ======================
        # RL
        # ======================
        global agent

        state_dim = len(demand_final)
        action_dim = len(demand_final)

        if agent.model.net[0].in_features != state_dim:
            dqn_model = DQN(state_dim, action_dim)
            agent = Agent(dqn_model)

        event_zone = event.get("zone_id") or 0

        state = [
            d + abs(i - event_zone)
            for i, d in enumerate(demand_final)
        ]

        action = agent.act(state)

        # ======================
        # ALLOCATION
        # ======================
        allocations = []

        for i, zone in enumerate(data_df["PULocationID"]):
            taxis = int(demand_final[i] / 10)

            if i == action:
                taxis += 5

            allocations.append({
                "zone_id": int(zone),
                "taxis_needed": max(1, taxis)
            })

        return {
            "event": event,
            "fare": fare,
            "time_info": time_info,
            "zones": data_df.to_dict(orient="records"),
            "allocations": allocations,
            "gnn_demand": demand_final,
        }

    except Exception as e:
        print("🔥 BACKEND ERROR:", str(e))

        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )


# ======================
# SIMULATION
# ======================
@app.post("/simulate-taxis")
def simulate_taxis(payload: dict):
    allocations = payload.get("allocations", [])

    taxis = []
    taxi_id = 1

    for alloc in allocations:
        for _ in range(alloc.get("taxis_needed", 0)):
            taxis.append({
                "id": taxi_id,
                "zone": f"Zone {alloc['zone_id']}",
                "status": "active"
            })
            taxi_id += 1

    return {"taxis": taxis}