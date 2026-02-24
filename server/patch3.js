const db = require('./config/db');

db.serialize(() => {
    // Our perfectly clean, master dataset of expected Workstations
    const validPCs = [
        'LAB-A-01', 'LAB-A-02', 'LAB-A-05',
        'LAB-B-01', 'LAB-B-07', 'LAB-B-11',
        'LAB-C-04', 'LAB-C-09',
        'LAB-D-05', 'LAB-D-07', 'LAB-D-12',
        'LIB-PC-01', 'LIB-PC-04', 'STAFF-ROOM-A'
    ];

    const placeholders = validPCs.map(() => '?').join(',');

    db.all(`SELECT id FROM computers WHERE computer_id NOT IN (${placeholders})`, validPCs, (err, rows) => {
        if (err) return console.error(err);

        const badIds = rows.map(r => r.id);
        if (badIds.length > 0) {
            const badIdStrings = badIds.join(',');
            db.run(`DELETE FROM tickets WHERE computer_id IN (${badIdStrings})`);
            db.run(`DELETE FROM pc_usage_logs WHERE computer_id IN (${badIdStrings})`);
            db.run(`DELETE FROM computers WHERE id IN (${badIdStrings})`, () => {
                console.log(`Deleted ${badIds.length} junk computers and their associated logs/tickets.`);
            });
        } else {
            console.log('No junk computers found.');
        }
    });

    // Enforce standardized map groups
    db.run("UPDATE computers SET lab_number = 'Lab A' WHERE computer_id LIKE 'LAB-A-%'");
    db.run("UPDATE computers SET lab_number = 'Lab B' WHERE computer_id LIKE 'LAB-B-%'");
    db.run("UPDATE computers SET lab_number = 'Lab C' WHERE computer_id LIKE 'LAB-C-%'");
    db.run("UPDATE computers SET lab_number = 'Lab D' WHERE computer_id LIKE 'LAB-D-%'", function () {
        console.log('Strict DB workstation names and Locations completely normalized.');
    });
});
