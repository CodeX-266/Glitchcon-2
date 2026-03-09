import { Cpu } from "lucide-react";

export function AIRecBox({ issue, expected, actual, recommendation }) {
    return (
        <div className="ai-rec-engine">
            <div className="ai-rec-title"><Cpu size={14} /> AI Recommendation Engine</div>
            <div className="ai-rec-body">
                <strong>Issue:</strong> {issue}
                <div className="ai-rec-sep" />
                {expected != null && actual != null && (
                    <>
                        <strong>Expected:</strong> ₹{Number(expected).toLocaleString()} | <strong>Actual:</strong> ₹{Number(actual).toLocaleString()}
                        <div className="ai-rec-sep" />
                    </>
                )}
                <div className="ai-rec-arrows">{recommendation}</div>
            </div>
        </div>
    );
}
