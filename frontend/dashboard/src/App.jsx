import { useState, useEffect, useRef } from "react";
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

  // ── WRITE GUARD ──
  const isWriting = useRef(false);
  const snapshotUnsub = useRef(null);

  // Helper: extract ONLY the mutable state fields per alert (small payload for Firebase)
  const extractStates = (alertsArr) => {
    const states = {};
    alertsArr.forEach(a => {
      // Only store alerts that have been modified from default "New" status
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

  // Persist alerts to localStorage always; try Firebase sync (but don't break if quota exceeded)
  useEffect(() => {
    localStorage.setItem("rld_alerts", JSON.stringify(alerts));
    if (alerts.length > 0) {
      const states = extractStates(alerts);
      isWriting.current = true;
      setDoc(doc(db, "system", "alert_states"), { states })
        .then(() => {
          setTimeout(() => { isWriting.current = false; }, 500);
        })
        .catch(() => {
          // Firebase quota exceeded or offline — localStorage already saved, so app still works
          isWriting.current = false;
        });
    }
  }, [alerts]);

  useEffect(() => { localStorage.setItem("rld_notifs", JSON.stringify(notifs)); }, [notifs]);

  // Listen to staff list from Firestore
  useEffect(() => {
    const unsubStaff = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersList = [];
      snapshot.forEach(doc => usersList.push({ id: doc.id, ...doc.data() }));
      setStaffList(usersList);
    });
    return () => unsubStaff();
  }, []);

  // Fetch alerts from Python API + merge with saved states
  const fetchAlerts = async () => {
    try {
      const res = await fetch(`${API_URL}/alerts`);
      const data = await res.json();

      if (Array.isArray(data)) {
        const baseAlerts = transformAlerts(data);

        // Source 1: localStorage (same browser, always available)
        const localSaved = localStorage.getItem("rld_alerts");
        const localAlerts = localSaved ? JSON.parse(localSaved) : [];
        const localMap = {};
        localAlerts.forEach(a => {
          if (a.status !== "New" || a.assignedTo) {
            localMap[a.id] = { status: a.status, assignedTo: a.assignedTo, priority: a.priority, notes: a.notes || [] };
          }
        });

        // Source 2: Firebase (cross-browser, may fail if quota exceeded)
        let fbStates = {};
        try {
          const statesSnap = await getDoc(doc(db, "system", "alert_states"));
          fbStates = statesSnap.exists() ? (statesSnap.data().states || {}) : {};
        } catch (fbErr) {
          console.warn("Firebase read failed (quota?), using localStorage only:", fbErr.message);
        }

        // Merge: base data + localStorage + Firebase (most recent wins)
        const merged = baseAlerts.map(a => ({
          ...a,
          ...(localMap[a.id] || {}),
          ...(fbStates[a.id] || {}),
        }));
        setAlerts(merged);

        // Try setting up real-time listener (will silently fail if quota exceeded)
        try {
          if (snapshotUnsub.current) snapshotUnsub.current();
          snapshotUnsub.current = onSnapshot(doc(db, "system", "alert_states"), (docSnap) => {
            if (isWriting.current) return;
            if (docSnap.exists() && docSnap.data().states) {
              const liveStates = docSnap.data().states;
              setAlerts(prev => {
                if (prev.length === 0) return prev;
                return prev.map(a => ({ ...a, ...(liveStates[a.id] || {}) }));
              });
            }
          });
        } catch (snapErr) {
          console.warn("Firebase listener failed:", snapErr.message);
        }
      }
    } catch (e) { console.error("Failed to fetch alerts:", e); }
    setLoading(false);
  };

  useEffect(() => {
    fetchAlerts();
    return () => { if (snapshotUnsub.current) snapshotUnsub.current(); };
  }, []);

  // Auth state listener
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
