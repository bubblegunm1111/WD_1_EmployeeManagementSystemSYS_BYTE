const express = require('express');
const { getDbConnection } = require('../db');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Register a new Admin and create their Organization
router.post('/register', async (req, res) => {
  const { email, uid, orgName, fullName } = req.body;
  if (!email || !uid || !orgName) {
    return res.status(400).json({ error: 'Email, uid, and orgName are required' });
  }

  try {
    const db = await getDbConnection();
    
    // Create the organization
    const result = await db.run(
      'INSERT INTO organizations (name, admin_firebase_uid) VALUES (?, ?)',
      [orgName, uid]
    );
    
    // We could optionally store the Admin as an employee record with a specific role,
    // but the system relies on the Admin portal just being tied to the org ownership right now.
    
    res.status(201).json({ message: 'Organization created successfully', orgId: result.lastID });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({ error: 'Organization or Admin already exists' });
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current organization details
router.get('/organization', requireAuth, async (req, res) => {
  try {
    const db = await getDbConnection();
    const org = await db.get('SELECT id, name FROM organizations WHERE id = ?', [req.organization_id]);
    if (!org) return res.status(404).json({ error: 'Organization not found' });
    res.json(org);
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = { router };
