#  AI Revenue Leakage Detection System

> An AI-powered healthcare analytics system that detects revenue leakage in hospital billing and insurance claims.

![AI Revenue Leakage](https://img.shields.io/badge/Status-Active-success)
![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)


##  Problem Statement

Healthcare organizations lose significant revenue due to unnoticed billing errors, incorrect medical coding, missing claims, and underpayments from insurance providers. 

Hospitals face several revenue leakage challenges:
-  Missing charges during encounter documentation
-  Incorrect CPT/ICD coding
-  Claims not submitted after patient visits
-  Denied claims not followed up
-  Underpayments from insurance payers

Manual auditing of these issues is time-consuming and inefficient.

---

## 💡 Solution

We developed an AI-powered Revenue Leakage Detection System that proactively recovers lost revenue. The system:
- **Analyzes** healthcare billing and claims data
- **Detects** revenue leakage using ML anomaly detection
- **Identifies** coding inconsistencies
- **Flags** unsubmitted or denied claims
- **Detects** insurance underpayments
- **Generates** automated alerts for revenue cycle teams

The system provides robust dashboards and analytics to help hospitals seamlessly monitor these issues.

---

## ✨ Key Features

- **Missing Charge Detection**
- **CPT/ICD Coding Consistency Validation**
- **Claim Submission Monitoring**
- **Denied Claim Detection**
- **Insurance Underpayment Detection**
- **ML-based Billing Anomaly Detection**
- **Automated Alert Generation**
- **Revenue Leakage Analytics Dashboard**

---

## 🛠 Technology Stack

### Backend
- **Python** & **FastAPI**
- **Machine Learning**: Isolation Forest (Anomaly Detection)
- **Data Science**: Pandas, Scikit-learn
- **API Documentation**: Swagger UI (via FastAPI)

### Data Processing
- Healthcare billing datasets
- CPT code mappings

### Visualization
- Dashboard for RCM (Revenue Cycle Management) teams
- CSV-based analytics

---

##  System Architecture

```text
Healthcare Billing Dataset
        ↓
Data Processing Pipeline (Pandas)
        ↓
AI Detection Engine
   ├─ Missing Charge Detection
   ├─ Coding Inconsistency Detection
   ├─ Claim Submission Monitoring
   ├─ Underpayment Detection
   └─ ML Anomaly Detection
        ↓
FastAPI Backend
        ↓
Revenue Leakage Alerts
        ↓
RCM Dashboard & Analytics
```

---

## 📂 Project Structure

```bash
revenue-leakage-ai/
│
├── backend/
│   ├── main.py                    # FastAPI server
│   ├── ai_engine.py               # ML and Rules Engine
│   └── detected_alerts.csv        # Output alerts generated
│
├── data/
│   └── hospital_billing_data.csv  # Sample billing dataset
│
├── frontend/
│   └── dashboard/                 # Frontend visualization
│
└── README.md
```

---

## 🚀 How to Run the Project

### 1. Clone the repository
```bash
git clone <repository-url>
cd revenue-leakage-ai
```

### 2. Create and activate a Virtual Environment
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install fastapi uvicorn pandas scikit-learn python-multipart
```

### 4. Run the Backend Server
```bash
cd backend
uvicorn main:app --reload
```

### 5. Open API Documentation
Navigate to your browser and open:
[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## 🔮 Future Improvements

- [ ] Integration with real hospital EHR systems
- [ ] Real-time claim monitoring
- [ ] Deep learning models for coding validation
- [ ] Automated claim resubmission recommendations
- [ ] Advanced revenue forecasting

---

## 📹 Presentation

- [https://docs.google.com/presentation/d/1rLfpQy2Ru2wo2qU4EkyhsTcixhKrPjqK/edit?usp=drive_link&ouid=109896952518917091453&rtpof=true&sd=true](#) *(Replace with actual link)*

---

## 👥 Team Members

- **Adarsh Kumar Mishra** — 24BYB1015
- **Krish Dagar** — 24BCE1845
- **Harshita Nandwani** — 24BCE1966
- **Boogith Pragathish P** — 24BDS1184
