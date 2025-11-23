
/**
 * Represents the different views of the application.
 * @enum {string}
 */
export enum ViewState {
  LANDING = 'LANDING',
  ASSESSMENT = 'ASSESSMENT',
  RESULTS = 'RESULTS',
  ORG_DASHBOARD = 'ORG_DASHBOARD'
}

/**
 * Represents the different types of questions in the assessment.
 * @enum {string}
 */
export enum QuestionType {
  SCALE = 'SCALE', // 1-5
  SLIDER = 'SLIDER', // 0-100%
  SCENARIO = 'SCENARIO', // A vs B
  SELECT = 'SELECT', // Dropdown
  TEXT = 'TEXT' // Free text
}

/**
 * Represents the settings for an embedded assessment.
 * @interface EmbedSettings
 */
export interface EmbedSettings {
  theme?: 'light' | 'dark';
  primaryColor?: string;
  hideRoadmap?: boolean;
  hideCharts?: boolean;
  hideArchetype?: boolean;
}

/**
 * Represents a question in the assessment.
 * @interface Question
 */
export interface Question {
  id: string;
  text: string;
  subText?: string;
  type: QuestionType;
  category: 'profile' | 'exposure' | 'style' | 'readiness' | 'sentiment';
  options?: { label: string; value: string | number }[]; 
}

/**
 * Represents the state of the assessment.
 * @interface AssessmentState
 */
export interface AssessmentState {
  answers: Record<string, number | string>; // questionId -> value
  isComplete: boolean;
}

/**
 * Represents a user profile.
 * @interface UserProfile
 */
export interface UserProfile {
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  organization?: string;
}

/**
 * Represents an archetype.
 * @interface Archetype
 */
export interface Archetype {
  name: string; // e.g., "De Sceptische Bewaker"
  description: string;
  color: string;
  risk: string;
  opportunity: string;
}

/**
 * Represents employee data.
 * @interface EmployeeData
 */
export interface EmployeeData {
  id: string;
  name: string;
  department: string;
  kaiScore: number; // Cognitive Style (-10 to 10)
  readinessScore: number; // AI Readiness (0-100)
  archetype: string;
}
