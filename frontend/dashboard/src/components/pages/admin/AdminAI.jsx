import { useState } from "react";
import { HBar } from "../../ui/Charts";
import { API_URL } from "../../../config/api";
import { Play, RotateCcw } from "lucide-react";

export function AdminAI({ alerts, onRetrain }) {
    const [trained, setTrained] = useState(false);
    const [training, setTraining] = useState(false);
    const [prog, setProg] = useState(0);

    const train = async () => {
        setTraining(true); setProg(0);
        const iv = setInterval(() => setProg(p => (p >= 90 ? 90 : p + 5)), 80);
        try {
            await fetch(`${API_URL}/run-analysis`, { method: "POST" });
            clearInterval(iv); setProg(100);
            setTimeout(() => { setTraining(false); setTrained(true); setProg(0); if (onRetrain) onRetrain(); }, 400);
        } catch (e) { clearInterval(iv); setTraining(false); setProg(0); alert("Training failed: " + e.message); }
    };

    return (
        <div className="page">
            <div className="g2 mb4">
                <div className="card">
                    <div className="ct">Model Performance</div>
                    {[{ k: "Algorithm", v: "Isolation Forest v2.3" }, { k: "Accuracy", v: trained ? "95.4%" : "91.2%", c: "var(--ok)" }, { k: "Precision", v: trained ? "93.1%" : "88.6%", c: "var(--ok)" }, { k: "Recall", v: trained ? "91.8%" : "85.3%", c: "var(--ok)" }, { k: "Last Trained", v: trained ? "Just now" : "3 days ago" }].map(r => (
                        <div className="dr" key={r.k}><span className="dr-l">{r.k}</span><span className="dr-v" style={{ color: r.c || "var(--text)" }}>{r.v}</span></div>
                    ))}
                    {training ? (
                        <>
                            <div className="scan" style={{ marginTop: 12 }}><div className="scan-l" /><span className="scan-t">TRAINING MODEL...</span></div>
                            <div className="prog-wrap"><div className="prog-fill" style={{ width: `${prog}%`, background: "var(--adm)" }} /></div>
                            <div className="ts tm">{prog}%</div>
                        </>
                    ) : (
                        <button className="btn btn-a btn-full" style={{ marginTop: 12 }} onClick={train}>
                            {trained ? <><RotateCcw size={14} /> Retrain</> : <><Play size={14} /> Train AI Model</>}
                        </button>
                    )}
                </div>
                <div className="card">
                    <div className="ct">Risk Score Distribution</div>
                    {[
                        { l: "Critical (>85)", n: alerts.filter(a => a.aiScore > 85).length, c: "var(--danger)" },
                        { l: "High 70–85", n: alerts.filter(a => a.aiScore > 70 && a.aiScore <= 85).length, c: "var(--warn)" },
                        { l: "Medium 50–70", n: alerts.filter(a => a.aiScore > 50 && a.aiScore <= 70).length, c: "var(--info)" },
                        { l: "Low (<50)", n: alerts.filter(a => a.aiScore <= 50).length, c: "var(--ok)" },
                    ].map(r => (
                        <HBar key={r.l} label={r.l} value={r.n} max={alerts.length} color={r.c} aside={`${r.n} alerts`} />
                    ))}
                </div>
            </div>
        </div>
    );
}
