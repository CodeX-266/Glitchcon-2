export function RiskBar({ v }) {
    const c = v > 80 ? "var(--danger)" : v > 60 ? "var(--warn)" : v > 40 ? "var(--info)" : "var(--ok)";
    return (
        <div className="rb">
            <div className="rb-t"><div className="rb-f" style={{ width: `${v}%`, background: c }} /></div>
            <span className="rb-n" style={{ color: c }}>{v}</span>
        </div>
    );
}
