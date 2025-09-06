import { GPTAdvisor } from '../../backend/src/ai/GPTAdvisor';
import { StudentProfile } from '../../backend/src/types/academic';

// Mock OpenAI
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{
              message: {
                content: JSON.stringify({
                  answer: "Based on your CS major and interests, I recommend taking CS32 next quarter.",
                  confidence: 0.9,
                  suggestions: ["Focus on data structures", "Practice coding problems"],
                  followUpQuestions: ["What's your preferred programming language?"],
                  resources: ["CS32 course materials", "LeetCode practice"],
                  actionItems: ["Enroll in CS32", "Review CS31 concepts"]
                })
              }
            }]
          })
        }
      }
    }))
  };
});

describe('GPTAdvisor', () => {
  let advisor: GPTAdvisor;
  let mockStudent: StudentProfile;

  beforeEach(() => {
    advisor = new GPTAdvisor('test-api-key');
    
    mockStudent = {
      id: 'student-1',
      name: 'Test Student',
      email: 'test@ucla.edu',
      major: 'Computer Science',
      year: 2,
      currentGPA: 3.5,
      completedCourses: [],
      currentQuarter: { season: 'Winter', year: 2025 },
      preferences: {
        maxUnitsPerQuarter: 16,
        preferredDifficulty: 'mixed',
        preferredTimes: ['10:00'],
        avoidEarlyClasses: false,
        avoidLateClasses: false,
        preferredDays: ['M', 'W', 'F'],
        studyStyle: 'balanced'
      },
      interests: ['AI', 'Software Engineering'],
      careerGoals: ['Software Engineer']
    };
  });

  describe('processQuery', () => {
    it('should process course recommendation queries', async () => {
      const query = {
        type: 'course-recommendation' as const,
        question: 'What courses should I take next quarter?',
        context: { student: mockStudent }
      };

      const response = await advisor.processQuery(query);

      expect(response).toBeDefined();
      expect(response.answer).toBeTruthy();
      expect(response.confidence).toBeGreaterThan(0);
      expect(response.suggestions).toBeInstanceOf(Array);
      expect(response.followUpQuestions).toBeInstanceOf(Array);
      expect(response.resources).toBeInstanceOf(Array);
      expect(response.actionItems).toBeInstanceOf(Array);
    });

    it('should handle what-if scenarios', async () => {
      const query = {
        type: 'what-if' as const,
        question: 'What if I switch to Data Science major?',
        context: { student: mockStudent }
      };

      const response = await advisor.processQuery(query);

      expect(response).toBeDefined();
      expect(response.answer).toBeTruthy();
      expect(typeof response.confidence).toBe('number');
    });

    it('should provide fallback responses when API fails', async () => {
      // Mock API failure
      const failingAdvisor = new GPTAdvisor('invalid-key');
      jest.spyOn(console, 'error').mockImplementation(() => {});

      const query = {
        type: 'general' as const,
        question: 'Help me plan my schedule',
        context: { student: mockStudent }
      };

      const response = await failingAdvisor.processQuery(query);

      expect(response).toBeDefined();
      expect(response.answer).toBeTruthy();
      expect(response.confidence).toBeLessThan(1);
      expect(response.suggestions).toBeInstanceOf(Array);
    });
  });

  describe('analyzeWhatIfScenario', () => {
    it('should analyze major change scenarios', async () => {
      const scenario = {
        type: 'major-change' as const,
        parameters: {
          newMajor: 'Data Science',
          currentProgress: 60
        }
      };

      const analysis = await advisor.analyzeWhatIfScenario(mockStudent, scenario);

      expect(analysis).toBeDefined();
      expect(analysis.feasibility).toBeGreaterThanOrEqual(0);
      expect(analysis.feasibility).toBeLessThanOrEqual(1);
      expect(analysis.impact).toBeDefined();
      expect(analysis.recommendations).toBeInstanceOf(Array);
      expect(analysis.risks).toBeInstanceOf(Array);
    });

    it('should analyze study load changes', async () => {
      const scenario = {
        type: 'study-load' as const,
        parameters: {
          newUnitsPerQuarter: 20,
          currentUnits: 16
        }
      };

      const analysis = await advisor.analyzeWhatIfScenario(mockStudent, scenario);

      expect(analysis).toBeDefined();
      expect(analysis.impact.timeToGraduation).toBeGreaterThan(0);
    });
  });

  describe('recommendCourses', () => {
    it('should recommend appropriate courses', async () => {
      const availableCourses = [
        {
          id: '1',
          code: 'CS32',
          name: 'Data Structures',
          credits: 4,
          difficulty: 'hard' as const,
          type: 'core' as const,
          prerequisites: ['CS31'],
          description: 'Advanced programming',
          quarters: ['Fall', 'Winter', 'Spring'],
          major: ['Computer Science']
        }
      ];

      const preferences = {
        quarter: 'Winter 2025',
        maxCourses: 3,
        focusAreas: ['Programming', 'Algorithms']
      };

      const recommendations = await advisor.recommendCourses(
        mockStudent,
        availableCourses,
        preferences
      );

      expect(recommendations).toBeDefined();
      expect(recommendations.recommendations).toBeInstanceOf(Array);
      expect(recommendations.alternatives).toBeInstanceOf(Array);
      
      if (recommendations.recommendations.length > 0) {
        const rec = recommendations.recommendations[0];
        expect(rec.course).toBeDefined();
        expect(rec.reasoning).toBeTruthy();
        expect(['high', 'medium', 'low']).toContain(rec.priority);
        expect(rec.fit).toBeGreaterThanOrEqual(0);
        expect(rec.fit).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('provideCareerGuidance', () => {
    it('should provide relevant career paths', async () => {
      const careerInterests = ['Software Engineering', 'Machine Learning'];

      const guidance = await advisor.provideCareerGuidance(mockStudent, careerInterests);

      expect(guidance).toBeDefined();
      expect(guidance.careerPaths).toBeInstanceOf(Array);
      expect(guidance.skillGaps).toBeInstanceOf(Array);
      expect(guidance.actionPlan).toBeInstanceOf(Array);

      if (guidance.careerPaths.length > 0) {
        const path = guidance.careerPaths[0];
        expect(path.title).toBeTruthy();
        expect(path.description).toBeTruthy();
        expect(path.requiredSkills).toBeInstanceOf(Array);
        expect(path.recommendedCourses).toBeInstanceOf(Array);
        expect(path.timeline).toBeTruthy();
      }
    });
  });

  describe('analyzePerformance', () => {
    it('should analyze academic performance trends', async () => {
      const recentGrades = [
        { course: 'CS31', grade: 3.7, quarter: 'Fall 2024' },
        { course: 'MATH31A', grade: 3.3, quarter: 'Fall 2024' },
        { course: 'ENGCOMP3', grade: 3.8, quarter: 'Fall 2024' }
      ];

      const analysis = await advisor.analyzePerformance(mockStudent, recentGrades);

      expect(analysis).toBeDefined();
      expect(analysis.trends).toBeDefined();
      expect(['improving', 'declining', 'stable']).toContain(analysis.trends.gpaDirection);
      expect(['excellent', 'good', 'struggling']).toContain(analysis.trends.difficultyHandling);
      expect(['excellent', 'good', 'needs-improvement']).toContain(analysis.trends.workloadManagement);
      expect(analysis.insights).toBeInstanceOf(Array);
      expect(analysis.recommendations).toBeInstanceOf(Array);
    });
  });

  describe('error handling', () => {
    it('should handle invalid queries gracefully', async () => {
      const invalidQuery = {
        type: 'invalid-type' as any,
        question: '',
        context: {}
      };

      const response = await advisor.processQuery(invalidQuery);

      expect(response).toBeDefined();
      expect(response.answer).toBeTruthy();
      expect(response.confidence).toBeLessThan(1);
    });

    it('should provide meaningful fallback responses', async () => {
      const query = {
        type: 'course-recommendation' as const,
        question: 'What courses should I take?',
        context: {}
      };

      // Test fallback by mocking API error
      jest.spyOn(advisor as any, 'openai').mockImplementation(() => {
        throw new Error('API Error');
      });

      const response = await advisor.processQuery(query);

      expect(response).toBeDefined();
      expect(response.suggestions.length).toBeGreaterThan(0);
      expect(response.followUpQuestions.length).toBeGreaterThan(0);
    });
  });
});
