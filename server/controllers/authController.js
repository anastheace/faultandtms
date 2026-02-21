const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const dotenv = require('dotenv');

dotenv.config();

// Register User
exports.registerUser = (req, res) => {
    const { name, email, password, role } = req.body;

    // Check if user exists
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, existingUser) => {
        if (err) {
            console.error('Database error checking user:', err.message);
            return res.status(500).send('Server Error');
        }

        if (existingUser) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        try {
            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Insert user
            db.run(
                'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                [name, email, hashedPassword, role || 'student'],
                function (err) {
                    if (err) {
                        console.error('Database error inserting user:', err.message);
                        return res.status(500).send('Server Error');
                    }

                    const payload = {
                        user: {
                            id: this.lastID,
                            role: role || 'student'
                        }
                    };

                    jwt.sign(
                        payload,
                        process.env.JWT_SECRET,
                        { expiresIn: '1h' },
                        (err, token) => {
                            if (err) throw err;
                            res.json({ token, user: { id: this.lastID, name, email, role: role || 'student' } });
                        }
                    );
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });
};

// Login User
exports.loginUser = (req, res) => {
    const { email, password } = req.body;

    // Check if user exists
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) {
            console.error('Database error finding user:', err.message);
            return res.status(500).send('Server Error');
        }

        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        try {
            // Check password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ msg: 'Invalid Credentials' });
            }

            const payload = {
                user: {
                    id: user.id,
                    role: user.role
                }
            };

            jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: '1h' },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });
};
// Get Technicians
exports.getTechnicians = (req, res) => {
    db.all('SELECT id, name FROM users WHERE role = "technician"', [], (err, rows) => {
        if (err) {
            console.error('Database error fetching technicians:', err.message);
            return res.status(500).send('Server Error');
        }
        res.json(rows);
    });
};
