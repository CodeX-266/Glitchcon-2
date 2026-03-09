import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    BarChart as RBarChart,
    Bar as RBar
} from "recharts";

export function HBar({ label, value, max, color, aside }) {
    // We can keep HBar as is for simple list indicators, or wrap it. 
    // Given the parameters, keeping it as a sleek CSS progress bar is often better for lists,
    // but we can enhance its appearance.
    return (
        <div className="hb-row" style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
            <div className="hb-lbl" style={{ width: 140, fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>{label}</div>
            <div className="hb-track" style={{ flex: 1, height: 8, background: 'var(--s2)', borderRadius: 4, position: 'relative', overflow: 'hidden', margin: '0 12px' }}>
                <div className="hb-fill" style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${(value / max) * 100}%`, background: color, borderRadius: 4 }} />
            </div>
            <div className="hb-val" style={{ width: 80, textAlign: 'right', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{aside || value}</div>
        </div>
    );
}

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: 'var(--s1)', border: '1px solid var(--border)', padding: '8px 12px', borderRadius: 6, fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                <p style={{ color: 'var(--muted)', marginBottom: 4 }}>{label}</p>
                <p style={{ color: payload[0].color, fontWeight: 700 }}>{payload[0].value.toLocaleString()}</p>
            </div>
        );
    }
    return null;
};

export function MiniBar({ data, color }) {
    // The previous MiniBar was a div-based graph. Let's upgrade it using Recharts LineChart for a sleek trend line.
    return (
        <div style={{ width: '100%', height: 250, marginTop: 16 }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="l" stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="v" stroke={color} strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

export function TrendBar({ data, color }) {
    return (
        <div style={{ width: '100%', height: 250, marginTop: 16 }}>
            <ResponsiveContainer width="100%" height="100%">
                <RBarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="l" stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <RBar dataKey="v" fill={color} radius={[4, 4, 0, 0]} />
                </RBarChart>
            </ResponsiveContainer>
        </div>
    );
}

export function Donut({ data }) {
    // data = [{ name: 'A', value: 100, color: '...' }, ...]
    return (
        <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={data} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
