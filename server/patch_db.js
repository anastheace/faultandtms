const bcrypt = require('bcryptjs');
const db = require('./config/db');

db.serialize(() => {
    const salt = bcrypt.genSaltSync(10);

    // Update existin technicians
    const rajeshPw = bcrypt.hashSync('rajesh123', salt);
    db.run("UPDATE users SET name = 'Rajesh Technician', email = 'rajesh@tms.com', password = ? WHERE email = 'sam@tms.com'", [rajeshPw]);

    const tharunPw = bcrypt.hashSync('tharun123', salt);
    db.run("UPDATE users SET name = 'Tharun Technician', email = 'tharun@tms.com', password = ? WHERE email = 'sara@tms.com'", [tharunPw]);

    // Insert Susu if not exists
    const susuPw = bcrypt.hashSync('susu123', salt);
    db.run("INSERT OR IGNORE INTO users (name, email, password, role) VALUES ('Susu Screenshot Collector', 'susu@tms.com', ?, 'technician')", [susuPw]);
});

setTimeout(() => {
    db.serialize(() => {
        // Find user IDs to assign tickets accurately
        db.all("SELECT id, email FROM users", [], (err, rows) => {
            const users = {};
            rows.forEach(r => users[r.email] = r.id);

            const tharunId = users['tharun@tms.com'];
            const rajeshId = users['rajesh@tms.com'];
            const susuId = users['susu@tms.com'];

            // TKT-003 to Tharun (resolved)
            if (tharunId) {
                db.run("UPDATE tickets SET assigned_to = ?, status = 'resolved' WHERE id = 3", [tharunId]);
                // Ensure all old Sara tickets go to Tharun
                //   db.run("UPDATE tickets SET assigned_to = ? WHERE assigned_to = (SELECT id FROM users WHERE email = 'sara@tms.com')", [tharunId]);
            }

            // TKT-009 to Rajesh (resolved)
            if (rajeshId) {
                db.run("UPDATE tickets SET assigned_to = ?, status = 'resolved' WHERE id = 9", [rajeshId]);
                // Ensure all old Sam tickets go to Rajesh
                // db.run("UPDATE tickets SET assigned_to = ? WHERE assigned_to = (SELECT id FROM users WHERE email = 'sam@tms.com')", [rajeshId]);
            }

            // TKT-004 to Susu (in progress, description: whatsapp bug)
            if (susuId) {
                db.run("UPDATE tickets SET assigned_to = ?, status = 'in_progress', description = 'whatsapp bug' WHERE id = 4", [susuId]);
            }

            console.log("Database perfectly patched.");
        });
    });
}, 1000);
