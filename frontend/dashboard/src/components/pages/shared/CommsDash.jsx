import { useState, useEffect, useRef } from "react";
import { API_URL } from "../../../config/api";
import toast from "react-hot-toast";
import { Megaphone, Send, Mail, User, ShieldCheck, MessagesSquare } from "lucide-react";

export function CommsDash({ currentUser, staffList, addNotif }) {
    const [announcement, setAnnouncement] = useState("");
    const [broadcasting, setBroadcasting] = useState(false);

    // Chat state
    const [chats, setChats] = useState([]);
    const [selectedEmail, setSelectedEmail] = useState(currentUser.role === "Admin" ? "GLOBAL_ALL" : "");
    const [messageText, setMessageText] = useState("");
    const [lastRead, setLastRead] = useState(() => {
        const saved = localStorage.getItem(`rld_chat_read_${currentUser.id}`);
        return saved ? JSON.parse(saved) : {};
    });
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
        if (selectedEmail && chats.length > 0) {
            let maxId = 0;
            if (selectedEmail === "GLOBAL_ALL") {
                maxId = Math.max(...chats.map(m => m.id));
            } else {
                const thread = chats.filter(msg =>
                    (msg.senderEmail === selectedEmail && msg.recipientEmail === currentUser.email) ||
                    (msg.senderEmail === currentUser.email && msg.recipientEmail === selectedEmail)
                );
                if (thread.length > 0) maxId = Math.max(...thread.map(m => m.id));
            }
            if (maxId > 0) {
                setLastRead(prev => {
                    if (prev[selectedEmail] === maxId) return prev;
                    const next = { ...prev, [selectedEmail]: maxId };
                    localStorage.setItem(`rld_chat_read_${currentUser.id}`, JSON.stringify(next));
                    return next;
                });
            }
        }
    }, [chats, selectedEmail, currentUser.id]);

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

    const getContactLastMessage = (contactEmail) => {
        const thread = chats.filter(msg =>
            (msg.senderEmail === contactEmail && msg.recipientEmail === currentUser.email) ||
            (msg.senderEmail === currentUser.email && msg.recipientEmail === contactEmail)
        );
        if (thread.length === 0) return { text: "No messages yet", time: null };
        const lastMsg = thread[thread.length - 1];
        return {
            text: `${lastMsg.senderEmail === currentUser.email ? "You: " : ""}${lastMsg.text}`,
            time: lastMsg.timestamp
        };
    };

    const getUnreadCount = (contactEmail) => {
        const lastReadId = lastRead[contactEmail] || 0;
        return chats.filter(msg =>
            msg.senderEmail === contactEmail &&
            msg.recipientEmail === currentUser.email &&
            msg.id > lastReadId
        ).length;
    };

    const getGlobalUnreadCount = () => {
        const lastReadId = lastRead["GLOBAL_ALL"] || 0;
        return chats.filter(msg => msg.id > lastReadId).length;
    };

    // Filter messages for rendering
    let displayChats = [];
    if (isAdmin && selectedEmail === "GLOBAL_ALL") {
        displayChats = [...chats];
    } else if (selectedEmail && selectedEmail !== "GLOBAL_ALL") {
        displayChats = chats.filter(c =>
            (c.senderEmail === currentUser.email && c.recipientEmail === selectedEmail) ||
            (c.senderEmail === selectedEmail && c.recipientEmail === currentUser.email)
        );
    }

    displayChats.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    return (
        <div className="page" style={{ maxWidth: 1400, margin: "0 auto", display: "grid", gridTemplateColumns: isAdmin ? "1fr 400px" : "1fr", gap: 24 }}>

            {/* ═══ LEFT/MAIN: CHAT INTERFACE ═══ */}
            <div style={{ display: "flex", gap: 0, height: "calc(100vh - 120px)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", background: "var(--card)" }}>

                {/* ── Chat Sidebar (WhatsApp List) ── */}
                <div style={{ width: 280, borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", background: "var(--bg)" }}>
                    <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", background: "rgba(0,0,0,0.15)", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                        {isAdmin ? <ShieldCheck size={18} style={{ color: "var(--accent)" }} /> : <MessagesSquare size={18} style={{ color: "var(--accent)" }} />}
                        {isAdmin ? "Global Monitor" : "Contacts"}
                    </div>
                    <div style={{ flex: 1, overflowY: "auto" }}>
                        {isAdmin && (() => {
                            const globalUnread = selectedEmail === "GLOBAL_ALL" ? 0 : getGlobalUnreadCount();
                            return (
                                <div
                                    onClick={() => setSelectedEmail("GLOBAL_ALL")}
                                    style={{
                                        padding: "12px 16px", cursor: "pointer",
                                        background: selectedEmail === "GLOBAL_ALL" ? "rgba(255,255,255,0.08)" : "transparent",
                                        borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12
                                    }}
                                >
                                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--warn)", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }}>
                                        <ShieldCheck size={20} />
                                    </div>
                                    <div style={{ flex: 1, overflow: "hidden" }}>
                                        <div style={{ fontWeight: 600, fontSize: 14 }}>All Staff Feed</div>
                                        <div style={{ fontSize: 12, color: "var(--muted)" }}>Monitor all messages</div>
                                    </div>
                                    {globalUnread > 0 && (
                                        <div style={{ background: "var(--warn)", color: "#000", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 10, minWidth: 18, textAlign: "center" }}>
                                            {globalUnread}
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                        {contacts.map(c => {
                            const last = getContactLastMessage(c.email);
                            const unreadCount = selectedEmail === c.email ? 0 : getUnreadCount(c.email);
                            const isActive = selectedEmail === c.email;
                            return (
                                <div
                                    key={c.email}
                                    onClick={() => setSelectedEmail(c.email)}
                                    style={{
                                        padding: "12px 16px", borderBottom: "1px solid var(--border)", cursor: "pointer",
                                        background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
                                        display: "flex", alignItems: "center", gap: 12, transition: "background 0.2s"
                                    }}
                                >
                                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--accent)", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }}>
                                        {c.name.charAt(0)}
                                    </div>
                                    <div style={{ flex: 1, overflow: "hidden" }}>
                                        <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                                        <div style={{ fontSize: 12, color: unreadCount > 0 ? "var(--text)" : "var(--muted)", fontWeight: unreadCount > 0 ? 600 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{last.text}</div>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                                        {last.time && (
                                            <div style={{ fontSize: 10, color: unreadCount > 0 ? "var(--accent)" : "var(--muted)", fontWeight: unreadCount > 0 ? 700 : 400 }}>
                                                {new Date(last.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        )}
                                        {unreadCount > 0 && (
                                            <div style={{ background: "var(--accent)", color: "#000", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 10, minWidth: 18, textAlign: "center" }}>
                                                {unreadCount}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Chat Window ── */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "rgba(0,0,0,0.02)" }}>
                    {/* Header */}
                    <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", background: "rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 12 }}>
                        {selectedEmail === "GLOBAL_ALL" ? (
                            <>
                                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--warn)", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}><ShieldCheck size={16} /></div>
                                <div><div style={{ fontWeight: 700, fontSize: 14 }}>Global Communication Monitor</div><div style={{ fontSize: 11, color: "var(--muted)" }}>Live View</div></div>
                            </>
                        ) : selectedEmail ? (
                            <>
                                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--accent)", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                                    {contacts.find(c => c.email === selectedEmail)?.name.charAt(0)}
                                </div>
                                <div><div style={{ fontWeight: 700, fontSize: 14 }}>{contacts.find(c => c.email === selectedEmail)?.name}</div><div style={{ fontSize: 11, color: "var(--muted)" }}>{selectedEmail}</div></div>
                            </>
                        ) : (
                            <div style={{ fontWeight: 600, color: "var(--muted)", display: "flex", alignItems: "center", gap: 8 }}><MessagesSquare size={16} /> Select a contact to start chatting</div>
                        )}
                    </div>

                    {/* Messages Body */}
                    <div className="tw" style={{ flex: 1, overflowY: "auto", border: "none", margin: 0, padding: 20 }}>
                        {!selectedEmail ? (
                            <div className="empty" style={{ height: "100%", border: "none" }}>
                                <div className="empty-ico"><MessagesSquare size={28} /></div>
                                Select a contact from the sidebar to view your conversation.
                            </div>
                        ) : displayChats.length === 0 ? (
                            <div className="empty" style={{ height: "100%", border: "none" }}>No messages yet. Say hello!</div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                {displayChats.map(c => {
                                    const isMe = c.senderEmail === currentUser.email;
                                    const isGlobalAdminView = isAdmin && selectedEmail === "GLOBAL_ALL";

                                    return (
                                        <div key={c.id} style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: isGlobalAdminView ? "flex-start" : (isMe ? "flex-end" : "flex-start")
                                        }}>
                                            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4, display: "flex", gap: 6, alignItems: "center" }}>
                                                {isGlobalAdminView ? (
                                                    <span style={{ fontWeight: 600, color: "var(--text)" }}>{c.senderName} <span style={{ color: "var(--muted)", fontWeight: 400 }}>to</span> {contacts.find(con => con.email === c.recipientEmail)?.name || "You"}</span>
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
                    {selectedEmail && selectedEmail !== "GLOBAL_ALL" && (
                        <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border)", background: "var(--card)", display: "flex", gap: 12 }}>
                            <input
                                type="text"
                                className="tinput"
                                placeholder={`Type a message...`}
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
