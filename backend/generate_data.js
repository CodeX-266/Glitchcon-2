const fs = require('fs');
const path = require('path');

const CSV_PATH = path.join(__dirname, "..", "data", "hospital_billing_data_populous.csv");

const CPT_MAP = {
    "MRI Brain": ["70553", 22000, "Radiology"],
    "Blood Panel": ["80050", 2500, "Lab"],
    "CT Abdomen": ["74178", 18000, "Radiology"],
    "Cardiac Echo": ["93306", 12000, "Cardiology"],
    "Knee Surgery": ["27447", 55000, "Surgery"],
    "Colonoscopy": ["45378", 19000, "Gastro"],
    "Ultrasound": ["76700", 8500, "Radiology"],
    "Sleep Study": ["95808", 10000, "Neurology"],
    "X-Ray Chest": ["71020", 3500, "Radiology"],
    "Thyroid Test": ["84443", 1800, "Lab"],
    "Appendectomy": ["44950", 40000, "Surgery"],
    "Angiography": ["93510", 30000, "Cardiology"],
    "CT Brain": ["70450", 16000, "Radiology"],
    "Glucose Test": ["82947", 1200, "Lab"],
    "Endoscopy": ["43235", 17000, "Gastro"],
    "EEG": ["95816", 11000, "Neurology"],
    "Stress Test": ["93015", 13000, "Cardiology"],
    "Liver Panel": ["80076", 4500, "Lab"],
    "Spine MRI": ["72148", 24000, "Radiology"],
    "Arthroscopy": ["29881", 42000, "Surgery"],
    "CT Chest": ["71260", 17000, "Radiology"],
    "Blood Culture": ["87040", 2800, "Lab"],
    "Angioplasty": ["92928", 60000, "Cardiology"],
    "Gallbladder Surgery": ["47562", 48000, "Surgery"],
    "Upper GI Endoscopy": ["43239", 15000, "Gastro"],
    "Nerve Conduction Study": ["95907", 10500, "Neurology"],
    "Abdominal Ultrasound": ["76705", 7500, "Radiology"],
    "Lipid Profile": ["80061", 3200, "Lab"],
    "Pacemaker Implant": ["33208", 80000, "Cardiology"],
    "Hernia Repair": ["49505", 35000, "Surgery"],
};

const keys = Object.keys(CPT_MAP);

function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomWeightedChoice(items, weights) {
    let sum = weights.reduce((a, b) => a + b, 0);
    let rand = Math.random() * sum;
    for (let i = 0; i < items.length; i++) {
        if (rand < weights[i]) return items[i];
        rand -= weights[i];
    }
    return items[0];
}

const scenarios = [
    { weight: 96, mod: r => r },
    { weight: 1, mod: r => ({ ...r, charge_amount: 0, insurance_paid: 0 }) },
    { weight: 1, mod: r => ({ ...r, claim_submitted: "No", claim_status: "NA", insurance_paid: 0 }) },
    { weight: 1, mod: r => ({ ...r, claim_status: "Denied", insurance_paid: 0 }) },
    { weight: 0.5, mod: r => ({ ...r, insurance_paid: Math.floor(r.charge_amount * (0.1 + Math.random() * 0.7)) }) },
    { weight: 0.5, mod: r => ({ ...r, cpt_code: (parseInt(r.cpt_code) + randomChoice([1, -1, 10, -10])).toString() }) },
];

const weights = scenarios.map(s => s.weight);

const rows = [];
const startDate = new Date();
startDate.setDate(startDate.getDate() - 90);

for (let i = 1; i <= 5000; i++) {
    const procedure = randomChoice(keys);
    const [cpt, charge, dept] = CPT_MAP[procedure];

    // random date within past 90 days
    const d = new Date(startDate);
    d.setDate(d.getDate() + Math.floor(Math.random() * 90));

    const base_row = {
        patient_id: `P${1000 + i}`,
        visit_id: `V${5000 + i}`,
        procedure: procedure,
        department: dept,
        cpt_code: cpt,
        charge_amount: charge,
        claim_submitted: "Yes",
        claim_status: "Approved",
        insurance_paid: charge,
        date: d.toISOString().split("T")[0]
    };

    const scenario = randomWeightedChoice(scenarios, weights);
    const final_row = scenario.mod(base_row);
    rows.push(final_row);
}

const fields = Object.keys(rows[0]);
const csvStrings = [fields.join(",")];
for (const row of rows) {
    csvStrings.push(fields.map(f => row[f]).join(","));
}

fs.writeFileSync(CSV_PATH, csvStrings.join("\n"));
console.log(`Generated ${rows.length} rich CSV records at ${CSV_PATH}`);
