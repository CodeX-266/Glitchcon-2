import { SBadge } from "../../ui/Badge";
import { HBar } from "../../ui/Charts";
import { AlertTriangle, CheckCircle, Clock, TrendingUp } from "lucide-react";

export function AdminDash({ alerts, staffList, csvAccess, setCsvAccess }) {
    const open = alerts.filter(a => ["New", "Assigned", "In Progress"].includes(a.status)).length;
    const res = alerts.filter(a => ["Resolved", "Verified", "Closed"].includes(a.status)).length;
    const loss = alerts.reduce((s, a) => s + a.loss, 0);
    const rec = alerts.filter(a => ["Resolved", "Verified", "Closed"].includes(a.status)).reduce((s, a) => s + a.loss, 0);
    const done = alerts.filter(a => a.status === "Work Done").length;
    const approved = staffList.filter(s => s.status === "Approved");

    return (
        <div className="page">
            <div className="krow k4">
                <div className="kpi kp"><div className="kpi-l">Total Alerts</div><div className="kpi-v p">{alerts.length}</div><div className="kpi-s">AI generated</div></div>
                <div className="kpi kr"><div className="kpi-l">Open / Action</div><div className="kpi-v r">{open}</div><div className="kpi-s">Needs attention</div></div>
                <div className="kpi kg"><div className="kpi-l">Resolved</div><div className="kpi-v g">{res}</div><div className="kpi-s">Cases closed</div></div>
                <div className="kpi ko"><div className="kpi-l">Revenue at Risk</div><div className="kpi-v o">₹{(loss / 1000).toFixed(0)}K</div><div className="kpi-s">₹{(rec / 1000).toFixed(0)}K recovered</div></div>
            </div>

            {done > 0 && <div className="banner success"><CheckCircle size={14} /> {done} staff member(s) have marked their assigned work as done — please verify!</div>}

            <div className="g2 mb4">
                <div className="card">
                    <div className="ct">AI Risk Score Priorities</div>
                    <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>Helps RCM team prioritize claims to check first.</p>
                    <div className="tw" style={{ border: "none", margin: "0 -20px" }}>
                        <table>
                            <thead><tr><th style={{ paddingLeft: 20 }}>Claim ID</th><th>Risk Score</th><th>Status</th></tr></thead>
                            <tbody>
                                {alerts.slice(0, 5).map(a => (
                                    <tr key={a.id}>
                                        <td style={{ paddingLeft: 20, fontWeight: 700 }}>{a.id}</td>
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

                <div className="card">
                    <div className="ct">Staff Workload</div>
                    {approved.map(s => {
                        const asgn = alerts.filter(a => a.assignedTo === s.id).length;
                        const dn = alerts.filter(a => a.assignedTo === s.id && a.status === "Work Done").length;
                        return (
                            <div className="wl-row" key={s.id}>
                                <div className="wl-av">{s.name.split(" ").map(n => n[0]).join("")}</div>
                                <div><div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div><div style={{ fontSize: 11, color: "var(--muted)" }}>{s.dept}</div></div>
                                <div className="wl-stats">
                                    <div><div className="ws-v" style={{ color: "var(--info)" }}>{asgn}</div><div className="ws-l">Assigned</div></div>
                                    <div><div className="ws-v" style={{ color: "var(--ok)" }}>{dn}</div><div className="ws-l">Done</div></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="card">
                <div className="ct">Alert Lifecycle</div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    {["New", "Assigned", "In Progress", "Work Done", "Resolved", "Verified", "Closed"].map(s => (
                        <div key={s} style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 18, fontWeight: 800 }}>{alerts.filter(a => a.status === s).length}</div>
                            <SBadge s={s} />
                        </div>
                    ))}
                </div>
            </div>

            <div className="card" style={{ marginTop: 24 }}>
                <div className="ct">Data & Export Access</div>
                <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>Control which departments can download the combined CSV dataset for analytics tools.</div>
                <div style={{ display: "flex", gap: 32, padding: "8px 0" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                        <input type="checkbox" checked={csvAccess.RCM} onChange={e => setCsvAccess(p => ({ ...p, RCM: e.target.checked }))} style={{ width: 18, height: 18, accentColor: "var(--adm)" }} />
                        <span style={{ fontWeight: 600, fontSize: 14 }}>RCM Team</span>
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                        <input type="checkbox" checked={csvAccess.Finance} onChange={e => setCsvAccess(p => ({ ...p, Finance: e.target.checked }))} style={{ width: 18, height: 18, accentColor: "var(--adm)" }} />
                        <span style={{ fontWeight: 600, fontSize: 14 }}>Finance Team</span>
                    </label>
                </div>
            </div>
        </div>
    );
}
