const express = require('express');
const router = express.Router();
const { createTicket, getTickets, updateTicketStatus, assignTicket } = require('../controllers/ticketController');
const authMiddleware = require('../middleware/authMiddleware');

// Route: /api/tickets
router.post('/', authMiddleware, createTicket);
router.get('/', authMiddleware, getTickets);
router.put('/:id/status', authMiddleware, updateTicketStatus);
router.put('/:id/assign', authMiddleware, assignTicket);

module.exports = router;
