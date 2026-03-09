import { useState } from "react";
import { SBadge } from "../../ui/Badge";
import { CheckCircle, Zap, ShieldCheck, Check, X, Database, Users, LayoutList } from "lucide-react";
import toast from "react-hot-toast";

export function AdminDash({ alerts, setAlerts, staffList, csvAccess, setCsvAccess, addNotif }) {
    const [viewLimit, setViewLimit] = useState(100);

    const open = alerts.filter(a => ["New", "Assigned", "In Progress"].includes(a.status)).length;
    const res = alerts.filter(a => ["Resolved", "Verified", "Closed"].includes(a.status)).length;
    const loss = alerts.reduce((s, a) => s + a.loss, 0);
    const rec = alerts.filter(a => ["Resolved", "Verified", "Closed"].includes(a.status)).reduce((s, a) => s + a.loss, 0);

    const unassigned = alerts.filter(a => a.status === "New").length;
    const awaitingApproval = alerts.filter(a => a.status === "Work Done");
    const approvedStaff = staffList.filter(s => s.status === "Approved" && s.role !== "Admin");

    const handleAutoAssign = () => {
        const revStaff = approvedStaff.filter(s => s.role === "Revenue Department");
        const claimStaff = approvedStaff.filter(s => s.role === "Insurance Claims");
        const codeStaff = approvedStaff.filter(s => s.role === "Medical Coding");

        let rIdx = 0, cIdx = 0, ccIdx = 0;
        let assignedCount = 0;

        const updatedAlerts = alerts.map(a => {
            if (a.status !== "New") return a;
            let targetStaff = null;

            if (["Missing Charge", "Underpayment"].includes(a.issue)) {
                if (revStaff.length > 0) { targetStaff = revStaff[rIdx % revStaff.length]; rIdx++; }
            } else if (["Claim Not Submitted", "Denied Claim"].includes(a.issue)) {
                if (claimStaff.length > 0) { targetStaff = claimStaff[cIdx % claimStaff.length]; cIdx++; }
            } else {
                if (codeStaff.length > 0) { targetStaff = codeStaff[ccIdx % codeStaff.length]; ccIdx++; }
            }

            if (targetStaff) {
                assignedCount++;
                return { ...a, status: "Assigned", assignedTo: targetStaff.id, priority: a.aiScore > 80 ? "Critical" : a.aiScore > 50 ? "High" : "Medium" };
            }
            return a;
        });

        if (assignedCount > 0) {
            setAlerts(updatedAlerts);
            toast.success(`AI Queue Auto-assigned ${assignedCount} new alerts optimally!`, { style: { background: "var(--bg)", color: "var(--text)", border: "1px solid var(--accent)" } });
            if (addNotif) addNotif({ type: "auto_assign", title: "AI Auto-Assign Triggered", message: `Distributed ${assignedCount} alerts to the workforce.`, time: "Just now" });
        } else {
            toast("No unassigned alerts or missing staff roles.", { style: { background: "var(--bg)", color: "var(--text)", border: "1px solid var(--border)" } });
        }
    };

    const handleApprove = (id) => {
        setAlerts(p => p.map(a => a.id === id ? { ...a, status: "Verified" } : a));
        toast.success("Task verified and closed.", { icon: "✅", style: { border: "1px solid var(--ok)", background: "var(--bg)", color: "var(--text)" } });
    };

    const handleReject = (id) => {
        setAlerts(p => p.map(a => a.id === id ? { ...a, status: "In Progress" } : a));
        toast.error("Revision requested. Sent back to staff.", { icon: "❌", style: { border: "1px solid var(--danger)", background: "var(--bg)", color: "var(--text)" } });
    };

    return (
        <div className="page" style={{ maxWidth: 1400, margin: "0 auto" }}>
            {/* TOP KPIs */}
            <div className="krow k4">
                <div className="kpi kp"><div className="kpi-l">Total Dataset Alerts</div><div className="kpi-v p">{alerts.length}</div><div className="kpi-s">CSV generated</div></div>
                <div className="kpi kr"><div className="kpi-l">Unassigned / New</div><div className="kpi-v r">{unassigned}</div><div className="kpi-s">Awaiting allocation</div></div>
                <div className="kpi kg"><div className="kpi-l">Awaiting Verify</div><div className="kpi-v g">{awaitingApproval.length}</div><div className="kpi-s">Requires Admin check</div></div>
                <div className="kpi ko"><div className="kpi-l">Revenue at Risk</div><div className="kpi-v o">₹{(loss / 1000).toFixed(0)}K</div><div className="kpi-s">Total dataset loss</div></div>
            </div>

            {/* MAIN GRID */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, marginTop: 24 }}>

                {/* LEFT COL: DATASET & WORKLOAD */}
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                    {/* CSV DATASET VIEW */}
                    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                        <div className="ct" style={{ padding: 20, borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.2)" }}>
                            <div style={{ display: "flex", gap: 10, alignItems: "center" }}><Database size={18} style={{ color: "var(--accent)" }} /> Raw Dataset & Alert Queue</div>
                            <button className="btn btn-p" onClick={handleAutoAssign} disabled={unassigned === 0} style={{ display: "flex", gap: 6, fontWeight: 700 }}>
                                <Zap size={14} /> Auto-Assign ({unassigned})
                            </button>
                        </div>
                        <div className="tw" style={{ border: "none", margin: 0, maxHeight: 400, overflowY: "auto", overflowX: "auto" }}>
                            <table style={{ minWidth: 800 }}>
                                <thead style={{ position: "sticky", top: 0, background: "var(--card)" }}>
                                    <tr>
                                        <th style={{ paddingLeft: 20 }}>Claim ID</th>
                                        <th>Issue Type</th>
                                        <th>Department Tracker</th>
                                        <th>Risk / Loss</th>
                                        <th>Lifecycle Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {alerts.slice(0, viewLimit).map(a => (
                                        <tr key={a.id}>
                                            <td style={{ paddingLeft: 20 }}>
                                                <div style={{ fontWeight: 700, fontFamily: "var(--mono)" }}>{a.id}</div>
                                                <div style={{ fontSize: 11, color: "var(--muted)" }}>{a.patient}</div>
                                            </td>
                                            <td style={{ fontWeight: 500 }}>{a.issue}</td>
                                            <td>{a.dept}</td>
                                            <td>
                                                <div style={{ color: "var(--danger)", fontWeight: 700 }}>₹{a.loss.toLocaleString()}</div>
                                                <div style={{ fontSize: 11, color: a.aiScore > 80 ? "var(--danger)" : "var(--warn)", fontWeight: 600 }}>Score: {a.aiScore}</div>
                                            </td>
                                            <td><SBadge s={a.status} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {alerts.length > viewLimit && (
                                <div style={{ padding: 15, textAlign: "center", borderTop: "1px solid var(--border)" }}>
                                    <button className="btn btn-sm" onClick={() => setViewLimit(l => l + 100)}>Load More Rows</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* STRUCTURED WORKLOAD MATRIX */}
                    <div className="card">
                        <div className="ct" style={{ borderBottom: "1px solid var(--border)", paddingBottom: 15, marginBottom: 15, display: "flex", gap: 10, alignItems: "center" }}><Users size={18} /> Department Workload Matrix</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            {["Revenue Department", "Insurance Claims", "Medical Coding"].map(departmentName => {
                                const deptStaff = approvedStaff.filter(s => s.role === departmentName);
                                if (deptStaff.length === 0) return null;
                                return (
                                    <div key={departmentName} style={{ background: "rgba(0,0,0,0.15)", border: "1px solid var(--border)", borderRadius: 8, padding: 15 }}>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--muted)", marginBottom: 15, display: "flex", alignItems: "center", gap: 6 }}>
                                            <LayoutList size={14} /> {departmentName}
                                        </div>
                                        {deptStaff.map(s => {
                                            const sAlerts = alerts.filter(a => a.assignedTo === s.id);
                                            const sActive = sAlerts.filter(a => ["Assigned", "In Progress"].includes(a.status)).length;
                                            const sDone = sAlerts.filter(a => ["Work Done", "Verified", "Resolved", "Closed"].includes(a.status)).length;
                                            const sTotal = sAlerts.length;
                                            const pct = sTotal === 0 ? 0 : Math.round((sDone / sTotal) * 100);
                                            return (
                                                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 15, marginBottom: 10 }}>
                                                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--accent)", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                                                        {s.name.charAt(0)}
                                                    </div>
                                                    <div style={{ width: 140 }}>
                                                        <div style={{ fontSize: 13, fontWeight: 700 }}>{s.name}</div>
                                                        <div style={{ fontSize: 11, color: "var(--muted)" }}>{sTotal} cases handled</div>
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: 11, display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                                            <span><strong style={{ color: "var(--warn)" }}>{sActive}</strong> Working</span>
                                                            <span><strong style={{ color: "var(--ok)" }}>{sDone}</strong> Done ({pct}%)</span>
                                                        </div>
                                                        <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden" }}>
                                                            <div style={{ height: "100%", background: "var(--ok)", width: `${pct}%`, transition: "width 0.5s ease" }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                            {approvedStaff.length === 0 && <div className="empty" style={{ padding: 20 }}>No staff members approved yet to display workload.</div>}
                        </div>
                    </div>
                </div>

                {/* RIGHT COL: ADMIN ACTIONS */}
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                    {/* ONLY ADMIN APPROVES COMPONENT */}
                    <div className="card" style={{ flex: 1, border: "1px solid rgba(245, 158, 11, 0.3)", background: "linear-gradient(180deg, rgba(245, 158, 11, 0.05) 0%, rgba(0,0,0,0) 100px)" }}>
                        <div className="ct" style={{ display: "flex", gap: 8, alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 15, marginBottom: 15 }}>
                            <ShieldCheck size={18} style={{ color: "var(--warn)" }} />
                            <span style={{ color: "var(--warn)" }}>Admin Verification</span>
                        </div>
                        <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>
                            Only administrators can verify and permanently close tasks marked as "Work Done" by staff members.
                        </p>

                        {awaitingApproval.length === 0 ? (
                            <div className="empty" style={{ padding: "40px 0" }}>
                                <CheckCircle size={32} style={{ color: "var(--ok)", opacity: 0.3, marginBottom: 10 }} />
                                <div>No tasks pending approval.</div>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {awaitingApproval.slice(0, 5).map(a => {
                                    const devName = approvedStaff.find(s => s.id === a.assignedTo)?.name || "Unknown Staff";
                                    return (
                                        <div key={a.id} style={{ border: "1px solid var(--border)", borderRadius: 6, padding: 12, background: "rgba(0,0,0,0.2)" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                                                <div>
                                                    <div style={{ fontSize: 13, fontWeight: 700 }}>{a.id}: {a.issue}</div>
                                                    <div style={{ fontSize: 11, color: "var(--muted)" }}>By {devName}</div>
                                                </div>
                                                <div style={{ color: "var(--danger)", fontWeight: 700, fontSize: 13 }}>₹{a.loss.toLocaleString()}</div>
                                            </div>
                                            <div style={{ display: "flex", gap: 8 }}>
                                                <button className="btn btn-sm btn-full btn-g" onClick={() => handleApprove(a.id)} style={{ padding: "6px 0", display: "flex", justifyContent: "center", gap: 4 }}><Check size={14} /> Approve</button>
                                                <button className="btn btn-sm btn-full btn-r" onClick={() => handleReject(a.id)} style={{ padding: "6px 0", display: "flex", justifyContent: "center", gap: 4 }}><X size={14} /> Reject</button>
                                            </div>
                                        </div>
                                    )
                                })}
                                {awaitingApproval.length > 5 && (
                                    <div style={{ textAlign: "center", padding: "10px 0", fontSize: 12, color: "var(--muted)" }}>
                                        + {awaitingApproval.length - 5} more in queue
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* DATA ACCESS */}
                    <div className="card">
                        <div className="ct">Data & Export Access</div>
                        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>Control which hospital departments can download the combined system CSV dataset for local BI tools.</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", background: "rgba(0,0,0,0.2)", padding: "10px 15px", borderRadius: 6, border: "1px solid var(--border)" }}>
                                <input type="checkbox" checked={csvAccess.RCM} onChange={e => setCsvAccess(p => ({ ...p, RCM: e.target.checked }))} style={{ width: 16, height: 16, accentColor: "var(--adm)" }} />
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 13 }}>RCM Analytics Team</div>
                                </div>
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", background: "rgba(0,0,0,0.2)", padding: "10px 15px", borderRadius: 6, border: "1px solid var(--border)" }}>
                                <input type="checkbox" checked={csvAccess.Finance} onChange={e => setCsvAccess(p => ({ ...p, Finance: e.target.checked }))} style={{ width: 16, height: 16, accentColor: "var(--adm)" }} />
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 13 }}>Finance & Accounting Team</div>
                                </div>
                            </label>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
