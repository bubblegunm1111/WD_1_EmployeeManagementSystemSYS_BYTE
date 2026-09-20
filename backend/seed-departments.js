const { getDbConnection } = require('./db');

async function seed() {
  try {
    const db = await getDbConnection();
    
    const depts = [
      { name: 'Engineering', code: 'ENG-001', location: 'Cairo Office', description: 'Core product development', color: 'bg-[#e0e7ff]', text_color: 'text-[#4f46e5]' },
      { name: 'Design', code: 'DES-001', location: 'Remote', description: 'Product design and UX', color: 'bg-[#fce7f3]', text_color: 'text-[#db2777]' },
      { name: 'HR', code: 'HR-001', location: 'London Office', description: 'Human resources and people', color: 'bg-[#dcfce7]', text_color: 'text-[#16a34a]' },
      { name: 'Marketing', code: 'MKT-001', location: 'New York Office', description: 'Growth and marketing', color: 'bg-[#ffedd5]', text_color: 'text-[#ea580c]' },
      { name: 'Finance', code: 'FIN-001', location: 'Cairo Office', description: 'Accounting and payroll', color: 'bg-[#f3e8ff]', text_color: 'text-[#9333ea]' }
    ];

    for (const d of depts) {
      await db.run(`
        INSERT INTO departments (name, description, manager_id, location, code, color, text_color)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [d.name, d.description, null, d.location, d.code, d.color, d.text_color]);
      console.log('Inserted:', d.name);
    }
    
    console.log('All departments seeded successfully!');
  } catch (err) {
    console.error('Error seeding departments:', err);
  }
}

seed();
