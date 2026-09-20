const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');

async function getDbConnection() {
  return open({
    filename: dbPath,
    driver: sqlite3.Database
  });
}

async function initDb() {
  const db = await getDbConnection();
  
  // Create tables if they don't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    );
    
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      position TEXT NOT NULL,
      department TEXT,
      status TEXT DEFAULT 'Active',
      salary REAL NOT NULL,
      hire_date TEXT NOT NULL,
      firebase_uid TEXT,
      requires_password_reset BOOLEAN DEFAULT 0,
      phone_number TEXT
    );
    
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      clock_in TEXT NOT NULL,
      clock_out TEXT,
      date TEXT NOT NULL,
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    );
    
    CREATE TABLE IF NOT EXISTS leaves (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      leave_type TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      duration_days INTEGER NOT NULL,
      status TEXT DEFAULT 'Pending',
      reason TEXT,
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    );
    
    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      manager_id INTEGER,
      location TEXT,
      code TEXT,
      color TEXT DEFAULT 'bg-[#e0e7ff]',
      text_color TEXT DEFAULT 'text-[#4f46e5]',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (manager_id) REFERENCES employees(id)
    );
    
    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      department_id INTEGER NOT NULL,
      manager_id INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (department_id) REFERENCES departments(id),
      FOREIGN KEY (manager_id) REFERENCES employees(id)
    );
  `);
  
  // Check if department column exists in employees table (for migration if needed)
  const columns = await db.all("PRAGMA table_info(employees)");
  const hasDepartment = columns.some(col => col.name === 'department');
  if (!hasDepartment) {
    await db.exec(`ALTER TABLE employees ADD COLUMN department TEXT;`);
  }
  const hasStatus = columns.some(col => col.name === 'status');
  if (!hasStatus) {
    await db.exec(`ALTER TABLE employees ADD COLUMN status TEXT DEFAULT 'Active';`);
  }
  const hasFirebaseUid = columns.some(col => col.name === 'firebase_uid');
  if (!hasFirebaseUid) {
    await db.exec(`ALTER TABLE employees ADD COLUMN firebase_uid TEXT;`);
  }
  const hasReset = columns.some(col => col.name === 'requires_password_reset');
  if (!hasReset) {
    await db.exec(`ALTER TABLE employees ADD COLUMN requires_password_reset BOOLEAN DEFAULT 0;`);
  }
  const hasPhone = columns.some(col => col.name === 'phone_number');
  if (!hasPhone) {
    await db.exec(`ALTER TABLE employees ADD COLUMN phone_number TEXT;`);
  }
  const hasDeptId = columns.some(col => col.name === 'department_id');
  if (!hasDeptId) {
    await db.exec(`ALTER TABLE employees ADD COLUMN department_id INTEGER;`);
  }
  const hasTeamId = columns.some(col => col.name === 'team_id');
  if (!hasTeamId) {
    await db.exec(`ALTER TABLE employees ADD COLUMN team_id INTEGER;`);
  }
  const hasManagerId = columns.some(col => col.name === 'manager_id');
  if (!hasManagerId) {
    await db.exec(`ALTER TABLE employees ADD COLUMN manager_id INTEGER;`);
  }
  
  // Create Payroll Records Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS payroll_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER,
      month TEXT,
      basic_salary INTEGER DEFAULT 0,
      accommodation INTEGER DEFAULT 0,
      transportation INTEGER DEFAULT 0,
      bonus INTEGER DEFAULT 0,
      overtime INTEGER DEFAULT 0,
      loan INTEGER DEFAULT 0,
      absence INTEGER DEFAULT 0,
      penalty INTEGER DEFAULT 0,
      personal_expenses INTEGER DEFAULT 0,
      others INTEGER DEFAULT 0,
      status TEXT DEFAULT 'Draft',
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id),
      UNIQUE(employee_id, month)
    )
  `);

  // Create Payroll Issues Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS payroll_issues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER,
      month TEXT,
      issue_type TEXT,
      description TEXT,
      status TEXT DEFAULT 'Open',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    )
  `);

  // Safely add new fixed salary columns to employees table if they don't exist
  try { await db.exec('ALTER TABLE employees ADD COLUMN basic_salary INTEGER DEFAULT 0;'); } catch (e) { /* ignores error if column exists */ }
  try { await db.exec('ALTER TABLE employees ADD COLUMN accommodation INTEGER DEFAULT 0;'); } catch (e) { }
  try { await db.exec('ALTER TABLE employees ADD COLUMN transportation INTEGER DEFAULT 0;'); } catch (e) { }

  // Create Report History and Saved Reports
  await db.exec(`
    CREATE TABLE IF NOT EXISTS saved_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      report_type TEXT NOT NULL,
      filters_json TEXT,
      last_generated TEXT
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS report_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_name TEXT NOT NULL,
      report_type TEXT NOT NULL,
      format TEXT NOT NULL,
      generated_by INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (generated_by) REFERENCES employees(id)
    )
  `);

  return db;
}

module.exports = {
  getDbConnection,
  initDb
};
