import os
import pandas as pd
import joblib
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import LabelEncoder


# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "..", "data", "hospital_billing_data.csv")
MODEL_PATH = os.path.join(BASE_DIR, "model.joblib")
ENCODERS_PATH = os.path.join(BASE_DIR, "encoders.joblib")
ALERTS_PATH = os.path.join(BASE_DIR, "detected_alerts.csv")


# Full CPT reference mapping
CPT_MAP = {
    "MRI Brain": "70553",
    "Blood Panel": "80050",
    "CT Abdomen": "74178",
    "Cardiac Echo": "93306",
    "Knee Surgery": "27447",
    "Colonoscopy": "45378",
    "Ultrasound": "76700",
    "Sleep Study": "95808",
    "X-Ray Chest": "71020",
    "Thyroid Test": "84443",
    "Appendectomy": "44950",
    "Angiography": "93510",
    "CT Brain": "70450",
    "Glucose Test": "82947",
    "Endoscopy": "43235",
    "EEG": "95816",
    "Stress Test": "93015",
    "Liver Panel": "80076",
    "Spine MRI": "72148",
    "Arthroscopy": "29881",
    "CT Chest": "71260",
    "Blood Culture": "87040",
    "Angioplasty": "92928",
    "Gallbladder Surgery": "47562",
    "Upper GI Endoscopy": "43239",
    "Nerve Conduction Study": "95907",
    "Abdominal Ultrasound": "76705",
    "Lipid Profile": "80061",
    "Pacemaker Implant": "33208",
    "Hernia Repair": "49505",
    "Brain MRI": "70551",
    "Complete Blood Count": "85025",
    "Angiogram": "93508",
    "Knee Replacement": "27447",
    "Esophageal Endoscopy": "43235",
    "EEG Monitoring": "95951",
    "Chest CT": "71250",
    "Vitamin D Test": "82306",
    "Cardiac Catheterization": "93458",
}


def _prepare_features(df):
    """Engineer richer features for anomaly detection."""

    # ── Derived numeric features ──
    # Payment ratio: how much of the charge was actually paid
    df["payment_ratio"] = df["insurance_paid"] / df["charge_amount"].replace(0, 1)

    # Charge deviation: how far this charge is from the department average
    dept_avg = df.groupby("department")["charge_amount"].transform("mean")
    df["charge_deviation"] = (df["charge_amount"] - dept_avg) / dept_avg.replace(0, 1)

    # ── Encode categorical columns ──
    encoders = {}
    for col in ["department", "procedure", "claim_status"]:
        le = LabelEncoder()
        df[f"{col}_enc"] = le.fit_transform(df[col].astype(str))
        encoders[col] = le

    feature_cols = [
        "charge_amount",
        "insurance_paid",
        "payment_ratio",
        "charge_deviation",
        "department_enc",
        "procedure_enc",
        "claim_status_enc",
    ]

    return df, df[feature_cols], encoders


def _train_model(features):
    """Train an Isolation Forest and persist it to disk."""
    model = IsolationForest(
        n_estimators=150,
        contamination=0.2,
        random_state=42,
    )
    model.fit(features)
    joblib.dump(model, MODEL_PATH)
    return model


def _load_or_train_model(features, force_retrain=False):
    """Load a previously trained model or train a new one."""
    if not force_retrain and os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
    else:
        model = _train_model(features)
    return model


def run_detection(force_retrain=False):
    """
    Main detection pipeline.
    Combines rule-based checks with ML anomaly detection.
    """

    # ── Load & clean data ──
    df = pd.read_csv(CSV_PATH)
    df["procedure"] = df["procedure"].str.strip()
    df["cpt_code"] = df["cpt_code"].astype(str).str.strip()

    # ── Precompute department-level average charges (for smart missing-charge loss) ──
    dept_avg_charge = df[df["charge_amount"] > 0].groupby("department")["charge_amount"].mean()
    global_avg_charge = df[df["charge_amount"] > 0]["charge_amount"].mean()

    # ── Feature engineering + ML ──
    df, features, encoders = _prepare_features(df)
    model = _load_or_train_model(features, force_retrain=force_retrain)
    df["anomaly"] = model.predict(features)

    # Save encoders for potential future inference
    joblib.dump(encoders, ENCODERS_PATH)

    # ── Detection loop ──
    alerts = []
    alert_id = 1

    for _, row in df.iterrows():

        issues = []

        patient = row["patient_id"]
        procedure = row["procedure"]
        charge = row["charge_amount"]
        paid = row["insurance_paid"]
        claim_submitted = row["claim_submitted"]
        claim_status = row["claim_status"]
        cpt_code = row["cpt_code"]

        # 1️⃣ Missing Charge — use department avg instead of hardcoded value
        if charge == 0:
            dept = row["department"]
            estimated_loss = dept_avg_charge.get(dept, global_avg_charge)
            issues.append(("Missing Charge", estimated_loss))

        # 2️⃣ Claim Not Submitted
        if claim_submitted == "No":
            issues.append(("Claim Not Submitted", charge))

        # 3️⃣ Denied Claim
        if claim_status == "Denied":
            issues.append(("Denied Claim", charge))

        # 4️⃣ Underpayment (only when claim was approved but paid less)
        if claim_status == "Approved" and paid < charge:
            issues.append(("Underpayment", charge - paid))

        # 5️⃣ Coding Inconsistency (with stripped strings)
        if procedure in CPT_MAP and CPT_MAP[procedure] != cpt_code:
            issues.append(("Coding Inconsistency", charge * 0.3))

        # 6️⃣ ML Anomaly — only flag if no rule-based issue found
        if row["anomaly"] == -1 and not issues:
            issues.append(("AI Billing Anomaly", charge * 0.2))

        # Append each detected issue as a separate alert
        for issue, loss in issues:
            alerts.append({
                "alert_id": f"A{alert_id:03}",
                "patient_id": patient,
                "procedure": procedure,
                "department": row["department"],
                "charge_amount": float(charge),
                "insurance_paid": float(paid),
                "issue": issue,
                "loss": round(float(loss), 2),
                "date": row["date"],
            })
            alert_id += 1

    alerts_df = pd.DataFrame(alerts)
    alerts_df.to_csv(ALERTS_PATH, index=False)

    return alerts_df


if __name__ == "__main__":

    alerts = run_detection(force_retrain=True)

    print("\n📊 Detected Revenue Leakage Cases\n")
    print(alerts.to_string(index=False))

    print(f"\n🔴 Total Alerts : {len(alerts)}")
    print(f"💰 Total Loss   : ₹{alerts['loss'].sum():,.2f}")

    # Breakdown by issue type
    print("\n📋 Breakdown by Issue Type:\n")
    summary = alerts.groupby("issue")["loss"].agg(["count", "sum"])
    summary.columns = ["Count", "Total Loss (₹)"]
    print(summary.to_string())