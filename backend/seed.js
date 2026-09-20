const bcrypt = require('bcrypt');
const { getDbConnection, initDb } = require('./db');

async function seed() {
  console.log('Initializing database...');
  await initDb();
  
  const db = await getDbConnection();
  
  console.log('Clearing existing data...');
  await db.exec('DELETE FROM attendance');
  await db.exec('DELETE FROM users');
  await db.exec('DELETE FROM employees');
  
  console.log('Seeding admin user...');
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash('admin123', saltRounds);
  
  await db.run(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    ['admin', hashedPassword]
  );
  
  console.log('Seeding employees...');
  const employees = [
    {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      position: 'Software Engineer',
      department: 'Engineering',
      status: 'Active',
      salary: 85000,
      hire_date: '2023-01-15'
    },
    {
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@example.com',
      position: 'Product Manager',
      department: 'Product',
      status: 'On Leave',
      salary: 105000,
      hire_date: '2022-11-01'
    },
    {
      first_name: 'Michael',
      last_name: 'Johnson',
      email: 'michael.johnson@example.com',
      position: 'HR Specialist',
      department: 'HR',
      status: 'Inactive',
      salary: 65000,
      hire_date: '2024-02-10'
    },
    {
      first_name: 'Shahd',
      last_name: 'Hosni',
      email: 'shahd.hosni@example.com',
      position: 'Lead Designer',
      department: 'Design',
      status: 'Active',
      salary: 95000,
      hire_date: '2023-06-01'
    }
  ];
  
  for (const emp of employees) {
    await db.run(
      `INSERT INTO employees (first_name, last_name, email, position, department, status, salary, hire_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [emp.first_name, emp.last_name, emp.email, emp.position, emp.department, emp.status, emp.salary, emp.hire_date]
    );
  }

  console.log('Seeding attendance...');
  // Seed attendance for Shahd
  await db.run(
    `INSERT INTO attendance (employee_id, clock_in, clock_out, date) VALUES (?, ?, ?, ?)`,
    [4, '09:00', '17:00', '2026-09-16']
  );
  
  console.log('Seeding complete! You can now start the server.');
  await db.close();
}

seed().catch(err => {
  console.error('Error seeding database:', err);
  process.exit(1);
});
