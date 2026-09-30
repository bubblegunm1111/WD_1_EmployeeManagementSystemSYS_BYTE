require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./db');
const { router: authRouter } = require('./routes/auth');
const employeeRouter = require('./routes/employees');
const attendanceRouter = require('./routes/attendance');
const leaveRouter = require('./routes/leave');
const departmentsRouter = require('./routes/departments');
const teamsRouter = require('./routes/teams');
const reportsRouter = require('./routes/reports');
const tasksRouter = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes will be mounted here
app.use('/api/auth', authRouter);
app.use('/api/employees', employeeRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/leave', leaveRouter);
app.use('/api/departments', departmentsRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/payroll', require('./routes/payroll'));
app.use('/api/reports', reportsRouter);
app.use('/api/tasks', tasksRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Employee Management API is running' });
});

async function startServer() {
  try {
    await initDb();
    console.log('Database initialized successfully.');
    
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
