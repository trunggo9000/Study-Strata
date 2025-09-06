import { Course } from '@/data/courseData';
import { StudentProfile, Quarter, Difficulty, CourseType, Course as AcademicCourse } from '@/types/academic';

interface GradeData {
  courseId: string;
  grade: string;
  gpa: number;
}

interface TrackGenerationOptions {
  minCoursesPerQuarter: number;
  maxCoursesPerQuarter: number;
  targetGraduation: { season: Quarter; year: number };
  prioritizeGPA: boolean;
  balanceWorkload: boolean;
}

interface GeneratedTrack {
  quarters: {
    quarter: Quarter;
    year: number;
    courses: Course[];
    totalCredits: number;
    estimatedDifficulty: number;
    reasoning: string;
  }[];
  totalCredits: number;
  projectedGPA: number;
  trackType: 'accelerated' | 'standard' | 'extended';
  warnings: string[];
}

export class IntelligentTrackGenerator {
  private calculateGPA(grades: GradeData[]): number {
    if (grades.length === 0) return 0;
    const totalPoints = grades.reduce((sum, grade) => sum + grade.gpa, 0);
    return totalPoints / grades.length;
  }

  private getGradeGPA(grade: string): number {
    const gradeMap: { [key: string]: number } = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'D-': 0.7,
      'F': 0.0
    };
    return gradeMap[grade] || 0;
  }

  private analyzePastPerformance(student: StudentProfile): {
    averageGPA: number;
    strongSubjects: string[];
    weakSubjects: string[];
    preferredDifficulty: Difficulty;
    recommendedLoad: number;
  } {
    const completedCourses = student.completedCourses;
    
    // Mock grade data - in real implementation, this would come from student records
    const mockGrades: GradeData[] = completedCourses.map(course => ({
      courseId: course.id,
      grade: this.generateMockGrade(course, student),
      gpa: this.getGradeGPA(this.generateMockGrade(course, student))
    }));

    const averageGPA = this.calculateGPA(mockGrades);
    
    // Analyze performance by course type
    const performanceByType: { [key: string]: number[] } = {};
    completedCourses.forEach((course, index) => {
      const type = course.type;
      if (!performanceByType[type]) performanceByType[type] = [];
      performanceByType[type].push(mockGrades[index].gpa);
    });

    const strongSubjects: string[] = [];
    const weakSubjects: string[] = [];
    
    Object.entries(performanceByType).forEach(([type, gpas]) => {
      const avgGPA = gpas.reduce((sum, gpa) => sum + gpa, 0) / gpas.length;
      if (avgGPA >= 3.5) strongSubjects.push(type);
      if (avgGPA < 3.0) weakSubjects.push(type);
    });

    // Determine preferred difficulty based on past performance
    const preferredDifficulty = averageGPA >= 3.7 ? Difficulty.HARD :
                               averageGPA >= 3.3 ? Difficulty.MEDIUM :
                               Difficulty.EASY;

    // Recommend course load based on GPA and preferences
    const baseLoad = student.preferences.maxCreditsPerQuarter;
    const recommendedLoad = averageGPA >= 3.5 ? Math.min(baseLoad, 20) :
                           averageGPA >= 3.0 ? Math.min(baseLoad, 16) :
                           Math.min(baseLoad, 14);

    return {
      averageGPA,
      strongSubjects,
      weakSubjects,
      preferredDifficulty,
      recommendedLoad
    };
  }

  private generateMockGrade(course: Course, student: StudentProfile): string {
    // Generate realistic grades based on course difficulty and student profile
    const baseProbability = student.currentGPA >= 3.5 ? 0.8 : 
                           student.currentGPA >= 3.0 ? 0.6 : 0.4;
    
    const difficultyModifier = course.difficulty === 'hard' ? -0.2 :
                              course.difficulty === 'medium' ? -0.1 : 0;
    
    const probability = Math.max(0.1, baseProbability + difficultyModifier);
    const random = Math.random();
    
    if (random < probability * 0.3) return 'A';
    if (random < probability * 0.6) return 'A-';
    if (random < probability * 0.8) return 'B+';
    if (random < probability) return 'B';
    return random < 0.8 ? 'B-' : 'C+';
  }

  private filterAvailableCourses(
    allCourses: Course[],
    completedCourses: Course[],
    student: StudentProfile
  ): Course[] {
    const completedIds = new Set(completedCourses.map(c => c.id));
    
    return allCourses.filter(course => {
      // Not already completed
      if (completedIds.has(course.id)) return false;
      
      // Prerequisites satisfied
      const prereqsSatisfied = course.prerequisites.every(prereq => 
        completedIds.has(prereq)
      );
            // Matches student's major
        const matchesMajor = course.major?.includes(student.major.toString()) || 
                          course.type === 'ge';
      
      return prereqsSatisfied && matchesMajor;
    });
  }

  private prioritizeCourses(
    courses: Course[],
    performance: ReturnType<typeof this.analyzePastPerformance>,
    student: StudentProfile
  ): Course[] {
    return courses.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Priority by type (core > math/science > electives > GE)
      const typeScores = {
        'core': 100,
        'math': 80,
        'science': 80,
        'elective': 60,
        'ge': 40
      };
      scoreA += typeScores[a.type] || 0;
      scoreB += typeScores[b.type] || 0;

      // Boost courses in strong subjects
      if (performance.strongSubjects.includes(a.type)) scoreA += 20;
      if (performance.strongSubjects.includes(b.type)) scoreB += 20;

      // Penalize courses in weak subjects
      if (performance.weakSubjects.includes(a.type)) scoreA -= 15;
      if (performance.weakSubjects.includes(b.type)) scoreB -= 15;

      // Difficulty preference
      const difficultyScores = {
        'easy': performance.preferredDifficulty === Difficulty.EASY ? 10 : 0,
        'medium': performance.preferredDifficulty === Difficulty.MEDIUM ? 10 : 5,
        'hard': performance.preferredDifficulty === Difficulty.HARD ? 10 : -5
      };
      scoreA += difficultyScores[a.difficulty] || 0;
      scoreB += difficultyScores[b.difficulty] || 0;

      // Prerequisites unlock potential (courses that unlock many others)
      const aUnlocks = courses.filter(c => c.prerequisites.includes(a.id)).length;
      const bUnlocks = courses.filter(c => c.prerequisites.includes(b.id)).length;
      scoreA += aUnlocks * 5;
      scoreB += bUnlocks * 5;

      return scoreB - scoreA;
    });
  }

  public generateIntelligentTrack(
    student: StudentProfile,
    availableCourses: Course[],
    options: TrackGenerationOptions
  ): GeneratedTrack {
    const performance = this.analyzePastPerformance(student);
    const eligibleCourses = this.filterAvailableCourses(
      availableCourses,
      student.completedCourses,
      student
    );
    
    const prioritizedCourses = this.prioritizeCourses(
      eligibleCourses,
      performance,
      student
    );

    // Determine track type based on timeline
    const quartersToGraduation = this.calculateQuartersToGraduation(
      student.currentQuarter,
      options.targetGraduation
    );
    
    const trackType: 'accelerated' | 'standard' | 'extended' = 
      quartersToGraduation <= 9 ? 'accelerated' :
      quartersToGraduation <= 12 ? 'standard' : 'extended';

    // Enforce minimum courses for accelerated track
    const minCoursesPerQuarter = trackType === 'accelerated' ? 
      Math.max(options.minCoursesPerQuarter, 4) : 
      options.minCoursesPerQuarter;

    const quarters = this.generateQuarterSchedule(
      prioritizedCourses,
      student,
      performance,
      {
        ...options,
        minCoursesPerQuarter
      },
      trackType
    );

    const totalCredits = quarters.reduce((sum, q) => sum + q.totalCredits, 0);
    const projectedGPA = this.calculateProjectedGPA(quarters, performance);
    const warnings = this.generateWarnings(quarters, performance, trackType);

    return {
      quarters,
      totalCredits,
      projectedGPA,
      trackType,
      warnings
    };
  }

  private calculateQuartersToGraduation(
    current: { season: Quarter; year: number },
    target: { season: Quarter; year: number }
  ): number {
    const quarterOrder = [Quarter.FALL, Quarter.WINTER, Quarter.SPRING, Quarter.SUMMER];
    const currentIndex = quarterOrder.indexOf(current.season);
    const targetIndex = quarterOrder.indexOf(target.season);
    
    const yearDiff = target.year - current.year;
    const quarterDiff = targetIndex - currentIndex;
    
    return Math.max(1, yearDiff * 4 + quarterDiff);
  }

  private generateQuarterSchedule(
    courses: Course[],
    student: StudentProfile,
    performance: ReturnType<typeof this.analyzePastPerformance>,
    options: TrackGenerationOptions,
    trackType: 'accelerated' | 'standard' | 'extended'
  ) {
    const quarters = [];
    const remainingCourses = [...courses];
    const completedCourseIds = new Set(student.completedCourses.map(c => c.id));
    
    let currentQuarter = { ...student.currentQuarter };
    const quarterOrder = [Quarter.FALL, Quarter.WINTER, Quarter.SPRING];
    
    while (remainingCourses.length > 0 && quarters.length < 20) {
      const quarterCourses: Course[] = [];
      let totalCredits = 0;
      let totalDifficulty = 0;
      
      // Filter courses available this quarter
      const availableThisQuarter = remainingCourses.filter(course => {
        // Check prerequisites
        const prereqsSatisfied = course.prerequisites.every(prereq => 
          completedCourseIds.has(prereq)
        );
        
        // Check if offered this quarter
        const offeredThisQuarter = course.quarters.includes(currentQuarter.season);
        
        return prereqsSatisfied && offeredThisQuarter;
      });

      // Select courses for this quarter
      for (const course of availableThisQuarter) {
        const wouldExceedCredits = totalCredits + course.credits > performance.recommendedLoad;
        const wouldExceedCourses = quarterCourses.length >= options.maxCoursesPerQuarter;
        
        if (wouldExceedCredits || wouldExceedCourses) {
          // Check if we have minimum courses for accelerated track
          if (trackType === 'accelerated' && quarterCourses.length < 4) {
            // Allow one more course even if it exceeds normal limits
            if (quarterCourses.length < 4 && totalCredits + course.credits <= 20) {
              quarterCourses.push(course);
              totalCredits += course.credits;
              totalDifficulty += this.getDifficultyScore(course.difficulty as Difficulty);
            }
          }
          break;
        }
        
        quarterCourses.push(course);
        totalCredits += course.credits;
        totalDifficulty += this.getDifficultyScore(course.difficulty as Difficulty);
        
        // Remove from remaining and add to completed
        const courseIndex = remainingCourses.findIndex(c => c.id === course.id);
        if (courseIndex !== -1) {
          remainingCourses.splice(courseIndex, 1);
          completedCourseIds.add(course.id);
        }
        
        // Stop if we have enough courses
        if (quarterCourses.length >= options.minCoursesPerQuarter && 
            totalCredits >= student.preferences.minCreditsPerQuarter) {
          break;
        }
      }

      // Generate reasoning for this quarter
      const reasoning = this.generateQuarterReasoning(
        quarterCourses,
        performance,
        trackType,
        currentQuarter
      );

      quarters.push({
        quarter: currentQuarter.season,
        year: currentQuarter.year,
        courses: quarterCourses,
        totalCredits,
        estimatedDifficulty: quarterCourses.length > 0 ? totalDifficulty / quarterCourses.length : 0,
        reasoning
      });

      // Move to next quarter
      currentQuarter = this.getNextQuarter(currentQuarter);
      
      // Break if no courses were added (avoid infinite loop)
      if (quarterCourses.length === 0) break;
    }

    return quarters;
  }

  private getDifficultyScore(difficulty: string): number {
    const scores = {
      'easy': 1,
      'medium': 2,
      'hard': 3,
      'very_hard': 4
    };
    return scores[difficulty as keyof typeof scores] || 2;
  }

  private generateQuarterReasoning(
    courses: Course[],
    performance: ReturnType<typeof this.analyzePastPerformance>,
    trackType: string,
    quarter: { season: Quarter; year: number }
  ): string {
    if (courses.length === 0) return "No courses scheduled this quarter.";
    
    const coreCount = courses.filter(c => c.type === 'core').length;
    const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
    const avgDifficulty = courses.reduce((sum, c) => 
      sum + this.getDifficultyScore(c.difficulty), 0) / courses.length;
    
    let reasoning = `${quarter.season} ${quarter.year}: `;
    
    if (trackType === 'accelerated') {
      reasoning += `Accelerated track with ${courses.length} courses (${totalCredits} credits). `;
    }
    
    if (coreCount > 0) {
      reasoning += `Prioritizing ${coreCount} core course${coreCount > 1 ? 's' : ''} for major requirements. `;
    }
    
    if (avgDifficulty >= 2.5) {
      reasoning += `Challenging quarter - balanced with your strong performance in ${performance.strongSubjects.join(', ')}. `;
    } else {
      reasoning += `Manageable workload to maintain GPA. `;
    }
    
    return reasoning.trim();
  }

  private getNextQuarter(current: { season: Quarter; year: number }): { season: Quarter; year: number } {
    const quarterOrder = [Quarter.FALL, Quarter.WINTER, Quarter.SPRING];
    const currentIndex = quarterOrder.indexOf(current.season);
    
    if (currentIndex === quarterOrder.length - 1) {
      return { season: quarterOrder[0], year: current.year + 1 };
    } else {
      return { season: quarterOrder[currentIndex + 1], year: current.year };
    }
  }

  private calculateProjectedGPA(
    quarters: ReturnType<typeof this.generateQuarterSchedule>,
    performance: ReturnType<typeof this.analyzePastPerformance>
  ): number {
    // Estimate GPA based on course difficulty and past performance
    let totalGradePoints = 0;
    let totalCredits = 0;
    
    quarters.forEach(quarter => {
      quarter.courses.forEach(course => {
        const expectedGPA = this.estimateCourseGPA(course, performance);
        totalGradePoints += expectedGPA * course.credits;
        totalCredits += course.credits;
      });
    });
    
    return totalCredits > 0 ? totalGradePoints / totalCredits : performance.averageGPA;
  }

  private estimateCourseGPA(
    course: Course,
    performance: ReturnType<typeof this.analyzePastPerformance>
  ): number {
    let baseGPA = performance.averageGPA;
    
    // Adjust based on subject strength
    if (performance.strongSubjects.includes(course.type)) {
      baseGPA += 0.2;
    } else if (performance.weakSubjects.includes(course.type)) {
      baseGPA -= 0.3;
    }
    
    // Adjust based on difficulty
    const difficultyAdjustment = {
      'easy': 0.1,
      'medium': 0,
      'hard': -0.2,
      'very_hard': -0.4
    };
    
    baseGPA += difficultyAdjustment[course.difficulty as keyof typeof difficultyAdjustment] || 0;
    
    return Math.max(0, Math.min(4.0, baseGPA));
  }

  private generateWarnings(
    quarters: ReturnType<typeof this.generateQuarterSchedule>,
    performance: ReturnType<typeof this.analyzePastPerformance>,
    trackType: string
  ): string[] {
    const warnings: string[] = [];
    
    // Check for accelerated track requirements
    if (trackType === 'accelerated') {
      const quartersWithFewCourses = quarters.filter(q => q.courses.length < 4);
      if (quartersWithFewCourses.length > 0) {
        warnings.push(`Accelerated track requires minimum 4 courses per quarter. ${quartersWithFewCourses.length} quarters have fewer courses.`);
      }
    }
    
    // Check for overloaded quarters
    const overloadedQuarters = quarters.filter(q => q.totalCredits > 18);
    if (overloadedQuarters.length > 0) {
      warnings.push(`${overloadedQuarters.length} quarters exceed 18 credits. Consider redistributing courses.`);
    }
    
    // Check for difficult quarters
    const difficultQuarters = quarters.filter(q => q.estimatedDifficulty >= 2.5);
    if (difficultQuarters.length > quarters.length * 0.5) {
      warnings.push(`Over half of your quarters are high-difficulty. Consider balancing with easier courses.`);
    }
    
    // Check weak subject concentration
    performance.weakSubjects.forEach(subject => {
      const subjectQuarters = quarters.filter(q => 
        q.courses.some(c => c.type === subject)
      );
      if (subjectQuarters.length > 0) {
        warnings.push(`Consider extra support for ${subject} courses based on past performance.`);
      }
    });
    
    return warnings;
  }
}

// Export utility functions
export const generateIntelligentTrack = (
  student: StudentProfile,
  availableCourses: Course[],
  options: TrackGenerationOptions
): GeneratedTrack => {
  const generator = new IntelligentTrackGenerator();
  return generator.generateIntelligentTrack(student, availableCourses, options);
};

export const validateAcceleratedTrack = (track: GeneratedTrack): boolean => {
  if (track.trackType !== 'accelerated') return true;
  
  // Check minimum 4 courses per quarter for accelerated track
  const invalidQuarters = track.quarters.filter(q => 
    q.courses.length > 0 && q.courses.length < 4
  );
  
  return invalidQuarters.length === 0;
};
