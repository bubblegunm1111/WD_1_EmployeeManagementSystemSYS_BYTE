import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './components/Dashboard';
import AdminOverview from './components/AdminOverview';
import Departments from './components/Departments';
import PlaceholderPage from './components/PlaceholderPage';
import EmployeeDashboard from './components/EmployeeDashboard';
import EmployeeAttendance from './components/EmployeeAttendance';
import EmployeeLeave from './components/EmployeeLeave';
import ForcePasswordReset from './components/ForcePasswordReset';
import EmployeeOnboarding from './components/employee/EmployeeOnboarding';
import Login from './components/Login';
import Welcome from './components/Welcome';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Leave from './components/Leave';
import Attendance from './components/Attendance';
import DepartmentDetails from './components/DepartmentDetails';
import Payroll from './components/Payroll';
import PayrollDetails from './components/PayrollDetails';
import EmployeePayroll from './components/employee/EmployeePayroll';
import MyTasks from './components/employee/MyTasks';
import MySchedule from './components/employee/MySchedule';
import MyDocuments from './components/employee/MyDocuments';
import MyTraining from './components/employee/MyTraining';
import MyEquipment from './components/employee/MyEquipment';
import EmployeeSettings from './components/employee/EmployeeSettings';
import EmployeeProfile from './components/employee/EmployeeProfile';
import Reports from './components/Reports';
import Settings from './components/Settings';

const ProtectedRoute = ({ children, allowedRole, allowedRoles }) => {
  const { user, role, loading } = useAuth();
  
  if (loading) return null; // Or a loading spinner
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && role !== allowedRole) {
    return <Navigate to={role === 'admin' ? '/admin' : '/employee'} replace />;
  }
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={role === 'admin' ? '/admin' : '/employee'} replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/login" element={<Login />} />
      <Route path="/force-reset" element={
        <ProtectedRoute allowedRoles={['employee', 'admin']}>
          <ForcePasswordReset />
        </ProtectedRoute>
      } />
      <Route path="/onboarding" element={
        <ProtectedRoute allowedRoles={['employee']}>
          <EmployeeOnboarding />
        </ProtectedRoute>
      } />

      {/* Wrapped Routes */}
      <Route element={<Layout />}>
        <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AdminOverview /></ProtectedRoute>} />
        <Route path="/admin/employees" element={<ProtectedRoute allowedRole="admin"><Dashboard /></ProtectedRoute>} />
        <Route path="/admin/departments" element={<ProtectedRoute allowedRole="admin"><Departments /></ProtectedRoute>} />
        <Route path="/admin/departments/:id" element={<ProtectedRoute allowedRole="admin"><DepartmentDetails /></ProtectedRoute>} />
        <Route path="/admin/attendance" element={<ProtectedRoute allowedRole="admin"><Attendance /></ProtectedRoute>} />
        <Route path="/admin/leave" element={<ProtectedRoute allowedRole="admin"><Leave /></ProtectedRoute>} />
        <Route path="/admin/payroll" element={<ProtectedRoute allowedRole="admin"><Payroll /></ProtectedRoute>} />
        <Route path="/admin/payroll/:id" element={<ProtectedRoute allowedRole="admin"><PayrollDetails /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute allowedRole="admin"><Reports /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute allowedRole="admin"><Settings /></ProtectedRoute>} />

        <Route path="/employee" element={<ProtectedRoute allowedRole="employee"><EmployeeDashboard /></ProtectedRoute>} />
        <Route path="/employee/profile" element={<ProtectedRoute allowedRole="employee"><EmployeeProfile /></ProtectedRoute>} />
        
        <Route path="/employee/tasks" element={<ProtectedRoute allowedRole="employee"><MyTasks /></ProtectedRoute>} />
        <Route path="/employee/schedule" element={<ProtectedRoute allowedRole="employee"><MySchedule /></ProtectedRoute>} />
        <Route path="/employee/documents" element={<ProtectedRoute allowedRole="employee"><MyDocuments /></ProtectedRoute>} />
        <Route path="/employee/training" element={<ProtectedRoute allowedRole="employee"><MyTraining /></ProtectedRoute>} />
        <Route path="/employee/equipment" element={<ProtectedRoute allowedRole="employee"><MyEquipment /></ProtectedRoute>} />
        
        <Route path="/employee/attendance" element={<ProtectedRoute allowedRole="employee"><EmployeeAttendance /></ProtectedRoute>} />
        <Route path="/employee/leave" element={<ProtectedRoute allowedRole="employee"><EmployeeLeave /></ProtectedRoute>} />
        <Route path="/employee/payroll" element={<ProtectedRoute allowedRole="employee"><EmployeePayroll /></ProtectedRoute>} />
        
        <Route path="/employee/settings" element={<ProtectedRoute allowedRole="employee"><EmployeeSettings /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-center" reverseOrder={false} />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
