import { useState, useEffect, useRef } from "react";
import { API_URL } from "./config/api";
import { transformAlerts } from "./utils/transforms";
import { auth, db } from "./config/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, collection } from "firebase/firestore";
import { AlertTriangle, LogOut } from "lucide-react";

import "./styles/theme.css";
import { Shell } from "./components/layout/Shell";
import { Login } from "./components/layout/Login";

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
  const syncTimer = useRef(null);

  // Helper: extract mutable state fields
  const extractStates = (alertsArr) => {
    const states = {};
    alertsArr.forEach(a => {
      if (a.status !== "New" || a.assignedTo || (a.notes && a.notes.length > 0)) {
        states[a.id] = {
          status: a.status,
          assignedTo: a.assignedTo || null,
          priority: a.priority,
          notes: a.notes || [],
        };
      }
    });
    return states;
  };

  // ── Save to localStorage + sync to backend (debounced) ──
  useEffect(() => {
    localStorage.setItem("rld_alerts", JSON.stringify(alerts));

    // Debounced sync to backend (waits 500ms after last change)
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      if (alerts.length > 0) {
        const states = extractStates(alerts);
        fetch(`${API_URL}/states`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(states),
        }).catch(() => { }); // Silently fail if backend unreachable
      }
    }, 500);
  }, [alerts]);

  useEffect(() => { localStorage.setItem("rld_notifs", JSON.stringify(notifs)); }, [notifs]);

  // ── Fetch alerts from API + merge with saved states ──
  const fetchAlerts = async () => {
    try {
      const res = await fetch(`${API_URL}/alerts`);
      const data = await res.json();

      if (Array.isArray(data)) {
        const baseAlerts = transformAlerts(data);

        const localSaved = localStorage.getItem("rld_alerts");
        const localAlerts = localSaved ? JSON.parse(localSaved) : [];
        const localMap = {};
        localAlerts.forEach(a => {
          if (a.status !== "New" || a.assignedTo) {
            localMap[a.id] = { status: a.status, assignedTo: a.assignedTo, priority: a.priority, notes: a.notes || [] };
          }
        });

        let serverStates = {};
        try {
          const stRes = await fetch(`${API_URL}/states`);
          serverStates = await stRes.json();
        } catch (e) { }

        const merged = baseAlerts.map(a => ({
          ...a,
          ...(localMap[a.id] || {}),
          ...(serverStates[a.id] || {}),
        }));
        setAlerts(merged);
      }
    } catch (e) { console.error("Failed to fetch alerts:", e); }
    setLoading(false);
  };

  // ── Fetch staff from API (fallback to Firestore) ──
  const fetchUsers = async () => {
    try {
      const r = await fetch(`${API_URL}/users`);
      const users = await r.json();
      if (Array.isArray(users)) {
        setStaffList(prev => {
          // Basic merge to not accidentally remove local-only if there's sync lag
          const idMap = new Map();
          prev.forEach(u => idMap.set(u.id, u));
          users.forEach(u => idMap.set(u.id, u));
          return Array.from(idMap.values());
        });
      }
    } catch (e) { }
  };

  // Fetch on mount + poll every 5 seconds for cross-device updates
  useEffect(() => {
    fetchAlerts();
    fetchUsers();

    // Also try Firestore listener once for any offline synced data
    let unsubStaff = () => { };
    try {
      unsubStaff = onSnapshot(collection(db, "users"), (snapshot) => {
        const usersList = [];
        snapshot.forEach(d => usersList.push({ id: d.id, ...d.data() }));
        if (usersList.length > 0) {
          setStaffList(prev => {
            const idMap = new Map();
            prev.forEach(u => idMap.set(u.id, u));
            usersList.forEach(u => idMap.set(u.id, u));
            return Array.from(idMap.values());
          });
        }
      }, () => { });
    } catch (e) { }

    const poll = setInterval(() => {
      fetchAlerts();
      fetchUsers();
    }, 5000);

    return () => {
      clearInterval(poll);
      unsubStaff();
    };
  }, []);

  // ── Auth ──
  useEffect(() => {
    let unsubscribeSnap = null;
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const docRef = doc(db, "users", firebaseUser.uid);
        unsubscribeSnap = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setUser({ ...docSnap.data(), id: firebaseUser.uid });
          } else {
            setUser(null);
          }
          setAuthChecked(true);
        }, () => {
          setUser({ id: firebaseUser.uid, name: firebaseUser.displayName || firebaseUser.email, email: firebaseUser.email, role: "Admin", status: "Approved", dept: "Administration" });
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
    try { await signOut(auth); } catch (e) { }
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
