import { useState, useEffect } from "react";
import { API_URL } from "./config/api";
import { transformAlerts } from "./utils/transforms";
import { auth, db } from "./config/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import "./styles/theme.css";
import { Shell } from "./components/layout/Shell";
import { Login } from "./components/layout/Login";
import { STAFF_INIT } from "./config/navigation";

export default function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [staffList, setStaffList] = useState(() => {
    const saved = localStorage.getItem("rld_staff");
    return saved ? JSON.parse(saved) : STAFF_INIT;
  });

  const [alerts, setAlerts] = useState(() => {
    const saved = localStorage.getItem("rld_alerts");
    return saved ? JSON.parse(saved) : [];
  });

  const [notifs, setNotifs] = useState(() => {
    const saved = localStorage.getItem("rld_notifs");
    return saved ? JSON.parse(saved) : [];
  });

  const [loading, setLoading] = useState(alerts.length === 0);

  useEffect(() => { localStorage.setItem("rld_staff", JSON.stringify(staffList)); }, [staffList]);
  useEffect(() => { localStorage.setItem("rld_alerts", JSON.stringify(alerts)); }, [alerts]);
  useEffect(() => { localStorage.setItem("rld_notifs", JSON.stringify(notifs)); }, [notifs]);

  const fetchAlerts = async () => {
    try {
      const res = await fetch(`${API_URL}/alerts`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setAlerts(prev => {
          const statusMap = {};
          prev.forEach(a => { statusMap[a.id] = { status: a.status, assignedTo: a.assignedTo, notes: a.notes, priority: a.priority }; });
          return transformAlerts(data).map(a => ({ ...a, ...(statusMap[a.id] || {}) }));
        });
      }
    } catch (e) { console.error("Failed to fetch alerts:", e); }
    setLoading(false);
  };

  useEffect(() => { fetchAlerts(); }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const docRef = doc(db, "users", firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUser({ ...docSnap.data(), id: firebaseUser.uid });
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error("Error fetching user session:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setAuthChecked(true);
    });
    return () => unsubscribe();
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

  return user
    ? <Shell user={user} onLogout={() => setUser(null)} staffList={staffList} setStaffList={setStaffList} alerts={alerts} setAlerts={setAlerts} notifs={notifs} setNotifs={setNotifs} loading={loading} fetchAlerts={fetchAlerts} />
    : <Login onLogin={setUser} staffList={staffList} setStaffList={setStaffList} alerts={alerts} setAlerts={setAlerts} />;
}
