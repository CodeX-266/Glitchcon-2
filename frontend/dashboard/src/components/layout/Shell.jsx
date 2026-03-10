import { useState, useEffect, useRef } from "react";
import { Toaster, toast } from 'react-hot-toast';
import { NAV, PAGE_TITLES } from "../../config/navigation";
import { CPT_MAP } from "../../config/api";
import { NotifBell } from "../ui/NotifBell";
import { AdminDash } from "../pages/admin/AdminDash";
import { AdminAlertQueue } from "../pages/admin/AdminAlertQueue";
import { AdminUsers } from "../pages/admin/AdminUsers";
import { AdminAI } from "../pages/admin/AdminAI";
import { RCMDash } from "../pages/rcm/RCMDash";
import { RCMInbox } from "../pages/rcm/RCMInbox";
import { FinanceDash } from "../pages/finance/FinanceDash";
import { FinanceReports } from "../pages/finance/FinanceReports";
import { StaffDash } from "../pages/staff/StaffDash";
import { StaffMyWork } from "../pages/staff/StaffMyWork";
import { LayoutDashboard, AlertTriangle, Cpu, Users, Inbox, BarChart3, ClipboardList, LogOut, CheckCircle, X, Sun, Moon } from "lucide-react";

const ICON_MAP = {
    "dash": <LayoutDashboard size={16} />,
    "alert-q": <AlertTriangle size={16} />,
    "ai": <Cpu size={16} />,
    "users": <Users size={16} />,
    "inbox": <Inbox size={16} />,
    "reports": <BarChart3 size={16} />,
    "work": <ClipboardList size={16} />,
};

export function Shell({ user, onLogout, staffList, setStaffList, alerts, setAlerts, notifs, setNotifs, loading, fetchAlerts }) {
    const [csvAccess, setCsvAccess] = useState({ RCM: false, Finance: false });
    const [page, setPage] = useState("dash");
    const [theme, setTheme] = useState(() => localStorage.getItem("rld_theme") || "dark");
    const prevMyTasks = useRef(0);
    const prevWorkDone = useRef(0);

    useEffect(() => {
        localStorage.setItem("rld_theme", theme);
        document.body.setAttribute('data-theme', theme);
    }, [theme]);

    const addNotif = n => setNotifs(p => [{ ...n, id: Date.now(), read: false }, ...p]);
    const clearNotifs = () => setNotifs([]);

    const nav = NAV[user.role];
    const pending = staffList.filter(s => s.status === "Pending").length;
    const newAlerts = alerts.filter(a => a.status === "New").length;
    const assigned = alerts.filter(a => ["Assigned", "In Progress"].includes(a.status)).length;
    const myTasks = alerts.filter(a => a.assignedTo === user.id && ["Assigned", "In Progress"].includes(a.status)).length;
    const workDone = alerts.filter(a => a.status === "Work Done").length;
    const bmap = { newAlerts, pendingStaff: pending, assigned, myTasks };
    const title = PAGE_TITLES[page]?.[user.role] || page;

    // Toast for STAFF when new tasks are assigned
    useEffect(() => {
        if (myTasks > prevMyTasks.current && prevMyTasks.current !== 0) {
            toast.success("New task assigned to you by Admin!", {
                icon: "🔔",
                style: { fontFamily: "var(--font)", border: `1px solid ${nav.accent}`, color: "var(--text)", fontWeight: 600 }
            });
        }
        prevMyTasks.current = myTasks;
    }, [myTasks]);

    // Toast for ADMIN when staff marks tasks as done
    useEffect(() => {
        if (user.role === "Admin" && workDone > prevWorkDone.current && prevWorkDone.current !== 0) {
            const newDone = workDone - prevWorkDone.current;
            toast(`${newDone} task${newDone > 1 ? "s" : ""} marked as done — awaiting your verification!`, {
                icon: "✅",
                duration: 5000,
                style: { fontFamily: "var(--font)", border: "1px solid var(--ok)", color: "var(--text)", fontWeight: 600, background: "var(--bg)" }
            });
        }
        prevWorkDone.current = workDone;
    }, [workDone]);

    const isStaffRole = ["Revenue Department", "Medical Coding", "Insurance Claims"].includes(user.role);

    const pages = {
        dash: user.role === "Admin" ? <AdminDash alerts={alerts} setAlerts={setAlerts} staffList={staffList} csvAccess={csvAccess} setCsvAccess={setCsvAccess} addNotif={addNotif} fetchAlerts={fetchAlerts} /> :
            user.role === "RCM" ? <RCMDash alerts={alerts} csvAccess={csvAccess} /> :
                user.role === "Finance" ? <FinanceDash alerts={alerts} csvAccess={csvAccess} /> :
                    isStaffRole ? <StaffDash currentUser={user} alerts={alerts} /> : null,
        "alert-q": <AdminAlertQueue alerts={alerts} setAlerts={setAlerts} staffList={staffList} addNotif={addNotif} />,
        "ai": <AdminAI alerts={alerts} onRetrain={fetchAlerts} />,
        "users": <AdminUsers staffList={staffList} setStaffList={setStaffList} addNotif={addNotif} />,
        "inbox": <RCMInbox alerts={alerts} setAlerts={setAlerts} />,
        "reports": <FinanceReports alerts={alerts} />,
        "work": <StaffMyWork currentUser={user} alerts={alerts} setAlerts={setAlerts} addNotif={addNotif} />,
    };

    return (
        <div className="shell" style={{ "--accent": nav.accent }}>
            <div className="sb">
                <div className="sb-brand">
                    <div className="sb-name">RLD System</div>
                    <div className="sb-sub">Revenue Leakage Detection</div>
                    <div className={`sb-rbadge ${nav.cls}`}>
                        {user.role} Portal
                    </div>
                </div>
                <nav className="nav">
                    {nav.sections.map(sec => (
                        <div key={sec.label}>
                            <div className="nav-sec">{sec.label}</div>
                            {sec.items.map(item => (
                                <div key={item.id} className={`nl${page === item.id ? " on" : ""}`} onClick={() => setPage(item.id)}>
                                    <span className="nl-ico">{ICON_MAP[item.id] || <LayoutDashboard size={16} />}</span>
                                    <span>{item.label}</span>
                                    {item.badge && bmap[item.badge] > 0 && <span className={`nl-badge${item.badge === "myTasks" ? " new" : ""}`}>{bmap[item.badge]}</span>}
                                </div>
                            ))}
                        </div>
                    ))}

                    {/* MEDICAL CPT CODES REFERENCE LIST */}
                    {(user.role === "Admin" || user.role === "Medical Coding") && (
                        <div style={{ marginTop: 24, paddingBottom: 16 }}>
                            <div className="nav-sec" style={{ paddingLeft: 16, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                                <ClipboardList size={14} /> Medical CPT Codes
                            </div>
                            <div style={{
                                maxHeight: 180, overflowY: "auto", margin: "0 16px",
                                background: "rgba(0,0,0,0.15)", border: "1px solid var(--border)",
                                borderRadius: 8, padding: "6px 10px"
                            }} className="tw">
                                <style>{`.tw::-webkit-scrollbar { width: 4px; } .tw::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }`}</style>
                                {Object.entries(CPT_MAP).map(([proc, code]) => (
                                    <div key={proc} style={{
                                        display: "flex", justifyContent: "space-between", alignItems: "center",
                                        padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.03)",
                                        fontSize: 11, color: "var(--muted)"
                                    }}>
                                        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>{proc}</span>
                                        <strong style={{ color: "var(--nav-text)", fontFamily: "var(--mono)", background: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: 4 }}>{code}</strong>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </nav>
                <div className="sb-foot">
                    <div className={`sb-av ${nav.cls}`}>{user.name.split(" ").map(n => n[0]).join("")}</div>
                    <div><div className="sb-un">{user.name}</div><div className="sb-ud">{user.dept}</div></div>
                    <button className="sb-out" onClick={onLogout} title="Logout"><LogOut size={14} /></button>
                </div>
            </div>

            <div className="main">
                <div className="topbar">
                    <div>
                        <div className="tb-title">{title}</div>
                        <div className="tb-sub">
                            {user.role === "Admin" && "System Control · Alert Assignment · Staff Management"}
                            {user.role === "RCM" && "Claim Investigation · Code Correction · Resubmission"}
                            {user.role === "Finance" && "Revenue Analytics · Forecasting · Reports"}
                            {isStaffRole && `${user.role} Operations · Analytics · Processing`}
                        </div>
                    </div>
                    <div className="tb-right">
                        {workDone > 0 && user.role === "Admin" && (
                            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", background: "rgba(34,197,94,.06)", border: "1px solid rgba(34,197,94,.15)", borderRadius: "var(--radius-sm)", fontSize: 12, fontWeight: 600, color: "var(--ok)" }}>
                                <CheckCircle size={12} /> {workDone} task{workDone > 1 ? "s" : ""} done
                            </div>
                        )}
                        <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} className="sb-out" style={{ margin: 0, background: "var(--s1)", color: "var(--muted)", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "17px", cursor: "pointer" }}>
                            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                        </button>
                        <NotifBell notifications={notifs} onClear={clearNotifs} />
                        <div className="ai-pill"><div className="ai-dot" />AI Active</div>
                    </div>
                </div>
                {loading ? (
                    <div className="page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                            <div style={{ width: 40, height: 40, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                            <div style={{ color: "var(--muted)", fontWeight: 500, fontFamily: "var(--mono)", fontSize: 13, letterSpacing: 1 }}>FETCHING AI ANALYSIS...</div>
                            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        </div>
                    </div>
                ) : pages[page] || <div className="page"><div className="empty">Page not found</div></div>}
            </div>
            <Toaster position="bottom-right" />
        </div>
    );
}
