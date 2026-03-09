import { useState } from "react";
import { UserPlus, Check, X, Clock } from "lucide-react";

export function AdminUsers({ staffList, setStaffList, addNotif }) {
    const pending = staffList.filter(s => s.status === "Pending");
    const approved = staffList.filter(s => s.status === "Approved");
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: "", email: "", password: "", dept: "Radiology" });

    const approve = id => {
        const s = staffList.find(x => x.id === id);
        setStaffList(p => p.map(s => s.id === id ? { ...s, status: "Approved" } : s));
        addNotif({ type: "staff_register", title: "Staff Approved", message: `${s?.name} now has system access`, time: "Just now" });
    };
    const reject = id => {
        const s = staffList.find(x => x.id === id);
        setStaffList(p => p.filter(s => s.id !== id));
        addNotif({ type: "staff_register", title: "Staff Rejected", message: `${s?.name}'s registration was rejected`, time: "Just now" });
    };
    const add = () => {
        if (!form.name || !form.email || !form.password) return;
        setStaffList(p => [...p, { ...form, id: `s${Date.now()}`, role: "Staff", status: "Approved", registered: new Date().toISOString().split("T")[0], assignedAlerts: [], completedAlerts: [] }]);
        setForm({ name: "", email: "", password: "", dept: "Radiology" });
        setShowForm(false);
    };

    return (
        <div className="page">
            {pending.length > 0 && (
                <div className="mb4">
                    <div className="sec-head mb3">
                        <div className="sec-t"><Clock size={16} style={{ display: "inline", verticalAlign: -2, marginRight: 6 }} />Pending Registrations</div>
                        <span className="b bpend">{pending.length} awaiting</span>
                    </div>
                    {pending.map(s => (
                        <div className="reg-card" key={s.id}>
                            <div className="reg-av">{s.name.split(" ").map(n => n[0]).join("")}</div>
                            <div className="reg-body">
                                <div className="reg-name">{s.name}</div>
                                <div className="reg-meta">{s.email} · {s.dept} · Registered {s.registered}</div>
                            </div>
                            <div className="reg-actions">
                                <button className="btn btn-sm btn-g" onClick={() => approve(s.id)}><Check size={12} /> Approve</button>
                                <button className="btn btn-sm btn-r" onClick={() => reject(s.id)}><X size={12} /> Reject</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="sec-head mb3">
                <div className="sec-t">Approved Staff</div>
                <button className="btn btn-a" onClick={() => setShowForm(!showForm)}><UserPlus size={14} /> Add Staff</button>
            </div>

            {showForm && (
                <div className="card mb4">
                    <div className="ct">Create Staff Account</div>
                    <div className="g2">
                        <div className="field"><label>Full Name</label><input className="tinput" style={{ minHeight: "unset", height: 36, resize: "none" }} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Dr. John Doe" /></div>
                        <div className="field"><label>Email</label><input className="tinput" style={{ minHeight: "unset", height: 36, resize: "none" }} value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="john@hospital.com" /></div>
                        <div className="field"><label>Password</label><input type="password" className="tinput" style={{ minHeight: "unset", height: 36, resize: "none" }} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Set a password" /></div>
                        <div className="field"><label>Department</label>
                            <select className="sel" value={form.dept} onChange={e => setForm(p => ({ ...p, dept: e.target.value }))}>
                                {["Radiology", "Surgery", "Lab", "Cardiology", "Gastro", "Neurology"].map(d => <option key={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>
                    <button className="btn btn-p" onClick={add}>Create Account</button>
                </div>
            )}

            <div className="tw">
                <table>
                    <thead><tr><th>Name</th><th>Email</th><th>Department</th><th>Registered</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                        {approved.map(s => (
                            <tr key={s.id}>
                                <td className="fw7">{s.name}</td>
                                <td className="tm ts">{s.email}</td>
                                <td>{s.dept}</td>
                                <td className="tm ts">{s.registered}</td>
                                <td><span className="b bapp">Approved</span></td>
                                <td><button className="btn btn-sm btn-r" onClick={() => reject(s.id)}>Remove</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
