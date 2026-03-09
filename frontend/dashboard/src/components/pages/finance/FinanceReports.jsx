import { useState } from "react";
import { generateCSV, downloadCSV } from "../../../utils/csv";
import { FileDown, BarChart3, FileText, Building2, Handshake, TrendingUp, Check } from "lucide-react";

const REPORTS = [
    { name: "Revenue Leakage Report", Icon: BarChart3 },
    { name: "Claim Recovery Report", Icon: FileText },
    { name: "Department Performance", Icon: Building2 },
    { name: "Insurance Analysis", Icon: Handshake },
    { name: "Q1 Executive Summary", Icon: TrendingUp },
];

export function FinanceReports({ alerts }) {
    const [gen, setGen] = useState([]);
    const loss = alerts.reduce((s, a) => s + a.loss, 0);
    const rec = alerts.filter(a => ["Resolved", "Verified", "Closed"].includes(a.status)).reduce((s, a) => s + a.loss, 0);

    return (
        <div className="page">
            <div className="krow k3">
                <div className="kpi ko"><div className="kpi-l">Total Leakage</div><div className="kpi-v o">₹{(loss / 1000).toFixed(0)}K</div></div>
                <div className="kpi kg"><div className="kpi-l">Recovered</div><div className="kpi-v g">₹{(rec / 1000).toFixed(0)}K</div></div>
                <div className="kpi kr"><div className="kpi-l">Pending</div><div className="kpi-v r">₹{((loss - rec) / 1000).toFixed(0)}K</div></div>
            </div>
            <div className="g2">
                {REPORTS.map(r => (
                    <div key={r.name} className="card" style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                        <div style={{ color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, background: "var(--s2)", borderRadius: "var(--radius-sm)" }}>
                            <r.Icon size={18} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, marginBottom: 3 }}>{r.name}</div>
                            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                                <button className="btn btn-sm btn-a" onClick={() => setGen(p => [...p, r.name])}><FileDown size={12} /> PDF</button>
                                <button className="btn btn-sm btn-csv" onClick={() => downloadCSV(generateCSV(alerts), `${r.name.replace(/ /g, "_").toLowerCase()}.csv`)}><FileDown size={12} /> CSV</button>
                            </div>
                            {gen.includes(r.name) && <div style={{ fontSize: 11, color: "var(--ok)", marginTop: 5, display: "flex", alignItems: "center", gap: 4 }}><Check size={12} /> Generated</div>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
