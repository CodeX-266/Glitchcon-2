export const USERS_INIT = [
    { id: "u1", email: "admin@hospital.com", password: "admin123", role: "Admin", name: "Dr. Sarah Chen", dept: "Administration", status: "active" },
    { id: "u2", email: "rcm@hospital.com", password: "rcm123", role: "RCM", name: "Anjali Sharma", dept: "Revenue Cycle", status: "active" },
    { id: "u3", email: "finance@hospital.com", password: "finance123", role: "Finance", name: "Ravi Kumar", dept: "Finance", status: "active" },
];

export const STAFF_INIT = [
    { id: "s1", name: "Priya Nair", email: "priya@hospital.com", password: "priya123", role: "Revenue Department", dept: "Surgery", status: "Approved", registered: "2024-01-05", assignedAlerts: [], completedAlerts: [] },
    { id: "s2", name: "Arun Mehta", email: "arun@hospital.com", password: "arun123", role: "Medical Coding", dept: "Radiology", status: "Pending", registered: "2024-02-14", assignedAlerts: [], completedAlerts: [] },
    { id: "s3", name: "Deepa Joshi", email: "deepa@hospital.com", password: "deepa123", role: "Medical Coding", dept: "Lab", status: "Pending", registered: "2024-02-20", assignedAlerts: [], completedAlerts: [] },
    { id: "s4", name: "Meena Pillai", email: "meena@hospital.com", password: "meena123", role: "Insurance Claims", dept: "Cardiology", status: "Approved", registered: "2024-01-10", assignedAlerts: [], completedAlerts: [] },
];

export const MONTHLY = [
    { month: "Aug", billed: 820000, collected: 710000, recovered: 48000 },
    { month: "Sep", billed: 910000, collected: 798000, recovered: 62000 },
    { month: "Oct", billed: 875000, collected: 741000, recovered: 71000 },
    { month: "Nov", billed: 950000, collected: 832000, recovered: 85000 },
    { month: "Dec", billed: 885000, collected: 762000, recovered: 68000 },
    { month: "Jan", billed: 1020000, collected: 871000, recovered: 94000 },
];

export const INSURERS = [
    { name: "Star Health", claims: 245, paid: 1820000, denialRate: 12, avgDays: 18 },
    { name: "ICICI Lombard", claims: 189, paid: 1450000, denialRate: 18, avgDays: 24 },
    { name: "HDFC Ergo", claims: 156, paid: 1180000, denialRate: 22, avgDays: 30 },
    { name: "Max Bupa", claims: 134, paid: 990000, denialRate: 15, avgDays: 21 },
    { name: "New India", claims: 98, paid: 720000, denialRate: 28, avgDays: 35 },
];

export const NAV = {
    Admin: {
        accent: "var(--adm)", cls: "adm",
        sections: [
            { label: "Overview", items: [{ id: "dash", label: "Dashboard" }] },
            {
                label: "Operations", items: [
                    { id: "alert-q", label: "Alert Queue", badge: "newAlerts" },
                    { id: "ai", label: "AI Engine" },
                ]
            },
            {
                label: "Management", items: [
                    { id: "comms", label: "Comms & Chat" },
                    { id: "users", label: "User Management", badge: "pendingStaff" },
                ]
            },
        ],
    },
    RCM: {
        accent: "var(--rcm)", cls: "rcm",
        sections: [
            { label: "Overview", items: [{ id: "dash", label: "Dashboard" }] },
            {
                label: "Claims Work", items: [
                    { id: "inbox", label: "Alert Inbox", badge: "assigned" },
                    { id: "comms", label: "Comms & Chat" },
                ]
            },
        ],
    },
    Finance: {
        accent: "var(--fin)", cls: "fin",
        sections: [
            { label: "Overview", items: [{ id: "dash", label: "Revenue Overview" }] },
            {
                label: "Analytics", items: [
                    { id: "reports", label: "Reports & Export" },
                    { id: "comms", label: "Comms & Chat" },
                ]
            },
        ],
    },
    "Revenue Department": {
        accent: "var(--rcm)", cls: "rcm",
        sections: [
            { label: "Overview", items: [{ id: "dash", label: "Revenue Dashboard" }] },
            {
                label: "My Work", items: [
                    { id: "work", label: "My Tasks", badge: "myTasks" },
                    { id: "comms", label: "Comms & Chat" },
                ]
            },
        ],
    },
    "Medical Coding": {
        accent: "var(--staff)", cls: "stf",
        sections: [
            { label: "Overview", items: [{ id: "dash", label: "Coding Dashboard" }] },
            {
                label: "My Work", items: [
                    { id: "work", label: "My Tasks", badge: "myTasks" },
                    { id: "comms", label: "Comms & Chat" },
                ]
            },
        ],
    },
    "Insurance Claims": {
        accent: "var(--fin)", cls: "fin",
        sections: [
            { label: "Overview", items: [{ id: "dash", label: "Claims Dashboard" }] },
            {
                label: "My Work", items: [
                    { id: "work", label: "My Tasks", badge: "myTasks" },
                    { id: "comms", label: "Comms & Chat" },
                ]
            },
        ],
    },
};

export const PAGE_TITLES = {
    dash: { Admin: "System Dashboard", RCM: "RCM Dashboard", Finance: "Revenue Overview", "Revenue Department": "Revenue Work Dashboard", "Medical Coding": "Medical Coding Dashboard", "Insurance Claims": "Insurance Claims Dashboard" },
    "alert-q": { Admin: "Alert Queue" },
    ai: { Admin: "AI Engine Control" },
    users: { Admin: "User Management" },
    inbox: { RCM: "Alert Inbox" },
    reports: { Finance: "Reports & Export" },
    work: { "Revenue Department": "Revenue Tasks", "Medical Coding": "Coding Tasks", "Insurance Claims": "Claims Tasks" },
};
