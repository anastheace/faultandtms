const jwt = require('./server/node_modules/jsonwebtoken');
const http = require('http');

require('dotenv').config({ path: './server/.env' });

const token = jwt.sign({ id: 2, role: 'admin' }, process.env.JWT_SECRET || 'tms_secret_key_2024', { expiresIn: '1h' });

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/tickets',
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`
    }
};

const req = http.request(options, res => {
    let data = '';
    res.on('data', d => data += d);
    res.on('end', () => {
        try {
            console.log(JSON.parse(data).slice(0, 3));
        } catch (err) {
            console.error("Error parsing JSON:", err);
            console.log("Raw Output:", data);
        }
    });
});
req.on('error', e => console.error(e));
req.end();
