const express = require('express');
const router = express.Router();
const { getDbConnection } = require('../db');

// GET all leaves with employee details
router.get('/', async (req, res) => {
  try {
    const db = await getDbConnection();
    const leaves = await db.all(`
      SELECT 
        l.*,
        e.first_name,
        e.last_name,
        e.department
      FROM leaves l
      JOIN employees e ON l.employee_id = e.id
      ORDER BY l.start_date DESC
    `);
    res.json(leaves);
  } catch (error) {
    console.error('Error fetching leaves:', error);
    res.status(500).json({ error: 'Failed to fetch leaves' });
  }
});

// POST new leave request
router.post('/', async (req, res) => {
  try {
    const { employee_id, leave_type, start_date, end_date, duration_days, reason } = req.body;
    
    if (!employee_id || !leave_type || !start_date || !end_date || !duration_days) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = await getDbConnection();
    const result = await db.run(`
      INSERT INTO leaves (employee_id, leave_type, start_date, end_date, duration_days, status, reason)
      VALUES (?, ?, ?, ?, ?, 'Pending', ?)
    `, [employee_id, leave_type, start_date, end_date, duration_days, reason]);

    res.status(201).json({ id: result.lastID, message: 'Leave request created' });
  } catch (error) {
    console.error('Error creating leave:', error);
    res.status(500).json({ error: 'Failed to create leave request' });
  }
});

// PUT update leave status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const db = await getDbConnection();
    await db.run('UPDATE leaves SET status = ? WHERE id = ?', [status, req.params.id]);
    
    res.json({ message: 'Leave status updated successfully' });
  } catch (error) {
    console.error('Error updating leave status:', error);
    res.status(500).json({ error: 'Failed to update leave status' });
  }
});

module.exports = router;
