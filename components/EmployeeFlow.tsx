import React, { useState, useEffect } from 'react';
import { Employee, EmployeeStatus, SafetyContent } from '../types';
import { generateSafetyBriefing, fallbackContent } from '../services/geminiService';

interface Props {
  employee: Employee;
  onComplete: (employeeId: string) => void;
  onBack: () => void;
}

export const EmployeeFlow: React.FC<Props> = ({ employee, onComplete, onBack }) => {
  const [step, setStep] = useState<'welcome' | 'learning' | 'confirm' | 'certificate'>('welcome');
  const [content, setContent] = useState<SafetyContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (step === 'learning' && !content) {
      setLoading(true);
      generateSafetyBriefing(employee.role, employee.department)
        .then(setContent)
        .catch(() => setContent(fallbackContent))
        .finally(() => setLoading(false));
    }
  }, [step, employee, content]);

  const handlePrint = () => {
    window.print();
  };

  // Screen 1: Welcome / Task Overview
  if (step === 'welcome') {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-white flex flex-col p-6">
        <header className="mb-8 mt-4">
          <button onClick={onBack} className="text-gray-500 text-sm mb-4">← Zurück</button>
          <h1 className="text-2xl font-bold text-slate-900">Moin, {employee.name.split(' ')[0]}!</h1>
          <p className="text-slate-600 mt-2">Du hast 1 offene Sicherheits-Unterweisung.</p>
        </header>

        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 shadow-sm mb-auto">
          <div className="flex justify-between items-start mb-4">
            <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">Pflicht</span>
            <span className="text-slate-400 text-xs">Fällig: Heute</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Arbeitssicherheit: {employee.role}</h2>
          <p className="text-slate-600 text-sm mb-6">Dauer: ca. 60 Sekunden</p>
          
          <button 
            onClick={() => setStep('learning')}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-semibold active:scale-95 transition-transform"
          >
            Jetzt starten
          </button>
        </div>
        
        <p className="text-xs text-center text-slate-400 mt-8">SafetyFirst v1.0 • Keine App-Installation nötig</p>
      </div>
    );
  }

  // Screen 2: Learning Content
  if (step === 'learning') {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col">
        <div className="flex-1 p-6 pb-24 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
              <p className="text-slate-500 animate-pulse">Lade Inhalte für {employee.role}...</p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">{content?.title}</h2>
                <p className="text-lg text-slate-700 leading-relaxed mb-6">{content?.intro}</p>
                
                <div className="bg-slate-100 rounded-xl p-4 mb-6 flex items-center justify-center h-48">
                  {/* Placeholder for Video/Image */}
                  <div className="text-center text-slate-400">
                    <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="text-sm font-medium">Lernvideo (Demo-Modus)</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-slate-900 uppercase tracking-wider text-sm">Die 3 wichtigsten Regeln:</h3>
                  {content?.steps.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-start">
                      <div className="bg-blue-100 text-blue-700 font-bold w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </div>
                      <p className="text-slate-700 font-medium pt-1">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <label className="flex items-center gap-4 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="w-6 h-6 text-green-600 rounded focus:ring-green-500 border-gray-300" 
                  />
                  <span className="text-slate-700 font-medium text-sm leading-tight">
                    Ich habe die Inhalte verstanden und werde sie einhalten.
                  </span>
                </label>
              </div>
            </>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 max-w-md mx-auto">
          <button 
            disabled={!confirmed || loading}
            onClick={() => {
              onComplete(employee.id);
              setStep('confirm');
            }}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-colors ${
              confirmed && !loading 
                ? 'bg-green-600 text-white shadow-lg shadow-green-200' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            Bestätigen & Abschließen
          </button>
        </div>
      </div>
    );
  }

  // Screen 3: Success
  if (step === 'confirm') {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-green-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Klasse, {employee.name.split(' ')[0]}!</h2>
        <p className="text-slate-600 mb-8">Deine Unterweisung wurde erfolgreich gespeichert.</p>

        <button 
          onClick={() => setStep('certificate')}
          className="w-full bg-white text-slate-900 border border-slate-200 py-4 rounded-xl font-semibold shadow-sm mb-3"
        >
          Nachweis anzeigen (PDF)
        </button>
        
        <button 
          onClick={onBack}
          className="text-slate-500 text-sm py-2"
        >
          Zurück zur Startseite
        </button>
      </div>
    );
  }

  // Screen 4: Certificate View (Printable)
  if (step === 'certificate') {
    const dateStr = new Date().toLocaleDateString('de-DE');
    return (
      <div className="min-h-screen bg-slate-800 p-4 flex flex-col items-center">
        <div id="certificate-area" className="bg-white w-full max-w-[210mm] aspect-[1/1.414] p-8 shadow-2xl relative flex flex-col text-slate-900">
           {/* Simple Certificate Layout */}
           <div className="border-4 border-slate-900 h-full p-6 flex flex-col">
              <div className="text-center border-b-2 border-slate-100 pb-6 mb-8">
                <h1 className="text-3xl font-bold text-slate-900 uppercase tracking-widest mb-2">Unterweisungs-Nachweis</h1>
                <p className="text-slate-500 text-sm">Gemäß § 12 ArbSchG</p>
              </div>

              <div className="flex-1 space-y-8">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Mitarbeiter</p>
                  <p className="text-2xl font-bold">{employee.name}</p>
                  <p className="text-lg text-slate-600">{employee.role}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Unterweisungsthema</p>
                  <p className="text-xl font-bold">{content?.title || "Sicherheit am Arbeitsplatz"}</p>
                  <p className="text-slate-600">Digitale Erstunterweisung</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Datum</p>
                    <p className="font-mono text-lg">{dateStr}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Status</p>
                    <p className="text-green-600 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                      Erfolgreich absolviert
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded text-xs text-slate-400 font-mono mt-8 break-all">
                  Digitale Signatur: {Math.random().toString(36).substring(7).toUpperCase()}-{Math.random().toString(36).substring(7).toUpperCase()}
                  <br/>Version: v2024.1
                </div>
              </div>

              <div className="mt-auto pt-8 border-t border-slate-100 flex justify-between items-end">
                <div>
                  <div className="h-10 w-32 border-b border-slate-300 mb-1"></div>
                  <p className="text-xs text-slate-400">Unterschrift Arbeitgeber</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-300">SafetyFirst System</div>
                </div>
              </div>
           </div>
        </div>

        <div className="fixed bottom-6 flex gap-4 print:hidden">
          <button 
            onClick={handlePrint}
            className="bg-white text-slate-900 px-6 py-3 rounded-full font-bold shadow-lg"
          >
            PDF speichern / Drucken
          </button>
          <button 
            onClick={() => setStep('confirm')}
            className="bg-slate-700 text-white px-6 py-3 rounded-full font-bold shadow-lg"
          >
            Schließen
          </button>
        </div>
        
        <style>{`
          @media print {
            body * { visibility: hidden; }
            #certificate-area, #certificate-area * { visibility: visible; }
            #certificate-area { position: absolute; left: 0; top: 0; width: 100%; height: 100%; margin: 0; padding: 0; box-shadow: none; }
            .print\\:hidden { display: none !important; }
          }
        `}</style>
      </div>
    );
  }

  return null;
};
