const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
    // 1. Check if a 'Student' user exists, otherwise create one for logging purposes.
    db.get("SELECT id FROM users WHERE role = 'student' LIMIT 1", (err, studentUser) => {
        if (err) return console.error(err);

        const updateLogs = (studentId) => {
            // Reassign all active (and past) usage logs from 'Anas' (Admin) to this student
            db.get("SELECT id FROM users WHERE name LIKE '%Anas%' LIMIT 1", (err, anasUser) => {
                if (err || !anasUser) return console.error('Anas user not found');

                db.run("UPDATE pc_usage_logs SET user_id = ? WHERE user_id = ?", [studentId, anasUser.id], function (err) {
                    if (err) console.error(err);
                    console.log(`Successfully migrated ${this.changes} log records from Anas to Student.`);
                });
            });
        };

        if (!studentUser) {
            db.run("INSERT INTO users (name, email, password, role) VALUES ('Student', 'student_log@tms.com', 'password', 'student')", function (err) {
                if (err) return console.error(err);
                updateLogs(this.lastID);
            });
        } else {
            // Update the name to literally be 'Student' just in case it's something else
            db.run("UPDATE users SET name = 'Student' WHERE id = ?", [studentUser.id]);
            updateLogs(studentUser.id);
        }
    });
});

setTimeout(() => db.close(), 1000);
