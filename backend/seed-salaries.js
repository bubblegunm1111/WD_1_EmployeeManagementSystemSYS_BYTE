const { getDbConnection } = require('./db');

async function seed() {
  try {
    const db = await getDbConnection();
    
    // Get all employees
    const employees = await db.all('SELECT * FROM employees');
    
    for (const emp of employees) {
      // Create a mock fixed structure based on their old salary, or use defaults
      const total = emp.salary || 18000;
      const basic = Math.floor(total * 0.8);
      const acc = Math.floor(total * 0.1);
      const trans = total - basic - acc;

      await db.run(`
        UPDATE employees 
        SET basic_salary = ?, accommodation = ?, transportation = ?
        WHERE id = ?
      `, [basic, acc, trans, emp.id]);
      
      console.log(`Updated employee ${emp.first_name} ${emp.last_name}: Basic=${basic}, Acc=${acc}, Trans=${trans}`);
    }
    
    console.log('All employee salaries seeded successfully!');
  } catch (err) {
    console.error('Error seeding salaries:', err);
  }
}

seed();
