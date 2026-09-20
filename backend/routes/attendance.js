const express = require('express');
const { getDbConnection } = require('../db');

const router = express.Router();

// Get all attendance for a specific date (or all if no date)
router.get('/', async (req, res) => {
  try {
    const db = await getDbConnection();
    const date = req.query.date;
    let records;
    if (date) {
      records = await db.all(`
        SELECT a.*, e.first_name, e.last_name 
        FROM attendance a 
        JOIN employees e ON a.employee_id = e.id 
        WHERE a.date = ? 
        ORDER BY a.id DESC`, 
        [date]
      );
    } else {
      records = await db.all(`
        SELECT a.*, e.first_name, e.last_name 
        FROM attendance a 
        JOIN employees e ON a.employee_id = e.id 
        ORDER BY a.date DESC, a.id DESC
      `);
    }
    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

// Get attendance for specific employee
router.get('/:employeeId', async (req, res) => {
  try {
    const db = await getDbConnection();
    const records = await db.all('SELECT * FROM attendance WHERE employee_id = ? ORDER BY date DESC, id DESC', [req.params.employeeId]);
    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

// Clock in / Clock out (create or update record)
router.post('/', async (req, res) => {
  const { employee_id, clock_in, clock_out, date } = req.body;
  
  if (!employee_id || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    const db = await getDbConnection();
    
    // Check if there's an existing record for this date
    // We order by id DESC to get the latest shift for today
    const existing = await db.get('SELECT * FROM attendance WHERE employee_id = ? AND date = ? ORDER BY id DESC', [employee_id, date]);
    
    if (existing && !existing.clock_out && clock_out) {
      // Currently working -> Clocking out
      await db.run(
        'UPDATE attendance SET clock_out = ? WHERE id = ?',
        [clock_out, existing.id]
      );
      res.json({ message: 'Attendance updated' });
    } else if (existing && existing.clock_out && clock_in) {
      // Already clocked out -> Clocking in again (New shift)
      await db.run(
        'INSERT INTO attendance (employee_id, clock_in, clock_out, date) VALUES (?, ?, ?, ?)',
        [employee_id, clock_in, null, date]
      );
      res.status(201).json({ message: 'New shift recorded' });
    } else if (!existing && clock_in) {
      // First clock in of the day
      await db.run(
        'INSERT INTO attendance (employee_id, clock_in, clock_out, date) VALUES (?, ?, ?, ?)',
        [employee_id, clock_in, null, date]
      );
      res.status(201).json({ message: 'Attendance recorded' });
    } else {
      // Fallback update
      if (existing) {
        await db.run(
          'UPDATE attendance SET clock_out = ? WHERE id = ?',
          [clock_out || existing.clock_out, existing.id]
        );
        res.json({ message: 'Attendance updated' });
      } else {
        res.status(400).json({ error: 'Invalid operation' });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to record attendance' });
  }
});

// Toggle break status
router.post('/break', async (req, res) => {
  const { employee_id, date, time } = req.body;
  if (!employee_id || !date || !time) return res.status(400).json({ error: 'Missing fields' });
  
  try {
    const db = await getDbConnection();
    const existing = await db.get('SELECT * FROM attendance WHERE employee_id = ? AND date = ? ORDER BY id DESC', [employee_id, date]);
    
    if (!existing) {
      return res.status(400).json({ error: 'Not clocked in today' });
    }
    
    if (existing.break_start) {
      // End break: calculate duration and add
      const breakStartMatch = existing.break_start.match(/(\d+):(\d+)\s(AM|PM)/i);
      const endMatch = time.match(/(\d+):(\d+)\s(AM|PM)/i);
      
      let durationMinutes = 0;
      if (breakStartMatch && endMatch) {
        let h1 = parseInt(breakStartMatch[1], 10), m1 = parseInt(breakStartMatch[2], 10), pm1 = breakStartMatch[3].toUpperCase() === 'PM';
        let h2 = parseInt(endMatch[1], 10), m2 = parseInt(endMatch[2], 10), pm2 = endMatch[3].toUpperCase() === 'PM';
        
        if (pm1 && h1 < 12) h1 += 12; if (!pm1 && h1 === 12) h1 = 0;
        if (pm2 && h2 < 12) h2 += 12; if (!pm2 && h2 === 12) h2 = 0;
        
        let startMins = h1 * 60 + m1;
        let endMins = h2 * 60 + m2;
        durationMinutes = endMins - startMins;
        if (durationMinutes < 0) durationMinutes += 24 * 60; // overnight wrap
      }
      
      const newTotal = (existing.break_duration_minutes || 0) + durationMinutes;
      await db.run('UPDATE attendance SET break_start = NULL, break_duration_minutes = ? WHERE id = ?', [newTotal, existing.id]);
      res.json({ message: 'Break ended', duration_minutes: durationMinutes, total_break: newTotal });
    } else {
      // Start break
      await db.run('UPDATE attendance SET break_start = ? WHERE id = ?', [time, existing.id]);
      res.json({ message: 'Break started' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to toggle break' });
  }
});

module.exports = router;
