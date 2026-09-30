const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { getDbConnection } = require('../db');
const firebaseAuth = require('../firebase');

const router = express.Router();

// Get all employees
router.get('/', async (req, res) => {
  try {
    const db = await getDbConnection();
    const employees = await db.all(`
      SELECT 
        e.*,
        m.first_name as manager_first_name,
        m.last_name as manager_last_name,
        d.name as department_name,
        t.name as team_name,
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM leaves l 
            WHERE l.employee_id = e.id 
            AND l.status = 'Approved' 
            AND date('now', 'localtime') BETWEEN date(l.start_date) AND date(l.end_date)
          ) THEN 'On Leave'
          ELSE e.status
        END AS status
      FROM employees e
      LEFT JOIN employees m ON e.manager_id = m.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN teams t ON e.team_id = t.id
      ORDER BY e.id DESC
    `);
    res.json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// Get employee by email
router.get('/by-email', async (req, res) => {
  try {
    const { email } = req.query;
    const db = await getDbConnection();
    const employee = await db.get('SELECT * FROM employees WHERE email = ?', [email]);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// Update reset status
router.put('/:id/reset-status', async (req, res) => {
  try {
    const id = req.params.id;
    const db = await getDbConnection();
    await db.run('UPDATE employees SET requires_password_reset = 0 WHERE id = ?', [id]);
    res.json({ message: 'Password reset status updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Update onboarding data
router.put('/:id/onboarding', async (req, res) => {
  try {
    const id = req.params.id;
    const { dob, gender, personal_email, address, city, country, emergency_name, emergency_relation, emergency_phone, bank_name, bank_account } = req.body;
    const db = await getDbConnection();
    
    await db.run(
      `UPDATE employees SET 
        onboarding_completed = 1,
        dob = ?, gender = ?, personal_email = ?, address = ?, city = ?, country = ?, 
        emergency_name = ?, emergency_relation = ?, emergency_phone = ?, 
        bank_name = ?, bank_account = ?
       WHERE id = ?`,
      [dob, gender, personal_email, address, city, country, emergency_name, emergency_relation, emergency_phone, bank_name, bank_account, id]
    );
    res.json({ message: 'Onboarding completed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save onboarding data' });
  }
});

// Create employee
router.post('/', async (req, res) => {
  const { first_name, last_name, email, phone_number, position, department, status, basic_salary, accommodation, transportation, department_id, team_id, manager_id } = req.body;
  const hire_date = new Date().toISOString().split('T')[0];
  
  if (!first_name || !last_name || !email || !position) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    let firebaseUid = null;
    let tempPassword = crypto.randomBytes(4).toString('hex') + 'A1!'; // e.g., 8f3bA1!
    
    // If Firebase Admin is configured, create the user in Firebase first
    if (firebaseAuth) {
      try {
        const userRecord = await firebaseAuth.createUser({
          email,
          password: tempPassword,
          displayName: `${first_name} ${last_name}`
        });
        firebaseUid = userRecord.uid;
      } catch (fbError) {
        if (fbError.code === 'auth/email-already-exists') {
          // If they already exist in Firebase, we just link them and we must update their password to the temp one!
          const existingUser = await firebaseAuth.getUserByEmail(email);
          firebaseUid = existingUser.uid;
          await firebaseAuth.updateUser(existingUser.uid, { password: tempPassword });
        } else {
          throw fbError; // Re-throw other Firebase errors
        }
      }
    }

    const db = await getDbConnection();
    const result = await db.run(
      `INSERT INTO employees (first_name, last_name, email, phone_number, position, department, status, basic_salary, accommodation, transportation, hire_date, firebase_uid, requires_password_reset, department_id, team_id, manager_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, email, phone_number || '', position, department || '', status || 'Active', basic_salary || 0, accommodation || 0, transportation || 0, hire_date, firebaseUid, 1, department_id || null, team_id || null, manager_id || null]
    );

    // Send Email using Nodemailer
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const mailOptions = {
        from: `"SYS Admin" <${process.env.EMAIL_USER || 'admin@sys.com'}>`,
        to: email,
        subject: 'Welcome to the Team - Your Login Details',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2>Welcome, ${first_name}!</h2>
            <p>Your employee account has been securely set up.</p>
            <p>You can log in to the employee portal using the following temporary credentials:</p>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; display: inline-block;">
              <p style="margin: 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 5px 0 0 0;"><strong>Temporary Password:</strong> <span style="font-family: monospace; font-size: 16px;">${tempPassword}</span></p>
            </div>
            <p><em>Note: You will be required to change this password immediately upon your first login.</em></p>
            <p>Click <a href="http://localhost:5174/login">here to log in</a>.</p>
          </div>
        `
      };

      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${email}`);
      } else {
        console.log("Email not sent: EMAIL_USER or EMAIL_PASS not set in .env");
        console.log("Would have sent:", mailOptions.html);
      }
    } catch (emailErr) {
      console.error("Failed to send email:", emailErr);
    }
    
    res.status(201).json({ 
      id: result.lastID,
      first_name, last_name, email, phone_number, position, department, status, basic_salary, hire_date,
      firebase_uid: firebaseUid,
      department_id, team_id, manager_id,
      tempPassword
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

// Update employee
router.put('/:id', async (req, res) => {
  const { first_name, last_name, email, phone_number, position, department, status, basic_salary, accommodation, transportation, department_id, team_id, manager_id } = req.body;
  try {
    const db = await getDbConnection();
    await db.run(
      `UPDATE employees SET 
        first_name = ?, last_name = ?, email = ?, phone_number = ?, position = ?, department = ?, status = ?, basic_salary = ?, accommodation = ?, transportation = ?, department_id = ?, team_id = ?, manager_id = ?
       WHERE id = ?`,
      [first_name, last_name, email, phone_number || '', position, department || '', status || 'Active', basic_salary || 0, accommodation || 0, transportation || 0, department_id || null, team_id || null, manager_id || null, req.params.id]
    );
    
    res.json({ message: 'Employee updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

// Delete employee
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDbConnection();
    await db.run('DELETE FROM employees WHERE id = ?', [req.params.id]);
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

module.exports = router;
