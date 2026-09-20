const express = require('express');
const router = express.Router();
const { getDbConnection } = require('../db');

// Create a team
router.post('/', async (req, res) => {
  try {
    const { name, department_id, manager_id, employee_ids } = req.body;
    const db = await getDbConnection();
    const result = await db.run(`
      INSERT INTO teams (name, department_id, manager_id)
      VALUES (?, ?, ?)
    `, [name, department_id, manager_id || null]);
    
    // Assign selected employees to this team
    if (employee_ids && Array.isArray(employee_ids) && employee_ids.length > 0) {
      const placeholders = employee_ids.map(() => '?').join(',');
      await db.run(`
        UPDATE employees SET team_id = ?, department_id = ? WHERE id IN (${placeholders})
      `, [result.lastID, department_id, ...employee_ids]);
    }
    
    res.status(201).json({ id: result.lastID, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a team
router.put('/:id', async (req, res) => {
  try {
    const { name, department_id, manager_id } = req.body;
    const db = await getDbConnection();
    await db.run(`
      UPDATE teams 
      SET name = ?, department_id = ?, manager_id = ?
      WHERE id = ?
    `, [name, department_id, manager_id, req.params.id]);
    
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a team
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDbConnection();
    await db.run('DELETE FROM teams WHERE id = ?', [req.params.id]);
    await db.run('UPDATE employees SET team_id = NULL WHERE team_id = ?', [req.params.id]);
    res.json({ message: 'Team deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
