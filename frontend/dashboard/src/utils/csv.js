export function generateCSV(alerts) {
    const headers = ["Alert ID", "Issue Type", "Patient", "Department", "Procedure", "Insurance", "Loss Amount", "AI Score", "Priority", "Status", "CPT Suggested", "Date"];
    const rows = alerts.map(a => [a.id, a.issue, a.patient, a.dept, a.procedure, a.insurance, a.loss, a.aiScore, a.priority, a.status, a.cptSuggested, a.date]);
    return [headers, ...rows].map(r => r.join(",")).join("\n");
}

export function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
