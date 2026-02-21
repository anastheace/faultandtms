const express = require('express');
const router = express.Router();
const { getSchedules, createSchedule, updateSchedule } = require('../controllers/maintenanceController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getSchedules);
router.post('/', authMiddleware, createSchedule);
router.put('/:id/status', authMiddleware, updateSchedule);

module.exports = router;
