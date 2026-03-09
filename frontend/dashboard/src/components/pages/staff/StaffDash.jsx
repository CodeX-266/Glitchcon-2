import { Info, Inbox, DollarSign, FileText, CheckCircle, ShieldAlert, Activity, ClipboardList } from "lucide-react";
import { Donut } from "../../ui/Charts";

export function StaffDash({ currentUser, alerts }) {
    const mine = alerts.filter(a => a.assignedTo === currentUser.id);
    const done = mine.filter(a => a.status === "Work Done").length;
    const open = mine.filter(a => ["Assigned", "In Progress"].includes(a.status)).length;
    const totalLoss = mine.reduce((s, a) => s + a.loss, 0);

    const RevenueDash = () => (
        <div className="page">
            <div className="banner info" style={{ background: "linear-gradient(90deg, rgba(59, 130, 246, 0.15), rgba(0,0,0,0))", borderLeft: "4px solid var(--info)", color: "var(--text)", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
                <DollarSign size={20} style={{ color: "var(--info)" }} />
                <span style={{ fontSize: 14, fontWeight: 500 }}>Welcome back, <strong style={{ color: "#fff" }}>{currentUser.name}</strong>. You are logged in to the Revenue Department portal.</span>
            </div>
            <div className="krow k4" style={{ marginTop: 24 }}>
                <div className="kpi kb"><div className="kpi-l">Accounts Assigned</div><div className="kpi-v b">{mine.length}</div><div className="kpi-s">Total cases assigned to you</div></div>
                <div className="kpi ky"><div className="kpi-l">Pending Audit</div><div className="kpi-v y">{open}</div><div className="kpi-s">Requires immediate attention</div></div>
                <div className="kpi kg"><div className="kpi-l">Audits Completed</div><div className="kpi-v g">{done}</div><div className="kpi-s">Ready for admin verification</div></div>
                <div className="kpi kr"><div className="kpi-l">Leakage Exposure</div><div className="kpi-v r">₹{(totalLoss / 1000).toFixed(0)}K</div><div className="kpi-s">Total financial risk value</div></div>
            </div>
            {mine.length === 0 ? (
                <div className="empty" style={{ marginTop: 40 }}><div className="empty-ico"><Inbox size={28} /></div>No accounts assigned yet.</div>
            ) : (
                <div className="g2" style={{ marginTop: 24 }}>
                    <div className="card" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0) 100%)", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                        <div className="ct" style={{ borderBottom: "1px solid var(--border)", paddingBottom: 12, marginBottom: 16 }}><Activity size={18} style={{ color: "var(--info)", marginRight: 8 }} /> Leakage Severity Breakdown</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13, fontWeight: 600 }}>
                                    <span>Critical Exposure Cases</span><span style={{ color: "var(--danger)" }}>{mine.filter(a => a.priority === "Critical").length}</span>
                                </div>
                                <div style={{ height: 6, width: "100%", background: "var(--s2)", borderRadius: 3, overflow: "hidden" }}>
                                    <div style={{ height: "100%", width: `${(mine.filter(a => a.priority === "Critical").length / Math.max(1, mine.length)) * 100}%`, background: "var(--danger)", borderRadius: 3 }}></div>
                                </div>
                            </div>
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13, fontWeight: 600 }}>
                                    <span>High Priority Accounts</span><span style={{ color: "var(--warn)" }}>{mine.filter(a => a.priority === "High").length}</span>
                                </div>
                                <div style={{ height: 6, width: "100%", background: "var(--s2)", borderRadius: 3, overflow: "hidden" }}>
                                    <div style={{ height: "100%", width: `${(mine.filter(a => a.priority === "High").length / Math.max(1, mine.length)) * 100}%`, background: "var(--warn)", borderRadius: 3 }}></div>
                                </div>
                            </div>
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13, fontWeight: 600 }}>
                                    <span>Standard Review Queue</span><span style={{ color: "var(--ok)" }}>{mine.filter(a => ["Medium", "Low"].includes(a.priority)).length}</span>
                                </div>
                                <div style={{ height: 6, width: "100%", background: "var(--s2)", borderRadius: 3, overflow: "hidden" }}>
                                    <div style={{ height: "100%", width: `${(mine.filter(a => ["Medium", "Low"].includes(a.priority)).length / Math.max(1, mine.length)) * 100}%`, background: "var(--ok)", borderRadius: 3 }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="ct" style={{ borderBottom: "1px solid var(--border)", paddingBottom: 12, marginBottom: 16 }}><DollarSign size={18} style={{ color: "var(--ok)", marginRight: 8 }} /> Recent Revenue Findings</div>
                        <div className="tw" style={{ border: "none" }}>
                            <table style={{ background: "transparent" }}>
                                <thead>
                                    <tr>
                                        <th style={{ background: "rgba(0,0,0,0.2)" }}>Account</th>
                                        <th style={{ background: "rgba(0,0,0,0.2)" }}>Issue Type</th>
                                        <th style={{ background: "rgba(0,0,0,0.2)" }}>Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mine.slice(0, 4).map(a => (
                                        <tr key={a.id} style={{ background: "transparent" }}>
                                            <td style={{ fontWeight: 600, fontFamily: "var(--mono)", fontSize: 12 }}>{a.id}</td>
                                            <td style={{ fontSize: 12 }}>{a.issue}</td>
                                            <td style={{ fontWeight: 700, color: "var(--danger)", fontSize: 13 }}>₹{a.loss.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const CodingDash = () => {
        const missingCodes = mine.filter(a => a.issue.includes("Missing")).length;
        const codeErrors = mine.filter(a => !a.issue.includes("Missing")).length;

        return (
            <div className="page">
                <div className="banner info" style={{ background: "linear-gradient(90deg, rgba(139, 92, 246, 0.15), rgba(0,0,0,0))", borderLeft: "4px solid var(--staff)", color: "var(--text)", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
                    <FileText size={20} style={{ color: "var(--staff)" }} />
                    <span style={{ fontSize: 14, fontWeight: 500 }}>Welcome back, <strong style={{ color: "#fff" }}>{currentUser.name}</strong>. You are logged in to the Medical Coding portal.</span>
                </div>
                <div className="krow k4" style={{ marginTop: 24 }}>
                    <div className="kpi ks"><div className="kpi-l">Total Coding Tasks</div><div className="kpi-v s">{mine.length}</div><div className="kpi-s">Assigned code reviews</div></div>
                    <div className="kpi ky"><div className="kpi-l">Missing Codes</div><div className="kpi-v y">{missingCodes}</div><div className="kpi-s">Unrepresented procedures</div></div>
                    <div className="kpi kr"><div className="kpi-l">Coding Inaccuracies</div><div className="kpi-v r">{codeErrors}</div><div className="kpi-s">Mismatched CPT/ICD pairs</div></div>
                    <div className="kpi kg"><div className="kpi-l">Corrections Submitted</div><div className="kpi-v g">{done}</div><div className="kpi-s">Successfully re-coded issues</div></div>
                </div>
                {mine.length === 0 ? (
                    <div className="empty" style={{ marginTop: 40 }}><div className="empty-ico"><Inbox size={28} /></div>No coding tasks assigned.</div>
                ) : (
                    <div className="g2" style={{ marginTop: 24 }}>
                        <div className="card" style={{ background: "linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(0,0,0,0) 100%)", borderColor: "rgba(139, 92, 246, 0.2)" }}>
                            <div className="ct" style={{ borderBottom: "1px solid rgba(139, 92, 246, 0.2)", paddingBottom: 12, marginBottom: 16 }}><ShieldAlert size={18} style={{ color: "var(--staff)", marginRight: 8 }} /> AI Coding Assistants</div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13, fontWeight: 600 }}>
                                        <span>Primary AI Confidence</span><span style={{ color: "var(--staff)" }}>94.2%</span>
                                    </div>
                                    <div style={{ height: 4, width: "100%", background: "var(--s2)", borderRadius: 2 }}>
                                        <div style={{ height: "100%", width: `94.2%`, background: "var(--staff)", borderRadius: 2 }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13, fontWeight: 600 }}>
                                        <span>Suggested CPT Accuracy</span><span style={{ color: "var(--staff)" }}>91.8%</span>
                                    </div>
                                    <div style={{ height: 4, width: "100%", background: "var(--s2)", borderRadius: 2 }}>
                                        <div style={{ height: "100%", width: `91.8%`, background: "var(--staff)", borderRadius: 2, opacity: 0.8 }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13, fontWeight: 600 }}>
                                        <span>ICD-10 Mapping Score</span><span style={{ color: "var(--staff)" }}>88.5%</span>
                                    </div>
                                    <div style={{ height: 4, width: "100%", background: "var(--s2)", borderRadius: 2 }}>
                                        <div style={{ height: "100%", width: `88.5%`, background: "var(--staff)", borderRadius: 2, opacity: 0.6 }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ gridColumn: "1/-1", display: 'flex', gap: 24, alignItems: 'center' }}>
                            <div style={{ flex: 1 }}>
                                <div className="ct" style={{ marginBottom: 16 }}>Issue Distribution Breakdown</div>
                                <Donut data={[
                                    { name: 'Missing Codes', value: missingCodes, color: '#f59e0b' },
                                    { name: 'Coding Inaccuracies', value: codeErrors, color: '#ef4444' }
                                ]} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div className="ct" style={{ borderBottom: "1px solid var(--border)", paddingBottom: 12, marginBottom: 16 }}><FileText size={18} style={{ color: "var(--muted)", marginRight: 8 }} /> Latest Suggested Codes</div>
                                <div className="tw" style={{ border: "none" }}>
                                    <table style={{ background: "transparent" }}>
                                        <thead style={{ background: "rgba(0,0,0,0.2)" }}>
                                            <tr>
                                                <th>Task ID</th>
                                                <th>Original</th>
                                                <th>AI Suggestion</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {mine.slice(0, 4).map(a => (
                                                <tr key={a.id} style={{ background: "transparent" }}>
                                                    <td style={{ fontWeight: 600, fontFamily: "var(--mono)", fontSize: 12 }}>{a.id}</td>
                                                    <td style={{ fontSize: 12, color: "var(--muted)" }}>{a.cpt_code || "MISSING"}</td>
                                                    <td style={{ fontWeight: 700, color: "var(--staff)", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                                                        {a.cptSuggested} <span style={{ fontSize: 10, background: "rgba(96, 165, 250, 0.15)", padding: "2px 6px", borderRadius: 4, color: "var(--staff)" }}>{a.cptConfidence}%</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const ClaimsDash = () => {
        const denied = mine.filter(a => a.issue === "Denied Claim").length;
        const unsubmitted = mine.filter(a => a.issue === "Claim Not Submitted").length;

        return (
            <div className="page">
                <div className="banner info" style={{ background: "linear-gradient(90deg, rgba(245, 158, 11, 0.15), rgba(0,0,0,0))", borderLeft: "4px solid var(--warn)", color: "var(--text)", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
                    <ClipboardList size={20} style={{ color: "var(--warn)" }} />
                    <span style={{ fontSize: 14, fontWeight: 500 }}>Welcome back, <strong style={{ color: "#fff" }}>{currentUser.name}</strong>. You are logged in to the Insurance Claims portal.</span>
                </div>
                <div className="krow k4" style={{ marginTop: 24 }}>
                    <div className="kpi kb"><div className="kpi-l">Claim Interventions</div><div className="kpi-v b">{mine.length}</div><div className="kpi-s">Assigned interventions</div></div>
                    <div className="kpi kr"><div className="kpi-l">Denied Claims</div><div className="kpi-v r">{denied}</div><div className="kpi-s">Pending insurance appeals</div></div>
                    <div className="kpi ky"><div className="kpi-l">Unsubmitted Claims</div><div className="kpi-v y">{unsubmitted}</div><div className="kpi-s">Requires documentation prep</div></div>
                    <div className="kpi kg"><div className="kpi-l">Claims Resolved</div><div className="kpi-v g">{done}</div><div className="kpi-s">Successfully overturned appeals</div></div>
                </div>
                {mine.length === 0 ? (
                    <div className="empty" style={{ marginTop: 40 }}><div className="empty-ico"><Inbox size={28} /></div>No claim interventions assigned.</div>
                ) : (
                    <div className="g2" style={{ marginTop: 24 }}>
                        <div className="card" style={{ background: "linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(0,0,0,0) 100%)", borderTop: "1px solid rgba(245, 158, 11, 0.2)" }}>
                            <div className="ct" style={{ borderBottom: "1px solid rgba(245, 158, 11, 0.2)", paddingBottom: 12, marginBottom: 16 }}><Activity size={18} style={{ color: "var(--warn)", marginRight: 8 }} /> Claim Resolution Tracker</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13, fontWeight: 600 }}>
                                        <span style={{ color: "var(--muted)" }}>Average Resolution Time</span><span style={{ color: "var(--text)", fontWeight: 800 }}>1.4 Days</span>
                                    </div>
                                    <div style={{ height: 4, width: "100%", background: "var(--s2)", borderRadius: 2 }}>
                                        <div style={{ height: "100%", width: `40%`, background: "var(--info)", borderRadius: 2 }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13, fontWeight: 600 }}>
                                        <span style={{ color: "var(--muted)" }}>Appeal Success Rate</span><span style={{ color: "var(--text)", fontWeight: 800 }}>82.1%</span>
                                    </div>
                                    <div style={{ height: 4, width: "100%", background: "var(--s2)", borderRadius: 2 }}>
                                        <div style={{ height: "100%", width: `82.1%`, background: "var(--ok)", borderRadius: 2 }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13, fontWeight: 600 }}>
                                        <span style={{ color: "var(--muted)" }}>Total Denials Overturned</span><span style={{ color: "var(--ok)", fontWeight: 800 }}>{done} Claims</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ gridColumn: "1/-1", display: "flex", gap: 24, alignItems: "center" }}>
                            <div style={{ flex: 1 }}>
                                <div className="ct" style={{ marginBottom: 16 }}>Denial vs Unsubmitted Ratio</div>
                                <Donut data={[
                                    { name: 'Denied Claims', value: denied, color: '#ef4444' },
                                    { name: 'Unsubmitted', value: unsubmitted, color: '#f59e0b' }
                                ]} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div className="ct" style={{ borderBottom: "1px solid var(--border)", paddingBottom: 12, marginBottom: 16 }}><DollarSign size={18} style={{ color: "var(--warn)", marginRight: 8 }} /> High Impact Denials</div>
                                <div className="tw" style={{ border: "none" }}>
                                    <table style={{ background: "transparent" }}>
                                        <thead style={{ background: "rgba(0,0,0,0.2)" }}>
                                            <tr>
                                                <th>Insurance</th>
                                                <th>Claim Action</th>
                                                <th>Value</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {mine.filter(a => a.priority === "Critical" || a.priority === "High").slice(0, 4).map(a => (
                                                <tr key={a.id} style={{ background: "transparent" }}>
                                                    <td style={{ fontWeight: 600, fontSize: 12 }}>{a.insurance}</td>
                                                    <td style={{ fontSize: 12, color: "var(--muted)" }}>{a.recommendation}</td>
                                                    <td style={{ fontWeight: 700, color: "var(--danger)", fontSize: 13 }}>₹{a.loss.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (currentUser.role === "Revenue Department") return <RevenueDash />;
    if (currentUser.role === "Medical Coding") return <CodingDash />;
    if (currentUser.role === "Insurance Claims") return <ClaimsDash />;

    return (
        <div className="page">
            <div className="banner info"><Info size={14} /> Welcome, {currentUser.name}. You are logged in as {currentUser.role} · {currentUser.dept} Department.</div>
            <div className="krow k4">
                <div className="kpi ks"><div className="kpi-l">Assigned to Me</div><div className="kpi-v s">{mine.length}</div></div>
                <div className="kpi ky"><div className="kpi-l">Open / Pending</div><div className="kpi-v y">{open}</div></div>
                <div className="kpi kg"><div className="kpi-l">Marked Done</div><div className="kpi-v g">{done}</div><div className="kpi-s">Awaiting admin verify</div></div>
                <div className="kpi kb"><div className="kpi-l">Total Loss on Cases</div><div className="kpi-v b">₹{(totalLoss / 1000).toFixed(0)}K</div></div>
            </div>
            {mine.length === 0 && (
                <div className="empty"><div className="empty-ico"><Inbox size={28} /></div>No alerts assigned yet. Wait for admin to assign work.</div>
            )}
        </div>
    );
}
