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
            <div className="banner info" style={{ background: "linear-gradient(90deg, rgba(52, 211, 153, 0.15), rgba(0,0,0,0))", borderLeft: "4px solid var(--rcm)", color: "var(--text)", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
                <BarChart3 size={20} style={{ color: "var(--rcm)" }} />
                <span style={{ fontSize: 14, fontWeight: 500 }}>Welcome to the <strong>RCM Department Analytics</strong>. Focused on claim resolution and loss recovery.</span>
            </div>

            {csvAccess.RCM && (
                <div className="banner success" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <BarChart3 size={14} /> Admin has granted you access to download the Combined CSV Dataset.
                    <button className="btn btn-sm btn-g" style={{ marginLeft: "auto" }} onClick={() => downloadCSV(generateCSV(alerts), "combined_rcm_export.csv")}><Download size={12} /> Download CSV</button>
                </div>
            )}
            <div className="krow k4" style={{ marginTop: 24 }}>
                <div className="kpi kb"><div className="kpi-l">Assigned Alerts</div><div className="kpi-v b">{alerts.filter(a => ["Assigned", "In Progress"].includes(a.status)).length}</div><div className="kpi-s">Total cases waiting logic</div></div>
                <div className="kpi ky"><div className="kpi-l">In Progress</div><div className="kpi-v y">{alerts.filter(a => a.status === "In Progress").length}</div><div className="kpi-s">Actively being worked</div></div>
                <div className="kpi kg"><div className="kpi-l">Resolved Cases</div><div className="kpi-v g">{alerts.filter(a => ["Resolved", "Verified", "Closed"].includes(a.status)).length}</div><div className="kpi-s">Successfully closed tickets</div></div>
                <div className="kpi kg"><div className="kpi-l">Revenue Recovered</div><div className="kpi-v g">₹{(rec / 1000).toFixed(0)}K</div><div className="kpi-s">Total financial impact</div></div>
            </div>
            <div className="g2 mb4" style={{ marginTop: 24 }}>
                <div className="card" style={{ background: "linear-gradient(135deg, rgba(52, 211, 153, 0.05) 0%, rgba(0,0,0,0) 100%)" }}>
                    <div className="ct" style={{ borderBottom: "1px solid var(--border)", paddingBottom: 12, marginBottom: 16 }}>Cases by Issue Type</div>
                    {["Missing Charge", "Claim Not Submitted", "Underpayment", "Denied Claim", "Duplicate Billing"].map(type => {
                        const n = alerts.filter(a => a.issue === type).length;
                        return <HBar key={type} label={type.split(" ").pop()} value={n} max={Math.max(alerts.length, 1)} color="var(--rcm)" aside={`${n} cases`} />;
                    })}
                </div>
                <div className="card">
                    <div className="ct" style={{ borderBottom: "1px solid var(--border)", paddingBottom: 12, marginBottom: 16 }}>Monthly Recovery</div>
                    <MiniBar color="var(--ok)" data={MONTHLY.map(m => ({ l: m.month, v: m.recovered }))} />
                </div>
                <div className="card" style={{ gridColumn: "1 / -1", background: "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0) 100%)", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                    <div className="ct" style={{ marginBottom: 4 }}>AI Risk Score Priorities</div>
                    <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>Helps RCM team prioritize which claims to check first.</p>
                    <div className="tw" style={{ border: "none", marginTop: 12 }}>
                        <table style={{ background: "transparent" }}>
                            <thead style={{ background: "rgba(0,0,0,0.2)" }}>
                                <tr><th>Claim ID</th><th>Department</th><th>Risk Score</th><th>Status</th></tr>
                            </thead>
                            <tbody>
                                {alerts.filter(a => a.aiScore > 50).sort((a, b) => b.aiScore - a.aiScore).slice(0, 5).map(a => (
                                    <tr key={a.id} style={{ background: "transparent" }}>
                                        <td style={{ fontWeight: 700, fontFamily: "var(--mono)", fontSize: 13 }}>{a.id}</td>
                                        <td style={{ fontSize: 13 }}>{a.dept}</td>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <div style={{ width: 24, height: 24, borderRadius: 4, background: a.aiScore > 80 ? "var(--danger)" : a.aiScore > 50 ? "var(--warn)" : "var(--ok)", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800 }}>{a.aiScore}</div>
                                                <span style={{ fontSize: 12, fontWeight: 500 }}>{a.aiScore > 80 ? "Critical risk" : a.aiScore > 50 ? "Medium risk" : "Safe"}</span>
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
        </div >
    );
}
