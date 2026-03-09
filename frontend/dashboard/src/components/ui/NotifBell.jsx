import { useState, useRef, useEffect } from "react";
import { Bell, AlertTriangle, UserCheck, CheckCircle, Info, Trash2 } from "lucide-react";

export function NotifBell({ notifications, onClear }) {
    const [open, setOpen] = useState(false);
    const ref = useRef();
    useEffect(() => {
        const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    const icons = {
        alert_assigned: <AlertTriangle size={14} />,
        staff_register: <UserCheck size={14} />,
        work_done: <CheckCircle size={14} />,
    };
    const unread = notifications.filter(n => !n.read).length;

    return (
        <div className="notif-wrap" ref={ref}>
            <button className="notif-btn" onClick={() => setOpen(!open)}>
                <Bell size={16} />
                {unread > 0 && <span className="notif-dot" />}
            </button>
            {open && (
                <div className="notif-panel">
                    <div className="np-head">
                        <span>Notifications {unread > 0 && `(${unread})`}</span>
                        {notifications.length > 0 && (
                            <span className="np-clear" onClick={onClear}><Trash2 size={12} /> Clear</span>
                        )}
                    </div>
                    {notifications.length === 0
                        ? <div className="np-empty">No notifications</div>
                        : notifications.map(n => (
                            <div key={n.id} className={`np-item${n.read ? "" : " unread"}`}>
                                <div className="np-ico">{icons[n.type] || <Info size={14} />}</div>
                                <div>
                                    <div className="np-title">{n.title}</div>
                                    <div className="np-sub">{n.message}</div>
                                    <div className="np-time">{n.time}</div>
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}
