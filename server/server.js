const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/usage', require('./routes/usageRoutes'));
app.use('/api/maintenance', require('./routes/maintenanceRoutes'));
// app.use('/api/users', require('./routes/userRoutes'));

const path = require('path');

// Serve static frontend files in production
app.use(express.static(path.join(__dirname, '../client/dist')));

// Send all other requests to the React app
app.get('(.*)', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
