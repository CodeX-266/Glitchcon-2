import { useState } from "react";
import { SBadge, PBadge } from "../../ui/Badge";
import { Pill, FileText, DollarSign, XCircle, Copy, AlertTriangle, CheckCircle, Inbox, MessageSquare, Cpu } from "lucide-react";

const ICON_MAP = {
    "Missing Charge": <Pill size={16} />,
    "Claim Not Submitted": <FileText size={16} />,
    "Underpayment": <DollarSign size={16} />,
    "Denied Claim": <XCircle size={16} />,
    "Duplicate Billing": <Copy size={16} />,
};

export function StaffMyWork({ currentUser, alerts, setAlerts, addNotif }) {
    const [note, setNote] = useState({});
    const [filter, setFilter] = useState("In Progress");

    let mine = alerts.filter(a => a.assignedTo === currentUser.id);
    if (filter === "In Progress") {
        mine = mine.filter(a => ["Assigned", "In Progress"].includes(a.status));
    } else if (filter === "Work Done") {
        mine = mine.filter(a => ["Work Done", "Verified", "Closed", "Resolved"].includes(a.status));
    }

    const markDone = id => {
        const alert = alerts.find(a => a.id === id);
        setAlerts(p => p.map(a => a.id === id ? { ...a, status: "Work Done", notes: [...a.notes, `${currentUser.name} marked as done on ${new Date().toLocaleDateString()}`] } : a));
        addNotif({
            type: "work_done",
            title: "Work Completed",
            message: `${currentUser.name} completed alert ${id} (${alert?.issue} · ${alert?.dept})`,
            time: "Just now",
            staffId: currentUser.id,
        });
    };

    const addNote = (id, n) => {
        if (!n) return;
        setAlerts(p => p.map(a => a.id === id ? { ...a, notes: [...a.notes, `${currentUser.name}: ${n}`] } : a));
        setNote(p => ({ ...p, [id]: "" }));
    };

    return (
        <div className="page">
            <div className="frow" style={{ marginBottom: 20 }}>
                {["In Progress", "Work Done", "All"].map(f => (
                    <button key={f} className={`fb${filter === f ? " on" : ""}`} onClick={() => setFilter(f)}>{f}</button>
                ))}
            </div>
            {mine.length === 0 ? (
                <div className="empty"><div className="empty-ico"><Inbox size={28} /></div>No tasks found for "{filter}".</div>
            ) : mine.map(a => (
                <div key={a.id} className={`task-card ${a.status === "Work Done" ? "done" : ""}`} style={{ borderLeft: `3px solid ${a.status === "Work Done" ? "var(--ok)" : a.priority === "Critical" ? "var(--danger)" : a.priority === "High" ? "var(--warn)" : "var(--info)"}` }}>
                    <div className="task-head">
                        <span className="task-id">{a.id}</span>
                        <div style={{ display: "flex", gap: 6 }}><SBadge s={a.status} /><PBadge p={a.priority} /></div>
                    </div>
                    <div className="task-issue">{ICON_MAP[a.issue] || <AlertTriangle size={16} />} {a.issue}</div>
                    <div className="task-meta">{a.patient} · {a.procedure} · {a.dept} · {a.insurance} · {a.date}</div>
                    <div style={{ color: "var(--danger)", fontWeight: 700, fontSize: 14, marginTop: 4 }}>Revenue Loss: ₹{a.loss.toLocaleString()}</div>

                    <div className="task-ai">
                        <div className="task-ai-h"><Cpu size={12} /> AI Recommendation</div>
                        <div className="task-ai-cpt">CPT Code: {a.cptSuggested}</div>
                        <div style={{ fontSize: 11, color: "var(--muted)" }}>Confidence: {a.cptConfidence}% · Action: {a.issue === "Claim Not Submitted" ? "Submit claim with this code" : a.issue === "Denied Claim" ? "Appeal with corrected auth" : "Verify and correct billing"}</div>
                    </div>

                    {a.notes.length > 0 && (
                        <div className="notes" style={{ maxHeight: 80, overflow: "auto" }}>
                            {a.notes.map((n, i) => <div key={i} className="note staff">{n}</div>)}
                        </div>
                    )}

                    {a.status !== "Work Done" && a.status !== "Verified" && a.status !== "Closed" && (
                        <div style={{ marginTop: 10 }}>
                            <div style={{ display: "flex", gap: 7, marginBottom: 8 }}>
                                <textarea className="tinput" style={{ flex: 1, minHeight: 36, resize: "none" }} value={note[a.id] || ""} onChange={e => setNote(p => ({ ...p, [a.id]: e.target.value }))} placeholder="Add a note about your progress..." />
                                <button className="btn btn-sm btn-a" onClick={() => addNote(a.id, note[a.id])}><MessageSquare size={12} /> Note</button>
                            </div>
                            <div className="task-actions">
                                <button className="btn btn-g fw7" onClick={() => markDone(a.id)} style={{ padding: "9px 20px" }}>
                                    <CheckCircle size={14} /> Mark Work as Done
                                </button>
                            </div>
                        </div>
                    )}

                    {a.status === "Work Done" && (
                        <div style={{ marginTop: 10 }}>
                            <div className="done-badge"><CheckCircle size={14} /> Marked as Done — Waiting for Admin Verification</div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
