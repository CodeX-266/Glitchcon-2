import { useState } from "react";
import { SBadge, PBadge } from "../../ui/Badge";
import { AlertTriangle, Pill, FileText, DollarSign, XCircle, Copy, UserPlus, Check, RotateCcw, X } from "lucide-react";

const ICON_MAP = {
    "Missing Charge": <Pill size={16} />,
    "Missing Claim": <FileText size={16} />,
    "Claim Not Submitted": <AlertTriangle size={16} />,
    "Underpayment": <DollarSign size={16} />,
    "Denied Claim": <XCircle size={16} />,
    "Duplicate Billing": <Copy size={16} />,
};

export function AdminAlertQueue({ alerts, setAlerts, staffList, addNotif }) {
    const [sel, setSel] = useState(null);
    const [assignTo, setAt] = useState("");
    const [prio, setPrio] = useState("High");
    const [filter, setFilter] = useState("All");
    const approved = staffList.filter(s => s.status === "Approved");
    const filtered = filter === "All" ? alerts : alerts.filter(a => a.status === filter || a.priority === filter);
    const getStaff = id => approved.find(s => s.id === id)?.name || "—";

    const assign = id => {
        if (!assignTo) return;
        const staff = approved.find(s => s.id === assignTo);
        setAlerts(p => p.map(a => a.id === id ? { ...a, status: "Assigned", assignedTo: assignTo, priority: prio } : a));
        addNotif({ type: "alert_assigned", title: "Alert Assigned", message: `${sel.id} assigned to ${staff?.name} (${prio} priority)`, time: "Just now" });
        setSel(null);
    };
    const verify = id => { setAlerts(p => p.map(a => a.id === id ? { ...a, status: "Verified" } : a)); addNotif({ type: "alert_assigned", title: "Alert Verified", message: `${id} fix verified by admin`, time: "Just now" }); setSel(null); };
    const reopen = id => { setAlerts(p => p.map(a => a.id === id ? { ...a, status: "In Progress" } : a)); setSel(null); };
    const close = id => { setAlerts(p => p.map(a => a.id === id ? { ...a, status: "Closed" } : a)); setSel(null); };

    return (
        <div className="page">
            <div className="frow">
                {["All", "New", "Assigned", "In Progress", "Work Done", "Resolved", "Critical", "High"].map(f => (
                    <button key={f} className={`fb${filter === f ? " on" : ""}`} onClick={() => setFilter(f)}>{f}</button>
                ))}
            </div>
            {filtered.map(a => (
                <div key={a.id} className={`ac ${a.status === "Work Done" ? "done" : a.priority === "Critical" ? "crit" : a.priority === "High" ? "hi" : "med"}`}>
                    <div className="ac-ico">{ICON_MAP[a.issue] || <AlertTriangle size={16} />}</div>
                    <div className="ac-body">
                        <div className="ac-type" style={{ color: a.status === "Work Done" ? "var(--ok)" : a.priority === "Critical" ? "var(--danger)" : a.priority === "High" ? "var(--warn)" : "var(--info)" }}>{a.issue}</div>
                        <div className="ac-meta">{a.id} · {a.patient} · {a.dept} · {a.date}</div>
                        <div style={{ display: "flex", gap: 6, marginTop: 5, flexWrap: "wrap" }}>
                            <SBadge s={a.status} /><PBadge p={a.priority} />
                            {a.assignedTo && <span className="b blo">{getStaff(a.assignedTo)}</span>}
                            {a.status === "Work Done" && <span className="b bapp">Staff marked done</span>}
                        </div>
                        <div className="ac-actions">
                            {["New", "Assigned"].includes(a.status) && <button className="btn btn-sm btn-a" onClick={() => { setSel(a); setAt(a.assignedTo || ""); setPrio(a.priority); }}><UserPlus size={12} /> Assign</button>}
                            {a.status === "Work Done" && <><button className="btn btn-sm btn-g" onClick={() => verify(a.id)}><Check size={12} /> Verify</button><button className="btn btn-sm btn-r" onClick={() => reopen(a.id)}><RotateCcw size={12} /> Reopen</button></>}
                            {a.status === "Resolved" && <><button className="btn btn-sm btn-g" onClick={() => verify(a.id)}><Check size={12} /> Verify</button><button className="btn btn-sm btn-r" onClick={() => reopen(a.id)}><RotateCcw size={12} /> Reopen</button></>}
                            {a.status === "Verified" && <button className="btn btn-sm" onClick={() => close(a.id)}>Close</button>}
                        </div>
                    </div>
                    <div className="ac-amt">
                        <div className="ac-loss" style={{ color: "var(--danger)" }}>₹{a.loss.toLocaleString()}</div>
                        <div className="ac-risk">Risk: {a.aiScore}</div>
                    </div>
                </div>
            ))}

            {sel && (
                <div className="ov" onClick={() => setSel(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="mh"><div className="mh-title">Assign Alert — {sel.id}</div><button className="mh-close" onClick={() => setSel(null)}>×</button></div>
                        <div className="mb2">
                            <div className="dr"><span className="dr-l">Issue</span><span className="dr-v fw7">{sel.issue}</span></div>
                            <div className="dr"><span className="dr-l">Patient</span><span className="dr-v">{sel.patient}</span></div>
                            <div className="dr"><span className="dr-l">Dept</span><span className="dr-v">{sel.dept}</span></div>
                            <div className="dr"><span className="dr-l">Loss</span><span className="dr-v fw7" style={{ color: "var(--danger)" }}>₹{sel.loss.toLocaleString()}</span></div>
                            <div className="dvdr" />
                            <div className="field"><label>Assign To Staff</label>
                                <select className="sel" value={assignTo} onChange={e => setAt(e.target.value)}>
                                    <option value="">— Select Staff Member —</option>
                                    {approved.map(s => <option key={s.id} value={s.id}>{s.name} · {s.dept}</option>)}
                                </select>
                            </div>
                            <div className="field"><label>Priority</label>
                                <select className="sel" value={prio} onChange={e => setPrio(e.target.value)}>
                                    {["Critical", "High", "Medium", "Low"].map(p => <option key={p}>{p}</option>)}
                                </select>
                            </div>
                            <button className="btn btn-p btn-full" onClick={() => assign(sel.id)}>Assign Alert</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
