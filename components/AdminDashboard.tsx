import React from 'react';
import { Employee, EmployeeStatus } from '../types';

interface Props {
  employees: Employee[];
  onBack: () => void;
}

export const AdminDashboard: React.FC<Props> = ({ employees, onBack }) => {
  const getStatusColor = (status: EmployeeStatus) => {
    switch(status) {
      case EmployeeStatus.COMPLETED: return 'bg-green-100 text-green-800';
      case EmployeeStatus.EXPIRED: return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: EmployeeStatus) => {
    switch(status) {
      case EmployeeStatus.COMPLETED: return 'Erledigt';
      case EmployeeStatus.EXPIRED: return 'Überfällig';
      default: return 'Offen';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Unterweisungs-Übersicht</h1>
            <p className="text-slate-500">Mustermann GmbH & Co. KG</p>
          </div>
          <button onClick={onBack} className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Abmelden
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <p className="text-slate-500 text-sm font-medium">Quote gesamt</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">
              {Math.round((employees.filter(e => e.status === EmployeeStatus.COMPLETED).length / employees.length) * 100)}%
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
             <p className="text-slate-500 text-sm font-medium">Offene Aufgaben</p>
             <p className="text-3xl font-bold text-yellow-600 mt-1">
              {employees.filter(e => e.status === EmployeeStatus.OPEN).length}
             </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
             <p className="text-slate-500 text-sm font-medium">Überfällig</p>
             <p className="text-3xl font-bold text-red-600 mt-1">
              {employees.filter(e => e.status === EmployeeStatus.EXPIRED).length}
             </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Mitarbeiter</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Abteilung</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Fällig</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-slate-900">{emp.name}</div>
                    <div className="text-xs text-slate-500 sm:hidden">{emp.role}</div>
                  </td>
                  <td className="p-4 hidden sm:table-cell text-slate-600">{emp.department}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(emp.status)}`}>
                      {getStatusText(emp.status)}
                    </span>
                  </td>
                  <td className="p-4 text-right text-slate-600 font-mono text-sm">
                    {new Date(emp.dueDate).toLocaleDateString('de-DE')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
