import React, { useState, useEffect } from 'react';
import { Employee, EmployeeStatus, SafetyContent } from '../types';
import { generateSafetyBriefing, fallbackContent } from '../services/geminiService';

interface Props {
  employee: Employee;
  onComplete: (employeeId: string) => void;
  onBack: () => void;
}

export const EmployeeFlow: React.FC<Props> = ({ employee, onComplete, onBack }) => {
  // Added 'quiz' step
  const [step, setStep] = useState<'welcome' | 'learning' | 'quiz' | 'confirm' | 'certificate'>('welcome');
  const [content, setContent] = useState<SafetyContent | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]); // Stores index of selected answer per question
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);

  const [confirmed, setConfirmed] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    if (step === 'learning' && !content) {
      setLoading(true);
      generateSafetyBriefing(employee.role, employee.department)
        .then((data) => {
            setContent(data);
            // Initialize quiz answers with -1 (unselected)
            if(data.quiz) {
                setQuizAnswers(new Array(data.quiz.length).fill(-1));
            }
        })
        .catch(() => {
            setContent(fallbackContent);
            setQuizAnswers(new Array(fallbackContent.quiz.length).fill(-1));
        })
        .finally(() => setLoading(false));
    }
  }, [step, employee, content]);

  const handlePrint = () => {
    window.print();
  };

  const handleQuizSelect = (questionIndex: number, optionIndex: number) => {
    if (quizSubmitted && quizPassed) return; // Prevent changing after passing
    const newAnswers = [...quizAnswers];
    newAnswers[questionIndex] = optionIndex;
    setQuizAnswers(newAnswers);
    setQuizSubmitted(false); // Reset submit state if user changes answer to retry
  };

  const checkQuiz = () => {
    if (!content?.quiz) return;
    setQuizSubmitted(true);
    
    const allCorrect = content.quiz.every((q, i) => q.correctIndex === quizAnswers[i]);
    if (allCorrect) {
        setQuizPassed(true);
    } else {
        setQuizPassed(false);
    }
  };

  // Screen 1: Welcome / Task Overview
  if (step === 'welcome') {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-white flex flex-col p-6 print:hidden">
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
          <p className="text-slate-600 text-sm mb-6">Dauer: ca. 2 Minuten (inkl. Quiz)</p>
          
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
      <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col print:hidden">
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
                
                {/* VIDEO PLAYER */}
                <div className="mb-6">
                  <div className="relative rounded-xl overflow-hidden shadow-sm bg-black aspect-video">
                    <video 
                      controls 
                      playsInline
                      className="w-full h-full object-cover"
                      poster="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=1000"
                    >
                      <source src="https://cdn.pixabay.com/video/2020/04/17/36466-409156711_small.mp4" type="video/mp4" />
                      <track 
                        kind="captions" 
                        srcLang="de" 
                        label="Deutsch" 
                        default
                        src="data:text/vtt;charset=utf-8,WEBVTT%0A%0A00:00.000%20--%3E%2000:05.000%0ADies%20ist%20eine%20Demonstration%20der%20Sicherheitsunterweisung." 
                      />
                      Dein Browser unterstützt dieses Video nicht.
                    </video>
                  </div>
                  
                  <div className="flex justify-between items-start mt-3">
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Video abspielen
                    </p>
                    <button 
                      onClick={() => setShowTranscript(!showTranscript)}
                      className="text-xs text-blue-600 font-medium hover:text-blue-800 flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded px-1"
                      aria-expanded={showTranscript}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      {showTranscript ? 'Transkript verbergen' : 'Transkript anzeigen'}
                    </button>
                  </div>

                  {showTranscript && (
                    <div className="mt-3 bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-700">
                      <h4 className="font-bold text-slate-900 mb-2">Video-Inhalt (Transkript)</h4>
                      <p className="italic mb-3">"{content?.intro}"</p>
                      <p className="font-semibold mb-1">Wichtige Schritte:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        {content?.steps.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}
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
            </>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 max-w-md mx-auto z-10">
          <button 
            disabled={loading}
            onClick={() => setStep('quiz')}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 active:scale-95 transition-all"
          >
            Zum Wissens-Check →
          </button>
        </div>
      </div>
    );
  }

  // Screen 2.5: Quiz
  if (step === 'quiz') {
    return (
        <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col print:hidden">
            <div className="flex-1 p-6 pb-24 overflow-y-auto">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">Kurzer Check</h2>
                    <p className="text-slate-600">Beantworte 3 Fragen richtig, um fortzufahren.</p>
                </div>

                <div className="space-y-6">
                    {content?.quiz.map((q, qIdx) => {
                        const isCorrectlyAnswered = quizSubmitted && quizAnswers[qIdx] === q.correctIndex;
                        const isWronglyAnswered = quizSubmitted && quizAnswers[qIdx] !== q.correctIndex;

                        return (
                            <div key={qIdx} className={`bg-white p-6 rounded-2xl shadow-sm border-2 transition-colors ${
                                isWronglyAnswered ? 'border-red-100' : isCorrectlyAnswered ? 'border-green-100' : 'border-transparent'
                            }`}>
                                <h3 className="font-bold text-slate-900 mb-4">{qIdx + 1}. {q.question}</h3>
                                <div className="space-y-2">
                                    {q.options.map((opt, oIdx) => (
                                        <button
                                            key={oIdx}
                                            disabled={quizPassed}
                                            onClick={() => handleQuizSelect(qIdx, oIdx)}
                                            className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${
                                                quizAnswers[qIdx] === oIdx 
                                                    ? 'bg-blue-50 border-blue-500 text-blue-900 font-medium' 
                                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                            }`}
                                        >
                                            {opt}
                                            {quizSubmitted && q.correctIndex === oIdx && (
                                                 <span className="float-right text-green-600 font-bold">✓</span>
                                            )}
                                            {quizSubmitted && quizAnswers[qIdx] === oIdx && q.correctIndex !== oIdx && (
                                                 <span className="float-right text-red-600 font-bold">✗</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                                {isWronglyAnswered && (
                                    <p className="text-red-600 text-xs mt-3 font-medium">Leider falsch. Bitte noch einmal versuchen.</p>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 max-w-md mx-auto z-10">
                {!quizPassed ? (
                    <button 
                        onClick={checkQuiz}
                        disabled={quizAnswers.includes(-1)}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                            quizAnswers.includes(-1)
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-slate-900 text-white shadow-lg'
                        }`}
                    >
                        Antworten prüfen
                    </button>
                ) : (
                    <button 
                        onClick={() => setStep('confirm')}
                        className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-200 animate-pulse"
                    >
                        Weiter zur Bestätigung
                    </button>
                )}
            </div>
        </div>
    )
  }

  // Screen 3: Final Confirmation
  if (step === 'confirm') {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col p-6 print:hidden">
          <div className="flex-1 flex flex-col justify-center">
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Fast geschafft!</h2>
                <div className="flex items-center gap-3 text-green-700 bg-green-50 p-4 rounded-lg mb-6">
                    <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="text-sm font-medium">Video gesehen & Quiz bestanden</span>
                </div>

                <p className="text-slate-600 mb-6 text-sm">
                    Bitte bestätige abschließend, dass du die Inhalte für <strong>{employee.role}</strong> verstanden hast und im Arbeitsalltag anwendest.
                </p>

                <label className="flex items-start gap-4 cursor-pointer p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="w-6 h-6 mt-0.5 text-green-600 rounded focus:ring-green-500 border-gray-300" 
                  />
                  <span className="text-slate-900 font-bold text-sm leading-tight">
                    Ich bestätige hiermit rechtsverbindlich die Teilnahme an der Unterweisung.
                  </span>
                </label>
            </div>
          </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 max-w-md mx-auto">
          <button 
            disabled={!confirmed || loading}
            onClick={() => {
              onComplete(employee.id);
              // Instead of confirm screen, go directly to certificate/success view logic which was previously combined or separate. 
              // Based on previous code flow, we might want to show a success message first.
              // Let's reuse the logic: confirm step -> success view
              setStep('certificate'); // Or creating a dedicated success view if needed, but certificate view acts as success.
            }}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-colors ${
              confirmed && !loading 
                ? 'bg-green-600 text-white shadow-lg shadow-green-200' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            Abschließen & Zertifikat
          </button>
        </div>
      </div>
    );
  }

  // Screen 4: Certificate View (Printable) - acts as Success View too
  if (step === 'certificate') {
    const dateStr = new Date().toLocaleDateString('de-DE');
    return (
      <div className="min-h-screen bg-green-50 p-4 flex flex-col items-center print:p-0 print:bg-white">
        
        {/* Success Message (Hidden on Print) */}
        <div className="w-full max-w-2xl mb-8 print:hidden text-center pt-8">
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Glückwunsch, {employee.name.split(' ')[0]}!</h2>
            <p className="text-slate-600">Deine Unterweisung ist gültig bis {new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('de-DE')}.</p>
        </div>

        {/* Actions Bar (Hidden on Print) */}
        <div className="w-full max-w-2xl flex flex-col sm:flex-row gap-3 justify-center items-center mb-8 print:hidden">
          <button onClick={handlePrint} className="w-full sm:w-auto bg-slate-900 text-white px-6 py-3 rounded-xl font-bold shadow hover:bg-slate-800 flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            PDF Speichern
          </button>
           <button onClick={onBack} className="w-full sm:w-auto bg-white text-slate-700 border border-slate-200 px-6 py-3 rounded-xl font-medium hover:bg-slate-50">
            Zurück zur Übersicht
          </button>
        </div>

        {/* Certificate Paper */}
        <div id="certificate-area" className="bg-white w-full max-w-[210mm] aspect-[1/1.414] shadow-2xl p-8 sm:p-12 relative print:shadow-none print:w-full print:h-screen print:max-w-none print:aspect-auto">
          
          <div className="border-4 border-slate-900 h-full p-6 flex flex-col">
            
            <header className="flex justify-between items-end border-b-2 border-slate-100 pb-8 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 uppercase tracking-widest">Zertifikat</h1>
                <p className="text-slate-500 mt-1">Sicherheitsunterweisung nach §12 ArbSchG</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-300">SafetyFirst</div>
              </div>
            </header>

            <main className="flex-1">
              <p className="text-lg text-slate-600 mb-2">Hiermit wird bestätigt, dass</p>
              <h2 className="text-4xl font-bold text-slate-900 mb-2">{employee.name}</h2>
              <p className="text-xl text-slate-600 mb-12">{employee.role} | {employee.department}</p>

              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 mb-8">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Unterweisungsinhalte</h3>
                <p className="text-xl font-semibold text-slate-900 mb-2">{content?.title || 'Allgemeine Arbeitssicherheit'}</p>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  {content?.steps.map((s, i) => (
                    <li key={i}>{s}</li>
                  )) || (
                    <li>Grundlagen der Arbeitssicherheit</li>
                  )}
                </ul>
                <div className="mt-4 pt-4 border-t border-slate-200 text-sm text-green-700 font-medium flex items-center gap-2">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     Wissens-Check erfolgreich bestanden
                </div>
              </div>

              <div className="flex gap-8 text-sm text-slate-500">
                <div>
                  <span className="block font-bold uppercase text-xs mb-1">Datum</span>
                  {dateStr}
                </div>
                <div>
                  <span className="block font-bold uppercase text-xs mb-1">Status</span>
                  Erfolgreich absolviert
                </div>
                <div>
                  <span className="block font-bold uppercase text-xs mb-1">Gültig bis</span>
                  {new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('de-DE')}
                </div>
              </div>
            </main>

            <footer className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-end">
              <div>
                <div className="h-12 w-48 mb-2 flex items-end">
                   <span className="font-handwriting text-2xl text-slate-800 italic" style={{fontFamily: 'cursive'}}>
                     Digitally Signed: {employee.id}
                   </span>
                </div>
                <div className="border-t border-slate-300 w-48 pt-1 text-xs text-slate-400 uppercase">Unterschrift Mitarbeiter</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-300">Dokument-ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
              </div>
            </footer>

          </div>
        </div>
      </div>
    );
  }

  return null;
};