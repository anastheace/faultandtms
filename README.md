# OG Stable Cloud: TMS Smart Trip


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
The SQLite database comes pre-seeded with highly varied test data. You can log into any of the roles below using these exact credentials:

1.  **Admin:** `admin@tms.com` (pw: `anas123`)
2.  **Student:** `student@tms.com` (pw: `student123`)
3.  **Staff:** `staff@tms.com` (pw: `staff123`)
4.  **Technicians:** `rajesh@tms.com` (pw: `rajesh123`), `tharun@tms.com` (pw: `tharun123`), `susu@tms.com` (pw: `susu123`)

## 🛠️ Deployment (Single-Click Monorepo)

The OG Stable Cloud release has been fully perfectly refactored to host **both** the frontend React static files and the backend Express API from a single Node.js runtime environment.

### **Deploying to Render**
Because we included a root `package.json` and a `render.yaml` Blueprint file, deployment is instant:
1. Push this repository to GitHub.
2. Log into Render.com.
3. Click **New +** > **Blueprint**.
4. Connect the repository. Render will automatically detect the configuration, build the React bundle, and start the Express server seamlessly on a single Web Service!
