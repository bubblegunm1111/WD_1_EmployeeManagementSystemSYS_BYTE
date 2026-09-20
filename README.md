# SYS - Employee Management System

SYS is a modern, full-stack Human Resources and Employee Management platform designed to streamline administrative tasks and empower employees with a personalized work hub. 

## 🚀 Features

### Admin Portal
- **Employee Directory**: Manage the entire organization's workforce, including roles, contact information, and departmental assignments.
- **Attendance Tracking**: Monitor company-wide clock-ins, breaks, and calculate total hours worked.
- **Leave Management**: Approve, reject, and track employee leave requests (Annual, Sick, Maternity, etc.).
- **Payroll Processing**: Oversee salary distributions, deductions, and generate payslips.
- **Advanced Reporting**: Generate dynamic business reports with PDF/CSV export capabilities.

### Employee Hub
- **Personal Dashboard**: A morning greeting dashboard tracking daily work hours, upcoming tasks, and events.
- **My Tasks**: An interactive task management system to track assignments and deadlines.
- **My Schedule**: A calendar view of daily meetings, stand-ups, and company-wide events.
- **My Documents**: A centralized repository for payslips, contracts, and HR policies with drag-and-drop upload functionality.
- **My Training & Equipment**: Track mandatory training courses and manage assigned company assets (laptops, phones).
- **Settings & Profile**: Manage account preferences, notifications, and personal emergency contact details.

## 🛠️ Technology Stack

- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons
- **Backend/Database**: Node.js, Express, SQLite (Mocked for development)
- **Routing**: React Router DOM (v6) with Protected Routes

## 💻 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/employee-management-system.git
   ```

2. Navigate to the project directory:
   ```bash
   cd employee-management-system/frontend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open `http://localhost:5173` in your browser.

## 📂 Project Structure

```text
src/
├── components/          # Reusable UI components and major layouts
│   ├── admin/           # Admin-specific dashboards and tools
│   └── employee/        # Employee-specific modules (Tasks, Schedule)
├── context/             # Global state management (AuthContext)
├── assets/              # Images, icons, and static files
├── App.jsx              # Application routing and role-based protection
└── main.jsx             # React entry point
```

## 🔒 Authentication & Roles
The application features role-based access control (RBAC). 
- **Admin Accounts** are routed to the comprehensive HR management dashboard.
- **Employee Accounts** are securely routed to their isolated personal work hub.
Unauthenticated users are restricted to the login gateway.
