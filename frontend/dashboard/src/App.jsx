import { useState, useEffect } from "react";
import { API_URL } from "./config/api";
import { transformAlerts } from "./utils/transforms";
import { auth, db } from "./config/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, collection, setDoc, getDoc } from "firebase/firestore";
import { AlertTriangle, LogOut } from "lucide-react";

import "./styles/theme.css";
import { Shell } from "./components/layout/Shell";
import { Login } from "./components/layout/Login";
import { STAFF_INIT } from "./config/navigation";

export default function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [staffList, setStaffList] = useState([]);

  const [alerts, setAlerts] = useState(() => {
    const saved = localStorage.getItem("rld_alerts");
    return saved ? JSON.parse(saved) : [];
  });

  const [notifs, setNotifs] = useState(() => {
    const saved = localStorage.getItem("rld_notifs");
    return saved ? JSON.parse(saved) : [];
  });

  const [loading, setLoading] = useState(alerts.length === 0);

  useEffect(() => {
    localStorage.setItem("rld_alerts", JSON.stringify(alerts));
    if (alerts.length > 0) {
      setDoc(doc(db, "system", "global_alerts"), { data: alerts }).catch(console.error);
    }
  }, [alerts]);
  useEffect(() => { localStorage.setItem("rld_notifs", JSON.stringify(notifs)); }, [notifs]);

  useEffect(() => {
    const unsubStaff = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersList = [];
      snapshot.forEach(doc => usersList.push({ id: doc.id, ...doc.data() }));
      setStaffList(usersList);
    });
    return () => unsubStaff();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await fetch(`${API_URL}/alerts`);
      const data = await res.json();

      if (Array.isArray(data)) {
        const baseAlerts = transformAlerts(data);
        const statesSnap = await getDoc(doc(db, "system", "global_alerts"));
        const fbAlerts = statesSnap.exists() ? statesSnap.data().data : [];

        const fbMap = {};
        fbAlerts.forEach(a => { fbMap[a.id] = a; });
        setAlerts(baseAlerts.map(a => ({ ...a, ...(fbMap[a.id] || {}) })));

        onSnapshot(doc(db, "system", "global_alerts"), (docSnap) => {
          if (docSnap.exists() && docSnap.data().data) {
            const liveAlerts = docSnap.data().data;
            const liveMap = {};
            liveAlerts.forEach(a => { liveMap[a.id] = a; });
            setAlerts(prev => {
              if (prev.length === 0) return prev;
              const changed = prev.some(p => JSON.stringify(liveMap[p.id]) !== JSON.stringify(p));
              if (!changed) return prev;
              return prev.map(a => ({ ...a, ...(liveMap[a.id] || {}) }));
            });
          }
        });
      }
    } catch (e) { console.error("Failed to fetch alerts:", e); }
    setLoading(false);
  };

  useEffect(() => { fetchAlerts(); }, []);

  useEffect(() => {
    let unsubscribeSnap = null;
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const docRef = doc(db, "users", firebaseUser.uid);
        unsubscribeSnap = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUser({ ...userData, id: firebaseUser.uid });
          } else {
            setUser(null);
          }
          setAuthChecked(true);
        }, (error) => {
          console.error("Error fetching user session:", error);
          setUser(null);
          setAuthChecked(true);
        });
      } else {
        if (unsubscribeSnap) unsubscribeSnap();
        setUser(null);
        setAuthChecked(true);
      }
    });
    return () => {
      if (unsubscribeSnap) unsubscribeSnap();
      unsubscribeAuth();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
    setUser(null);
  };

  if (!authChecked) {
    return <div className="page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>Loading session...</div>;
  }

  if (user && user.status === "Pending") {
    return (
      <div className="lp">
        <div className="lbox" style={{ maxWidth: 450, textAlign: "center", padding: "40px 30px" }}>
          <AlertTriangle size={48} color="var(--accent)" style={{ margin: "0 auto 20px" }} />
          <h2 style={{ fontSize: 24, marginBottom: 10, color: "var(--text)" }}>Waiting for Approval</h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.5, marginBottom: 30 }}>
            Your account has been successfully created and is waiting for an Admin to approve your access.
            This page will automatically refresh once you are approved!
          </p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ width: 30, height: 30, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <button onClick={handleLogout} style={{ marginTop: 40, background: "none", border: "none", color: "var(--muted)", textDecoration: "underline", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, margin: "40px auto 0" }}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>
    );
  }

  return user
    ? <Shell user={user} onLogout={handleLogout} staffList={staffList} setStaffList={setStaffList} alerts={alerts} setAlerts={setAlerts} notifs={notifs} setNotifs={setNotifs} loading={loading} fetchAlerts={fetchAlerts} />
    : <Login onLogin={setUser} staffList={staffList} setStaffList={setStaffList} alerts={alerts} setAlerts={setAlerts} />;
}
