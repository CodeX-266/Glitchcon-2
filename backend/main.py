from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os
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