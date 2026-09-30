const express = require('express');
const router = express.Router();
const { getDbConnection } = require('../db');

// Get all tasks for an employee
router.get('/:employeeId', async (req, res) => {
  try {
    const db = await getDbConnection();
    const tasks = await db.all('SELECT * FROM tasks WHERE employee_id = ? ORDER BY created_at DESC', [req.params.employeeId]);
    
    // Fetch comments for these tasks
    for (let i = 0; i < tasks.length; i++) {
      const comments = await db.all('SELECT * FROM task_comments WHERE task_id = ? ORDER BY created_at ASC', [tasks[i].id]);
      tasks[i].comments = comments;
      tasks[i].attachments = []; // Mock attachments for now to maintain frontend compatibility
    }
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Create a new task
router.post('/', async (req, res) => {
  try {
    const { employee_id, title, description, due, priority, assigned_by, project } = req.body;
    const db = await getDbConnection();
    
    const result = await db.run(
      `INSERT INTO tasks (employee_id, title, description, due, priority, assigned_by, project) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [employee_id, title, description, due || 'Upcoming', priority || 'Medium', assigned_by || 'Admin', project || 'General']
    );
    
    const newTask = await db.get('SELECT * FROM tasks WHERE id = ?', [result.lastID]);
    newTask.comments = [];
    newTask.attachments = [];
    
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update a task (e.g., status or details)
router.put('/:id', async (req, res) => {
  try {
    const { title, description, due, priority, status } = req.body;
    const db = await getDbConnection();
    
    await db.run(
      `UPDATE tasks SET title = ?, description = ?, due = ?, priority = ?, status = ? WHERE id = ?`,
      [title, description, due, priority, status, req.params.id]
    );
    
    const updatedTask = await db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDbConnection();
    await db.run('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Add a comment to a task
router.post('/:id/comments', async (req, res) => {
  try {
    const { author, text } = req.body;
    const db = await getDbConnection();
    
    const result = await db.run(
      `INSERT INTO task_comments (task_id, author, text) VALUES (?, ?, ?)`,
      [req.params.id, author, text]
    );
    
    const newComment = await db.get('SELECT * FROM task_comments WHERE id = ?', [result.lastID]);
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

module.exports = router;
