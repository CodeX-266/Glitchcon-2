import { useState, useEffect, useRef } from "react";
import { API_URL } from "../../../config/api";
import toast from "react-hot-toast";
import { Megaphone, Send, Mail, User, ShieldCheck, MessagesSquare } from "lucide-react";

export function CommsDash({ currentUser, staffList, addNotif }) {
    const [announcement, setAnnouncement] = useState("");
    const [broadcasting, setBroadcasting] = useState(false);

    // Chat state
    const [chats, setChats] = useState([]);
    const [selectedEmail, setSelectedEmail] = useState("");
    const [messageText, setMessageText] = useState("");
    const isAdmin = currentUser.role === "Admin";

    // Only non-admin staff that are approved (or all, but usually approved ones communicate)
    const activeStaff = staffList.filter(s => s.status === "Approved" || s.status === "active" || s.role === "Admin");

    // Derived contacts for the current user
    const contacts = activeStaff.filter(s => s.email !== currentUser.email);

    const chatEndRef = useRef(null);

    // Poll states to get chats
    useEffect(() => {
        const fetchChats = async () => {
            try {
                const res = await fetch(`${API_URL}/states`);
                const data = await res.json();
                if (data._chats && Array.isArray(data._chats)) {
                    setChats(data._chats);
                }
            } catch (e) {
                console.error("Failed to load chats:", e);
            }
        };
        fetchChats();
        const interval = setInterval(fetchChats, 4000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chats, selectedEmail]);

    const handleBroadcast = async () => {
        if (!announcement.trim()) return;
        setBroadcasting(true);
        try {
            const annObj = { id: Date.now(), msg: announcement.trim() };
            await fetch(`${API_URL}/states`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ _global_announcement: annObj })
            });
            toast.success("Broadcast sent to all active users!", { duration: 4000, style: { background: "var(--bg)", color: "var(--text)", border: "1px solid var(--ok)" } });
            if (addNotif) addNotif({ type: "announcement", title: "Broadcast Sent", message: announcement.trim(), time: "Just now" });
            setAnnouncement("");
        } catch (e) {
            toast.error("Failed to broadcast message.");
        }
        setBroadcasting(false);
    };

    const handleSendMessage = async () => {
        if (!messageText.trim() || !selectedEmail) return;

        const newMsg = {
            id: Date.now(),
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderEmail: currentUser.email,
            recipientEmail: selectedEmail,
            text: messageText.trim(),
            timestamp: new Date().toISOString()
        };

        const updatedChats = [...chats, newMsg];
        setChats(updatedChats); // optimistic update
        setMessageText("");

        try {
            await fetch(`${API_URL}/states`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ _chats: updatedChats })
            });
        } catch (e) {
            console.error("Failed to send message", e);
            toast.error("Failed to send message.");
        }
    };

    // Filter messages for rendering
    let displayChats = [];
    if (isAdmin) {
        // Admin sees EVERYTHING
        displayChats = [...chats];
    } else {
        // Staff sees messages where they are sender AND recipient is selectedEmail
        // OR where they are recipient AND sender is selectedEmail
        displayChats = chats.filter(c =>
            (c.senderEmail === currentUser.email && c.recipientEmail === selectedEmail) ||
            (c.senderEmail === selectedEmail && c.recipientEmail === currentUser.email)
        );
    }

    displayChats.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    return (
        <div className="page" style={{ maxWidth: 1400, margin: "0 auto", display: "grid", gridTemplateColumns: isAdmin ? "1fr 400px" : "1fr", gap: 24 }}>

            {/* ═══ LEFT/MAIN: CHAT INTERFACE ═══ */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24, height: "calc(100vh - 120px)" }}>

                <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>

                    {/* Chat Header */}
                    <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.15)" }}>
                        <div style={{ display: "flex", gap: 10, alignItems: "center", fontWeight: 700, fontSize: 14 }}>
                            {isAdmin ? <ShieldCheck size={18} style={{ color: "var(--accent)" }} /> : <MessagesSquare size={18} style={{ color: "var(--accent)" }} />}
                            {isAdmin ? "Global Communication Monitor (Admin View)" : "Staff Communications"}
                        </div>

                        {/* Selector for Chat */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Mail size={14} style={{ color: "var(--muted)" }} />
                            <select
                                className="sel"
                                value={selectedEmail}
                                onChange={e => setSelectedEmail(e.target.value)}
                                style={{ padding: "6px 12px", width: 250 }}
                            >
                                <option value="">{isAdmin ? "Select Staff (Optional)" : "-- Select Contact to Chat --"}</option>
                                {contacts.map(c => (
                                    <option key={c.email} value={c.email}>{c.name} ({c.email})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Chat Body */}
                    <div className="tw" style={{ flex: 1, overflowY: "auto", border: "none", margin: 0, padding: 20, background: "rgba(0,0,0,0.05)" }}>
                        {displayChats.length === 0 ? (
                            <div className="empty" style={{ height: "100%", border: "none" }}>
                                <div className="empty-ico"><MessagesSquare size={28} /></div>
                                {isAdmin ? "No messages found in the global feed." : "No messages found. Select a contact to start chatting!"}
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                {displayChats.map(c => {
                                    const isMe = c.senderEmail === currentUser.email;
                                    const isGlobalAdminView = isAdmin;

                                    return (
                                        <div key={c.id} style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: isGlobalAdminView ? "flex-start" : (isMe ? "flex-end" : "flex-start")
                                        }}>
                                            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4, display: "flex", gap: 6, alignItems: "center" }}>
                                                {isGlobalAdminView ? (
                                                    <span style={{ fontWeight: 600, color: "var(--text)" }}>{c.senderEmail} <span style={{ color: "var(--muted)", fontWeight: 400 }}>to</span> {c.recipientEmail}</span>
                                                ) : (
                                                    <span style={{ fontWeight: 600 }}>{isMe ? "You" : c.senderName}</span>
                                                )}
                                                <span style={{ opacity: 0.6 }}>{new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <div style={{
                                                background: isGlobalAdminView ? "var(--s2)" : (isMe ? "var(--accent)" : "var(--s2)"),
                                                color: isMe && !isGlobalAdminView ? "#000" : "var(--text)",
                                                padding: "10px 14px",
                                                borderRadius: 12,
                                                borderTopRightRadius: (isMe && !isGlobalAdminView) ? 2 : 12,
                                                borderTopLeftRadius: (!isMe || isGlobalAdminView) ? 2 : 12,
                                                maxWidth: "75%",
                                                fontSize: 14,
                                                lineHeight: 1.4,
                                                border: isGlobalAdminView ? "1px solid var(--border)" : "none"
                                            }}>
                                                {c.text}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={chatEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Chat Input */}
                    {(!isAdmin || selectedEmail) && (
                        <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border)", background: "var(--card)", display: "flex", gap: 12 }}>
                            <input
                                type="text"
                                className="tinput"
                                placeholder={`Type a message to ${selectedEmail || "select a contact"}...`}
                                value={messageText}
                                onChange={e => setMessageText(e.target.value)}
                                disabled={!selectedEmail}
                                onKeyDown={e => e.key === "Enter" && handleSendMessage()}
                                style={{ flex: 1 }}
                            />
                            <button className="btn btn-p" onClick={handleSendMessage} disabled={!messageText.trim() || !selectedEmail} style={{ display: "flex", gap: 6 }}>
                                <Send size={14} /> Send
                            </button>
                        </div>
                    )}
                </div>

            </div>

            {/* ═══ RIGHT COMPONENT: GLOBAL ANNOUNCEMENT (Admin Only) ═══ */}
            {isAdmin && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    <div className="card" style={{ border: "1px solid rgba(236, 72, 153, 0.3)", background: "linear-gradient(180deg, rgba(236, 72, 153, 0.05) 0%, rgba(0,0,0,0) 120px)" }}>
                        <div className="ct" style={{ borderBottom: "1px solid var(--border)", paddingBottom: 12, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                            <Megaphone size={18} style={{ color: "#ec4899" }} /> Global Announcement
                        </div>
                        <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>
                            Broadcast a high-priority alert to all staff dashboards instantly.
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            <textarea
                                className="tinput"
                                placeholder="e.g., Servers will be down at 5PM for maintenance..."
                                value={announcement}
                                onChange={e => setAnnouncement(e.target.value)}
                                style={{ minHeight: 60, resize: "none", fontSize: 13 }}
                            />
                            <button className="btn"
                                onClick={handleBroadcast}
                                disabled={!announcement.trim() || broadcasting}
                                style={{ background: "#ec4899", color: "#fff", display: "flex", justifyContent: "center", alignItems: "center", gap: 6, fontWeight: 700 }}>
                                <Send size={14} /> {broadcasting ? "Broadcasting..." : "Broadcast Message"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
