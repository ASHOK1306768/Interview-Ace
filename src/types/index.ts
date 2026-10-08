export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  createdDate: string;
}

export type CategoryTrack = 
  | 'Coding Problems'
  | 'Aptitude & Logic'
  | 'Frontend Dev'
  | 'Backend Dev'
  | 'Data Science / ML'
  | 'Product Management'
  | 'Behavioral & HR'
  | 'Company Requirements'
  | 'General FAQ';

export interface Question {
  id: number;
  category: CategoryTrack;
  title: string;
  idealStructure?: string;
}

export interface QuestionEvaluation {
  questionId: number;
  questionTitle: string;
  userAnswer: string;
  speechContentEval: string;
  recommendedAnswerStructure: string;
}

export interface InterviewSession {
  id: string;
  candidateName: string;
  candidateEmail: string;
  targetTrack: string;
  experienceLevel: string;
  durationSeconds: number;
  score: number; // 0-100
  verdict: 'Requires Practice' | 'Good Performance' | 'Exemplary Mastery';
  completedDate: string;
  resumeText?: string;
  evaluations: QuestionEvaluation[];
  isTailored?: boolean;
}

export interface AppSettings {
  geminiApiKey: string;
  voiceAccent: string;
  ttsEnabled: boolean;
  cameraEnabled: boolean;
}

export type CanvasMode = 'Constellations Network' | 'Fluid Aurora';

declare global {
  interface Window {
    google?: any;
  }
}
