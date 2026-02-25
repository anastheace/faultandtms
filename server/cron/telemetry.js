const db = require('../config/db');

// In memory tracker to prevent spamming the database with duplicate thermal tickets
const automatedTicketCache = new Map();

// Generate a random CPU temp between 40C (idle) and 95C (overheating)
// Generate a random CPU temp between 40C (idle) and 95C (overheating)
const generateSimulatedTemp = () => Math.floor(Math.random() * (95 - 40 + 1)) + 40;

const runHardwareTelemetry = () => {
    // Run this telemetry sweep every 48 hours (2 Days)
    setInterval(() => {
        // Fetch all active operational computers
        db.all("SELECT id, computer_id FROM computers WHERE status = 'operational'", [], (err, computers) => {
            if (err) {
                console.error("[Telemetry] Failed to fetch computers:", err);
                return;
            }

            // Flag to ensure we ONLY generate a MAXIMUM of 1 critical ticket per 12-hour sweep
            let ticketGeneratedThisSweep = false;

            computers.forEach(pc => {
                if (ticketGeneratedThisSweep) return; // Stop if we already generated one this sweep

                const currentTemp = generateSimulatedTemp();

                // If Temp breaks 90C, initiate Critical Protocol
                if (currentTemp > 90) {
                    // Check if we already created an automated ticket for this PC recently
                    const lastAlertTime = automatedTicketCache.get(pc.computer_id);
                    const now = Date.now();

                    // Only generate a new automated ticket if one hasn't been made in the last 48 hours
                    if (!lastAlertTime || (now - lastAlertTime) > (48 * 60 * 60 * 1000)) { // 48 hour cooldown per PC
                        const description = `[AUTOMATED TELEMETRY ALERT] Critical Thermal Event Detected. CPU Core Temp exceeded safety thresholds (${currentTemp}°C). Immediate hardware diagnostic required.`;

                        // Insert the automated ticket 
                        // reported_by: 99 (Auto Telemetry User)
                        // assigned_to: 1 (Tharun Technician)
                        db.run(
                            `INSERT INTO tickets (computer_id, reported_by, assigned_to, issue_category, description, priority, status) 
                             VALUES (?, 99, 1, 'Hardware', ?, 'critical', 'open')`,
                            [pc.id, description],
                            function (insertErr) {
                                if (insertErr) {
                                    console.error("[Telemetry] Ticket generation failed:", insertErr);
                                } else {
                                    console.log(`[!ALERT!] Thermal Incident on ${pc.computer_id} (${currentTemp}°C). Automated Ticket #${this.lastID} dispatched to Tharun.`);
                                    // Update our memory cache to prevent spam
                                    automatedTicketCache.set(pc.computer_id, now);
                                }
                            }
                        );
                        ticketGeneratedThisSweep = true;
                    }
                }
            });
        });
    }, 48 * 60 * 60 * 1000); // 48 hours in milliseconds
};

const axios = require('axios');

const runSimulatedTraffic = () => {
    // Run every 10 minutes (600,000 ms) to keep the system active
    setInterval(() => {
        // --- RENDER WAKE-UP PING ---
        // Render Free Tier spins down after 15 mins of no *incoming HTTP traffic*. 
        // We must ping a PUBLIC, UNAUTHENTICATED route so it doesn't fail with a 401 error.
        const appUrl = process.env.RENDER_EXTERNAL_URL || 'http://localhost:5000';
        axios.get(`${appUrl}/`)
            .then(() => console.log(`[Self-Ping] Successfully pinged public route ${appUrl}/ to prevent Render sleep timer.`))
            .catch(err => console.error(`[Self-Ping Failed] Could not ping ${appUrl}:`, err.message));

        // 1. Get the generic Student user
        db.get("SELECT id FROM users WHERE role = 'student' LIMIT 1", (err, student) => {
            if (err || !student) return;

            // 2. Pick a random operational computer
            db.all("SELECT id, computer_id FROM computers WHERE status = 'operational'", [], (err, computers) => {
                if (err || computers.length === 0) return;

                const randomPc = computers[Math.floor(Math.random() * computers.length)];

                // 3. Ensure this PC isn't already actively checked into
                db.get("SELECT id FROM pc_usage_logs WHERE computer_id = ? AND logout_time IS NULL", [randomPc.id], (err, activeLog) => {
                    if (err || activeLog) return; // Skip if someone is already using it

                    // 4. Log the student in
                    db.run("INSERT INTO pc_usage_logs (computer_id, user_id) VALUES (?, ?)", [randomPc.id, student.id], function (err) {
                        if (err) return;
                        const logId = this.lastID;

                        // 5. Calculate a random checkout time between 30 and 150 minutes
                        const minTime = 30 * 60 * 1000;
                        const maxTime = 150 * 60 * 1000;
                        const checkoutDelay = Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
                        const checkoutMins = Math.round(checkoutDelay / 60000);

                        console.log(`[Simulated Traffic] Phantom Student checked into ${randomPc.computer_id}. Scheduled auto-checkout in ${checkoutMins} minutes.`);

                        // 6. Schedule the checkout
                        setTimeout(() => {
                            db.run("UPDATE pc_usage_logs SET logout_time = CURRENT_TIMESTAMP WHERE id = ?", [logId], (err) => {
                                if (!err) {
                                    console.log(`[Simulated Traffic] Phantom Student completed ${checkoutMins}m session and logged out of ${randomPc.computer_id}.`);
                                }
                            });
                        }, checkoutDelay);
                    });
                });
            });
        });
    }, 10 * 60 * 1000); // 10 minutes
};

const initTelemetry = () => {
    runHardwareTelemetry();
    runSimulatedTraffic();
};

module.exports = initTelemetry;
