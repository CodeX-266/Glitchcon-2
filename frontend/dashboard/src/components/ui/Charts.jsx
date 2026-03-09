export function HBar({ label, value, max, color, aside }) {
    return (
        <div className="hb-row">
            <div className="hb-lbl">{label}</div>
            <div className="hb-track">
                <div className="hb-fill" style={{ width: `${(value / max) * 100}%`, background: color }}>
                    <span className="hb-val">{aside || value}</span>
                </div>
            </div>
        </div>
    );
}

export function MiniBar({ data, color }) {
    const max = Math.max(...data.map(d => d.v));
    return (
        <div className="mbc">
            {data.map((d, i) => (
                <div className="mbc-b" key={i}>
                    <div style={{ flex: 1, display: "flex", alignItems: "flex-end" }}>
                        <div className="mbc-f" style={{ height: `${(d.v / max) * 100}%`, background: color, opacity: .65 + i / data.length * .35 }} />
                    </div>
                    <span className="mbc-l">{d.l}</span>
                </div>
            ))}
        </div>
    );
}
