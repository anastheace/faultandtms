const db = require('../config/db');

// In memory tracker to prevent spamming the database with duplicate thermal tickets
const automatedTicketCache = new Map();

// Generate a random CPU temp between 40C (idle) and 95C (overheating)
// Generate a random CPU temp between 40C (idle) and 95C (overheating)
const generateSimulatedTemp = () => Math.floor(Math.random() * (95 - 40 + 1)) + 40;

const runHardwareTelemetry = () => {
    // Run this telemetry sweep every 12 hours
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

                    // Only generate a new automated ticket if one hasn't been made in the last 12 hours
                    if (!lastAlertTime || (now - lastAlertTime) > (12 * 60 * 60 * 1000)) { // 12 hour cooldown per PC
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
    }, 12 * 60 * 60 * 1000); // 12 hours in milliseconds
};

module.exports = runHardwareTelemetry;
