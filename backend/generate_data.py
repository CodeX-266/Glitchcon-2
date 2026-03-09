import csv
import random
import os
from datetime import datetime, timedelta

CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "hospital_billing_data.csv")

CPT_MAP = {
    "MRI Brain": ("70553", 22000, "Radiology"),
    "Blood Panel": ("80050", 2500, "Lab"),
    "CT Abdomen": ("74178", 18000, "Radiology"),
    "Cardiac Echo": ("93306", 12000, "Cardiology"),
    "Knee Surgery": ("27447", 55000, "Surgery"),
    "Colonoscopy": ("45378", 19000, "Gastro"),
    "Ultrasound": ("76700", 8500, "Radiology"),
    "Sleep Study": ("95808", 10000, "Neurology"),
    "X-Ray Chest": ("71020", 3500, "Radiology"),
    "Thyroid Test": ("84443", 1800, "Lab"),
    "Appendectomy": ("44950", 40000, "Surgery"),
    "Angiography": ("93510", 30000, "Cardiology"),
    "CT Brain": ("70450", 16000, "Radiology"),
    "Glucose Test": ("82947", 1200, "Lab"),
    "Endoscopy": ("43235", 17000, "Gastro"),
    "EEG": ("95816", 11000, "Neurology"),
    "Stress Test": ("93015", 13000, "Cardiology"),
    "Liver Panel": ("80076", 4500, "Lab"),
    "Spine MRI": ("72148", 24000, "Radiology"),
    "Arthroscopy": ("29881", 42000, "Surgery"),
    "CT Chest": ("71260", 17000, "Radiology"),
    "Blood Culture": ("87040", 2800, "Lab"),
    "Angioplasty": ("92928", 60000, "Cardiology"),
    "Gallbladder Surgery": ("47562", 48000, "Surgery"),
    "Upper GI Endoscopy": ("43239", 15000, "Gastro"),
    "Nerve Conduction Study": ("95907", 10500, "Neurology"),
    "Abdominal Ultrasound": ("76705", 7500, "Radiology"),
    "Lipid Profile": ("80061", 3200, "Lab"),
    "Pacemaker Implant": ("33208", 80000, "Cardiology"),
    "Hernia Repair": ("49505", 35000, "Surgery"),
}

scenarios = [
    # Clean record - 96%
    {"weight": 96, "mod": lambda r: r},
    
    # Missing Charge (Revenue) - 1%
    {"weight": 1, "mod": lambda r: {**r, "charge_amount": 0, "insurance_paid": 0}},
    
    # Claim Not Submitted (Claims) - 1%
    {"weight": 1, "mod": lambda r: {**r, "claim_submitted": "No", "claim_status": "NA", "insurance_paid": 0}},
    
    # Denied Claim (Claims) - 1%
    {"weight": 1, "mod": lambda r: {**r, "claim_status": "Denied", "insurance_paid": 0}},
    
    # Underpayment (Revenue) - 0.5%
    {"weight": 0.5, "mod": lambda r: {**r, "insurance_paid": int(r["charge_amount"] * random.uniform(0.3, 0.7))}},
    
    # Coding Inconsistency (Coding) - 0.5%
    {"weight": 0.5, "mod": lambda r: {**r, "cpt_code": str(int(r["cpt_code"]) + random.choice([1, -1, 10, -10]))}},
]

rows = []
start_date = datetime.now() - timedelta(days=90)

for i in range(1, 5001): # 5000 records
    procedure = random.choice(list(CPT_MAP.keys()))
    cpt, charge, dept = CPT_MAP[procedure]
    
    base_row = {
        "patient_id": f"P{1000 + i}",
        "visit_id": f"V{5000 + i}",
        "procedure": procedure,
        "department": dept,
        "cpt_code": cpt,
        "charge_amount": charge,
        "claim_submitted": "Yes",
        "claim_status": "Approved",
        "insurance_paid": charge,
        "date": (start_date + timedelta(days=random.randint(0, 89))).strftime("%Y-%m-%d")
    }

    scenario = random.choices(scenarios, weights=[s["weight"] for s in scenarios], k=1)[0]
    final_row = scenario["mod"](base_row)
    rows.append(final_row)

with open(CSV_PATH, "w", newline='') as f:
    writer = csv.DictWriter(f, fieldnames=rows[0].keys())
    writer.writeheader()
    writer.writerows(rows)

print(f"Generated {len(rows)} rich CSV records at {CSV_PATH}")
