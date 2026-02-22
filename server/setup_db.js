const db = require('./config/db');

const initializeDatabase = () => {
  db.serialize(() => {
    // USERS TABLE
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT CHECK(role IN ('admin', 'student', 'staff', 'technician')) DEFAULT 'student',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // COMPUTERS TABLE
    db.run(`
      CREATE TABLE IF NOT EXISTS computers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        computer_id TEXT UNIQUE NOT NULL,
        lab_number TEXT NOT NULL,
        status TEXT CHECK(status IN ('operational', 'faulty', 'maintenance')) DEFAULT 'operational',
        last_maintenance DATETIME
      )
    `);

    // TICKETS TABLE
    db.run(`
      CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        computer_id INTEGER NOT NULL,
        reported_by INTEGER NOT NULL,
        assigned_to INTEGER,
        issue_category TEXT NOT NULL,
        description TEXT NOT NULL,
        priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
        status TEXT CHECK(status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        resolved_at DATETIME,
        FOREIGN KEY (computer_id) REFERENCES computers(id),
        FOREIGN KEY (reported_by) REFERENCES users(id),
        FOREIGN KEY (assigned_to) REFERENCES users(id)
      )
    `);

    // TICKET UPDATES TABLE
    db.run(`
      CREATE TABLE IF NOT EXISTS ticket_updates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id INTEGER NOT NULL,
        updated_by INTEGER NOT NULL,
        update_text TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES tickets(id),
        FOREIGN KEY (updated_by) REFERENCES users(id)
      )
    `);
    // PC USAGE LOGS TABLE
    db.run(`
      CREATE TABLE IF NOT EXISTS pc_usage_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        computer_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        logout_time DATETIME,
        FOREIGN KEY (computer_id) REFERENCES computers(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // MAINTENANCE SCHEDULES TABLE
    db.run(`
      CREATE TABLE IF NOT EXISTS maintenance_schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        computer_id INTEGER NOT NULL,
        scheduled_date DATE NOT NULL,
        status TEXT CHECK(status IN ('pending', 'completed')) DEFAULT 'pending',
        description TEXT,
        FOREIGN KEY (computer_id) REFERENCES computers(id)
      )
    `);

    // Insert Seed Data
    db.get('SELECT id FROM users WHERE email = ?', ['admin@tms.com'], (err, row) => {
      if (!row) {
        const bcrypt = require('bcryptjs');
        const salt = bcrypt.genSaltSync(10);
        const adminPw = bcrypt.hashSync('anas123', salt);
        const studentPw = bcrypt.hashSync('student123', salt);
        const techPw = bcrypt.hashSync('tech123', salt);

        // 1. Insert Users
        const tharunPw = bcrypt.hashSync('tharun123', salt);
        const rajeshPw = bcrypt.hashSync('rajesh123', salt);
        const susuPw = bcrypt.hashSync('susu123', salt);

        db.run("INSERT INTO users (name, email, password, role) VALUES ('Anas', 'admin@tms.com', ?, 'admin')", [adminPw]);
        db.run("INSERT INTO users (name, email, password, role) VALUES ('Student', 'student@tms.com', ?, 'student')", [studentPw]);
        db.run("INSERT INTO users (name, email, password, role) VALUES ('Rajesh Technician', 'rajesh@tms.com', ?, 'technician')", [rajeshPw]); // ID 3
        db.run("INSERT INTO users (name, email, password, role) VALUES ('Tharun Technician', 'tharun@tms.com', ?, 'technician')", [tharunPw]); // ID 4
        db.run("INSERT INTO users (name, email, password, role) VALUES ('Susu Screenshot Collector', 'susu@tms.com', ?, 'technician')", [susuPw]); // ID 5

        // Ensure technicians exist before adding tickets assigned to them
        setTimeout(() => {
          // 2. Insert Computers
          const computers = [
            ['LAB-A-01', 'Lab A', 'operational'],
            ['LAB-A-02', 'Lab A', 'operational'],
            ['LAB-A-05', 'Lab A', 'faulty'],
            ['LAB-B-01', 'Lab B', 'operational'],
            ['LAB-B-07', 'Lab B', 'operational'],
            ['LAB-B-11', 'Lab B', 'maintenance'],
            ['LAB-C-04', 'Lab C', 'operational'],
            ['LAB-C-09', 'Lab C', 'operational'],
            ['LAB-D-12', 'Lab D', 'operational'],
            ['LIB-PC-01', 'Library', 'faulty'],
            ['LIB-PC-04', 'Library', 'operational'],
            ['STAFF-ROOM-A', 'Staff', 'faulty']
          ];

          computers.forEach(comp => {
            db.run('INSERT INTO computers (computer_id, lab_number, status) VALUES (?, ?, ?)', comp);
          });

          // 3. Insert Usage Logs, Tickets, and Maintenance later (after computers are added)
          setTimeout(() => {
            // Usage Logs (Extensive logs over the past week for rich dashboard charts)
            db.run("INSERT INTO pc_usage_logs (computer_id, user_id, login_time, logout_time) VALUES (1, 2, datetime('now', '-2 days', '-4 hours'), datetime('now', '-2 days', '-1 hours'))");
            db.run("INSERT INTO pc_usage_logs (computer_id, user_id, login_time, logout_time) VALUES (2, 2, datetime('now', '-18 hours'), datetime('now', '-16 hours'))");
            db.run("INSERT INTO pc_usage_logs (computer_id, user_id, login_time, logout_time) VALUES (5, 2, datetime('now', '-15 hours'), datetime('now', '-14 hours'))");
            db.run("INSERT INTO pc_usage_logs (computer_id, user_id, login_time, logout_time) VALUES (7, 2, datetime('now', '-8 hours'), datetime('now', '-5 hours'))");
            db.run("INSERT INTO pc_usage_logs (computer_id, user_id, login_time, logout_time) VALUES (4, 2, datetime('now', '-5 hours'), datetime('now', '-3 hours'))");
            db.run("INSERT INTO pc_usage_logs (computer_id, user_id, login_time, logout_time) VALUES (2, 2, datetime('now', '-3 days', '-5 hours'), datetime('now', '-3 days', '-2 hours'))");
            db.run("INSERT INTO pc_usage_logs (computer_id, user_id, login_time, logout_time) VALUES (8, 2, datetime('now', '-4 days', '-10 hours'), datetime('now', '-4 days', '-8 hours'))");
            db.run("INSERT INTO pc_usage_logs (computer_id, user_id, login_time, logout_time) VALUES (9, 2, datetime('now', '-6 days', '-2 hours'), datetime('now', '-6 days', '-1 hours'))");
            db.run("INSERT INTO pc_usage_logs (computer_id, user_id, login_time, logout_time) VALUES (11, 2, datetime('now', '-1 days', '-9 hours'), datetime('now', '-1 days', '-4 hours'))");
            db.run("INSERT INTO pc_usage_logs (computer_id, user_id, login_time, logout_time) VALUES (12, 2, datetime('now', '-5 days', '-12 hours'), datetime('now', '-5 days', '-9 hours'))");
            db.run("INSERT INTO pc_usage_logs (computer_id, user_id, login_time, logout_time) VALUES (1, 2, datetime('now', '-7 days', '-8 hours'), datetime('now', '-7 days', '-6 hours'))");
            db.run("INSERT INTO pc_usage_logs (computer_id, user_id, login_time, logout_time) VALUES (5, 2, datetime('now', '-2 days', '-10 hours'), datetime('now', '-2 days', '-8 hours'))");
            db.run("INSERT INTO pc_usage_logs (computer_id, user_id, login_time, logout_time) VALUES (7, 2, datetime('now', '-3 days', '-20 hours'), datetime('now', '-3 days', '-18 hours'))");
            db.run("INSERT INTO pc_usage_logs (computer_id, user_id, login_time, logout_time) VALUES (6, 2, datetime('now', '-6 hours'), datetime('now', '-4 hours'))");
            db.run("INSERT INTO pc_usage_logs (computer_id, user_id, login_time, logout_time) VALUES (10, 2, datetime('now', '-1 hours'), NULL)"); // Active Usage
            db.run("INSERT INTO pc_usage_logs (computer_id, user_id, login_time, logout_time) VALUES (3, 2, datetime('now', '-2 hours'), NULL)"); // Active Usage

            // Tickets (Wide variety of issues)
            db.run(`INSERT INTO tickets (computer_id, reported_by, assigned_to, issue_category, description, priority, status) 
                        VALUES (3, 2, 3, 'Hardware', 'Monitor is flickering and showing green lines', 'high', 'in_progress')`); // ID 1
            db.run(`INSERT INTO tickets (computer_id, reported_by, issue_category, description, priority, status) 
                        VALUES (10, 2, 'Network', 'Cannot connect to university Wi-Fi or Ethernet', 'medium', 'open')`); // ID 2
            db.run(`INSERT INTO tickets (computer_id, reported_by, assigned_to, issue_category, description, priority, status) 
                        VALUES (12, 2, 4, 'Hardware', 'Motherboard beeping on startup, fan is extremely loud', 'critical', 'resolved')`); // ID 3 - Tharun
            db.run(`INSERT INTO tickets (computer_id, reported_by, assigned_to, issue_category, description, priority, status) 
                        VALUES (5, 2, 5, 'Software', 'whatsapp bug', 'low', 'in_progress')`); // ID 4 - Susu
            db.run(`INSERT INTO tickets (computer_id, reported_by, assigned_to, issue_category, description, priority, status) 
                        VALUES (1, 2, 3, 'Software', 'Anaconda Navigator not launching, python path error', 'medium', 'open')`); // ID 5
            db.run(`INSERT INTO tickets (computer_id, reported_by, issue_category, description, priority, status) 
                        VALUES (7, 2, 'Hardware', 'Missing keyboard keys (Spacebar and Enter)', 'low', 'open')`); // ID 6
            db.run(`INSERT INTO tickets (computer_id, reported_by, assigned_to, issue_category, description, priority, status) 
                        VALUES (4, 2, 3, 'Network', 'DNS Resolution failed, cannot access internal gitlab', 'high', 'resolved')`); // ID 7
            db.run(`INSERT INTO tickets (computer_id, reported_by, assigned_to, issue_category, description, priority, status) 
                        VALUES (2, 2, 4, 'Other', 'Blue Screen of Death showing MEMORY_MANAGEMENT error', 'critical', 'in_progress')`); // ID 8
            db.run(`INSERT INTO tickets (computer_id, reported_by, assigned_to, issue_category, description, priority, status) 
                        VALUES (8, 2, 3, 'Software', 'Visual Studio requires an admin password to update workloads', 'medium', 'resolved')`); // ID 9 - Rajesh
            db.run(`INSERT INTO tickets (computer_id, reported_by, assigned_to, issue_category, description, priority, status) 
                        VALUES (11, 2, 4, 'Hardware', 'Mouse laser not tracking properly on the specific desk surface', 'low', 'resolved')`); // ID 10
            db.run(`INSERT INTO tickets (computer_id, reported_by, issue_category, description, priority, status) 
                        VALUES (9, 2, 'Other', 'Chair at this workstation is broken and dangerous', 'medium', 'open')`); // Unassigned

            // Maintenance Schedules
            db.run(`INSERT INTO maintenance_schedules (computer_id, scheduled_date, description, status) 
                        VALUES (1, date('now', '+2 days'), 'Monthly RAM and Dust Check', 'pending')`);
            db.run(`INSERT INTO maintenance_schedules (computer_id, scheduled_date, description, status) 
                        VALUES (4, date('now', '-1 days'), 'OS Security Patching', 'completed')`);
            db.run(`INSERT INTO maintenance_schedules (computer_id, scheduled_date, description, status) 
                        VALUES (2, date('now', '+5 days'), 'Keyboard replacement', 'pending')`);
            db.run(`INSERT INTO maintenance_schedules (computer_id, scheduled_date, description, status) 
                        VALUES (6, date('now', '+1 days'), 'Deep cleaning and thermal paste replacement', 'pending')`);
            db.run(`INSERT INTO maintenance_schedules (computer_id, scheduled_date, description, status) 
                        VALUES (12, date('now', '-7 days'), 'BIOS Update and hardware diagnostic', 'completed')`);
            db.run(`INSERT INTO maintenance_schedules (computer_id, scheduled_date, description, status) 
                        VALUES (7, date('now', '+12 days'), 'Network interface card swap', 'pending')`);
            db.run(`INSERT INTO maintenance_schedules (computer_id, scheduled_date, description, status) 
                        VALUES (10, date('now', '-3 days'), 'Malware scan and removal', 'completed')`);
            db.run(`INSERT INTO maintenance_schedules (computer_id, scheduled_date, description, status) 
                        VALUES (9, date('now', '+3 days'), 'CMOS battery replacement', 'pending')`);

            console.log('Seed data comprehensively generated and ready for demo.');
          }, 500);

        }, 500);
      }
    });

    console.log('SQLite database initialized successfully.');
  });
};

initializeDatabase();
