const express = require('express');
const router = express.Router();
const { getDbConnection } = require('../db');
const { requireAuth } = require('../middleware/authMiddleware');

router.use(requireAuth);

// Helper to ensure payroll record exists for an employee and month
async function getOrCreatePayrollRecord(db, employee, month) {
  let record = await db.get('SELECT * FROM payroll_records WHERE employee_id = ? AND month = ?', [employee.id, month]);
  
  if (!record) {
    const result = await db.run(`
      INSERT INTO payroll_records (
        employee_id, month, basic_salary, accommodation, transportation, 
        bonus, overtime, loan, absence, penalty, personal_expenses, others, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      employee.id, month, 
      employee.basic_salary || 0, employee.accommodation || 0, employee.transportation || 0,
      0, 0, 0, 0, 0, 0, 0, 'Draft'
    ]);
    
    record = await db.get('SELECT * FROM payroll_records WHERE id = ?', [result.lastID]);
  } else if (record.status === 'Draft') {
    // Auto-sync the salary fields from the employee profile if the payroll is still a Draft
    await db.run(`
      UPDATE payroll_records SET
        basic_salary = ?, accommodation = ?, transportation = ?
      WHERE id = ?
    `, [employee.basic_salary || 0, employee.accommodation || 0, employee.transportation || 0, record.id]);
    
    record.basic_salary = employee.basic_salary || 0;
    record.accommodation = employee.accommodation || 0;
    record.transportation = employee.transportation || 0;
  }
  return record;
}

// GET all payrolls for a specific month
router.get('/', async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) return res.status(400).json({ error: 'Month parameter is required (YYYY-MM)' });
    
    const db = await getDbConnection();
    const employees = await db.all('SELECT * FROM employees WHERE organization_id = ?', [req.organization_id]);
    
    const records = [];
    for (const emp of employees) {
      const record = await getOrCreatePayrollRecord(db, emp, month);
      records.push({
        ...record,
        employee_first_name: emp.first_name,
        employee_last_name: emp.last_name,
        department_name: emp.department
      });
    }
    
    res.json(records);
  } catch (error) {
    console.error('Error fetching payroll:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET specific employee payroll for a month
router.get('/:employeeId', async (req, res) => {
  try {
    const { month } = req.query;
    const { employeeId } = req.params;
    if (!month) return res.status(400).json({ error: 'Month parameter is required (YYYY-MM)' });
    
    const db = await getDbConnection();
    const employee = await db.get(`
      SELECT e.*, d.name as department_name 
      FROM employees e 
      LEFT JOIN departments d ON e.department_id = d.id 
      WHERE e.id = ? AND e.organization_id = ?
    `, [employeeId, req.organization_id]);
    
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    
    const record = await getOrCreatePayrollRecord(db, employee, month);
    
    res.json({
      ...record,
      employee_first_name: employee.first_name,
      employee_last_name: employee.last_name,
      position: employee.position,
      department_name: employee.department_name || employee.department
    });
  } catch (error) {
    console.error('Error fetching employee payroll:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update payroll adjustments
router.put('/:employeeId', async (req, res) => {
  try {
    const { month, bonus, overtime, loan, absence, penalty, personal_expenses, others } = req.body;
    const { employeeId } = req.params;
    
    if (!month) return res.status(400).json({ error: 'Month is required' });
    
    const db = await getDbConnection();
    
    // Verify ownership
    const emp = await db.get('SELECT id FROM employees WHERE id = ? AND organization_id = ?', [employeeId, req.organization_id]);
    if (!emp) return res.status(403).json({ error: 'Employee not found in organization' });

    await db.run(`
      UPDATE payroll_records SET 
        bonus = ?, overtime = ?, loan = ?, absence = ?, penalty = ?, personal_expenses = ?, others = ?, updated_at = CURRENT_TIMESTAMP
      WHERE employee_id = ? AND month = ?
    `, [bonus || 0, overtime || 0, loan || 0, absence || 0, penalty || 0, personal_expenses || 0, others || 0, employeeId, month]);
    
    const record = await db.get('SELECT * FROM payroll_records WHERE employee_id = ? AND month = ?', [employeeId, month]);
    res.json(record);
  } catch (error) {
    console.error('Error updating payroll:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST mark payroll as paid
router.post('/:employeeId/pay', async (req, res) => {
  try {
    const { month } = req.body;
    const { employeeId } = req.params;
    
    if (!month) return res.status(400).json({ error: 'Month is required' });
    
    const db = await getDbConnection();
    
    // Verify ownership
    const emp = await db.get('SELECT id FROM employees WHERE id = ? AND organization_id = ?', [employeeId, req.organization_id]);
    if (!emp) return res.status(403).json({ error: 'Employee not found in organization' });

    await db.run(`
      UPDATE payroll_records SET status = 'Paid', updated_at = CURRENT_TIMESTAMP
      WHERE employee_id = ? AND month = ?
    `, [employeeId, month]);
    
    res.json({ message: 'Payroll marked as Paid' });
  } catch (error) {
    console.error('Error paying payroll:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET full payroll history for an employee
router.get('/history/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const db = await getDbConnection();
    
    const records = await db.all(`
      SELECT p.* FROM payroll_records p
      JOIN employees e ON p.employee_id = e.id
      WHERE p.employee_id = ? AND e.organization_id = ?
      ORDER BY p.month DESC
    `, [employeeId, req.organization_id]);
    
    res.json(records);
  } catch (error) {
    console.error('Error fetching payroll history:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST report a new payroll issue
router.post('/issues', async (req, res) => {
  try {
    const { employee_id, month, issue_type, description } = req.body;
    if (!employee_id || !month || !issue_type || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const db = await getDbConnection();
    
    // Verify ownership
    const emp = await db.get('SELECT id FROM employees WHERE id = ? AND organization_id = ?', [employee_id, req.organization_id]);
    if (!emp) return res.status(403).json({ error: 'Employee not found in organization' });

    const result = await db.run(`
      INSERT INTO payroll_issues (employee_id, month, issue_type, description, status)
      VALUES (?, ?, ?, ?, 'Open')
    `, [employee_id, month, issue_type, description]);
    
    res.status(201).json({ id: result.lastID, message: 'Issue reported successfully' });
  } catch (error) {
    console.error('Error reporting issue:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET all payroll issues (Admin)
router.get('/issues/all', async (req, res) => {
  try {
    const db = await getDbConnection();
    const issues = await db.all(`
      SELECT i.*, e.first_name, e.last_name 
      FROM payroll_issues i
      JOIN employees e ON i.employee_id = e.id
      WHERE e.organization_id = ?
      ORDER BY i.created_at DESC
    `, [req.organization_id]);
    res.json(issues);
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT resolve a payroll issue (Admin)
router.put('/issues/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDbConnection();
    
    // Verify ownership via join
    const issue = await db.get('SELECT i.id FROM payroll_issues i JOIN employees e ON i.employee_id = e.id WHERE i.id = ? AND e.organization_id = ?', [id, req.organization_id]);
    if (!issue) return res.status(403).json({ error: 'Issue not found or access denied' });

    await db.run(`
      UPDATE payroll_issues SET status = 'Resolved' WHERE id = ?
    `, [id]);
    
    res.json({ message: 'Issue resolved successfully' });
  } catch (error) {
    console.error('Error resolving issue:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
