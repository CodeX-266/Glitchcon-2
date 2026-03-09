import { Info, Inbox } from "lucide-react";

export function StaffDash({ currentUser, alerts }) {
    const mine = alerts.filter(a => a.assignedTo === currentUser.id);
    const done = mine.filter(a => a.status === "Work Done").length;
    const open = mine.filter(a => ["Assigned", "In Progress"].includes(a.status)).length;

    return (
        <div className="page">
            <div className="banner info"><Info size={14} /> Welcome, {currentUser.name}. You are logged in as Staff · {currentUser.dept} Department.</div>
            <div className="krow k4">
                <div className="kpi ks"><div className="kpi-l">Assigned to Me</div><div className="kpi-v s">{mine.length}</div></div>
                <div className="kpi ky"><div className="kpi-l">Open / Pending</div><div className="kpi-v y">{open}</div></div>
                <div className="kpi kg"><div className="kpi-l">Marked Done</div><div className="kpi-v g">{done}</div><div className="kpi-s">Awaiting admin verify</div></div>
                <div className="kpi kb"><div className="kpi-l">Total Loss on Cases</div><div className="kpi-v b">₹{(mine.reduce((s, a) => s + a.loss, 0) / 1000).toFixed(0)}K</div></div>
            </div>
            {mine.length === 0 && (
                <div className="empty"><div className="empty-ico"><Inbox size={28} /></div>No alerts assigned yet. Wait for admin to assign work.</div>
            )}
        </div>
    );
}
