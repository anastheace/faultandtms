const db = require('./config/db');

db.serialize(() => {
    // We will dynamically get the IDs for Tharun and Rajesh
    db.all("SELECT id, email FROM users", [], (err, rows) => {
        const users = {};
        rows.forEach(r => users[r.email] = r.id);

        const tharunId = users['tharun@tms.com'];
        const rajeshId = users['rajesh@tms.com'];
        const susuId = users['susu@tms.com'];

        // Fix Ticket 7 which accidentally got assigned to Student (ID 4) instead of Sara/Tharun
        db.run("UPDATE tickets SET assigned_to = ? WHERE id = 7", [tharunId]);

        // Ensure TKT-003 and TKT-009 are resolved and assigned as requested
        db.run("UPDATE tickets SET assigned_to = ?, status = 'resolved' WHERE id = 3", [tharunId]);
        db.run("UPDATE tickets SET assigned_to = ?, status = 'resolved' WHERE id = 9", [rajeshId]);

        // Ensure TKT-004 is Susu's whatsapp bug
        db.run("UPDATE tickets SET assigned_to = ?, status = 'in_progress', description = 'whatsapp bug' WHERE id = 4", [susuId]);

        console.log("All tickets perfectly re-assigned based on user request.");
    });
});
