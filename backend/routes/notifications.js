const express = require('express');
const router = express.Router();
const { getDbConnection } = require('../db');

// Get all notifications for a specific user (admin or employee_id)
router.get('/:userId', async (req, res) => {
  try {
    const db = await getDbConnection();
    const notifications = await db.all(
      'SELECT * FROM notifications WHERE recipient_id = ? ORDER BY created_at DESC LIMIT 50', 
      [req.params.userId]
    );
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark a specific notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const db = await getDbConnection();
    await db.run('UPDATE notifications SET is_read = 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification read:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Mark all notifications as read for a user
router.put('/mark-all-read/:userId', async (req, res) => {
  try {
    const db = await getDbConnection();
    await db.run('UPDATE notifications SET is_read = 1 WHERE recipient_id = ?', [req.params.userId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications read:', error);
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

// Create a new notification manually (though usually done internally by other routes)
router.post('/', async (req, res) => {
  try {
    const { recipient_id, title, message, type } = req.body;
    const db = await getDbConnection();
    const result = await db.run(
      'INSERT INTO notifications (recipient_id, title, message, type) VALUES (?, ?, ?, ?)',
      [recipient_id, title, message, type]
    );
    const newNotif = await db.get('SELECT * FROM notifications WHERE id = ?', [result.lastID]);
    res.status(201).json(newNotif);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

module.exports = router;
