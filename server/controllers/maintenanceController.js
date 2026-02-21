const db = require('../config/db');

// @desc    Get all maintenance schedules
// @route   GET /api/maintenance
// @access  Private (Admin)
const getSchedules = (req, res) => {
    const sql = `
        SELECT m.id, c.computer_id as pc_number, m.scheduled_date, m.status, m.description
        FROM maintenance_schedules m
        JOIN computers c ON m.computer_id = c.id
        ORDER BY m.scheduled_date ASC
    `;

    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Server Error' });
        res.json(rows);
    });
};

const insertSchedule = (computerId, date, description, res) => {
    db.run('INSERT INTO maintenance_schedules (computer_id, scheduled_date, description) VALUES (?, ?, ?)',
        [computerId, date, description], function (err) {
            if (err) {
                console.error("Error inserting schedule:", err);
                return res.status(500).json({ message: 'Failed to create schedule' });
            }
            res.status(201).json({ message: 'Maintenance scheduled successfully', id: this.lastID });
        });
};

// @desc    Schedule maintenance for a computer
// @route   POST /api/maintenance
// @access  Private (Admin)
const createSchedule = (req, res) => {
    const { pcNumber, scheduledDate, description } = req.body;

    if (!pcNumber || !scheduledDate) {
        return res.status(400).json({ message: 'PC Number and Scheduled Date are required' });
    }

    db.get('SELECT id FROM computers WHERE computer_id = ?', [pcNumber], (err, computer) => {
        if (err) {
            console.error("Error finding computer:", err);
            return res.status(500).json({ message: 'Server Error' });
        }

        if (!computer) {
            // Auto create computer for simplicity if it doesn't exist
            db.run('INSERT INTO computers (computer_id, lab_number, status) VALUES (?, ?, ?)',
                [pcNumber, 'Unknown', 'operational'], function (err) {
                    if (err) {
                        console.error("Error creating matching computer target:", err);
                        return res.status(500).json({ message: 'Server Error' });
                    }
                    insertSchedule(this.lastID, scheduledDate, description, res);
                });
        } else {
            insertSchedule(computer.id, scheduledDate, description, res);
        }
    });
};

// @desc    Update maintenance status (e.g., mark as completed)
// @route   PUT /api/maintenance/:id
// @access  Private (Admin/Technician)
const updateSchedule = (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    if (!status) {
        return res.status(400).json({ message: 'Status is required' });
    }

    db.run('UPDATE maintenance_schedules SET status = ? WHERE id = ?', [status, id], function (err) {
        if (err) return res.status(500).json({ message: 'Server Error' });

        if (this.changes === 0) {
            return res.status(404).json({ message: 'Schedule not found' });
        }

        res.json({ message: 'Schedule updated successfully' });
    });
};

module.exports = { getSchedules, createSchedule, updateSchedule };
