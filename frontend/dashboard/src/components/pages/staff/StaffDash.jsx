import { Info, Inbox, DollarSign, FileText, CheckCircle, ShieldAlert, Activity, ClipboardList, PieChart as PieIcon, BarChart2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from "recharts";

export function StaffDash({ currentUser, alerts }) {
    const mine = alerts.filter(a => a.assignedTo === currentUser.id);
    const done = mine.filter(a => a.status === "Work Done").length;
    const open = mine.filter(a => ["Assigned", "In Progress"].includes(a.status)).length;
    const totalLoss = mine.reduce((s, a) => s + a.loss, 0);

    const RevenueDash = () => {
        const critLoss = mine.filter(a => a.priority === "Critical").reduce((s, a) => s + a.loss, 0);
        const hiLoss = mine.filter(a => a.priority === "High").reduce((s, a) => s + a.loss, 0);
        const medLoss = mine.filter(a => ["Medium", "Low"].includes(a.priority)).reduce((s, a) => s + a.loss, 0);

        const pieData = [
            { name: "Critical Exposure", value: critLoss },
            { name: "High Priority", value: hiLoss },
            { name: "Standard Review", value: medLoss }
        ].filter(d => d.value > 0);

        const PIE_COLORS = ["#ef4444", "#f59e0b", "#3b82f6"];

        return (
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
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
                        <div className="card">
                            <div className="ct"><PieIcon size={16} /> Leakage Exposure Distribution</div>
                            <div style={{ height: 240, padding: 10 }}>
                                {pieData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={pieData} innerRadius={60} outerRadius={85} dataKey="value" stroke="none">
                                                {pieData.map((e, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                            </Pie>
                                            <RTooltip formatter={(value) => `₹${value.toLocaleString()}`} contentStyle={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)" }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="empty" style={{ minHeight: "100%", padding: 0 }}>No exposure data</div>
                                )}
                            </div>
                        </div>
                        <div className="card">
                            <div className="ct"><Activity size={16} /> Severity Breakdown</div>
                            <div style={{ padding: "20px 20px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", margin: "14px 0", borderBottom: "1px solid var(--border)", paddingBottom: 14 }}>
                                    <span style={{ fontWeight: 600, color: "var(--muted)" }}>Critical Exposure Cases</span>
                                    <span className="b bcrit">{mine.filter(a => a.priority === "Critical").length} Cases</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", margin: "14px 0", borderBottom: "1px solid var(--border)", paddingBottom: 14 }}>
                                    <span style={{ fontWeight: 600, color: "var(--muted)" }}>High Priority Accounts</span>
                                    <span className="b bhi">{mine.filter(a => a.priority === "High").length} Cases</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", margin: "14px 0", borderBottom: "1px solid var(--border)", paddingBottom: 14 }}>
                                    <span style={{ fontWeight: 600, color: "var(--muted)" }}>Standard Review Queue</span>
                                    <span className="b bmed">{mine.filter(a => ["Medium", "Low"].includes(a.priority)).length} Cases</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const CodingDash = () => {
        const missingCodes = mine.filter(a => a.issue.includes("Missing")).length;
        const codeErrors = mine.filter(a => !a.issue.includes("Missing") && !a.issue.includes("Duplicate")).length;
        const duplicates = mine.filter(a => a.issue.includes("Duplicate")).length;

        const codeData = [
            { name: "Missing Codes", tasks: missingCodes },
            { name: "Incorrect Codes", tasks: codeErrors },
            { name: "Duplicates", tasks: duplicates },
        ];

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
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
                        <div className="card">
                            <div className="ct"><BarChart2 size={16} /> Coding Error Frequency</div>
                            <div style={{ height: 240, padding: "20px 20px 0" }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={codeData} margin={{ left: -20, bottom: -5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 12 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 12 }} allowDecimals={false} />
                                        <RTooltip cursor={{ fill: "rgba(139, 92, 246, 0.05)" }} contentStyle={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8 }} />
                                        <Bar dataKey="tasks" fill="var(--staff)" radius={[4, 4, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="card">
                            <div className="ct"><ShieldAlert size={16} /> AI Coding Assistants</div>
                            <div style={{ padding: "30px 20px" }}>
                                <div className="dr" style={{ paddingBottom: 15, borderBottom: "1px solid var(--border)" }}><span className="dr-l">Primary AI Confidence</span><span className="dr-v fw7 s">94.2%</span></div>
                                <div className="dr" style={{ paddingTop: 15, paddingBottom: 15, borderBottom: "1px solid var(--border)" }}><span className="dr-l">Suggested CPT Accuracy</span><span className="dr-v fw7 s" style={{ color: "var(--ok)" }}>97.8%</span></div>
                                <div className="dr" style={{ paddingTop: 15 }}><span className="dr-l">ICD-10 Mapping Score</span><span className="dr-v fw7 s">88.5%</span></div>
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

        const claimsData = [
            { status: "Denied", count: denied },
            { status: "Unsubmitted", count: unsubmitted },
            { status: "Resolved", count: done },
        ];

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
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
                        <div className="card">
                            <div className="ct"><BarChart2 size={16} /> Interventions Pipeline</div>
                            <div style={{ height: 210, padding: "20px 20px 0" }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={claimsData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="status" type="category" axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 12, fontWeight: 500 }} width={90} />
                                        <RTooltip cursor={{ fill: "rgba(245, 158, 11, 0.05)" }} contentStyle={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8 }} />
                                        <Bar dataKey="count" fill="var(--warn)" radius={[0, 4, 4, 0]} barSize={26} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="card">
                            <div className="ct"><Activity size={16} /> Claim Resolution Tracker</div>
                            <div style={{ padding: "24px 20px" }}>
                                <div className="dr" style={{ paddingBottom: 15, borderBottom: "1px solid var(--border)" }}><span className="dr-l">Average Resolution Time</span><span className="dr-v fw7">1.4 Days</span></div>
                                <div className="dr" style={{ paddingBottom: 15, paddingTop: 15, borderBottom: "1px solid var(--border)" }}><span className="dr-l">Appeal Success Rate</span><span className="dr-v fw7">82.1%</span></div>
                                <div className="dr" style={{ paddingTop: 15 }}><span className="dr-l">Total Denials Overturned</span><span className="dr-v fw7" style={{ color: "var(--ok)" }}>{done} Claims</span></div>
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
