export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const CPT_MAP = {
    "MRI Brain": "70553", "Blood Panel": "80050", "CT Abdomen": "74178", "Cardiac Echo": "93306",
    "Knee Surgery": "27447", "Colonoscopy": "45378", "Ultrasound": "76700", "Sleep Study": "95808",
    "X-Ray Chest": "71046", "Spinal Fusion": "22633", "Appendectomy": "44970", "Thyroid Panel": "84443",
    "Liver Biopsy": "47000", "Angioplasty": "92920", "Hip Replacement": "27130", "Cataract Surgery": "66984",
    "Tonsillectomy": "42826", "Dialysis": "90935", "Bone Density": "77080", "PET Scan": "78815",
    "EEG": "95819", "EMG": "95907", "Mammogram": "77067", "Stress Test": "93015",
    "Knee Replacement": "27447", "Esophageal Endoscopy": "43235", "EEG Monitoring": "95951",
    "Chest CT": "71250", "Vitamin D Test": "82306", "Cardiac Catheterization": "93458",
};

export const RECOMMENDATIONS = {
    "Missing Charge": "→ Add missing charge to billing system\n→ Re-submit claim to insurer",
    "Claim Not Submitted": "→ Submit claim immediately with procedure records\n→ Escalate to billing supervisor",
    "Denied Claim": "→ Review denial reason from insurer\n→ Appeal with corrected documentation",
    "Underpayment": "→ Compare expected vs actual payment\n→ File underpayment appeal with insurer",
    "Duplicate Billing": "→ Void duplicate charge entry\n→ Verify patient account for overcharges",
    "Coding Inconsistency": "→ Verify CPT code matches procedure\n→ Correct billing entry and resubmit",
    "AI Billing Anomaly": "→ Investigate anomalous billing pattern\n→ Verify charge and payment amounts",
};
