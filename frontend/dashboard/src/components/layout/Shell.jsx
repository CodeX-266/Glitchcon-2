import { useState } from "react";
import { NAV, PAGE_TITLES } from "../../config/navigation";
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
import { LayoutDashboard, AlertTriangle, Cpu, Users, Inbox, BarChart3, ClipboardList, LogOut, CheckCircle } from "lucide-react";

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

    const pages = {
        dash: user.role === "Admin" ? <AdminDash alerts={alerts} staffList={staffList} csvAccess={csvAccess} setCsvAccess={setCsvAccess} /> :
            user.role === "RCM" ? <RCMDash alerts={alerts} csvAccess={csvAccess} /> :
                user.role === "Finance" ? <FinanceDash alerts={alerts} csvAccess={csvAccess} /> :
                    <StaffDash currentUser={user} alerts={alerts} />,
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
                            {user.role === "Staff" && `${user.dept} Department · Billing & Claims Work`}
                        </div>
                    </div>
                    <div className="tb-right">
                        {workDone > 0 && user.role === "Admin" && (
                            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", background: "rgba(34,197,94,.06)", border: "1px solid rgba(34,197,94,.15)", borderRadius: "var(--radius-sm)", fontSize: 12, fontWeight: 600, color: "var(--ok)" }}>
                                <CheckCircle size={12} /> {workDone} task{workDone > 1 ? "s" : ""} done
                            </div>
                        )}
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
        </div>
    );
}
