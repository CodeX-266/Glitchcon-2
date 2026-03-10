import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { auth, db } from "../../config/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Toaster, toast } from "react-hot-toast";

export function Login({ onLogin, staffList, setStaffList }) {
    const [tab, setTab] = useState("login");
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [err, setErr] = useState("");
    const [ok, setOk] = useState("");

    const [rName, setRName] = useState("");
    const [rEmail, setREmail] = useState("");
    const [rPass, setRPass] = useState("");
    const [rRole, setRRole] = useState("");
    const [rDept, setRDept] = useState("Radiology");

    const fetchUserRoleAndLogin = async (user) => {
        try {
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            let userData = null;

            if (docSnap.exists()) {
                userData = docSnap.data();
            } else {
                if (tab !== "register") {
                    setErr("Please use the Staff Register tab first to select your role.");
                    return;
                }
                userData = {
                    id: user.uid,
                    name: user.displayName || rName || "New User",
                    email: user.email,
                    role: rRole,
                    dept: rDept || "General",
                    status: "Pending", // Require admin approval by default
                    registered: new Date().toISOString().split("T")[0],
                };
                await setDoc(docRef, userData);

                // Add to local state so Admin can see them
                setStaffList(p => [...p, userData]);
            }

            onLogin({ ...userData, id: user.uid });
        } catch (error) {
            console.error("Error fetching user data:", error);
            setErr("Failed to load user profile. Please try again.");
        }
    };


    const attempt = async () => {
        setErr("");
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, pass);
            await fetchUserRoleAndLogin(userCredential.user);
        } catch (error) {
            console.error(error);
            setErr("Invalid credentials. " + error.message);
        }
    };

    const attemptGoogle = async () => {
        setErr("");
        if (tab === "register" && !rRole) {
            toast.error("You must select a Role before continuing with Google.", {
                icon: '⚠️', style: { border: '1px solid #777', color: '#111', fontWeight: 600 }
            });
            return;
        }
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            await fetchUserRoleAndLogin(result.user);
        } catch (error) {
            console.error(error);
            setErr("Google sign-in failed. " + error.message);
        }
    };

    const register = async () => {
        setErr("");
        if (!rName || !rEmail || !rPass) { setErr("All fields are required."); return; }
        if (!rRole) {
            toast.error("Wait! Please select a Role from the dropdown.", {
                icon: '🛑', style: { border: '1px solid #777', color: '#111', fontWeight: 600 }
            });
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, rEmail, rPass);
            const user = userCredential.user;

            const ns = {
                id: user.uid,
                name: rName,
                email: rEmail,
                role: rRole,
                dept: rDept,
                status: "Pending",
                registered: new Date().toISOString().split("T")[0],
            };

            await setDoc(doc(db, "users", user.uid), ns);
            setStaffList(p => [...p, ns]);

            setOk("Registration successful!");
            setRName(""); setREmail(""); setRPass(""); setTab("login");
            await fetchUserRoleAndLogin(user);
        } catch (error) {
            console.error(error);
            setErr("Registration failed. " + error.message);
        }
    };

    return (
        <div className="lp">
            <Toaster position="top-right" />
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

                            <button className="l-btn" onClick={attempt} style={{ marginBottom: 12 }}>Access System</button>
                            <button className="l-btn" onClick={attemptGoogle} style={{ background: "white", color: "#333", border: "1px solid #ccc", display: "flex", justifyContent: "center", alignItems: "center", gap: 10 }}>
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: 18 }} />
                                Continue with Google
                            </button>

                            {err && <div className="l-err" style={{ marginTop: 12 }}>{err}</div>}
                            {ok && <div className="l-ok" style={{ marginTop: 12 }}>{ok}</div>}
                        </>
                    )}

                    {tab === "register" && (
                        <>
                            <div className="banner warn" style={{ marginBottom: 14 }}><AlertTriangle size={14} /> New staff accounts require admin approval before login.</div>
                            <div className="lf"><label>Full Name</label><input value={rName} onChange={e => setRName(e.target.value)} placeholder="Dr. John Doe" /></div>
                            <div className="lf"><label>Email</label><input type="email" value={rEmail} onChange={e => setREmail(e.target.value)} placeholder="john@hospital.com" /></div>
                            <div className="lf"><label>Password</label><input type="password" value={rPass} onChange={e => setRPass(e.target.value)} placeholder="Choose a secure password" /></div>
                            <div className="lf"><label>Role</label>
                                <select className="sel" value={rRole} onChange={e => setRRole(e.target.value)}>
                                    <option value="" disabled>— Select your specific role —</option>
                                    {["Revenue Department", "Medical Coding", "Insurance Claims"].map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div className="lf"><label>Department</label>
                                <select className="sel" value={rDept} onChange={e => setRDept(e.target.value)}>
                                    {["Radiology", "Surgery", "Lab", "Cardiology", "Gastro", "Neurology"].map(d => <option key={d}>{d}</option>)}
                                </select>
                            </div>
                            <button className="l-btn staff-btn" onClick={register}>Submit Registration</button>
                            <button className="l-btn" onClick={attemptGoogle} style={{ background: "white", color: "#333", border: "1px solid #ccc", display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginTop: 12 }}>
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: 18 }} />
                                Register with Google
                            </button>
                            {err && <div className="l-err">{err}</div>}
                            {ok && <div className="l-ok">{ok}</div>}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
