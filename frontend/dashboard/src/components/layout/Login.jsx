import { useState } from "react";
import { USERS_INIT } from "../../config/navigation";
import { AlertTriangle } from "lucide-react";

export function Login({ onLogin, staffList, setStaffList }) {
    const [tab, setTab] = useState("login");
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [err, setErr] = useState("");
    const [ok, setOk] = useState("");
    const [allUsers] = useState(USERS_INIT);

    const [rName, setRName] = useState("");
    const [rEmail, setREmail] = useState("");
    const [rPass, setRPass] = useState("");
    const [rDept, setRDept] = useState("Radiology");

    const attempt = () => {
        setErr("");
        const u = allUsers.find(u => u.email === email && u.password === pass);
        if (u) { onLogin(u); return; }
        const s = staffList.find(s => s.email === email && s.password === pass);
        if (s) {
            if (s.status === "Pending") { setErr("Your account is pending admin approval."); return; }
            onLogin({ ...s, dept: s.dept });
            return;
        }
        setErr("Invalid credentials. Try a demo card below or register as staff.");
    };

    const register = () => {
        setErr("");
        if (!rName || !rEmail || !rPass) { setErr("All fields are required."); return; }
        if (staffList.find(s => s.email === rEmail) || allUsers.find(u => u.email === rEmail)) { setErr("Email already registered."); return; }
        const ns = { id: `s${Date.now()}`, name: rName, email: rEmail, password: rPass, role: "Staff", dept: rDept, status: "Pending", registered: new Date().toISOString().split("T")[0], assignedAlerts: [], completedAlerts: [] };
        setStaffList(p => [...p, ns]);
        setOk("Registration submitted! Waiting for admin approval.");
        setRName(""); setREmail(""); setRPass(""); setTab("login");
    };

    const demoCards = [
        { role: "Admin", email: "admin@hospital.com", password: "admin123", cls: "adm" },
        { role: "RCM", email: "rcm@hospital.com", password: "rcm123", cls: "rcm" },
        { role: "Finance", email: "finance@hospital.com", password: "finance123", cls: "fin" },
        { role: "Staff", email: "priya@hospital.com", password: "priya123", cls: "stf" },
    ];

    return (
        <div className="lp">
            <div className="lbox">
                <div className="lbox-top">
                    <div className="l-chip"><i />Hospital Analytics Platform</div>
                    <div className="l-h1">Revenue<br /><em>Leakage</em><br />Detection</div>
                </div>
                <div className="lbox-body">
                    <div className="tab-row">
                        <button className={`tab${tab === "login" ? " on" : ""}`} onClick={() => { setTab("login"); setErr(""); setOk(""); }}>Sign In</button>
                        <button className={`tab stf${tab === "register" ? " on stf" : ""}`} onClick={() => { setTab("register"); setErr(""); setOk(""); }}>Staff Register</button>
                    </div>

                    {tab === "login" && (
                        <>
                            <div className="lf"><label>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@hospital.com" onKeyDown={e => e.key === "Enter" && attempt()} /></div>
                            <div className="lf"><label>Password</label><input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && attempt()} /></div>
                            <button className="l-btn" onClick={attempt}>Access System</button>
                            {err && <div className="l-err">{err}</div>}
                            {ok && <div className="l-ok">{ok}</div>}
                            <div className="role-cards">
                                {demoCards.map(u => (
                                    <div key={u.email} className="rc" onClick={() => { setEmail(u.email); setPass(u.password); setErr(""); setOk(""); }}>
                                        <div className={`rc-role ${u.cls}`}>{u.role}</div>
                                        <div className="rc-email">{u.email}</div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {tab === "register" && (
                        <>
                            <div className="banner warn" style={{ marginBottom: 14 }}><AlertTriangle size={14} /> New staff accounts require admin approval before login.</div>
                            <div className="lf"><label>Full Name</label><input value={rName} onChange={e => setRName(e.target.value)} placeholder="Dr. John Doe" /></div>
                            <div className="lf"><label>Email</label><input type="email" value={rEmail} onChange={e => setREmail(e.target.value)} placeholder="john@hospital.com" /></div>
                            <div className="lf"><label>Password</label><input type="password" value={rPass} onChange={e => setRPass(e.target.value)} placeholder="Choose a secure password" /></div>
                            <div className="lf"><label>Department</label>
                                <select className="sel" value={rDept} onChange={e => setRDept(e.target.value)}>
                                    {["Radiology", "Surgery", "Lab", "Cardiology", "Gastro", "Neurology"].map(d => <option key={d}>{d}</option>)}
                                </select>
                            </div>
                            <button className="l-btn staff-btn" onClick={register}>Submit Registration</button>
                            {err && <div className="l-err">{err}</div>}
                            {ok && <div className="l-ok">{ok}</div>}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
