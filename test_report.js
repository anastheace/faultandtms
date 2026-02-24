const db = require('./server/config/db');
const sql = `
SELECT t.id, c.computer_id as pc, 
    CASE 
        WHEN u1.id = 99 THEN 'Auto Telemetry'
        WHEN u1.role = 'student' THEN 'Student'
        WHEN u1.role = 'staff' THEN 'Staff'
        WHEN u1.role = 'admin' THEN 'Admin'
        WHEN u1.role = 'technician' THEN 'Technician'
        ELSE u1.role 
    END as user, 
    u1.role as original_role, 
    u1.name as original_name 
FROM tickets t 
JOIN computers c ON t.computer_id = c.id 
JOIN users u1 ON t.reported_by = u1.id
`;
db.all(sql, [], (err, rows) => {
    console.log(rows.slice(0, 3));
});
