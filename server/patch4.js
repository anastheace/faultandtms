const db = require('./config/db');

db.serialize(() => {
    db.all("SELECT id FROM tickets WHERE description LIKE '%[AUTOMATED TELEMETRY ALERT]%' ORDER BY created_at DESC", (err, rows) => {
        if (err) return console.error(err);

        if (rows.length > 3) {
            const deleteIds = rows.slice(3).map(r => r.id);
            const deleteStr = deleteIds.join(',');

            db.run(`DELETE FROM tickets WHERE id IN (${deleteStr})`, function (err) {
                if (err) console.error(err);
                else console.log(`Successfully deleted ${this.changes} excess automated tickets, kept the 3 most recent.`);
            });
        } else {
            console.log(`Only ${rows.length} automated tickets found, no deletion needed.`);
        }
    });
});
