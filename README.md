# TMS Labs - Fault & Ticket Management System

Welcome to the Fault and Ticket Management System, a full-stack React + Node.js application built for administrators, technicians, and students to flawlessly track hardware, manage software repair tickets, and schedule maintenance across PC labs.

## 🚀 Features

*   **Role-Based Access:** Logins for Admins, Technicians, and Students.
*   **AMOLED Dark Theme UI:** Smooth glassmorphism panes with Framer Motion physics-based interactions.
*   **Real-time Analytics Dashboard:** PC usage charts, ticking maintenance logs, and active ticket tracking.
*   **Robust Ticketing:** Students report hardware/software faults; Admins assign fault tickets; Technicians mark them in progress and resolve them.
*   **Maintenance Scheduler:** Admins can queue workstation nodes for thermal paste changes, screen dustings, and hardware upgrades.

## 💻 Tech Stack
*   **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Recharts
*   **Backend**: Node.js, Express.js, SQLite (Local database), bcrypt (Auth)

## 🔑 Demo Credentials
The SQLite database comes pre-seeded with highly varied test data. You can log into any of the roles below using the password `xxx123` or `admin123`/`student123`/`tech123` depending on the seed version.

1.  **Admin:** `admin@tms.com`
2.  **Student:** `student@tms.com`
3.  **Technicians:** `sam@tms.com` and `sara@tms.com`

## 🛠️ Deployment (Render & Vercel)

### **Frontend (Vercel)**
Because the frontend is a pure React static export, it is highly optimized for Vercel. 
1. Push this repository to GitHub. 
2. Import the repository into Vercel. 
3. Change the Build command to `cd client && npm run build` and the Out dir to `client/dist`.

### **Backend (Render.com)**
Because Vercel Serverless Functions will delete the local `TMS.db` SQLite file on every request, host the backend Express server on Render Web Services.
1. Link your GitHub to Render.
2. Select this Repo, set Root Dir to `.`.
3. Build Command: `cd server && npm install`
4. Start Command: `cd server && node server.js`
*(Remember to update the Frontend Axios URLs to match your live Render API URL!)*
