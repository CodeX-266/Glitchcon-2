import { CPT_MAP, RECOMMENDATIONS } from "../config/api";

export function transformAlerts(apiAlerts) {
    return apiAlerts.map((a, i) => {
        const id = a.alert_id || a.id || `A${String(i + 1).padStart(3, "0")}`;
        const issue = a.issue_type || a.issue || "Unknown";
        const loss = a.estimated_loss ?? a.loss ?? 0;
        const procedure = a.procedure || "General";
        const dept = a.department || "General";
        const patient = a.patient_id || `P${100 + i}`;
        const insurance = a.insurance || "Unknown";
        const date = a.date || "2024-01-02";
        const cpt = a.cpt_code || "";
        const expectedPayment = a.expected_payment ?? a.charge_amount ?? loss;
        const actualPayment = a.actual_payment ?? a.insurance_paid ?? 0;
        const suggestedCpt = CPT_MAP[procedure] || cpt || "99213";
        const conf = cpt && CPT_MAP[procedure] && cpt === CPT_MAP[procedure] ? 95 : 78 + (i % 15);
        const aiScore = a.ai_score ?? (loss > 10000 ? 85 + (i % 10) : loss > 5000 ? 65 + (i % 15) : 40 + (i % 25));
        const priority = aiScore > 85 ? "Critical" : aiScore > 70 ? "High" : aiScore > 50 ? "Medium" : "Low";
        const recommendation = RECOMMENDATIONS[issue] || RECOMMENDATIONS["AI Billing Anomaly"];
        return {
            id, issue, loss, procedure, dept, patient, insurance, date,
            cptCode: cpt, cptSuggested: suggestedCpt, cptConfidence: Math.min(conf, 98),
            aiScore, priority, status: a.status || "New",
            assignedTo: a.assignedTo || null, notes: a.notes || [],
            recommendation, expectedPayment, actualPayment,
        };
    });
}

