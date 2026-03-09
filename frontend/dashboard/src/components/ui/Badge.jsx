export function SBadge({ s }) {
    const m = { New: "bn", Assigned: "ba", "In Progress": "bip", Resolved: "bres", Verified: "bver", Closed: "bcl", "Work Done": "bdone" };
    return <span className={`bdg ${m[s] || "bn"}`}>{s}</span>;
}

export function PBadge({ p }) {
    const m = { Critical: "bcrit", High: "bhi", Medium: "bmed", Low: "blo" };
    return <span className={`bdg ${m[p] || "bmed"}`}>{p}</span>;
}
