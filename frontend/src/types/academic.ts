export enum Quarter {
  FALL = 'FALL',
  WINTER = 'WINTER',
  SPRING = 'SPRING',
  SUMMER = 'SUMMER'
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  VERY_HARD = 'VERY_HARD'
}

export enum CourseType {
  CORE = 'CORE',
  ELECTIVE = 'ELECTIVE',
  MATH = 'MATH',
  SCIENCE = 'SCIENCE',
  GE = 'GE'
}

export enum Major {
  COMPUTER_SCIENCE = 'COMPUTER_SCIENCE',
  COMPUTER_ENGINEERING = 'COMPUTER_ENGINEERING',
  MATHEMATICS = 'MATHEMATICS',
  STATISTICS = 'STATISTICS',
  PHYSICS = 'PHYSICS'
}

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
  location?: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  credits: number;
  prerequisites: string[];
  corequisites?: string[];
  difficulty: Difficulty;
  type: CourseType;
  quarters: Quarter[];
  instructor?: string;
  maxEnrollment?: number;
  currentEnrollment?: number;
  rating?: number;
  workload?: number; // hours per week
}

export interface ScheduledCourse extends Course {
  timeSlots: TimeSlot[];
  quarter: Quarter;
  year: number;
  enrolled: boolean;
  waitlisted?: boolean;
  grade?: string;
}

export interface CompletedCourse {
  courseId: string;
  course: Course;
  grade: string;
  quarter: Quarter;
  year: number;
  units: number;
}

export interface QuarterInfo {
  season: Quarter;
  year: number;
}

export interface StudentPreferences {
  preferredTimeSlots: TimeSlot[];
  avoidTimeSlots: TimeSlot[];
  maxCreditsPerQuarter: number;
  minCreditsPerQuarter: number;
  preferredDifficulty: Difficulty[];
  avoidInstructors: string[];
  preferredInstructors: string[];
  workloadLimit: number; // max hours per week
  gpaGoal: number;
}

export interface StudentProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  major: Major;
  minor?: string;
  currentQuarter: QuarterInfo;
  expectedGraduation: QuarterInfo;
  completedCourses: Course[];
  currentGPA: number;
  totalCredits: number;
  preferences: StudentPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduleConstraints {
  maxCreditsPerQuarter: number;
  minCreditsPerQuarter: number;
  preferredTimeSlots: TimeSlot[];
  avoidTimeSlots: TimeSlot[];
  maxWorkloadPerWeek: number;
  gpaGoal: number;
  graduationDeadline: QuarterInfo;
}

export interface AcademicPlan {
  id: string;
  studentId: string;
  name: string;
  description?: string;
  quarters: PlannedQuarter[];
  totalCredits: number;
  projectedGPA: number;
  graduationQuarter: QuarterInfo;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlannedQuarter {
  quarter: QuarterInfo;
  courses: ScheduledCourse[];
  totalCredits: number;
  estimatedWorkload: number;
  estimatedGPA: number;
}

export interface ScheduleOptimizationResult {
  success: boolean;
  schedule: PlannedQuarter[];
  score: number;
  conflicts: ScheduleConflict[];
  warnings: string[];
  metadata: {
    totalCredits: number;
    projectedGPA: number;
    graduationQuarter: QuarterInfo;
    optimizationTime: number;
  };
}

export interface ScheduleConflict {
  type: 'TIME_CONFLICT' | 'PREREQUISITE_MISSING' | 'OVERLOAD' | 'COURSE_UNAVAILABLE';
  severity: 'ERROR' | 'WARNING' | 'INFO';
  message: string;
  affectedCourses: string[];
  quarter?: QuarterInfo;
  suggestions?: string[];
}

export interface AdvisorQuery {
  question: string;
  type: 'course-recommendation' | 'what-if' | 'career-guidance' | 'performance-analysis';
  context: {
    studentProfile: StudentProfile;
    currentSchedule?: PlannedQuarter[];
    specificCourses?: string[];
    targetGPA?: number;
    careerGoals?: string[];
  };
}

export interface AdvisorResponse {
  success: boolean;
  response: string;
  recommendations?: CourseRecommendation[];
  analysis?: PerformanceAnalysis;
  whatIfResults?: WhatIfAnalysis;
  careerGuidance?: CareerGuidance;
  followUpQuestions?: string[];
  confidence: number;
}

export interface CourseRecommendation {
  course: Course;
  reason: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  suggestedQuarter: QuarterInfo;
  prerequisites: {
    satisfied: string[];
    missing: string[];
  };
}

export interface PerformanceAnalysis {
  currentGPA: number;
  projectedGPA: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  riskFactors: string[];
}

export interface WhatIfAnalysis {
  scenario: string;
  originalPlan: AcademicPlan;
  modifiedPlan: AcademicPlan;
  impact: {
    gpaChange: number;
    graduationDateChange: number; // quarters
    workloadChange: number;
    difficultyChange: number;
  };
  pros: string[];
  cons: string[];
  recommendation: string;
}

export interface CareerGuidance {
  careerPath: string;
  requiredCourses: Course[];
  recommendedElectives: Course[];
  skills: string[];
  internshipSuggestions: string[];
  industryInsights: string[];
  timeline: {
    quarter: QuarterInfo;
    milestones: string[];
  }[];
}

// Form data types for frontend
export interface FormData {
  personalInfo: {
    name: string;
    email: string;
    studentId: string;
  };
  academicInfo: {
    major: Major;
    minor?: string;
    currentQuarter: QuarterInfo;
    expectedGraduation: QuarterInfo;
  };
  preferences: StudentPreferences;
  completedCourses: string[];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Schedule generation request
export interface ScheduleGenerationRequest {
  studentProfile: StudentProfile;
  availableCourses: Course[];
  constraints: ScheduleConstraints;
  targetQuarters: number;
  optimizationGoals: {
    prioritizeGPA: boolean;
    prioritizeWorkload: boolean;
    prioritizeGraduation: boolean;
    prioritizePreferences: boolean;
  };
}

// Roadmap types
export interface Milestone {
  id: string;
  title: string;
  description: string;
  quarter: QuarterInfo;
  type: 'COURSE' | 'REQUIREMENT' | 'GOAL' | 'DEADLINE';
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PLANNED' | 'OVERDUE';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface RoadmapView {
  type: 'TIMELINE' | 'GRID' | 'MILESTONES';
  timeRange: {
    start: QuarterInfo;
    end: QuarterInfo;
  };
  filters: {
    courseTypes: CourseType[];
    difficulties: Difficulty[];
    showCompleted: boolean;
    showPlanned: boolean;
  };
}
