from fastapi import FastAPI, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os
import json
from ai_engine import run_detection

app = FastAPI(title="AI Revenue Leakage Detection System")

# CORS — allow React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATA_PATH = os.path.join(BASE_DIR, "..", "data", "hospital_billing_data.csv")
ALERT_PATH = os.path.join(BASE_DIR, "detected_alerts.csv")
STATES_PATH = os.path.join(BASE_DIR, "alert_states.json")


# ---------------------------------------
# Health check
# ---------------------------------------
@app.get("/")
def home():
    return {
        "system": "Revenue Leakage Detection API",
        "status": "running"
    }


# ---------------------------------------
# Upload billing dataset
# ---------------------------------------
@app.post("/upload-data")
async def upload_dataset(file: UploadFile = File(...)):

    contents = await file.read()

    with open(DATA_PATH, "wb") as f:
        f.write(contents)

    return {
        "message": "Dataset uploaded successfully"
    }


# ---------------------------------------
# Run AI revenue leakage detection
# ---------------------------------------
@app.post("/run-analysis")
def run_analysis():

    alerts = run_detection()

    total_loss = float(alerts["loss"].sum())

    return {
        "total_alerts": len(alerts),
        "total_revenue_loss": total_loss
    }


# ---------------------------------------
# Get detected alerts
# ---------------------------------------
@app.get("/alerts")
def get_alerts():

    if not os.path.exists(ALERT_PATH):
        return []

    df = pd.read_csv(ALERT_PATH)

    return df.to_dict(orient="records")


# ---------------------------------------
# Dashboard analytics
# ---------------------------------------
@app.get("/analytics")
def analytics():

    if not os.path.exists(ALERT_PATH):
        return {"message": "No alerts generated yet"}

    df = pd.read_csv(ALERT_PATH)

    total_loss = df["loss"].sum()

    issue_breakdown = df.groupby("issue")["loss"].sum().to_dict()

    dept_breakdown = df.groupby("department")["loss"].sum().to_dict()

    return {
        "total_revenue_loss": float(total_loss),
        "issue_breakdown": issue_breakdown,
        "department_breakdown": dept_breakdown
    }


# ---------------------------------------
# Alert state sync (cross-device)
# ---------------------------------------
@app.get("/states")
def get_states():
    """Get saved alert states (assignments, status changes)."""
    if not os.path.exists(STATES_PATH):
        return {}
    try:
        with open(STATES_PATH, "r") as f:
            return json.load(f)
    except Exception:
        return {}


@app.post("/states")
async def save_states(request: Request):
    """Save alert states from any client."""
    try:
        body = await request.json()
        # Merge with existing states (don't overwrite other fields)
        existing = {}
        if os.path.exists(STATES_PATH):
            with open(STATES_PATH, "r") as f:
                existing = json.load(f)
        existing.update(body)
        with open(STATES_PATH, "w") as f:
            json.dump(existing, f)
        return {"ok": True, "count": len(existing)}
    except Exception as e:
        return {"ok": False, "error": str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)