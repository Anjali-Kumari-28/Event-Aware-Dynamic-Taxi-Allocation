import pandas as pd
import numpy as np

def load_data():
    try:
        trips = pd.read_parquet("data/yellow_tripdata_2026-01.parquet")
        zones = pd.read_csv("data/taxi_zone_lookup.csv")

        # ✅ Safety check — ensure required columns exist before merging
        if "PULocationID" not in trips.columns:
            raise ValueError("trips data missing 'PULocationID' column")
        if "LocationID" not in zones.columns:
            raise ValueError("zones data missing 'LocationID' column")

        trips = trips.merge(zones, left_on="PULocationID", right_on="LocationID", how="left")

        return trips, zones

    except FileNotFoundError as e:
        raise FileNotFoundError(f"Data file not found: {e}. Make sure parquet and CSV files are in /data folder.")


def aggregate(trips):
    required = ["tpep_pickup_datetime", "PULocationID", "trip_distance", "fare_amount"]
    missing = [col for col in required if col not in trips.columns]
    if missing:
        raise ValueError(f"Missing columns: {missing}")

    trips = trips.copy()

    trips["hour"] = pd.to_datetime(trips["tpep_pickup_datetime"]).dt.hour

    grouped = trips.groupby("PULocationID").agg(
        trip_distance=("trip_distance", "mean"),
        fare_amount=("fare_amount", "mean"),
        demand=("PULocationID", "count"),
        hour=("hour", "mean")   # ✅ FIX
    ).reset_index()

    return grouped

def apply_time_boost(demand, current_hour, event_hour):
    time_diff = abs(event_hour - current_hour)

    if time_diff <= 1:
        factor = 1.5
    elif time_diff <= 3:
        factor = 1.3
    else:
        factor = 1.0

    return demand * factor

def build_features(df, event, current_hour):
    hour_normalized = df["hour"].values / 24.0

    current_hour_normalized = current_hour / 24.0
    current_hour_feature = np.full(len(df), current_hour_normalized)

    features = np.column_stack([
        df["demand"].values,
        df["trip_distance"].values,
        df["fare_amount"].values,
        hour_normalized,
        current_hour_feature
    ])

    return features.astype(float)