const db = require('../config/db');

const insertLog = (computerId, userId, res) => {
    db.run('INSERT INTO pc_usage_logs (computer_id, user_id) VALUES (?, ?)',
        [computerId, userId], function (err) {
            if (err) return res.status(500).json({ message: 'Failed to record login' });
            res.status(201).json({ message: 'PC Login successful', logId: this.lastID });
        });
};

// @desc    Log into a PC
// @route   POST /api/usage/login
// @access  Private
const loginPC = (req, res) => {
    const { pcNumber } = req.body;
    const userId = req.user.id;

    if (!pcNumber) {
        return res.status(400).json({ message: 'PC Number is required' });
    }

    // 1. Ensure computer exists
    db.get('SELECT id, status FROM computers WHERE computer_id = ?', [pcNumber], (err, computer) => {
        if (err) return res.status(500).json({ message: 'Server Error' });

        if (!computer) {
            // Create the computer if it doesn't exist
            db.run('INSERT INTO computers (computer_id, lab_number, status) VALUES (?, ?, ?)',
                [pcNumber, 'Unknown', 'operational'], function (err) {
                    if (err) return res.status(500).json({ message: 'Server Error' });
                    insertLog(this.lastID, userId, res);
                });
        } else {
            insertLog(computer.id, userId, res);
        }
    });
};

// @desc    Log out of a PC
// @route   POST /api/usage/logout
// @access  Private
const logoutPC = (req, res) => {
    const { pcNumber } = req.body;
    const userId = req.user.id;

    if (!pcNumber) {
        return res.status(400).json({ message: 'PC Number is required for logout' });
    }

    db.get('SELECT id FROM computers WHERE computer_id = ?', [pcNumber], (err, computer) => {
        if (err || !computer) return res.status(404).json({ message: 'Computer not found' });

        db.run(`
            UPDATE pc_usage_logs 
            SET logout_time = CURRENT_TIMESTAMP 
            WHERE computer_id = ? AND user_id = ? AND logout_time IS NULL
        `, [computer.id, userId], function (err) {
            if (err) return res.status(500).json({ message: 'Server Error' });

            if (this.changes === 0) {
                return res.status(404).json({ message: 'No active check-in found for this PC' });
            }

            res.json({ message: 'PC Logout successful' });
        });
    });
};

// @desc    Get all usage logs
// @route   GET /api/usage/logs
// @access  Private (Admin)
const getUsageLogs = (req, res) => {
    const sql = `
        SELECT l.id, c.computer_id, u.name as user_name, u.role, l.login_time, l.logout_time
        FROM pc_usage_logs l
        JOIN computers c ON l.computer_id = c.id
        JOIN users u ON l.user_id = u.id
        ORDER BY l.login_time DESC
    `;

    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Server Error' });
        res.json(rows);
    });
};

// @desc    Get all computers for Lab Map
// @route   GET /api/usage/computers
// @access  Private (Admin)
const getAllComputers = (req, res) => {
    db.all("SELECT * FROM computers ORDER BY lab_number, computer_id", [], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Server Error fetching computers' });
        res.json(rows);
    });
};

module.exports = { loginPC, logoutPC, getUsageLogs, getAllComputers };
