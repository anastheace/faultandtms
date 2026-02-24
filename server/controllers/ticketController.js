const db = require('../config/db');

// Helper function to insert the ticket
const insertTicket = (computerId, reportedBy, issueCategory, description, priority, res) => {
    const sql = `
        INSERT INTO tickets (computer_id, reported_by, issue_category, description, priority, status)
        VALUES (?, ?, ?, ?, ?, 'open')
    `;

    db.run(sql, [computerId, reportedBy, issueCategory, description, priority], function (err) {
        if (err) {
            console.error('Database error creating ticket:', err);
            return res.status(500).json({ message: 'Server Error' });
        }

        res.status(201).json({
            message: 'Fault reported successfully',
            ticketId: this.lastID
        });
    });
};

// @desc    Create a new ticket (Report Fault)
// @route   POST /api/tickets
// @access  Private (Student/Staff)
const createTicket = (req, res) => {
    const { pcNumber, issueCategory, priority, description } = req.body;
    const reportedBy = req.user.id; // From authMiddleware

    if (!pcNumber || !issueCategory || !description) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Default priority to medium if not provided
    const ticketPriority = priority || 'medium';

    // 1. Check if the computer exists, if not, create it
    db.get('SELECT id FROM computers WHERE computer_id = ?', [pcNumber], (err, computer) => {
        if (err) {
            console.error('Database error checking computer:', err);
            return res.status(500).json({ message: 'Server Error' });
        }

        if (computer) {
            // Computer exists, proceed to create ticket
            insertTicket(computer.id, reportedBy, issueCategory, description, ticketPriority, res);
        } else {
            // Computer doesn't exist, create it first. Default lab_number to 'Unknown' for now.
            db.run('INSERT INTO computers (computer_id, lab_number, status) VALUES (?, ?, ?)',
                [pcNumber, 'Unknown', 'faulty'], function (err) {
                    if (err) {
                        console.error('Database error creating computer:', err);
                        return res.status(500).json({ message: 'Server Error' });
                    }
                    // 'this.lastID' contains the ID of the newly inserted computer
                    insertTicket(this.lastID, reportedBy, issueCategory, description, ticketPriority, res);
                });
        }
    });
};

// @desc    Get all tickets
// @route   GET /api/tickets
// @access  Private
const getTickets = (req, res) => {
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
               t.issue_category as issue, 
               t.description, t.status, t.priority, u2.name as assignedTo
        FROM tickets t
        JOIN computers c ON t.computer_id = c.id
        JOIN users u1 ON t.reported_by = u1.id
        LEFT JOIN users u2 ON t.assigned_to = u2.id
        ORDER BY t.created_at DESC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Server Error' });

        // Map the IDs to format 'TKT-001'
        const formattedRows = rows.map(r => ({
            ...r,
            id: `TKT-${String(r.id).padStart(3, '0')}`
        }));

        res.json(formattedRows);
    });
};

// @desc    Update ticket status
// @route   PUT /api/tickets/:id/status
// @access  Private
const updateTicketStatus = (req, res) => {
    const { status } = req.body;
    let { id } = req.params;

    // Convert 'TKT-001' back to '1' if necessary
    if (typeof id === 'string' && id.startsWith('TKT-')) {
        id = parseInt(id.split('-')[1], 10);
    }

    if (!status) return res.status(400).json({ message: 'Status is required' });

    db.run('UPDATE tickets SET status = ? WHERE id = ?', [status, id], function (err) {
        if (err) return res.status(500).json({ message: 'Server Error' });
        if (this.changes === 0) return res.status(404).json({ message: 'Ticket not found' });
        res.json({ message: 'Ticket status updated' });
    });
};

// @desc    Assign ticket
// @route   PUT /api/tickets/:id/assign
// @access  Private (Admin)
const assignTicket = (req, res) => {
    const { techId } = req.body;
    let { id } = req.params;

    if (typeof id === 'string' && id.startsWith('TKT-')) {
        id = parseInt(id.split('-')[1], 10);
    }

    db.run('UPDATE tickets SET assigned_to = ?, status = "in_progress" WHERE id = ?', [techId, id], function (err) {
        if (err) return res.status(500).json({ message: 'Server Error' });
        if (this.changes === 0) return res.status(404).json({ message: 'Ticket not found' });
        res.json({ message: 'Ticket assigned successfully' });
    });
};

module.exports = {
    createTicket,
    getTickets,
    updateTicketStatus,
    assignTicket
};
