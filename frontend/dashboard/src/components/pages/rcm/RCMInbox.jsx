import { useState } from "react";
import { SBadge, PBadge } from "../../ui/Badge";
import { AIRecBox } from "../../ui/AIRecBox";
import { Pill, FileText, DollarSign, XCircle, Copy, AlertTriangle, Search, Play, CheckCircle, MessageSquare } from "lucide-react";

const ICON_MAP = {
    "Missing Charge": <Pill size={16} />,
    "Claim Not Submitted": <FileText size={16} />,
    "Underpayment": <DollarSign size={16} />,
    "Denied Claim": <XCircle size={16} />,
    "Duplicate Billing": <Copy size={16} />,
};

export function RCMInbox({ alerts, setAlerts }) {
    const [sel, setSel] = useState(null);
    const [note, setNote] = useState("");
    const [filter, setFilter] = useState("All");
    const filtered = alerts.filter(a => filter === "All" || a.issue === filter || a.priority === filter || a.status === filter);

    const startWork = id => setAlerts(p => p.map(a => a.id === id ? { ...a, status: "In Progress" } : a));
    const resolve = id => { setAlerts(p => p.map(a => a.id === id ? { ...a, status: "Resolved", notes: note ? [...a.notes, note] : a.notes } : a)); setNote(""); setSel(null); };
    const addNote = id => { if (!note) return; setAlerts(p => p.map(a => a.id === id ? { ...a, notes: [...a.notes, note] } : a)); setNote(""); };

    return (
        <div className="page">
            <div className="frow">
                {["All", "New", "Assigned", "In Progress", "Critical", "High"].map(f => (
                    <button key={f} className={`fb${filter === f ? " on" : ""}`} onClick={() => setFilter(f)}>{f}</button>
                ))}
            </div>
            {filtered.map(a => (
                <div key={a.id} className={`ac ${a.priority === "Critical" ? "crit" : a.priority === "High" ? "hi" : "med"}`}>
                    <div className="ac-ico">{ICON_MAP[a.issue] || <AlertTriangle size={16} />}</div>
                    <div className="ac-body">
                        <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 3 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--warn)" }}>{a.issue}</span>
                            <SBadge s={a.status} /><PBadge p={a.priority} />
                        </div>
                        <div className="ac-meta">{a.id} · {a.patient} · {a.dept} · {a.insurance}</div>
                        <div style={{ marginTop: 4 }}><span className="ts tm">CPT: </span><span style={{ fontWeight: 700, color: "var(--ok)" }}>{a.cptSuggested}</span><span className="ts tm" style={{ marginLeft: 5 }}>({a.cptConfidence}% conf.)</span></div>
                        <div className="ac-actions">
                            <button className="btn btn-sm" onClick={() => setSel(a)}><Search size={12} /> Investigate</button>
                            {a.status === "Assigned" && <button className="btn btn-sm btn-a" onClick={() => startWork(a.id)}><Play size={12} /> Start</button>}
                            {a.status === "In Progress" && <button className="btn btn-sm btn-g" onClick={() => setSel(a)}><CheckCircle size={12} /> Resolve</button>}
                        </div>
                    </div>
                    <div className="ac-amt"><div className="ac-loss" style={{ color: "var(--danger)" }}>₹{a.loss.toLocaleString()}</div><div className="ac-risk">AI: {a.aiScore}</div></div>
                </div>
            ))}

            {sel && (
                <div className="ov" onClick={() => setSel(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="mh"><div className="mh-title">Case — {sel.id}</div><button className="mh-close" onClick={() => setSel(null)}>×</button></div>
                        <div className="mb2">
                            <div className="dr"><span className="dr-l">Patient</span><span className="dr-v">{sel.patient}</span></div>
                            <div className="dr"><span className="dr-l">Procedure</span><span className="dr-v fw7">{sel.procedure}</span></div>
                            <div className="dr"><span className="dr-l">Insurance</span><span className="dr-v">{sel.insurance}</span></div>
                            <div className="dr"><span className="dr-l">Loss</span><span className="dr-v fw7" style={{ color: "var(--danger)" }}>₹{sel.loss.toLocaleString()}</span></div>
                            <div className="ai-box">
                                <div className="ai-box-h">AI Suggestion</div>
                                <div className="ai-cpt">CPT: {sel.cptSuggested}</div>
                                <div className="ai-conf">Confidence: {sel.cptConfidence}% · {sel.procedure}</div>
                            </div>
                            <AIRecBox issue={sel.issue} expected={sel.expectedPayment} actual={sel.actualPayment} recommendation={sel.recommendation} />
                            {sel.notes.length > 0 && <div className="notes">{sel.notes.map((n, i) => <div key={i} className="note">{n}</div>)}</div>}
                            <div className="field" style={{ marginTop: 10 }}><label>Note</label><textarea className="tinput" value={note} onChange={e => setNote(e.target.value)} placeholder="Add investigation note..." /></div>
                            <div style={{ display: "flex", gap: 7 }}>
                                <button className="btn btn-a" onClick={() => addNote(sel.id)}><MessageSquare size={12} /> Add Note</button>
                                {sel.status === "In Progress" && <button className="btn btn-g" onClick={() => resolve(sel.id)}><CheckCircle size={12} /> Mark Resolved</button>}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
