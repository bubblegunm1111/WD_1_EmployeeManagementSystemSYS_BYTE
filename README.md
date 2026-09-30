# SYS — Employee Management System

> **A modern, full-stack HR and workforce management platform built with React, Node.js, and SQLite — secured by Firebase Authentication.**

🌐 **Live Demo**: [sys-employee-management-system.vercel.app](https://sys-employee-management-system.vercel.app)
📦 **Repository**: [github.com/bubblegunm1111/sys-employee-management-system](https://github.com/bubblegunm1111/WD_1_EmployeeManagementSystemSYS_BYTE)

---

## ✨ Features

### Admin Portal
- Employee Directory — full CRUD with Firebase account provisioning and email delivery
- Attendance monitoring — company-wide clock-ins, breaks, and hour calculations
- Leave Management — approve/reject employee leave requests
- Payroll Processing — salary, deductions, bonuses, and payslip generation
- Advanced Reports — dynamic business analytics with PDF/CSV export
- Department & Team Management

### Employee Hub
- Personal Dashboard — morning greeting, daily task summary, attendance widget
- My Tasks — create, complete, and track assignments
- My Schedule — calendar of meetings and company events
- My Documents — upload/download payslips, contracts, HR policies
- My Training & Equipment — course tracking and asset management
- Settings & Profile — personal info, emergency contacts, bank details

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS v4, Framer Motion |
| Backend | Node.js, Express.js |
| Database | SQLite (via `sqlite3` + `sqlite`) |
| Auth | Firebase Authentication (Email/Password + Google OAuth) |
| Email | Nodemailer (Gmail SMTP) |
| Deployment | Vercel (frontend) + Render (backend) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- A Firebase project with Email/Password and Google sign-in enabled
- A `.env` file in the `backend/` directory (see below)

### 1. Clone the repository
```bash
git clone https://github.com/bubblegunm1111/sys-employee-management-system.git
cd sys-employee-management-system
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Start the backend:
```bash
node server.js
# Server runs on http://localhost:3000
```

The database and seed data are created automatically on first run.

### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

---

## 📂 Project Structure

```text
sys-employee-management-system/
├── backend/
│   ├── routes/
│   │   ├── auth.js          # Admin registration
│   │   ├── employees.js     # Employee CRUD + Firebase provisioning
│   │   ├── attendance.js    # Clock-in/out/break
│   │   ├── leave.js         # Leave requests & approval
│   │   ├── payroll.js       # Payroll records
│   │   ├── departments.js   # Department management
│   │   ├── tasks.js         # Task management
│   │   └── reports.js       # Analytics & exports
│   ├── middleware/
│   │   └── authMiddleware.js  # Firebase JWT verification + org scoping
│   ├── db.js                # SQLite schema + seed data
│   └── server.js            # Express app entry point
│
└── frontend/
    └── src/
        ├── components/      # All React page components
        │   └── employee/    # Employee-specific modules
        ├── context/         # AuthContext (Firebase state)
        ├── api.js           # Axios instance with auth interceptor
        └── App.jsx          # Routing + protected routes
```

---

## 🔐 Authentication & Authorization

All API routes require a **Firebase ID token** in the `Authorization` header:

```
Authorization: Bearer <firebase_id_token>
```

The `requireAuth` middleware:
1. Verifies the token with Firebase Admin SDK
2. Resolves the caller's `organization_id` from the database
3. Attaches `req.role` (`admin` or `employee`) for downstream use
4. All queries are **scoped by `organization_id`** — admins only see/manage their own org's data

---

## 📡 API Routes & Sample Payloads

### Auth

#### `POST /api/auth/register`
Register a new admin organization.

**Request:**
```json
{
  "email": "admin@company.com",
  "uid": "firebase_uid_here",
  "orgName": "VibeTribe Inc.",
  "fullName": "Alex Johnson"
}
```
**Response `201`:**
```json
{ "message": "Organization registered successfully", "orgId": 1 }
```

---

### Employees

#### `GET /api/employees`
List all employees in the authenticated admin's organization.

**Response `200`:**
```json
[
  {
    "id": 1,
    "first_name": "Sarah",
    "last_name": "Chen",
    "email": "sarah.chen@company.com",
    "position": "Software Engineer",
    "department": "Engineering",
    "status": "Active",
    "basic_salary": 8500,
    "hire_date": "2025-01-15",
    "department_name": "Engineering",
    "team_name": "Backend Team"
  }
]
```

---

#### `GET /api/employees/by-email?email=sarah.chen@company.com`
Fetch a single employee by email (used by employee portal for self-lookup).

**Response `200`:**
```json
{
  "id": 1,
  "first_name": "Sarah",
  "email": "sarah.chen@company.com",
  "requires_password_reset": 0,
  "onboarding_completed": 1
}
```

---

#### `POST /api/employees`
Create a new employee record. Simultaneously creates a Firebase Auth user and sends a welcome email with temporary credentials.

**Required fields:** `first_name`, `last_name`, `email`, `position`

**Request:**
```json
{
  "first_name": "James",
  "last_name": "Miller",
  "email": "james.miller@company.com",
  "phone_number": "+1 555 0199",
  "position": "Product Designer",
  "department": "Design",
  "basic_salary": 7200,
  "accommodation": 500,
  "transportation": 300,
  "department_id": 2,
  "team_id": 1,
  "manager_id": 3
}
```

**Response `201`:**
```json
{
  "id": 12,
  "first_name": "James",
  "last_name": "Miller",
  "email": "james.miller@company.com",
  "position": "Product Designer",
  "hire_date": "2026-09-22",
  "firebase_uid": "abc123xyz",
  "tempPassword": "f3a8b2C1!"
}
```

**Validation errors `400`:**
```json
{ "error": "Missing required fields" }
```

---

#### `PUT /api/employees/:id`
Update an employee's information.

**Request:**
```json
{
  "first_name": "James",
  "last_name": "Miller",
  "email": "james.miller@company.com",
  "position": "Senior Product Designer",
  "status": "Active",
  "basic_salary": 8000,
  "department_id": 2
}
```

**Response `200`:**
```json
{ "message": "Employee updated successfully" }
```

---

#### `DELETE /api/employees/:id`
Delete an employee record.

**Response `200`:**
```json
{ "message": "Employee deleted successfully" }
```

---

### Attendance

#### `POST /api/attendance` — Clock In
```json
{ "employee_id": 1, "clock_in": "09:02 AM", "date": "2026-09-22" }
```

#### `POST /api/attendance` — Clock Out
```json
{ "employee_id": 1, "clock_out": "05:30 PM", "date": "2026-09-22" }
```

#### `POST /api/attendance/break` — Toggle Break
```json
{ "employee_id": 1, "time": "12:00 PM", "date": "2026-09-22" }
```

#### `GET /api/attendance/:employeeId`
Returns full attendance history for an employee.

---

### Leave

#### `GET /api/leave`
Returns all leave requests for the organization (with employee name and department).

#### `POST /api/leave`
Submit a new leave request.

```json
{
  "employee_id": 1,
  "leave_type": "Annual Leave",
  "start_date": "2026-10-01",
  "end_date": "2026-10-05",
  "duration_days": 5,
  "reason": "Family vacation"
}
```

**Response `201`:**
```json
{ "id": 7, "message": "Leave request created" }
```

#### `PUT /api/leave/:id/status`
Approve or reject a leave request (admin only).

```json
{ "status": "Approved" }
```

---

### Payroll

#### `GET /api/payroll`
Returns all payroll records for the organization.

#### `POST /api/payroll`
Generate a payroll record for an employee.

```json
{
  "employee_id": 1,
  "month": "September",
  "year": 2026,
  "basic_salary": 8500,
  "allowances": 800,
  "deductions": 200,
  "bonus": 500
}
```

---

## 🗃️ Database Schema (Key Tables)

```sql
-- Employees
CREATE TABLE employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  position TEXT NOT NULL,
  department TEXT,
  status TEXT DEFAULT 'Active',
  salary REAL NOT NULL,
  basic_salary REAL,
  accommodation REAL DEFAULT 0,
  transportation REAL DEFAULT 0,
  hire_date TEXT NOT NULL,
  firebase_uid TEXT,
  requires_password_reset BOOLEAN DEFAULT 1,
  onboarding_completed BOOLEAN DEFAULT 0,
  organization_id INTEGER,
  department_id INTEGER,
  team_id INTEGER,
  manager_id INTEGER,
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Organizations
CREATE TABLE organizations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  admin_firebase_uid TEXT UNIQUE NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔒 Roles & Access Control

| Action | Admin | Employee |
|---|---|---|
| View employee list | ✅ | ❌ |
| Create employee | ✅ | ❌ |
| Update employee | ✅ | ❌ |
| Delete employee | ✅ | ❌ |
| Clock in/out | ✅ | ✅ (own record) |
| Submit leave request | ❌ | ✅ |
| Approve/reject leave | ✅ | ❌ |
| View payroll | ✅ | ✅ (own payslip) |
| Generate reports | ✅ | ❌ |

---

## 📧 Email Notifications

When a new employee is created, an automated welcome email is sent via Gmail SMTP containing:
- Their work email address
- A temporary password
- A link to the employee portal

> Requires `EMAIL_USER` and `EMAIL_PASS` environment variables to be set.

---

## 🧪 Sample Seed Data

On first run, the database is seeded with:
- 1 default organization ("VibeTribe")
- Sample employees across Engineering, Design, HR, Finance, and Marketing departments
- Sample attendance, leave, and payroll records for demo purposes
