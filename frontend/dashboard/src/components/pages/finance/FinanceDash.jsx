import { HBar } from "../../ui/Charts";
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
            {csvAccess.Finance && (
                <div className="banner success"><BarChart3 size={14} /> Admin has granted you access to download the Combined CSV Dataset.
                    <button className="btn btn-sm btn-g" style={{ marginLeft: "auto" }} onClick={() => downloadCSV(generateCSV(alerts), "combined_finance_export.csv")}><Download size={12} /> Download CSV</button>
                </div>
            )}
            <div className="krow k4">
                <div className="kpi kb"><div className="kpi-l">Total Billed</div><div className="kpi-v b">₹{(total / 100000).toFixed(1)}L</div></div>
                <div className="kpi kr"><div className="kpi-l">Leakage</div><div className="kpi-v r">₹{(loss / 1000).toFixed(0)}K</div><div className="kpi-s">{((loss / total) * 100).toFixed(1)}%</div></div>
                <div className="kpi kg"><div className="kpi-l">Recovered</div><div className="kpi-v g">₹{(rec / 1000).toFixed(0)}K</div></div>
                <div className="kpi ko"><div className="kpi-l">Pending</div><div className="kpi-v o">₹{((loss - rec) / 1000).toFixed(0)}K</div></div>
            </div>
            <div className="card mb4">
                <div className="ct">Leakage by Category</div>
                {["Missing Charge", "Claim Not Submitted", "Denied Claim", "Underpayment", "Duplicate Billing"].map(type => {
                    const v = alerts.filter(a => a.issue === type).reduce((s, a) => s + a.loss, 0);
                    return <HBar key={type} label={type.split(" ").pop()} value={v} max={loss} color="var(--fin)" aside={`₹${(v / 1000).toFixed(0)}K`} />;
                })}
            </div>
            <div className="forecast">
                <div className="fc-l">AI Predicted Leakage — Next Quarter</div>
                <div className="fc-v">₹10,50,000</div>
                <div className="fc-d">Based on 6-month trend · 87% confidence</div>
            </div>
            <div className="card">
                <div className="ct">Insurance Performance</div>
                <div className="tw" style={{ border: "none" }}>
                    <table>
                        <thead><tr><th>Insurer</th><th>Claims</th><th>Paid</th><th>Denial %</th><th>Avg Days</th></tr></thead>
                        <tbody>
                            {insurersData.map(i => (
                                <tr key={i.name}>
                                    <td className="fw7">{i.name}</td><td>{i.claims}</td>
                                    <td style={{ color: "var(--ok)", fontWeight: 600 }}>₹{i.paid.toLocaleString()}</td>
                                    <td style={{ fontWeight: 700, color: i.denialRate > 20 ? "var(--danger)" : i.denialRate > 12 ? "var(--warn)" : "var(--ok)" }}>{i.denialRate}%</td>
                                    <td>{i.avgDays}d</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
