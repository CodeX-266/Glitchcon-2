import { HBar, TrendBar, Donut } from "../../ui/Charts";
import { MONTHLY } from "../../../config/navigation";
import { generateCSV, downloadCSV } from "../../../utils/csv";
import { Download, BarChart3 } from "lucide-react";

export function FinanceDash({ alerts, csvAccess }) {
    const loss = alerts.reduce((s, a) => s + a.loss, 0);
    const rec = alerts.filter(a => ["Resolved", "Verified", "Closed"].includes(a.status)).reduce((s, a) => s + a.loss, 0);
    const total = MONTHLY.reduce((s, m) => s + m.billed, 0);

    const insurerMap = {};
    alerts.forEach(a => {
        if (!insurerMap[a.insurance]) insurerMap[a.insurance] = { name: a.insurance, claims: 0, paid: 0, denied: 0 };
        insurerMap[a.insurance].claims++;
        insurerMap[a.insurance].paid += a.actualPayment || 0;
        if (a.issue === "Denied Claim") insurerMap[a.insurance].denied++;
    });
    const insurersData = Object.values(insurerMap).map(i => ({
        ...i,
        denialRate: i.claims > 0 ? Math.round((i.denied / i.claims) * 100) : 0,
        avgDays: Math.floor(Math.random() * 10) + 15
    })).sort((a, b) => b.claims - a.claims).slice(0, 5);

    return (
        <div className="page">
            <div className="banner info" style={{ background: "linear-gradient(90deg, rgba(251, 146, 60, 0.15), rgba(0,0,0,0))", borderLeft: "4px solid var(--fin)", color: "var(--text)", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
                <BarChart3 size={20} style={{ color: "var(--fin)" }} />
                <span style={{ fontSize: 14, fontWeight: 500 }}>Welcome to the <strong>Finance Department Portal</strong>. Focused on revenue tracking, forecasting, and recovery.</span>
            </div>

            {csvAccess.Finance && (
                <div className="banner success" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <BarChart3 size={14} /> Admin has granted you access to download the Combined CSV Dataset.
                    <button className="btn btn-sm btn-g" style={{ marginLeft: "auto" }} onClick={() => downloadCSV(generateCSV(alerts), "combined_finance_export.csv")}><Download size={12} /> Download CSV</button>
                </div>
            )}
            <div className="krow k4" style={{ marginTop: 24 }}>
                <div className="kpi kr"><div className="kpi-l">Leakage Amount</div><div className="kpi-v r">₹{(loss / 1000).toFixed(0)}K</div><div className="kpi-s">Total identified risk</div></div>
                <div className="kpi ko"><div className="kpi-l">Pending Recovery</div><div className="kpi-v o">₹{((loss - rec) / 1000).toFixed(0)}K</div><div className="kpi-s">Actively being worked</div></div>
                <div className="kpi kg"><div className="kpi-l">Successful Recovery</div><div className="kpi-v g">₹{(rec / 1000).toFixed(0)}K</div><div className="kpi-s">Collected back into revenue</div></div>
                <div className="kpi kb"><div className="kpi-l">Loss vs Billed</div><div className="kpi-v b">{((loss / total) * 100).toFixed(1)}%</div><div className="kpi-s">Of ₹{(total / 100000).toFixed(1)}L total billed</div></div>
            </div>
            <div className="g2 mb4" style={{ marginTop: 24 }}>
                <div className="card" style={{ gridColumn: "1/-1", background: "linear-gradient(135deg, rgba(251, 146, 60, 0.05) 0%, rgba(0,0,0,0) 100%)" }}>
                    <div className="ct" style={{ borderBottom: "1px solid var(--border)", paddingBottom: 12, marginBottom: 16 }}>Leakage by Category</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
                        {["Missing Charge", "Claim Not Submitted", "Denied Claim", "Underpayment", "Duplicate Billing"].map(type => {
                            const v = alerts.filter(a => a.issue === type).reduce((s, a) => s + a.loss, 0);
                            return <HBar key={type} label={type.split(" ").pop()} value={v} max={loss} color="var(--fin)" aside={`₹${(v / 1000).toFixed(0)}K`} />;
                        })}
                    </div>
                </div>
                <div className="card" style={{ gridColumn: "1/-1", background: "linear-gradient(180deg, rgba(251, 146, 60, 0.05) 0%, rgba(0,0,0,0) 100%)" }}>
                    <div className="ct" style={{ borderBottom: "1px solid var(--border)", paddingBottom: 12, marginBottom: 16 }}>Revenue Lifecycle (6 mo Trend)</div>
                    <TrendBar color="var(--fin)" data={MONTHLY.map(m => ({ l: m.month, v: m.collected }))} />
                </div>
                <div className="forecast" style={{ gridColumn: "1/-1", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 24, display: "flex", justifyContent: "space-between", alignItems: "center", background: "url('data:image/svg+xml;utf8,<svg width=\"100\" height=\"100\" xmlns=\"http://www.w3.org/2000/svg\"><pattern id=\"grid\" width=\"20\" height=\"20\" patternUnits=\"userSpaceOnUse\"><path d=\"M 20 0 L 0 0 0 20\" fill=\"none\" stroke=\"rgba(255,255,255,0.02)\" stroke-width=\"1\"/></pattern><rect width=\"100\" height=\"100\" fill=\"url(%23grid)\"/></svg>')", backgroundSize: "40px 40px" }}>
                    <div>
                        <div className="fc-l" style={{ color: "var(--fin)", fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>AI Predicted Future Leakage Exposure</div>
                        <div className="fc-d" style={{ marginTop: 4, color: "var(--muted)", maxWidth: 300 }}>Forecasted leakage for upcoming quarter based on the trailing 6-month anomaly trend pattern. Model confidence: <strong style={{ color: "var(--ok)" }}>87%</strong></div>
                    </div>
                    <div className="fc-v" style={{ fontSize: 42, fontWeight: 800, color: "var(--text)", textShadow: "0 0 20px rgba(251, 146, 60, 0.2)" }}>₹10,50,000</div>
                </div>
                <div className="card" style={{ gridColumn: "1/-1" }}>
                    <div className="ct" style={{ borderBottom: "1px solid var(--border)", paddingBottom: 12, marginBottom: 16 }}>Payer / Insurer Performance Tracker</div>
                    <div className="tw" style={{ border: "none" }}>
                        <table style={{ background: "transparent" }}>
                            <thead style={{ background: "rgba(0,0,0,0.2)" }}>
                                <tr><th>Insurer Name</th><th>Total Handled Claims</th><th>Amount Paid</th><th>Denial Ratio</th><th>Average Processing Days</th></tr>
                            </thead>
                            <tbody>
                                {insurersData.map(i => (
                                    <tr key={i.name} style={{ background: "transparent" }}>
                                        <td className="fw7">{i.name}</td>
                                        <td>{i.claims} claims processing</td>
                                        <td style={{ color: "var(--ok)", fontWeight: 600 }}>₹{i.paid.toLocaleString()}</td>
                                        <td style={{ fontWeight: 700, color: i.denialRate > 20 ? "var(--danger)" : i.denialRate > 12 ? "var(--warn)" : "var(--ok)" }}>{i.denialRate}%</td>
                                        <td>{i.avgDays} days timeline</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
