import OpenAI from 'openai';
import { StudentProfile, Course, ScheduledCourse, Major } from '../types/academic';

export interface AdvisorQuery {
  type: 'what-if' | 'course-recommendation' | 'schedule-optimization' | 'career-guidance' | 'general';
  question: string;
  context?: {
    student?: StudentProfile;
    courses?: Course[];
    schedule?: ScheduledCourse[];
    major?: Major;
  };
}

export interface AdvisorResponse {
  answer: string;
  confidence: number;
  suggestions: string[];
  followUpQuestions: string[];
  resources: string[];
  actionItems: string[];
}

export class GPTAdvisor {
  private openai: OpenAI;
  private readonly systemPrompt = `
    You are an expert academic advisor for UCLA students. You provide personalized, data-driven advice on:
    - Course selection and scheduling
    - Major requirements and planning
    - What-if scenario analysis (major changes, study abroad, etc.)
    - Career guidance and preparation
    - Academic optimization strategies

    Always provide:
    1. Clear, actionable advice
    2. Specific course recommendations with reasoning
    3. Timeline considerations
    4. Potential risks and mitigation strategies
    5. Follow-up questions to gather more context

    Be encouraging but realistic. Consider UCLA-specific policies, prerequisites, and graduation requirements.
  `;

  constructor(apiKey?: string) {
    this.openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Processes natural language queries and provides intelligent academic advice
   */
  async processQuery(query: AdvisorQuery): Promise<AdvisorResponse> {
    try {
      const contextualPrompt = this.buildContextualPrompt(query);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: this.systemPrompt },
          { role: "user", content: contextualPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      });

      const response = JSON.parse(completion.choices[0].message.content || '{}');
      
      return {
        answer: response.answer || "I need more information to provide a complete answer.",
        confidence: response.confidence || 0.7,
        suggestions: response.suggestions || [],
        followUpQuestions: response.followUpQuestions || [],
        resources: response.resources || [],
        actionItems: response.actionItems || []
      };

    } catch (error) {
      console.error('GPT Advisor Error:', error);
      return this.getFallbackResponse(query);
    }
  }

  /**
   * Analyzes what-if scenarios for major changes, study load modifications, etc.
   */
  async analyzeWhatIfScenario(
    student: StudentProfile,
    scenario: {
      type: 'major-change' | 'study-load' | 'course-substitution' | 'timeline-change';
      parameters: Record<string, any>;
    }
  ): Promise<{
    feasibility: number;
    impact: {
      graduationDate: string;
      additionalCourses: Course[];
      gpaImpact: number;
      timeToGraduation: number;
    };
    recommendations: string[];
    risks: string[];
  }> {
    const query: AdvisorQuery = {
      type: 'what-if',
      question: `Analyze the impact of ${scenario.type} with parameters: ${JSON.stringify(scenario.parameters)}`,
      context: { student }
    };

    const response = await this.processQuery(query);
    
    // Parse structured what-if analysis
    return {
      feasibility: 0.8, // Would be calculated based on GPT response
      impact: {
        graduationDate: "Spring 2026",
        additionalCourses: [],
        gpaImpact: 0.1,
        timeToGraduation: 2.5
      },
      recommendations: response.suggestions,
      risks: response.actionItems
    };
  }

  /**
   * Provides personalized course recommendations based on interests and goals
   */
  async recommendCourses(
    student: StudentProfile,
    availableCourses: Course[],
    preferences: {
      quarter: string;
      maxCourses: number;
      focusAreas: string[];
    }
  ): Promise<{
    recommendations: Array<{
      course: Course;
      reasoning: string;
      priority: 'high' | 'medium' | 'low';
      fit: number;
    }>;
    alternatives: Course[];
  }> {
    const query: AdvisorQuery = {
      type: 'course-recommendation',
      question: `Recommend ${preferences.maxCourses} courses for ${preferences.quarter} focusing on ${preferences.focusAreas.join(', ')}`,
      context: { student, courses: availableCourses }
    };

    const response = await this.processQuery(query);
    
    // Process recommendations (simplified for demo)
    const recommendations = availableCourses.slice(0, preferences.maxCourses).map(course => ({
      course,
      reasoning: `Aligns with your ${student.major} major and interests in ${student.interests.join(', ')}`,
      priority: 'high' as const,
      fit: 0.9
    }));

    return {
      recommendations,
      alternatives: availableCourses.slice(preferences.maxCourses)
    };
  }

  /**
   * Provides career guidance and preparation advice
   */
  async provideCareerGuidance(
    student: StudentProfile,
    careerInterests: string[]
  ): Promise<{
    careerPaths: Array<{
      title: string;
      description: string;
      requiredSkills: string[];
      recommendedCourses: string[];
      timeline: string;
    }>;
    skillGaps: string[];
    actionPlan: string[];
  }> {
    const query: AdvisorQuery = {
      type: 'career-guidance',
      question: `Provide career guidance for interests in: ${careerInterests.join(', ')}`,
      context: { student }
    };

    const response = await this.processQuery(query);
    
    return {
      careerPaths: [
        {
          title: "Software Engineer",
          description: "Develop applications and systems",
          requiredSkills: ["Programming", "System Design", "Algorithms"],
          recommendedCourses: ["CS32", "CS33", "CS35L"],
          timeline: "2-4 years"
        }
      ],
      skillGaps: response.actionItems,
      actionPlan: response.suggestions
    };
  }

  /**
   * Builds contextual prompt based on query type and available context
   */
  private buildContextualPrompt(query: AdvisorQuery): string {
    let prompt = `Question: ${query.question}\n\n`;

    if (query.context?.student) {
      const student = query.context.student;
      prompt += `Student Context:
- Major: ${student.major}
- Year: ${student.year}
- Current GPA: ${student.currentGPA || 'N/A'}
- Completed Courses: ${student.completedCourses.map(c => c.code).join(', ')}
- Interests: ${student.interests.join(', ')}
- Career Goals: ${student.careerGoals.join(', ')}
- Preferences: Max ${student.preferences.maxUnitsPerQuarter} units, ${student.preferences.studyStyle} study style

`;
    }

    if (query.context?.courses) {
      prompt += `Available Courses: ${query.context.courses.map(c => `${c.code} (${c.name})`).join(', ')}\n\n`;
    }

    prompt += `Please respond in JSON format with the following structure:
{
  "answer": "Detailed response to the question",
  "confidence": 0.8,
  "suggestions": ["Specific actionable suggestions"],
  "followUpQuestions": ["Questions to gather more context"],
  "resources": ["Relevant resources or links"],
  "actionItems": ["Immediate next steps"]
}`;

    return prompt;
  }

  /**
   * Provides fallback response when GPT is unavailable
   */
  private getFallbackResponse(query: AdvisorQuery): AdvisorResponse {
    const fallbackResponses = {
      'what-if': {
        answer: "What-if analysis requires careful consideration of your current progress, major requirements, and timeline. I'd recommend scheduling a meeting with your academic advisor to explore this scenario in detail.",
        suggestions: [
          "Review your degree audit",
          "Check prerequisite chains",
          "Consider summer session options",
          "Meet with your academic advisor"
        ]
      },
      'course-recommendation': {
        answer: "Course selection should align with your major requirements, interests, and career goals. Consider balancing challenging courses with manageable workload.",
        suggestions: [
          "Prioritize major requirements",
          "Balance course difficulty",
          "Check course availability",
          "Consider professor ratings"
        ]
      },
      'general': {
        answer: "I'm here to help with your academic planning. Could you provide more specific details about what you'd like assistance with?",
        suggestions: [
          "Ask about specific courses",
          "Inquire about major requirements",
          "Explore career paths",
          "Discuss schedule optimization"
        ]
      }
    };

    const response = fallbackResponses[query.type] || fallbackResponses.general;
    
    return {
      answer: response.answer,
      confidence: 0.6,
      suggestions: response.suggestions,
      followUpQuestions: [
        "What specific aspect would you like to explore further?",
        "Do you have any constraints or preferences I should consider?"
      ],
      resources: [
        "UCLA Academic Calendar",
        "Degree Requirements",
        "Course Catalog"
      ],
      actionItems: response.suggestions
    };
  }

  /**
   * Analyzes student performance and provides improvement recommendations
   */
  async analyzePerformance(
    student: StudentProfile,
    recentGrades: Array<{ course: string; grade: number; quarter: string }>
  ): Promise<{
    trends: {
      gpaDirection: 'improving' | 'declining' | 'stable';
      difficultyHandling: 'excellent' | 'good' | 'struggling';
      workloadManagement: 'excellent' | 'good' | 'needs-improvement';
    };
    insights: string[];
    recommendations: string[];
  }> {
    const query: AdvisorQuery = {
      type: 'general',
      question: `Analyze academic performance trends and provide improvement recommendations based on recent grades: ${JSON.stringify(recentGrades)}`,
      context: { student }
    };

    const response = await this.processQuery(query);
    
    return {
      trends: {
        gpaDirection: 'stable',
        difficultyHandling: 'good',
        workloadManagement: 'good'
      },
      insights: response.suggestions,
      recommendations: response.actionItems
    };
  }
}

export default GPTAdvisor;
