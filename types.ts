
export enum ViewState {
  LANDING = 'LANDING',
  ASSESSMENT = 'ASSESSMENT',
  RESULTS = 'RESULTS',
  ORG_DASHBOARD = 'ORG_DASHBOARD'
}

export enum QuestionType {
  SCALE = 'SCALE', // 1-5
  SLIDER = 'SLIDER', // 0-100%
  SCENARIO = 'SCENARIO', // A vs B
  SELECT = 'SELECT', // Dropdown
  TEXT = 'TEXT' // Free text
}

export interface EmbedSettings {
  theme?: 'light' | 'dark';
  primaryColor?: string;
  hideRoadmap?: boolean;
  hideCharts?: boolean;
  hideArchetype?: boolean;
}

export interface Question {
  id: string;
  text: string;
  subText?: string;
  type: QuestionType;
  category: 'profile' | 'exposure' | 'style' | 'readiness' | 'sentiment';
  options?: { label: string; value: string | number }[]; 
}

export interface AssessmentState {
  answers: Record<string, number | string>; // questionId -> value
  isComplete: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  organization?: string;
}

export interface Archetype {
  name: string; // e.g., "De Sceptische Bewaker"
  description: string;
  color: string;
  risk: string;
  opportunity: string;
}

export interface EmployeeData {
  id: string;
  name: string;
  department: string;
  kaiScore: number; // Cognitive Style (-10 to 10)
  readinessScore: number; // AI Readiness (0-100)
  archetype: string;
}
