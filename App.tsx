import React, { useState } from 'react';
import { Employee, EmployeeStatus } from './types';
import { EmployeeFlow } from './components/EmployeeFlow';
import { AdminDashboard } from './components/AdminDashboard';

// Mock Data
const INITIAL_EMPLOYEES: Employee[] = [
  { id: '1', name: 'Max Mustermann', role: 'Lagerist', department: 'Logistik', status: EmployeeStatus.OPEN, dueDate: '2024-10-30' },
  { id: '2', name: 'Lisa Müller', role: 'Maschinenführerin', department: 'Produktion', status: EmployeeStatus.COMPLETED, lastTrainingDate: '2024-05-12', dueDate: '2025-05-12' },
  { id: '3', name: 'Klaus Schmidt', role: 'Vorarbeiter', department: 'Bau', status: EmployeeStatus.EXPIRED, lastTrainingDate: '2023-01-01', dueDate: '2024-01-01' },
];

function App() {
  const [view, setView] = useState<'selector' | 'employee' | 'admin'>('selector');
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);

  const handleEmployeeComplete = (id: string) => {
    setEmployees(prev => prev.map(e => 
      e.id === id ? { ...e, status: EmployeeStatus.COMPLETED, lastTrainingDate: new Date().toISOString() } : e
    ));
  };

  const handleUserSelect = (emp: Employee) => {
    setCurrentUser(emp);
    setView('employee');
  };

  if (view === 'selector') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-slate-100 p-6 border-b border-slate-200 text-center">
            <h1 className="text-2xl font-bold text-slate-800">SafetyFirst</h1>
            <p className="text-slate-500 text-sm">Bitte Zugang wählen</p>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Mitarbeiter Login (Demo)</h2>
              <div className="space-y-2">
                {employees.map(emp => (
                  <button 
                    key={emp.id}
                    onClick={() => handleUserSelect(emp)}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all group text-left"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{emp.name}</div>
                      <div className="text-xs text-slate-500">{emp.role}</div>
                    </div>
                    {emp.status === EmployeeStatus.OPEN && (
                      <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
               <button 
                  onClick={() => setView('admin')}
                  className="w-full p-4 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-700 transition-colors"
                >
                  Als Arbeitgeber verwalten
                </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'employee' && currentUser) {
    // We pass the potentially updated employee object from the state
    const currentEmployeeState = employees.find(e => e.id === currentUser.id) || currentUser;
    return (
      <EmployeeFlow 
        employee={currentEmployeeState} 
        onComplete={handleEmployeeComplete}
        onBack={() => setView('selector')}
      />
    );
  }

  if (view === 'admin') {
    return (
      <AdminDashboard 
        employees={employees} 
        onBack={() => setView('selector')}
      />
    );
  }

  return null;
}

export default App;
