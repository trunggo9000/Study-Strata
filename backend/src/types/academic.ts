export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'core' | 'elective' | 'ge' | 'math' | 'science';
  prerequisites: string[];
  description: string;
  quarters: ('Fall' | 'Winter' | 'Spring' | 'Summer')[];
  major: string[];
  defaultTime?: string;
  instructor?: string;
  gpa?: number;
}

export interface ScheduledCourse extends Course {
  startTime: string;
  endTime: string;
  days: string[];
  location: string;
  instructor: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  major: string;
  year: number;
  currentGPA?: number;
  completedCourses: Course[];
  currentQuarter: Quarter;
  preferences: StudentPreferences;
  interests: string[];
  careerGoals: string[];
}

export interface StudentPreferences {
  maxUnitsPerQuarter: number;
  preferredDifficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  preferredTimes: string[];
  avoidEarlyClasses: boolean;
  avoidLateClasses: boolean;
  preferredDays: string[];
  studyStyle: 'intensive' | 'balanced' | 'light';
}

export interface Quarter {
  season: 'Fall' | 'Winter' | 'Spring' | 'Summer';
  year: number;
}

export interface ScheduleConstraints {
  maxUnits?: number;
  minUnits?: number;
  preferredTimes?: string[];
  blockedTimes?: string[];
  requiredCourses?: string[];
  avoidCourses?: string[];
  balanceWorkload?: boolean;
}

export interface Major {
  id: string;
  name: string;
  school: string;
  degreeType: string;
  requiredCourses: string[];
  electiveCourses: string[];
  geRequirements: string[];
  totalUnits: number;
  typicalDuration: number;
}

export interface AcademicPlan {
  id: string;
  studentId: string;
  major: string;
  quarters: QuarterPlan[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface QuarterPlan {
  quarter: Quarter;
  courses: ScheduledCourse[];
  totalUnits: number;
  estimatedGPA: number;
  workloadScore: number;
  conflicts: string[];
}

export interface GPAProjection {
  currentGPA: number;
  projectedGPA: number;
  quarterGPAs: number[];
  confidenceScore: number;
}

export interface ConflictResolution {
  type: 'time' | 'prerequisite' | 'workload' | 'location';
  description: string;
  suggestions: string[];
  severity: 'low' | 'medium' | 'high';
}

export interface OptimizationMetrics {
  scheduleScore: number;
  workloadBalance: number;
  timeEfficiency: number;
  graduationProgress: number;
  gpaImpact: number;
}
