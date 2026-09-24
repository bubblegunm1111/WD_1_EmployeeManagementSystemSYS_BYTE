import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreHorizontal, Users, Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../api';

function DepartmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dept, setDept] = useState(null);
  const [teams, setTeams] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isEditDeptOpen, setIsEditDeptOpen] = useState(false);
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false);
  const [isAddEmpOpen, setIsAddEmpOpen] = useState(false);
  const [editDeptData, setEditDeptData] = useState({});
  const [teamData, setTeamData] = useState({ name: '', manager_id: '', employee_ids: [] });
  const [selectedEmpId, setSelectedEmpId] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [deptRes, teamsRes, empRes, allEmpRes] = await Promise.all([
        api.get(`/departments/${id}`),
        api.get(`/departments/${id}/teams`),
        api.get(`/departments/${id}/employees`),
        api.get('/employees') // Fetch all employees for assignment dropdowns
      ]);
      setDept(deptRes.data);
      setTeams(teamsRes.data);
      setEmployees(empRes.data);
      setAllEmployees(allEmpRes.data);
      setEditDeptData(deptRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditDept = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/departments/${id}`, editDeptData);
      setIsEditDeptOpen(false);
      fetchData();
    } catch (err) {
      alert("Failed to update department");
    }
  };

  const handleAddTeam = async (e) => {
    e.preventDefault();
    try {
      await api.post('/teams', { ...teamData, department_id: id });
      setIsAddTeamOpen(false);
      setTeamData({ name: '', manager_id: '', employee_ids: [] });
      fetchData();
    } catch (err) {
      alert("Failed to create team");
    }
  };

  const handleAssignEmployee = async (e) => {
    e.preventDefault();
    if (!selectedEmpId) return;
    try {
      // Get current employee data first to preserve other fields
      const empToUpdate = allEmployees.find(e => e.id === parseInt(selectedEmpId));
      if (empToUpdate) {
        await api.put(`/employees/${selectedEmpId}`, {
          ...empToUpdate,
          department_id: id,
          team_id: null,
          manager_id: dept.manager_id // default to department manager
        });
        setIsAddEmpOpen(false);
        setSelectedEmpId('');
        fetchData();
      }
    } catch (err) {
      alert("Failed to assign employee");
    }
  };

  if (loading) {
    return <div className="flex justify-center mt-20"><div className="w-8 h-8 border-4 border-[#8b8cf8] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!dept) {
    return <div className="p-8 text-center text-gray-500">Department not found</div>;
  }

  return (
    <div className="flex h-full w-full bg-[#fdfcfa] overflow-hidden">
      <div className="flex-1 flex flex-col overflow-y-auto px-8 py-6 max-w-[1200px] mx-auto custom-scrollbar">
        
        {/* Breadcrumb & Header */}
        <div className="mb-8">
          <button onClick={() => navigate('/admin/departments')} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-800 transition mb-4">
            <ArrowLeft size={16} /> Departments
          </button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-extrabold text-[#1e293b] tracking-tight mb-2">{dept.name}</h1>
              <span className="text-sm font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{dept.name} Department</span>
            </div>
            
            <div className="relative group">
              <button onClick={() => setIsEditDeptOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-700 hover:bg-gray-50 shadow-sm transition">
                <Edit2 size={16} /> Edit Department
              </button>
            </div>
          </div>
        </div>

        {/* Info Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Department Manager</span>
            <div className="font-extrabold text-sm text-[#1e293b]">
              {dept.manager_first_name ? `${dept.manager_first_name} ${dept.manager_last_name}` : 'Unassigned'}
            </div>
            {dept.manager_first_name && <div className="text-xs text-gray-500 mt-1">Manager</div>}
          </div>
          
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Department Code</span>
            <div className="font-extrabold text-sm text-[#4f46e5] bg-[#e0e7ff] w-fit px-3 py-1 rounded-lg">
              {dept.code || 'None'}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Location</span>
            <div className="font-extrabold text-sm text-[#1e293b]">
              {dept.location || 'Remote'}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Created</span>
            <div className="font-extrabold text-sm text-[#1e293b]">
              {new Date(dept.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Teams Section */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-extrabold text-[#1e293b]">Teams</h2>
            <button onClick={() => setIsAddTeamOpen(true)} className="flex items-center gap-1.5 text-sm font-bold text-[#4f46e5] hover:text-[#4338ca] transition bg-[#e0e7ff] px-3 py-1.5 rounded-lg">
              <Plus size={16} /> Add Team
            </button>
          </div>
          
          {teams.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-3xl p-10 text-center shadow-sm">
              <p className="text-gray-400 font-medium text-sm">No teams have been created yet.</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">Team</th>
                    <th className="px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">Manager</th>
                    <th className="px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">Employees</th>
                    <th className="px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {teams.map(team => (
                    <tr key={team.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-bold text-sm text-[#1e293b]">{team.name}</td>
                      <td className="px-6 py-4 font-medium text-sm text-gray-600">
                        {team.manager_first_name ? `${team.manager_first_name} ${team.manager_last_name}` : 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-600">
                        {team.employee_count}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-gray-400 hover:text-[#4f46e5] transition p-1">
                          <Edit2 size={16} />
                        </button>
                        <button className="text-gray-400 hover:text-red-500 transition p-1 ml-2">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Employees Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-extrabold text-[#1e293b]">Employees</h2>
              <span className="bg-gray-100 text-gray-500 font-bold text-xs px-2.5 py-0.5 rounded-full">{employees.length}</span>
            </div>
            <button onClick={() => setIsAddEmpOpen(true)} className="flex items-center gap-1.5 text-sm font-bold text-white bg-[#1a1a1a] hover:bg-[#333333] transition px-4 py-2 rounded-xl shadow-sm">
              <Plus size={16} /> Add Employee
            </button>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">Manager</th>
                  <th className="px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#f3e8ff] text-[#9333ea] font-bold text-xs flex items-center justify-center border border-[#e9d5ff]">
                          {emp.first_name.charAt(0)}
                        </div>
                        <span className="font-bold text-sm text-[#1e293b]">{emp.first_name} {emp.last_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-sm text-gray-600">{emp.position}</td>
                    <td className="px-6 py-4 font-medium text-sm text-gray-600">
                      {emp.manager_first_name ? `${emp.manager_first_name} ${emp.manager_last_name}` : 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 font-medium text-sm text-gray-500">
                      {new Date(emp.hire_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-gray-800 transition px-3 py-1 rounded-lg text-xs font-bold border border-gray-200">
                        Move
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
      {/* Modals */}
      
      {/* Edit Department Modal */}
      {isEditDeptOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-extrabold text-[#1e293b] mb-6">Edit Department</h2>
            <form onSubmit={handleEditDept} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Department Name</label>
                <input type="text" required value={editDeptData.name || ''} onChange={e => setEditDeptData({...editDeptData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8b8cf8] outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Code</label>
                  <input type="text" value={editDeptData.code || ''} onChange={e => setEditDeptData({...editDeptData, code: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8b8cf8] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Location</label>
                  <input type="text" value={editDeptData.location || ''} onChange={e => setEditDeptData({...editDeptData, location: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8b8cf8] outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Department Manager</label>
                <select value={editDeptData.manager_id || ''} onChange={e => setEditDeptData({...editDeptData, manager_id: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8b8cf8] outline-none bg-white">
                  <option value="">Unassigned</option>
                  {allEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.position})</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsEditDeptOpen(false)} className="px-5 py-2 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-[#4f46e5] text-white font-bold rounded-xl shadow-sm hover:bg-[#4338ca] transition">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Team Modal */}
      {isAddTeamOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-extrabold text-[#1e293b] mb-6">Create New Team</h2>
            <form onSubmit={handleAddTeam} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Team Name <span className="text-red-500">*</span></label>
                <input type="text" required value={teamData.name} onChange={e => setTeamData({...teamData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8b8cf8] outline-none" placeholder="e.g. Frontend Team" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Team Manager</label>
                <select value={teamData.manager_id} onChange={e => setTeamData({...teamData, manager_id: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8b8cf8] outline-none bg-white">
                  <option value="">Select a manager (optional)</option>
                  {allEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.position})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Assign Employees</label>
                <div className="bg-gray-50 border border-gray-200 rounded-xl max-h-40 overflow-y-auto p-2 custom-scrollbar">
                  {allEmployees.length === 0 ? (
                    <p className="text-xs text-gray-400 p-2 text-center">No employees found.</p>
                  ) : (
                    allEmployees.map(emp => (
                      <label key={emp.id} className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-gray-300 text-[#4f46e5] focus:ring-[#4f46e5]"
                          checked={teamData.employee_ids.includes(emp.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTeamData({ ...teamData, employee_ids: [...teamData.employee_ids, emp.id] });
                            } else {
                              setTeamData({ ...teamData, employee_ids: teamData.employee_ids.filter(id => id !== emp.id) });
                            }
                          }}
                        />
                        <div>
                          <p className="text-sm font-bold text-[#1e293b]">{emp.first_name} {emp.last_name}</p>
                          <p className="text-xs text-gray-500">{emp.position}</p>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsAddTeamOpen(false)} className="px-5 py-2 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-[#4f46e5] text-white font-bold rounded-xl shadow-sm hover:bg-[#4338ca] transition">Create Team</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Employee Modal */}
      {isAddEmpOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-extrabold text-[#1e293b] mb-6">Assign Employee to {dept.name}</h2>
            <form onSubmit={handleAssignEmployee} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Select Employee</label>
                <select required value={selectedEmpId} onChange={e => setSelectedEmpId(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8b8cf8] outline-none bg-white">
                  <option value="">-- Choose an existing employee --</option>
                  {allEmployees.filter(emp => emp.department_id !== dept.id).map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.position})</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-2">Only employees not currently in this department are shown.</p>
              </div>
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsAddEmpOpen(false)} className="px-5 py-2 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-[#1a1a1a] text-white font-bold rounded-xl shadow-sm hover:bg-[#333333] transition">Assign</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DepartmentDetails;
