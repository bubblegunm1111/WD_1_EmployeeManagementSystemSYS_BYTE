import React, { useState, useEffect } from 'react';
import TasksList from '../TasksList';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import toast from 'react-hot-toast';

export default function MyTasks() {
  const { user } = useAuth();
  const [employeeId, setEmployeeId] = useState(null);
  const [employeeName, setEmployeeName] = useState('');

  useEffect(() => {
    if (user?.email) {
      api.get(`/employees/by-email?email=${encodeURIComponent(user.email)}`)
        .then(res => {
          setEmployeeId(res.data.id);
          setEmployeeName(res.data.first_name);
        })
        .catch(() => {
          toast.error("Could not find employee profile");
        });
    }
  }, [user]);

  if (!employeeId) {
    return <div className="flex h-full w-full bg-[#fdfcfa] items-center justify-center font-bold text-gray-500">Loading profile...</div>;
  }

  return (
    <div className="flex h-full w-full bg-[#fdfcfa] overflow-hidden">
      <div className="flex-1 flex flex-col px-8 py-8 h-full custom-scrollbar overflow-y-auto">
        <TasksList employeeId={employeeId} isAdmin={false} employeeName={employeeName} />
      </div>
    </div>
  );
}
