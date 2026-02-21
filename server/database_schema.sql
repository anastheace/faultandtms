CREATE DATABASE IF NOT EXISTS fault_management_system;
USE fault_management_system;

-- USERS Table
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'student', 'staff', 'technician') NOT NULL DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- COMPUTERS Table
CREATE TABLE IF NOT EXISTS computers (
    pc_id INT AUTO_INCREMENT PRIMARY KEY,
    lab_number VARCHAR(50) NOT NULL,
    pc_number VARCHAR(50) NOT NULL,
    status ENUM('working', 'faulty', 'maintenance') DEFAULT 'working',
    last_checked TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TICKETS Table
CREATE TABLE IF NOT EXISTS tickets (
    ticket_id INT AUTO_INCREMENT PRIMARY KEY,
    pc_id INT,
    reported_by INT,
    issue_description TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    status ENUM('open', 'assigned', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    assigned_to INT,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_date TIMESTAMP NULL,
    FOREIGN KEY (pc_id) REFERENCES computers(pc_id) ON DELETE SET NULL,
    FOREIGN KEY (reported_by) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(user_id) ON DELETE SET NULL
);

-- TICKET_UPDATES Table
CREATE TABLE IF NOT EXISTS ticket_updates (
    update_id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT,
    comment TEXT,
    status ENUM('open', 'assigned', 'in_progress', 'resolved', 'closed'),
    updated_by INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Insert Default Admin (Password: admin123 - You should hash this in production)
-- INSERT INTO users (name, email, password, role) VALUES ('Admin User', 'admin@example.com', '$2a$10$YourHashedPasswordHere', 'admin');
