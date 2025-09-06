import { AIScheduler } from '../../backend/src/services/Scheduler';
import { StudentProfile, Course, ScheduleConstraints } from '../../backend/src/types/academic';

describe('AIScheduler', () => {
  let scheduler: AIScheduler;
  let mockStudent: StudentProfile;
  let mockCourses: Course[];
  let mockConstraints: ScheduleConstraints;

  beforeEach(() => {
    scheduler = new AIScheduler();
    
    mockStudent = {
      id: 'student-1',
      name: 'Test Student',
      email: 'test@ucla.edu',
      major: 'Computer Science',
      year: 2,
      currentGPA: 3.5,
      completedCourses: [
        {
          id: '1',
          code: 'CS31',
          name: 'Introduction to Computer Science I',
          credits: 4,
          difficulty: 'medium',
          type: 'core',
          prerequisites: [],
          description: 'Intro CS',
          quarters: ['Fall', 'Winter', 'Spring'],
          major: ['Computer Science']
        }
      ],
      currentQuarter: { season: 'Winter', year: 2025 },
      preferences: {
        maxUnitsPerQuarter: 16,
        preferredDifficulty: 'mixed',
        preferredTimes: ['10:00', '11:00'],
        avoidEarlyClasses: false,
        avoidLateClasses: false,
        preferredDays: ['M', 'W', 'F'],
        studyStyle: 'balanced'
      },
      interests: ['AI', 'Software Engineering'],
      careerGoals: ['Software Engineer']
    };

    mockCourses = [
      {
        id: '2',
        code: 'CS32',
        name: 'Introduction to Computer Science II',
        credits: 4,
        difficulty: 'hard',
        type: 'core',
        prerequisites: ['CS31'],
        description: 'Data structures and algorithms',
        quarters: ['Fall', 'Winter', 'Spring'],
        major: ['Computer Science']
      },
      {
        id: '3',
        code: 'MATH31B',
        name: 'Integration and Infinite Series',
        credits: 4,
        difficulty: 'hard',
        type: 'math',
        prerequisites: ['MATH31A'],
        description: 'Calculus II',
        quarters: ['Fall', 'Winter', 'Spring'],
        major: ['Computer Science', 'Mathematics']
      },
      {
        id: '4',
        code: 'PHYSICS1A',
        name: 'Mechanics and Wave Motion',
        credits: 4,
        difficulty: 'medium',
        type: 'science',
        prerequisites: ['MATH31A'],
        description: 'Physics I',
        quarters: ['Fall', 'Winter', 'Spring'],
        major: ['Computer Science', 'Physics']
      }
    ];

    mockConstraints = {
      maxUnits: 16,
      minUnits: 12,
      preferredTimes: ['10:00', '11:00', '14:00'],
      balanceWorkload: true
    };
  });

  describe('generateMultiQuarterSchedule', () => {
    it('should generate a valid multi-quarter schedule', async () => {
      const result = await scheduler.generateMultiQuarterSchedule(
        mockStudent,
        mockCourses,
        mockConstraints,
        4
      );

      expect(result).toBeDefined();
      expect(result.quarters).toHaveLength(4);
      expect(result.totalUnits).toBeGreaterThan(0);
      expect(result.overallGPA).toBeGreaterThanOrEqual(0);
      expect(result.overallGPA).toBeLessThanOrEqual(4.0);
      expect(result.completionRate).toBeGreaterThanOrEqual(0);
      expect(result.completionRate).toBeLessThanOrEqual(100);
    });

    it('should respect unit constraints', async () => {
      const result = await scheduler.generateMultiQuarterSchedule(
        mockStudent,
        mockCourses,
        mockConstraints,
        2
      );

      result.quarters.forEach(quarter => {
        expect(quarter.totalUnits).toBeGreaterThanOrEqual(mockConstraints.minUnits!);
        expect(quarter.totalUnits).toBeLessThanOrEqual(mockConstraints.maxUnits!);
      });
    });

    it('should not schedule courses without prerequisites', async () => {
      const advancedCourse: Course = {
        id: '5',
        code: 'CS33',
        name: 'Computer Organization',
        credits: 4,
        difficulty: 'hard',
        type: 'core',
        prerequisites: ['CS32'], // CS32 not completed yet
        description: 'Computer systems',
        quarters: ['Fall', 'Winter', 'Spring'],
        major: ['Computer Science']
      };

      const coursesWithAdvanced = [...mockCourses, advancedCourse];
      const result = await scheduler.generateMultiQuarterSchedule(
        mockStudent,
        coursesWithAdvanced,
        mockConstraints,
        2
      );

      // CS33 should not appear in first quarter since CS32 prerequisite not met
      const firstQuarter = result.quarters[0];
      const hasCS33InFirstQuarter = firstQuarter.courses.some(c => c.code === 'CS33');
      expect(hasCS33InFirstQuarter).toBeFalsy();
    });
  });

  describe('scoring system', () => {
    it('should prioritize core courses over electives', () => {
      const coreCourse: Course = {
        id: '6',
        code: 'CS35L',
        name: 'Software Construction',
        credits: 4,
        difficulty: 'medium',
        type: 'core',
        prerequisites: ['CS32'],
        description: 'Software engineering',
        quarters: ['Fall', 'Winter', 'Spring'],
        major: ['Computer Science']
      };

      const electiveCourse: Course = {
        id: '7',
        code: 'CS188',
        name: 'Artificial Intelligence',
        credits: 4,
        difficulty: 'hard',
        type: 'elective',
        prerequisites: ['CS32'],
        description: 'AI fundamentals',
        quarters: ['Fall', 'Winter', 'Spring'],
        major: ['Computer Science']
      };

      // Mock the scoring method to test priority
      const coreScore = (scheduler as any).scoreCourse(coreCourse, mockStudent, mockConstraints);
      const electiveScore = (scheduler as any).scoreCourse(electiveCourse, mockStudent, mockConstraints);

      expect(coreScore.breakdown.graduationProgress).toBeGreaterThan(electiveScore.breakdown.graduationProgress);
    });

    it('should consider difficulty in workload scoring', () => {
      const easyCourse: Course = {
        ...mockCourses[0],
        difficulty: 'easy'
      };

      const hardCourse: Course = {
        ...mockCourses[0],
        difficulty: 'hard'
      };

      const easyScore = (scheduler as any).scoreCourse(easyCourse, mockStudent, mockConstraints);
      const hardScore = (scheduler as any).scoreCourse(hardCourse, mockStudent, mockConstraints);

      expect(easyScore.breakdown.workload).toBeGreaterThan(hardScore.breakdown.workload);
    });
  });

  describe('conflict detection', () => {
    it('should detect time conflicts', () => {
      const conflictingCourses = [
        {
          id: '1',
          code: 'CS32',
          startTime: '10:00',
          endTime: '11:50',
          days: ['M', 'W', 'F']
        },
        {
          id: '2',
          code: 'MATH31B',
          startTime: '10:00',
          endTime: '11:50',
          days: ['M', 'W', 'F']
        }
      ];

      const conflicts = (scheduler as any).detectConflicts(conflictingCourses);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]).toContain('conflicts with');
    });

    it('should not detect conflicts for different days', () => {
      const nonConflictingCourses = [
        {
          id: '1',
          code: 'CS32',
          startTime: '10:00',
          endTime: '11:50',
          days: ['M', 'W', 'F']
        },
        {
          id: '2',
          code: 'MATH31B',
          startTime: '10:00',
          endTime: '11:50',
          days: ['T', 'R']
        }
      ];

      const conflicts = (scheduler as any).detectConflicts(nonConflictingCourses);
      expect(conflicts).toHaveLength(0);
    });
  });

  describe('GPA estimation', () => {
    it('should estimate realistic GPA based on difficulty', () => {
      const easyCourses = [
        { ...mockCourses[0], difficulty: 'easy' as const },
        { ...mockCourses[1], difficulty: 'easy' as const }
      ];

      const hardCourses = [
        { ...mockCourses[0], difficulty: 'hard' as const },
        { ...mockCourses[1], difficulty: 'hard' as const }
      ];

      const easyGPA = (scheduler as any).estimateQuarterGPA(easyCourses, mockStudent);
      const hardGPA = (scheduler as any).estimateQuarterGPA(hardCourses, mockStudent);

      expect(easyGPA).toBeGreaterThan(hardGPA);
      expect(easyGPA).toBeLessThanOrEqual(4.0);
      expect(hardGPA).toBeGreaterThanOrEqual(0);
    });
  });
});
