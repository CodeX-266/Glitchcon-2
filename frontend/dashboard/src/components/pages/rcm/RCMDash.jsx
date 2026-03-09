import { SBadge } from "../../ui/Badge";
import { HBar, MiniBar } from "../../ui/Charts";
import { MONTHLY } from "../../../config/navigation";
import { generateCSV, downloadCSV } from "../../../utils/csv";
import { Download, BarChart3 } from "lucide-react";

export function RCMDash({ alerts, csvAccess }) {
    const loss = alerts.reduce((s, a) => s + a.loss, 0);
    const rec = alerts.filter(a => ["Resolved", "Verified", "Closed"].includes(a.status)).reduce((s, a) => s + a.loss, 0);

    return (
        <div className="page">
            {csvAccess.RCM && (
                <div className="banner success"><BarChart3 size={14} /> Admin has granted you access to download the Combined CSV Dataset.
                    <button className="btn btn-sm btn-g" style={{ marginLeft: "auto" }} onClick={() => downloadCSV(generateCSV(alerts), "combined_rcm_export.csv")}><Download size={12} /> Download CSV</button>
                </div>
            )}
            <div className="krow k4">
                <div className="kpi kb"><div className="kpi-l">Assigned Alerts</div><div className="kpi-v b">{alerts.filter(a => ["Assigned", "In Progress"].includes(a.status)).length}</div></div>
                <div className="kpi ky"><div className="kpi-l">In Progress</div><div className="kpi-v y">{alerts.filter(a => a.status === "In Progress").length}</div></div>
                <div className="kpi kg"><div className="kpi-l">Resolved</div><div className="kpi-v g">{alerts.filter(a => ["Resolved", "Verified", "Closed"].includes(a.status)).length}</div></div>
                <div className="kpi kg"><div className="kpi-l">Recovered</div><div className="kpi-v g">₹{(rec / 1000).toFixed(0)}K</div></div>
            </div>
            <div className="g2 mb4">
                <div className="card">
                    <div className="ct">Cases by Issue Type</div>
                    {["Missing Charge", "Claim Not Submitted", "Underpayment", "Denied Claim", "Duplicate Billing"].map(type => {
                        const n = alerts.filter(a => a.issue === type).length;
                        return <HBar key={type} label={type.split(" ").pop()} value={n} max={alerts.length} color="var(--rcm)" aside={`${n} cases`} />;
                    })}
                </div>
                <div className="card">
                    <div className="ct">Monthly Recovery</div>
                    <MiniBar color="var(--rcm)" data={MONTHLY.map(m => ({ l: m.month, v: m.recovered }))} />
                </div>
                <div className="card" style={{ gridColumn: "1 / -1" }}>
                    <div className="ct">AI Risk Score Priorities</div>
                    <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>Helps RCM team prioritize which claims to check first.</p>
                    <div className="tw" style={{ border: "none" }}>
                        <table>
                            <thead><tr><th>Claim ID</th><th>Risk Score</th><th>Status</th></tr></thead>
                            <tbody>
                                {alerts.slice(0, 5).map(a => (
                                    <tr key={a.id}>
                                        <td style={{ fontWeight: 700 }}>{a.id}</td>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <div style={{ width: 20, height: 20, borderRadius: 4, background: a.aiScore > 80 ? "var(--danger)" : a.aiScore > 50 ? "var(--warn)" : "var(--ok)", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700 }}>{a.aiScore}</div>
                                                {a.aiScore > 80 ? "High risk" : a.aiScore > 50 ? "Medium" : "Safe"}
                                            </div>
                                        </td>
                                        <td><SBadge s={a.status} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
