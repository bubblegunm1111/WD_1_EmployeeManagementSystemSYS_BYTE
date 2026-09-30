const express = require('express');
const router = express.Router();
const { getDbConnection } = require('../db');
const { requireAuth } = require('../middleware/authMiddleware');

router.use(requireAuth);

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
      WHERE e.organization_id = ?
      ORDER BY l.start_date DESC
    `, [req.organization_id]);
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
    
    // Verify ownership
    const emp = await db.get('SELECT id FROM employees WHERE id = ? AND organization_id = ?', [employee_id, req.organization_id]);
    if (!emp) return res.status(403).json({ error: 'Employee not found in organization' });

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
    
    // Verify ownership via join
    const leave = await db.get('SELECT l.id FROM leaves l JOIN employees e ON l.employee_id = e.id WHERE l.id = ? AND e.organization_id = ?', [req.params.id, req.organization_id]);
    if (!leave) return res.status(403).json({ error: 'Leave request not found or access denied' });

    await db.run('UPDATE leaves SET status = ? WHERE id = ?', [status, req.params.id]);
    
    res.json({ message: 'Leave status updated successfully' });
  } catch (error) {
    console.error('Error updating leave status:', error);
    res.status(500).json({ error: 'Failed to update leave status' });
  }
});

module.exports = router;
