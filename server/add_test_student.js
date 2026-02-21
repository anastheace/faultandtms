const db = require('./config/db');
const bcrypt = require('bcryptjs');

const salt = bcrypt.genSaltSync(10);
const hashedPassword = bcrypt.hashSync('student123', salt);

db.run(`
    INSERT INTO users (name, email, password, role) 
    VALUES ('Test Student', 'student@tms.com', ?, 'student')
`, [hashedPassword], (err) => {
    if (err) console.error('Error inserting test student:', err.message);
    else console.log('Test student created: student@tms.com / student123');
});
