const db = require('./config/db');
db.all("SELECT t.id, c.computer_id as pc, u1.name as reporter, t.issue_category, t.description, t.status, t.priority, u2.name as assignedTo FROM tickets t JOIN computers c ON t.computer_id = c.id JOIN users u1 ON t.reported_by = u1.id LEFT JOIN users u2 ON t.assigned_to = u2.id ORDER BY t.id", [], (err, rows) => {
    console.table(rows);
});
db.all("SELECT id, name, email FROM users", [], (err, rows) => {
    console.table(rows);
});
