const express = require('express');
const router = express.require ? express.Router() : express.Router();
const { getDbConnection } = require('../db');

// Helper to format dates
const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString();
};

// Generate Report
router.post('/generate', async (req, res) => {
  const { type, period, departmentId, employeeId, includes, adminId } = req.body;
  const db = await getDbConnection();

  try {
    let reportData = [];
    let summary = {};
    let columns = [];
    const reportName = `${type} Report - ${period}`;

    // Base employee conditions
    let empCondition = '1=1';
    const params = [];
    
    if (departmentId && departmentId !== 'all') {
      empCondition += ' AND e.department_id = ?';
      params.push(departmentId);
    }
    if (employeeId && employeeId !== 'all') {
      empCondition += ' AND e.id = ?';
      params.push(employeeId);
    }

    if (type === 'Employee Directory') {
      columns = [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'position', label: 'Position' },
        { key: 'department', label: 'Department' },
        { key: 'hire_date', label: 'Hire Date' },
        { key: 'status', label: 'Status' }
      ];

      const records = await db.all(`
        SELECT e.first_name, e.last_name, e.email, e.position, d.name as department_name, e.hire_date, e.status
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE ${empCondition}
      `, ...params);

      reportData = records.map(r => ({
        name: `${r.first_name} ${r.last_name}`,
        email: r.email,
        position: r.position,
        department: r.department_name || 'Unassigned',
        hire_date: formatDate(r.hire_date),
        status: r.status
      }));

      summary = {
        total_employees: records.length,
        active_employees: records.filter(r => r.status === 'Active').length
      };

    } else if (type === 'New Hires') {
      columns = [
        { key: 'name', label: 'Name' },
        { key: 'position', label: 'Position' },
        { key: 'department', label: 'Department' },
        { key: 'hire_date', label: 'Hire Date' }
      ];

      // Assuming period is "Month YYYY". We filter by string matching for now (e.g. LIKE '%YYYY-MM%')
      // Simple implementation: just return all for demo, or filter by year
      const year = period.split(' ')[1];
      
      const records = await db.all(`
        SELECT e.first_name, e.last_name, e.position, d.name as department_name, e.hire_date
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE ${empCondition} AND e.hire_date LIKE ?
      `, ...params, `${year}%`);

      reportData = records.map(r => ({
        name: `${r.first_name} ${r.last_name}`,
        position: r.position,
        department: r.department_name || 'Unassigned',
        hire_date: formatDate(r.hire_date)
      }));

      summary = { total_employees: records.length, new_hires: records.length };

    } else if (type === 'Attendance') {
      columns = [
        { key: 'name', label: 'Name' },
        { key: 'date', label: 'Date' },
        { key: 'clock_in', label: 'Clock In' },
        { key: 'clock_out', label: 'Clock Out' }
      ];

      // Assuming period maps to a specific month. E.g. "September 2026"
      const monthMap = { "January": "01", "February": "02", "March": "03", "April": "04", "May": "05", "June": "06", "July": "07", "August": "08", "September": "09", "October": "10", "November": "11", "December": "12" };
      const [monthStr, yearStr] = period.split(' ');
      const monthPrefix = `${yearStr}-${monthMap[monthStr]}`;

      const records = await db.all(`
        SELECT a.date, a.clock_in, a.clock_out, e.first_name, e.last_name
        FROM attendance a
        JOIN employees e ON a.employee_id = e.id
        WHERE ${empCondition} AND a.date LIKE ?
        ORDER BY a.date DESC
      `, ...params, `${monthPrefix}%`);

      reportData = records.map(r => {
        let clockIn = '-';
        if (r.clock_in) {
           const d = new Date(r.clock_in);
           clockIn = isNaN(d) ? r.clock_in : d.toLocaleTimeString();
        }
        let clockOut = '-';
        if (r.clock_out) {
           const d = new Date(r.clock_out);
           clockOut = isNaN(d) ? r.clock_out : d.toLocaleTimeString();
        }

        return {
          name: `${r.first_name} ${r.last_name}`,
          date: r.date,
          clock_in: clockIn,
          clock_out: clockOut
        };
      });

      // Count unique employees
      const uniqueEmps = new Set(records.map(r => r.name)).size;
      summary = { total_employees: uniqueEmps, total_records: records.length };

    } else if (type === 'Leave Summary') {
      columns = [
        { key: 'name', label: 'Name' },
        { key: 'leave_type', label: 'Leave Type' },
        { key: 'duration_days', label: 'Days' },
        { key: 'status', label: 'Status' }
      ];

      const records = await db.all(`
        SELECT l.leave_type, l.duration_days, l.status, e.first_name, e.last_name
        FROM leaves l
        JOIN employees e ON l.employee_id = e.id
        WHERE ${empCondition}
      `, ...params);

      reportData = records.map(r => ({
        name: `${r.first_name} ${r.last_name}`,
        leave_type: r.leave_type,
        duration_days: r.duration_days,
        status: r.status
      }));

      const uniqueEmps = new Set(records.map(r => r.name)).size;
      const approvedDays = records.filter(r => r.status === 'Approved').reduce((acc, curr) => acc + curr.duration_days, 0);
      summary = { total_employees: uniqueEmps, total_approved_days: approvedDays };

    } else if (type === 'Leave Requests') {
      columns = [
        { key: 'name', label: 'Name' },
        { key: 'leave_type', label: 'Type' },
        { key: 'start_date', label: 'Start' },
        { key: 'end_date', label: 'End' },
        { key: 'status', label: 'Status' }
      ];

      const records = await db.all(`
        SELECT l.leave_type, l.start_date, l.end_date, l.status, e.first_name, e.last_name
        FROM leaves l
        JOIN employees e ON l.employee_id = e.id
        WHERE ${empCondition}
      `, ...params);

      reportData = records.map(r => ({
        name: `${r.first_name} ${r.last_name}`,
        leave_type: r.leave_type,
        start_date: formatDate(r.start_date),
        end_date: formatDate(r.end_date),
        status: r.status
      }));

      const uniqueEmps = new Set(records.map(r => r.name)).size;
      summary = { total_employees: uniqueEmps, total_requests: records.length };

    } else if (type === 'Salary') {
      columns = [
        { key: 'name', label: 'Name' },
        { key: 'basic_salary', label: 'Basic Salary' },
        { key: 'accommodation', label: 'Accommodation' },
        { key: 'transportation', label: 'Transportation' },
        { key: 'fixed_total', label: 'Fixed Total' }
      ];

      const records = await db.all(`
        SELECT e.first_name, e.last_name, e.basic_salary, e.accommodation, e.transportation
        FROM employees e
        WHERE ${empCondition}
      `, ...params);

      let totalBase = 0;
      reportData = records.map(r => {
        const fixed = (r.basic_salary || 0) + (r.accommodation || 0) + (r.transportation || 0);
        totalBase += fixed;
        return {
          name: `${r.first_name} ${r.last_name}`,
          basic_salary: r.basic_salary || 0,
          accommodation: r.accommodation || 0,
          transportation: r.transportation || 0,
          fixed_total: fixed
        };
      });

      summary = { total_employees: records.length, total_fixed_salary: totalBase };

    } else if (type === 'Deductions') {
      columns = [
        { key: 'name', label: 'Name' },
        { key: 'loan', label: 'Loan' },
        { key: 'absence', label: 'Absence' },
        { key: 'penalty', label: 'Penalty' },
        { key: 'others', label: 'Others' },
        { key: 'total_deductions', label: 'Total Deductions' }
      ];

      const records = await db.all(`
        SELECT e.first_name, e.last_name, pr.loan, pr.absence, pr.penalty, pr.others
        FROM employees e
        JOIN payroll_records pr ON e.id = pr.employee_id AND pr.month = ?
        WHERE ${empCondition} AND (pr.loan > 0 OR pr.absence > 0 OR pr.penalty > 0 OR pr.others > 0)
      `, period, ...params);

      let totalDed = 0;
      reportData = records.map(r => {
        const total = (r.loan || 0) + (r.absence || 0) + (r.penalty || 0) + (r.others || 0);
        totalDed += total;
        return {
          name: `${r.first_name} ${r.last_name}`,
          loan: r.loan || 0,
          absence: r.absence || 0,
          penalty: r.penalty || 0,
          others: r.others || 0,
          total_deductions: total
        };
      });

      summary = { total_employees: records.length, total_deductions: totalDed };

    } else if (type === 'Payroll') {
      columns = [
        { key: 'name', label: 'Name' }
      ];
      if (includes.salary) columns.push({ key: 'salary', label: 'Salary' });
      if (includes.bonus) columns.push({ key: 'bonus', label: 'Bonus' });
      if (includes.overtime) columns.push({ key: 'overtime', label: 'Overtime' });
      if (includes.deductions) columns.push({ key: 'deductions', label: 'Deductions' });
      if (includes.net_total) columns.push({ key: 'total', label: 'Total' });

      const records = await db.all(`
        SELECT e.first_name, e.last_name, 
               pr.basic_salary, pr.accommodation, pr.transportation,
               pr.bonus, pr.overtime, pr.loan, pr.absence, pr.penalty, pr.personal_expenses, pr.others
        FROM employees e
        LEFT JOIN payroll_records pr ON e.id = pr.employee_id AND pr.month = ?
        WHERE ${empCondition}
      `, period, ...params);

      let totalEarnings = 0;
      let totalDeductions = 0;
      let netPayroll = 0;

      reportData = records.map(r => {
        const fixedSalary = (r.basic_salary || 0) + (r.accommodation || 0) + (r.transportation || 0);
        const additions = (r.bonus || 0) + (r.overtime || 0);
        const deductions = (r.loan || 0) + (r.absence || 0) + (r.penalty || 0) + (r.personal_expenses || 0) + (r.others || 0);
        
        const earnings = fixedSalary + additions;
        const total = earnings - deductions;

        totalEarnings += earnings;
        totalDeductions += deductions;
        netPayroll += total;

        return {
          name: `${r.first_name} ${r.last_name}`,
          salary: fixedSalary,
          bonus: r.bonus || 0,
          overtime: r.overtime || 0,
          deductions: deductions,
          total: total
        };
      });

      summary = {
        total_employees: records.length,
        total_earnings: totalEarnings,
        total_deductions: totalDeductions,
        net_payroll: netPayroll
      };
    } else {
      // Fallback
      columns = [{ key: 'name', label: 'Name' }, { key: 'status', label: 'Status' }];
      reportData = [{ name: 'System', status: 'Under Construction' }];
      summary = { total_employees: 0, message: 'This report type is currently under construction.' };
    }

    // Log to history
    await db.run(
      'INSERT INTO report_history (report_name, report_type, format, generated_by) VALUES (?, ?, ?, ?)',
      [reportName, type, 'View', adminId || 1]
    );

    res.json({
      name: reportName,
      period,
      summary,
      columns,
      data: reportData,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Get Report History
router.get('/history', async (req, res) => {
  try {
    const db = await getDbConnection();
    const history = await db.all(`
      SELECT rh.*, e.first_name as admin_first, e.last_name as admin_last 
      FROM report_history rh
      LEFT JOIN employees e ON rh.generated_by = e.id
      ORDER BY rh.created_at DESC
      LIMIT 20
    `);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch report history' });
  }
});

// Get Saved Reports
router.get('/saved', async (req, res) => {
  try {
    const db = await getDbConnection();
    const saved = await db.all('SELECT * FROM saved_reports ORDER BY id DESC');
    if (saved.length === 0) {
      const mocks = [
        { id: 1, name: 'Monthly Payroll Report', report_type: 'Payroll', last_generated: new Date().toISOString() },
        { id: 2, name: 'Monthly Attendance Report', report_type: 'Attendance', last_generated: new Date().toISOString() },
        { id: 3, name: 'Leave Summary — Engineering', report_type: 'Leave', last_generated: new Date(Date.now() - 86400000*2).toISOString() }
      ];
      res.json(mocks);
      return;
    }
    res.json(saved);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch saved reports' });
  }
});

module.exports = router;
