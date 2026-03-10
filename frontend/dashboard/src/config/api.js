export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const CPT_MAP = {
    "MRI Brain": "70553", "Blood Panel": "80050", "CT Abdomen": "74178", "Cardiac Echo": "93306",
    "Knee Surgery": "27447", "Colonoscopy": "45378", "Ultrasound": "76700", "Sleep Study": "95808",
    "X-Ray Chest": "71020", "Thyroid Test": "84443", "Appendectomy": "44950", "Angiography": "93510",
    "CT Brain": "70450", "Glucose Test": "82947", "Endoscopy": "43235", "EEG": "95816",
    "Stress Test": "93015", "Liver Panel": "80076", "Spine MRI": "72148", "Arthroscopy": "29881",
    "CT Chest": "71260", "Blood Culture": "87040", "Angioplasty": "92928", "Gallbladder Surgery": "47562",
    "Upper GI Endoscopy": "43239", "Nerve Conduction Study": "95907", "Abdominal Ultrasound": "76705",
    "Lipid Profile": "80061", "Pacemaker Implant": "33208", "Hernia Repair": "49505", "Brain MRI": "70551",
    "Complete Blood Count": "85025", "Angiogram": "93508", "Knee Replacement": "27447",
    "Esophageal Endoscopy": "43235", "EEG Monitoring": "95951", "Chest CT": "71250",
    "Vitamin D Test": "82306", "Cardiac Catheterization": "93458"
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
