const express = require('express');
const router = express.Router();
const { getDbConnection } = require('../db');
const { requireAuth } = require('../middleware/authMiddleware');

router.use(requireAuth);

// Get all departments
router.get('/', async (req, res) => {
  try {
    const db = await getDbConnection();
    // Join with employees for manager name, and get counts
    const departments = await db.all(`
      SELECT 
        d.*,
        e.first_name as manager_first_name,
        e.last_name as manager_last_name,
        (SELECT COUNT(*) FROM employees WHERE department_id = d.id) as employee_count,
        (SELECT COUNT(*) FROM teams WHERE department_id = d.id) as team_count
      FROM departments d
      LEFT JOIN employees e ON d.manager_id = e.id
      WHERE d.organization_id = ?
      ORDER BY d.name ASC
    `, [req.organization_id]);
    res.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get a single department
router.get('/:id', async (req, res) => {
  try {
    const db = await getDbConnection();
    const department = await db.get(`
      SELECT 
        d.*,
        e.first_name as manager_first_name,
        e.last_name as manager_last_name,
        (SELECT COUNT(*) FROM employees WHERE department_id = d.id) as employee_count
      FROM departments d
      LEFT JOIN employees e ON d.manager_id = e.id
      WHERE d.id = ? AND d.organization_id = ?
    `, [req.params.id, req.organization_id]);
    
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }
    res.json(department);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create department
router.post('/', async (req, res) => {
  try {
    const { name, description, manager_id, location, code, color, text_color } = req.body;
    const db = await getDbConnection();
    const result = await db.run(`
      INSERT INTO departments (name, description, manager_id, location, code, color, text_color, organization_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, description || null, manager_id || null, location || null, code || null, color || null, text_color || null, req.organization_id]);
    
    res.status(201).json({ id: result.lastID, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update department
router.put('/:id', async (req, res) => {
  try {
    const { name, description, manager_id, location, code } = req.body;
    const db = await getDbConnection();
    await db.run(`
      UPDATE departments 
      SET name = ?, description = ?, manager_id = ?, location = ?, code = ?
      WHERE id = ? AND organization_id = ?
    `, [name, description, manager_id, location, code, req.params.id, req.organization_id]);
    
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete department
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDbConnection();
    await db.run('DELETE FROM departments WHERE id = ? AND organization_id = ?', [req.params.id, req.organization_id]);
    await db.run('UPDATE employees SET department_id = NULL WHERE department_id = ? AND organization_id = ?', [req.params.id, req.organization_id]);
    res.json({ message: 'Department deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get teams for a department
router.get('/:id/teams', async (req, res) => {
  try {
    const db = await getDbConnection();
    const teams = await db.all(`
      SELECT 
        t.*,
        e.first_name as manager_first_name,
        e.last_name as manager_last_name,
        (SELECT COUNT(*) FROM employees WHERE team_id = t.id) as employee_count
      FROM teams t
      LEFT JOIN employees e ON t.manager_id = e.id
      WHERE t.department_id = ? AND t.organization_id = ?
    `, [req.params.id, req.organization_id]);
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get employees for a department
router.get('/:id/employees', async (req, res) => {
  try {
    const db = await getDbConnection();
    const employees = await db.all(`
      SELECT e.*, 
        m.first_name as manager_first_name, 
        m.last_name as manager_last_name
      FROM employees e
      LEFT JOIN employees m ON e.manager_id = m.id
      WHERE e.department_id = ? AND e.organization_id = ?
    `, [req.params.id, req.organization_id]);
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
