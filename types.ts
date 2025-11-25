export enum EmployeeStatus {
  OPEN = 'OPEN',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED'
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface SafetyContent {
  title: string;
  intro: string;
  steps: string[];
  duration: string;
  quiz: QuizQuestion[];
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string; // e.g., "Lager", "Montage"
  status: EmployeeStatus;
  lastTrainingDate?: string;
  dueDate: string;
}

export interface CompletionRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  topic: string;
  completedAt: string; // ISO date
  signatureHash: string;
}