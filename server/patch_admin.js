const bcrypt = require('bcryptjs');
const db = require('./config/db');

db.serialize(() => {
    const salt = bcrypt.genSaltSync(10);
    const adminPw = bcrypt.hashSync('anas123', salt);

    // Update the admin user directly
    db.run("UPDATE users SET name = 'Anas', email = 'admin123', password = ? WHERE role = 'admin'", [adminPw], function (err) {
        if (err) {
            console.error("Error updating admin:", err);
        } else {
            console.log("Admin successfully updated to Anas / admin123");
        }
    });
});
