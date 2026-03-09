import { useState } from "react";
import { SBadge, PBadge } from "../../ui/Badge";
import { CheckCircle, Zap, ShieldCheck, Check, X, Database, Users, LayoutList, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

export function AdminDash({ alerts, setAlerts, staffList, csvAccess, setCsvAccess, addNotif }) {
    const [viewLimit, setViewLimit] = useState(100);
    const [filter, setFilter] = useState("All");

    const loss = alerts.reduce((s, a) => s + a.loss, 0);
    const unassigned = alerts.filter(a => a.status === "New").length;
    const assignedCount = alerts.filter(a => ["Assigned", "In Progress"].includes(a.status)).length;
    const awaitingApproval = alerts.filter(a => a.status === "Work Done");
    const resolved = alerts.filter(a => ["Verified", "Closed", "Resolved"].includes(a.status)).length;
    const approvedStaff = staffList.filter(s => s.status === "Approved" && s.role !== "Admin");

    // Filter logic
    const filteredAlerts = filter === "All" ? alerts
        : filter === "New" ? alerts.filter(a => a.status === "New")
            : filter === "Assigned" ? alerts.filter(a => ["Assigned", "In Progress"].includes(a.status))
                : filter === "Work Done" ? alerts.filter(a => a.status === "Work Done")
                    : filter === "Resolved" ? alerts.filter(a => ["Verified", "Closed", "Resolved"].includes(a.status))
                        : alerts;

    const handleAutoAssign = () => {
        const revStaff = approvedStaff.filter(s => s.role === "Revenue Department");
        const claimStaff = approvedStaff.filter(s => s.role === "Insurance Claims");
        const codeStaff = approvedStaff.filter(s => s.role === "Medical Coding");

        if (revStaff.length === 0 && claimStaff.length === 0 && codeStaff.length === 0) {
            toast.error("No approved staff available! Approve staff members first.", { style: { background: "var(--bg)", color: "var(--text)", border: "1px solid var(--danger)" } });
            return;
        }

        let rIdx = 0, cIdx = 0, ccIdx = 0;
        let assignedCount = 0;

        const updatedAlerts = alerts.map(a => {
            if (a.status !== "New") return a;
            let targetStaff = null;

            // Revenue issues → Revenue Department
            if (["Missing Charge", "Underpayment"].includes(a.issue)) {
                if (revStaff.length > 0) { targetStaff = revStaff[rIdx % revStaff.length]; rIdx++; }
            }
            // Claims issues → Insurance Claims
            else if (["Claim Not Submitted", "Denied Claim"].includes(a.issue)) {
                if (claimStaff.length > 0) { targetStaff = claimStaff[cIdx % claimStaff.length]; cIdx++; }
            }
            // Coding / everything else → Medical Coding
            else {
                if (codeStaff.length > 0) { targetStaff = codeStaff[ccIdx % codeStaff.length]; ccIdx++; }
            }

            // If no matching role staff, try assigning to any available staff
            if (!targetStaff) {
                const allStaff = [...revStaff, ...claimStaff, ...codeStaff];
                if (allStaff.length > 0) {
                    targetStaff = allStaff[(rIdx + cIdx + ccIdx) % allStaff.length];
                }
            }

            if (targetStaff) {
                assignedCount++;
                return { ...a, status: "Assigned", assignedTo: targetStaff.id, priority: a.aiScore > 80 ? "Critical" : a.aiScore > 50 ? "High" : "Medium" };
            }
            return a;
        });

        if (assignedCount > 0) {
            setAlerts(updatedAlerts);
            toast.success(`✨ Auto-assigned ${assignedCount} alerts to ${approvedStaff.length} staff members!`, { duration: 4000, style: { background: "var(--bg)", color: "var(--text)", border: "1px solid var(--accent)" } });
            if (addNotif) addNotif({ type: "auto_assign", title: "AI Auto-Assign", message: `Distributed ${assignedCount} alerts across departments.`, time: "Just now" });
        } else {
            toast("No unassigned alerts found.", { style: { background: "var(--bg)", color: "var(--text)", border: "1px solid var(--border)" } });
        }
    };

    const handleApprove = (id) => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: "Verified" } : a));
        toast.success("Task approved & verified!", { icon: "✅", duration: 3000, style: { border: "1px solid var(--ok)", background: "var(--bg)", color: "var(--text)" } });
        if (addNotif) addNotif({ type: "verify", title: "Task Verified", message: `Alert ${id} verified by admin.`, time: "Just now" });
    };

    const handleReject = (id) => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: "In Progress" } : a));
        toast.error("Sent back for revision.", { icon: "🔄", duration: 3000, style: { border: "1px solid var(--danger)", background: "var(--bg)", color: "var(--text)" } });
        if (addNotif) addNotif({ type: "reject", title: "Task Rejected", message: `Alert ${id} sent back to staff.`, time: "Just now" });
    };

    const getStaffName = (id) => staffList.find(s => s.id === id)?.name || "—";
    const getStaffRole = (id) => staffList.find(s => s.id === id)?.role || "—";

    return (
        <div className="page" style={{ maxWidth: 1400, margin: "0 auto" }}>
            {/* ── TOP KPIs ── */}
            <div className="krow k4">
                <div className="kpi kp"><div className="kpi-l">Total Alerts</div><div className="kpi-v p">{alerts.length}</div><div className="kpi-s">AI generated from CSV</div></div>
                <div className="kpi kr"><div className="kpi-l">Unassigned</div><div className="kpi-v r">{unassigned}</div><div className="kpi-s">Needs allocation</div></div>
                <div className="kpi ko"><div className="kpi-l">In Progress</div><div className="kpi-v o">{assignedCount}</div><div className="kpi-s">Being worked on</div></div>
                <div className="kpi kg"><div className="kpi-l">Resolved</div><div className="kpi-v g">{resolved}</div><div className="kpi-s">Admin verified</div></div>
            </div>

            {/* ── AWAITING APPROVAL BANNER ── */}
            {awaitingApproval.length > 0 && (
                <div className="banner success" style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 10 }}>
                    <CheckCircle size={16} /> <strong>{awaitingApproval.length}</strong> task(s) marked as done by staff — scroll down to approve or reject!
                </div>
            )}

            {/* ── MAIN 2-COL GRID ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, marginTop: 24 }}>

                {/* ═══ LEFT: DATASET TABLE ═══ */}
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                    {/* CSV DATASET VIEW */}
                    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.15)" }}>
                            <div style={{ display: "flex", gap: 10, alignItems: "center", fontWeight: 700, fontSize: 14 }}>
                                <Database size={18} style={{ color: "var(--accent)" }} /> Alert Dataset
                                <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 400 }}>({filteredAlerts.length} rows)</span>
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                                <button className="btn btn-p" onClick={handleAutoAssign} disabled={unassigned === 0} style={{ display: "flex", gap: 6, fontWeight: 700, fontSize: 12 }}>
                                    <Zap size={14} /> Auto-Assign ({unassigned})
                                </button>
                            </div>
                        </div>

                        {/* Filter tabs */}
                        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--border)", background: "rgba(0,0,0,0.08)" }}>
                            {["All", "New", "Assigned", "Work Done", "Resolved"].map(f => (
                                <button key={f} onClick={() => setFilter(f)}
                                    style={{ padding: "8px 16px", fontSize: 12, fontWeight: filter === f ? 700 : 500, background: "none", border: "none", borderBottom: filter === f ? "2px solid var(--accent)" : "2px solid transparent", color: filter === f ? "var(--text)" : "var(--muted)", cursor: "pointer", transition: "all 0.2s" }}>
                                    {f}
                                </button>
                            ))}
                        </div>

                        <div className="tw" style={{ border: "none", margin: 0, maxHeight: 420, overflowY: "auto", overflowX: "auto" }}>
                            <table style={{ minWidth: 750 }}>
                                <thead style={{ position: "sticky", top: 0, background: "var(--card)", zIndex: 2 }}>
                                    <tr>
                                        <th style={{ paddingLeft: 16 }}>Claim ID</th>
                                        <th>Issue</th>
                                        <th>Assigned To</th>
                                        <th>Loss</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAlerts.slice(0, viewLimit).map(a => (
                                        <tr key={a.id} style={{ borderLeft: a.status === "Work Done" ? "3px solid var(--ok)" : a.status === "New" ? "3px solid var(--danger)" : "3px solid transparent" }}>
                                            <td style={{ paddingLeft: 16 }}>
                                                <div style={{ fontWeight: 700, fontFamily: "var(--mono)", fontSize: 12 }}>{a.id}</div>
                                                <div style={{ fontSize: 10, color: "var(--muted)" }}>{a.patient}</div>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 600, fontSize: 12 }}>{a.issue}</div>
                                                <div style={{ fontSize: 10, color: "var(--muted)" }}>{a.dept}</div>
                                            </td>
                                            <td>
                                                {a.assignedTo ? (
                                                    <div>
                                                        <div style={{ fontSize: 12, fontWeight: 600 }}>{getStaffName(a.assignedTo)}</div>
                                                        <div style={{ fontSize: 10, color: "var(--muted)" }}>{getStaffRole(a.assignedTo)}</div>
                                                    </div>
                                                ) : (
                                                    <span style={{ fontSize: 11, color: "var(--muted)", fontStyle: "italic" }}>Unassigned</span>
                                                )}
                                            </td>
                                            <td>
                                                <div style={{ color: "var(--danger)", fontWeight: 700, fontSize: 13 }}>₹{a.loss.toLocaleString()}</div>
                                            </td>
                                            <td><SBadge s={a.status} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredAlerts.length > viewLimit && (
                                <div style={{ padding: 12, textAlign: "center", borderTop: "1px solid var(--border)" }}>
                                    <button className="btn btn-sm" onClick={() => setViewLimit(l => l + 100)}>Load More</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── WORKLOAD MATRIX ── */}
                    <div className="card">
                        <div className="ct" style={{ borderBottom: "1px solid var(--border)", paddingBottom: 12, marginBottom: 16, display: "flex", gap: 10, alignItems: "center" }}>
                            <Users size={18} /> Department Workload Matrix
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            {["Revenue Department", "Insurance Claims", "Medical Coding"].map(deptName => {
                                const deptStaff = approvedStaff.filter(s => s.role === deptName);
                                if (deptStaff.length === 0) return (
                                    <div key={deptName} style={{ background: "rgba(0,0,0,0.1)", border: "1px solid var(--border)", borderRadius: 8, padding: 16 }}>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", display: "flex", alignItems: "center", gap: 6 }}>
                                            <LayoutList size={14} /> {deptName}
                                        </div>
                                        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 8, fontStyle: "italic" }}>No approved staff in this department</div>
                                    </div>
                                );
                                return (
                                    <div key={deptName} style={{ background: "rgba(0,0,0,0.1)", border: "1px solid var(--border)", borderRadius: 8, padding: 16 }}>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
                                            <LayoutList size={14} /> {deptName}
                                        </div>
                                        {deptStaff.map(s => {
                                            const sAlerts = alerts.filter(a => a.assignedTo === s.id);
                                            const sActive = sAlerts.filter(a => ["Assigned", "In Progress"].includes(a.status)).length;
                                            const sDone = sAlerts.filter(a => ["Work Done", "Verified", "Resolved", "Closed"].includes(a.status)).length;
                                            const sTotal = sAlerts.length;
                                            const pct = sTotal === 0 ? 0 : Math.round((sDone / sTotal) * 100);
                                            return (
                                                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--accent)", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                                                        {s.name.charAt(0)}
                                                    </div>
                                                    <div style={{ width: 130 }}>
                                                        <div style={{ fontSize: 13, fontWeight: 700 }}>{s.name}</div>
                                                        <div style={{ fontSize: 11, color: "var(--muted)" }}>{sTotal} tasks</div>
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: 11, display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                                            <span><strong style={{ color: "var(--warn)" }}>{sActive}</strong> active</span>
                                                            <span><strong style={{ color: "var(--ok)" }}>{sDone}</strong> done ({pct}%)</span>
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
                        </div>
                    </div>
                </div>

                {/* ═══ RIGHT: APPROVAL + ACCESS ═══ */}
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                    {/* ADMIN VERIFY/REJECT */}
                    <div className="card" style={{ border: "1px solid rgba(245, 158, 11, 0.3)", background: "linear-gradient(180deg, rgba(245, 158, 11, 0.05) 0%, rgba(0,0,0,0) 120px)" }}>
                        <div className="ct" style={{ display: "flex", gap: 8, alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: 12, marginBottom: 14 }}>
                            <ShieldCheck size={18} style={{ color: "var(--warn)" }} />
                            <span style={{ color: "var(--warn)" }}>Admin Verification Queue</span>
                            {awaitingApproval.length > 0 && (
                                <span style={{ marginLeft: "auto", background: "var(--warn)", color: "#000", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 10 }}>
                                    {awaitingApproval.length}
                                </span>
                            )}
                        </div>
                        <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 14 }}>
                            Only admin can approve or reject tasks marked "Done" by staff.
                        </p>

                        {awaitingApproval.length === 0 ? (
                            <div className="empty" style={{ padding: "30px 0" }}>
                                <CheckCircle size={28} style={{ color: "var(--ok)", opacity: 0.3, marginBottom: 8 }} />
                                <div style={{ fontSize: 13 }}>No tasks pending approval</div>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 400, overflowY: "auto" }}>
                                {awaitingApproval.map(a => {
                                    const staffName = getStaffName(a.assignedTo);
                                    const staffRole = getStaffRole(a.assignedTo);
                                    return (
                                        <div key={a.id} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 14, background: "rgba(0,0,0,0.15)" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                                                <div>
                                                    <div style={{ fontSize: 13, fontWeight: 700 }}>{a.issue}</div>
                                                    <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)" }}>{a.id}</div>
                                                </div>
                                                <div style={{ color: "var(--danger)", fontWeight: 700, fontSize: 14 }}>₹{a.loss.toLocaleString()}</div>
                                            </div>
                                            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 10, display: "flex", gap: 6, alignItems: "center" }}>
                                                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--accent)", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800 }}>{staffName.charAt(0)}</div>
                                                {staffName} · {staffRole}
                                            </div>
                                            <div style={{ display: "flex", gap: 8 }}>
                                                <button className="btn btn-sm btn-g" onClick={() => handleApprove(a.id)} style={{ flex: 1, padding: "7px 0", display: "flex", justifyContent: "center", gap: 5, fontWeight: 700 }}>
                                                    <Check size={14} /> Approve
                                                </button>
                                                <button className="btn btn-sm btn-r" onClick={() => handleReject(a.id)} style={{ flex: 1, padding: "7px 0", display: "flex", justifyContent: "center", gap: 5, fontWeight: 700 }}>
                                                    <X size={14} /> Reject
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* REVENUE AT RISK */}
                    <div className="card">
                        <div className="ct" style={{ borderBottom: "1px solid var(--border)", paddingBottom: 12, marginBottom: 14 }}>
                            <AlertTriangle size={16} style={{ color: "var(--danger)", marginRight: 8 }} /> Revenue Summary
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                <span style={{ fontSize: 13, color: "var(--muted)" }}>Total Revenue at Risk</span>
                                <span style={{ fontWeight: 800, color: "var(--danger)", fontSize: 15 }}>₹{(loss / 1000).toFixed(0)}K</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                <span style={{ fontSize: 13, color: "var(--muted)" }}>Recovery Potential</span>
                                <span style={{ fontWeight: 700, color: "var(--ok)", fontSize: 14 }}>₹{(alerts.filter(a => ["Verified", "Closed"].includes(a.status)).reduce((s, a) => s + a.loss, 0) / 1000).toFixed(0)}K</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                                <span style={{ fontSize: 13, color: "var(--muted)" }}>Staff Utilization</span>
                                <span style={{ fontWeight: 700, fontSize: 14 }}>{approvedStaff.length} active</span>
                            </div>
                        </div>
                    </div>

                    {/* DATA ACCESS */}
                    <div className="card">
                        <div className="ct">Data & Export Access</div>
                        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 14 }}>Control CSV download permissions.</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", background: "rgba(0,0,0,0.15)", padding: "10px 14px", borderRadius: 6, border: "1px solid var(--border)" }}>
                                <input type="checkbox" checked={csvAccess.RCM} onChange={e => setCsvAccess(p => ({ ...p, RCM: e.target.checked }))} style={{ width: 16, height: 16, accentColor: "var(--adm)" }} />
                                <span style={{ fontWeight: 600, fontSize: 13 }}>RCM Analytics</span>
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", background: "rgba(0,0,0,0.15)", padding: "10px 14px", borderRadius: 6, border: "1px solid var(--border)" }}>
                                <input type="checkbox" checked={csvAccess.Finance} onChange={e => setCsvAccess(p => ({ ...p, Finance: e.target.checked }))} style={{ width: 16, height: 16, accentColor: "var(--adm)" }} />
                                <span style={{ fontWeight: 600, fontSize: 13 }}>Finance Team</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
