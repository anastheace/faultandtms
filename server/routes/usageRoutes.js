const express = require('express');
const router = express.Router();
const { loginPC, logoutPC, getUsageLogs, getAllComputers } = require('../controllers/usageController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/login', authMiddleware, loginPC);
router.post('/logout', authMiddleware, logoutPC);
router.get('/logs', authMiddleware, getUsageLogs);
router.get('/computers', authMiddleware, getAllComputers);

module.exports = router;
