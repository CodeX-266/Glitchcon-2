import { Info, Inbox, DollarSign, FileText, CheckCircle, ShieldAlert, Activity, ClipboardList } from "lucide-react";

export function StaffDash({ currentUser, alerts }) {
    const mine = alerts.filter(a => a.assignedTo === currentUser.id);
    const done = mine.filter(a => a.status === "Work Done").length;
    const open = mine.filter(a => ["Assigned", "In Progress"].includes(a.status)).length;
    const totalLoss = mine.reduce((s, a) => s + a.loss, 0);

    const RevenueDash = () => (
        <div className="page">
            <div className="banner info" style={{ background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.2)", color: "var(--text)" }}>
                <DollarSign size={16} style={{ color: "var(--info)" }} />
                Welcome back, {currentUser.name}. You are logged in to the Revenue Department portal.
            </div>
            <div className="krow k4">
                <div className="kpi kb"><div className="kpi-l">Accounts Assigned</div><div className="kpi-v b">{mine.length}</div></div>
                <div className="kpi ky"><div className="kpi-l">Pending Audit</div><div className="kpi-v y">{open}</div></div>
                <div className="kpi kg"><div className="kpi-l">Audits Completed</div><div className="kpi-v g">{done}</div></div>
                <div className="kpi kr"><div className="kpi-l">Leakage Exposure</div><div className="kpi-v r">₹{(totalLoss / 1000).toFixed(0)}K</div></div>
            </div>
            {mine.length === 0 ? (
                <div className="empty"><div className="empty-ico"><Inbox size={28} /></div>No accounts assigned yet.</div>
            ) : (
                <div className="card mb4" style={{ marginTop: 20 }}>
                    <div className="ct"><Activity size={16} /> Leakage Severity Breakdown</div>
                    <div style={{ padding: 20, textAlign: "left", color: "var(--muted)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", margin: "10px 0", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
                            <span style={{ fontWeight: 600 }}>Critical Exposure Cases</span> <span className="b bcrit">{mine.filter(a => a.priority === "Critical").length} Cases</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", margin: "10px 0", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
                            <span style={{ fontWeight: 600 }}>High Priority Accounts</span> <span className="b bhi">{mine.filter(a => a.priority === "High").length} Cases</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", margin: "10px 0", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
                            <span style={{ fontWeight: 600 }}>Standard Review Queue</span> <span className="b bmed">{mine.filter(a => ["Medium", "Low"].includes(a.priority)).length} Cases</span>
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
                <div className="banner info" style={{ background: "rgba(139, 92, 246, 0.1)", border: "1px solid rgba(139, 92, 246, 0.2)", color: "var(--text)" }}>
                    <FileText size={16} style={{ color: "var(--staff)" }} />
                    Welcome back, {currentUser.name}. You are logged in to the Medical Coding portal.
                </div>
                <div className="krow k4">
                    <div className="kpi ks"><div className="kpi-l">Total Coding Tasks</div><div className="kpi-v s">{mine.length}</div></div>
                    <div className="kpi ky"><div className="kpi-l">Missing Codes</div><div className="kpi-v y">{missingCodes}</div></div>
                    <div className="kpi kr"><div className="kpi-l">Coding Inaccuracies</div><div className="kpi-v r">{codeErrors}</div></div>
                    <div className="kpi kg"><div className="kpi-l">Corrections Submitted</div><div className="kpi-v g">{done}</div></div>
                </div>
                {mine.length === 0 ? (
                    <div className="empty"><div className="empty-ico"><Inbox size={28} /></div>No coding tasks assigned.</div>
                ) : (
                    <div className="card mb4" style={{ marginTop: 20 }}>
                        <div className="ct"><ShieldAlert size={16} /> AI Coding Assistants</div>
                        <div style={{ padding: 20 }}>
                            <div className="dr"><span className="dr-l">Primary AI Confidence</span><span className="dr-v fw7 s">94.2%</span></div>
                            <div className="dr"><span className="dr-l">Suggested CPT Accuracy</span><span className="dr-v fw7 s">91.8%</span></div>
                            <div className="dr"><span className="dr-l">ICD-10 Mapping Score</span><span className="dr-v fw7 s">88.5%</span></div>
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
                <div className="banner info" style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.2)", color: "var(--text)" }}>
                    <ClipboardList size={16} style={{ color: "var(--warn)" }} />
                    Welcome back, {currentUser.name}. You are logged in to the Insurance Claims portal.
                </div>
                <div className="krow k4">
                    <div className="kpi kb"><div className="kpi-l">Claim Interventions</div><div className="kpi-v b">{mine.length}</div></div>
                    <div className="kpi kr"><div className="kpi-l">Denied Claims</div><div className="kpi-v r">{denied}</div></div>
                    <div className="kpi ky"><div className="kpi-l">Unsubmitted Claims</div><div className="kpi-v y">{unsubmitted}</div></div>
                    <div className="kpi kg"><div className="kpi-l">Claims Resolved</div><div className="kpi-v g">{done}</div></div>
                </div>
                {mine.length === 0 ? (
                    <div className="empty"><div className="empty-ico"><Inbox size={28} /></div>No claim interventions assigned.</div>
                ) : (
                    <div className="card mb4" style={{ marginTop: 20 }}>
                        <div className="ct"><Activity size={16} /> Claim Resolution Tracker</div>
                        <div style={{ padding: 20 }}>
                            <div className="dr"><span className="dr-l">Average Resolution Time</span><span className="dr-v fw7">1.4 Days</span></div>
                            <div className="dr"><span className="dr-l">Appeal Success Rate</span><span className="dr-v fw7">82.1%</span></div>
                            <div className="dr"><span className="dr-l">Total Denials Overturned</span><span className="dr-v fw7" style={{ color: "var(--ok)" }}>{done} Claims</span></div>
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
