const { getDbConnection } = require('./db');

async function seedLeaves() {
  const db = await getDbConnection();
  
  // Get existing employees
  const employees = await db.all('SELECT id, first_name, last_name FROM employees LIMIT 5');
  
  if (employees.length === 0) {
    console.log('No employees found to seed leaves for.');
    return;
  }
  
  // Clear existing leaves
  await db.run('DELETE FROM leaves');
  
  // Helper to format date relative to today
  const shiftDate = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const leavesToInsert = [
    { emp: employees[0], type: 'Vacation', start: shiftDate(-2), end: shiftDate(3), days: 5, status: 'Approved' },
    { emp: employees[1] || employees[0], type: 'Sick Leave', start: shiftDate(-5), end: shiftDate(-3), days: 2, status: 'Approved' },
    { emp: employees[2] || employees[0], type: 'Personal', start: shiftDate(1), end: shiftDate(1), days: 1, status: 'Approved' },
    { emp: employees[3] || employees[0], type: 'Leaving Forever', start: shiftDate(10), end: shiftDate(10), days: 0, status: 'Pending' },
    { emp: employees[4] || employees[0], type: 'Bereavement', start: shiftDate(-1), end: shiftDate(1), days: 3, status: 'Approved' },
    { emp: employees[0], type: 'Vacation', start: shiftDate(-10), end: shiftDate(-5), days: 5, status: 'Rejected' }
  ];
  
  for (const leave of leavesToInsert) {
    await db.run(`
      INSERT INTO leaves (employee_id, leave_type, start_date, end_date, duration_days, status, reason)
      VALUES (?, ?, ?, ?, ?, ?, 'Seed data')
    `, [leave.emp.id, leave.type, leave.start, leave.end, leave.days, leave.status]);
  }
  
  console.log('Successfully seeded leaves table!');
}

seedLeaves().catch(console.error);
