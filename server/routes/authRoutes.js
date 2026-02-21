const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getTechnicians } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware'); // For protected routes later

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', registerUser);

// @route   POST api/auth/login
// @desc    Login user & get token
// @access  Public
router.post('/login', loginUser);

// @route   GET api/auth/technicians
// @desc    Get all technicians
// @access  Public/Private
router.get('/technicians', getTechnicians);

module.exports = router;
