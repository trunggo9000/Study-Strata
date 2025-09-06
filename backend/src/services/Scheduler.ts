import { Course, ScheduledCourse, StudentProfile, Quarter, ScheduleConstraints } from '../types/academic';

export interface SchedulingScore {
  total: number;
  breakdown: {
    prerequisites: number;
    workload: number;
    timeDistribution: number;
    gpaImpact: number;
    graduationProgress: number;
  };
}

export interface QuarterPlan {
  quarter: Quarter;
  courses: ScheduledCourse[];
  totalUnits: number;
  estimatedGPA: number;
  workloadScore: number;
  conflicts: string[];
}

export interface MultiQuarterPlan {
  quarters: QuarterPlan[];
  graduationDate: string;
  totalUnits: number;
  overallGPA: number;
  completionRate: number;
}

export class AIScheduler {
  private readonly MAX_UNITS_PER_QUARTER = 20;
  private readonly MIN_UNITS_PER_QUARTER = 12;
  private readonly OPTIMAL_UNITS_PER_QUARTER = 16;

  /**
   * Generates an optimized multi-quarter schedule using weighted scoring algorithm
   */
  async generateMultiQuarterSchedule(
    student: StudentProfile,
    availableCourses: Course[],
    constraints: ScheduleConstraints,
    targetQuarters: number = 12
  ): Promise<MultiQuarterPlan> {
    const remainingCourses = this.getRemainingCourses(student, availableCourses);
    const quarters: QuarterPlan[] = [];
    let completedCourses = new Set(student.completedCourses.map(c => c.code));

    for (let i = 0; i < targetQuarters; i++) {
      const quarter = this.getNextQuarter(student.currentQuarter, i);
      const quarterPlan = await this.optimizeQuarterSchedule(
        remainingCourses,
        completedCourses,
        quarter,
        constraints,
        student
      );

      quarters.push(quarterPlan);
      
      // Update completed courses for next iteration
      quarterPlan.courses.forEach(course => {
        completedCourses.add(course.code);
      });

      // Remove scheduled courses from remaining
      remainingCourses.splice(0, remainingCourses.length, 
        ...remainingCourses.filter(course => 
          !quarterPlan.courses.some(scheduled => scheduled.code === course.code)
        )
      );

      // Stop if all required courses are scheduled
      if (this.isGraduationComplete(student, Array.from(completedCourses))) {
        break;
      }
    }

    return this.buildMultiQuarterPlan(quarters, student);
  }

  /**
   * Optimizes a single quarter using weighted scoring
   */
  private async optimizeQuarterSchedule(
    availableCourses: Course[],
    completedCourses: Set<string>,
    quarter: Quarter,
    constraints: ScheduleConstraints,
    student: StudentProfile
  ): Promise<QuarterPlan> {
    const eligibleCourses = this.filterEligibleCourses(
      availableCourses,
      completedCourses,
      quarter
    );

    const bestCombination = this.findOptimalCombination(
      eligibleCourses,
      constraints,
      student
    );

    const scheduledCourses = await this.assignTimeSlots(bestCombination, constraints);

    return {
      quarter,
      courses: scheduledCourses,
      totalUnits: scheduledCourses.reduce((sum, course) => sum + course.credits, 0),
      estimatedGPA: this.estimateQuarterGPA(scheduledCourses, student),
      workloadScore: this.calculateWorkloadScore(scheduledCourses),
      conflicts: this.detectConflicts(scheduledCourses)
    };
  }

  /**
   * Finds optimal course combination using dynamic programming approach
   */
  private findOptimalCombination(
    courses: Course[],
    constraints: ScheduleConstraints,
    student: StudentProfile
  ): Course[] {
    const scored = courses.map(course => ({
      course,
      score: this.scoreCourse(course, student, constraints)
    })).sort((a, b) => b.score.total - a.score.total);

    const combination: Course[] = [];
    let totalUnits = 0;

    for (const { course } of scored) {
      if (totalUnits + course.credits <= this.MAX_UNITS_PER_QUARTER &&
          totalUnits + course.credits >= this.MIN_UNITS_PER_QUARTER) {
        
        if (this.isValidAddition(course, combination, constraints)) {
          combination.push(course);
          totalUnits += course.credits;
        }
      }

      if (totalUnits >= this.OPTIMAL_UNITS_PER_QUARTER) break;
    }

    return combination;
  }

  /**
   * Scores a course based on multiple weighted factors
   */
  private scoreCourse(
    course: Course,
    student: StudentProfile,
    constraints: ScheduleConstraints
  ): SchedulingScore {
    const weights = {
      prerequisites: 0.25,
      workload: 0.20,
      timeDistribution: 0.15,
      gpaImpact: 0.20,
      graduationProgress: 0.20
    };

    const scores = {
      prerequisites: this.scorePrerequisites(course, student),
      workload: this.scoreWorkload(course, constraints),
      timeDistribution: this.scoreTimeDistribution(course, constraints),
      gpaImpact: this.scoreGPAImpact(course, student),
      graduationProgress: this.scoreGraduationProgress(course, student)
    };

    const total = Object.entries(scores).reduce((sum, [key, score]) => {
      return sum + (score * weights[key as keyof typeof weights]);
    }, 0);

    return { total, breakdown: scores };
  }

  /**
   * Assigns optimal time slots to courses avoiding conflicts
   */
  private async assignTimeSlots(
    courses: Course[],
    constraints: ScheduleConstraints
  ): Promise<ScheduledCourse[]> {
    const timeSlots = this.generateTimeSlots();
    const scheduled: ScheduledCourse[] = [];

    // Sort by priority (core > math/science > electives)
    const prioritized = courses.sort((a, b) => {
      const priority = { core: 3, math: 2, science: 2, elective: 1, ge: 1 };
      return (priority[b.type] || 0) - (priority[a.type] || 0);
    });

    for (const course of prioritized) {
      const optimalSlot = this.findOptimalTimeSlot(
        course,
        scheduled,
        timeSlots,
        constraints
      );

      if (optimalSlot) {
        scheduled.push({
          ...course,
          startTime: optimalSlot.startTime,
          endTime: optimalSlot.endTime,
          days: optimalSlot.days,
          location: this.assignLocation(course),
          instructor: this.assignInstructor(course)
        });
      }
    }

    return scheduled;
  }

  /**
   * Helper methods for scoring individual factors
   */
  private scorePrerequisites(course: Course, student: StudentProfile): number {
    const completed = new Set(student.completedCourses.map(c => c.code));
    const satisfied = course.prerequisites.every(prereq => completed.has(prereq));
    return satisfied ? 100 : 0;
  }

  private scoreWorkload(course: Course, constraints: ScheduleConstraints): number {
    const difficultyScore = { easy: 100, medium: 75, hard: 50 };
    return difficultyScore[course.difficulty] || 50;
  }

  private scoreTimeDistribution(course: Course, constraints: ScheduleConstraints): number {
    // Prefer courses that fit student's preferred time slots
    if (constraints.preferredTimes?.includes(course.defaultTime || '')) {
      return 100;
    }
    return 60;
  }

  private scoreGPAImpact(course: Course, student: StudentProfile): number {
    // Estimate based on course difficulty and student's historical performance
    const avgGPA = student.currentGPA || 3.0;
    const difficultyMultiplier = { easy: 1.1, medium: 1.0, hard: 0.9 };
    return Math.min(100, avgGPA * 25 * (difficultyMultiplier[course.difficulty] || 1.0));
  }

  private scoreGraduationProgress(course: Course, student: StudentProfile): number {
    // Higher score for courses that directly contribute to major requirements
    if (student.major && course.major.includes(student.major)) {
      return course.type === 'core' ? 100 : 80;
    }
    return 40;
  }

  /**
   * Utility methods
   */
  private getRemainingCourses(student: StudentProfile, allCourses: Course[]): Course[] {
    const completed = new Set(student.completedCourses.map(c => c.code));
    return allCourses.filter(course => !completed.has(course.code));
  }

  private filterEligibleCourses(
    courses: Course[],
    completed: Set<string>,
    quarter: Quarter
  ): Course[] {
    return courses.filter(course => {
      const prereqsSatisfied = course.prerequisites.every(prereq => completed.has(prereq));
      const offeredThisQuarter = course.quarters.includes(quarter.season);
      return prereqsSatisfied && offeredThisQuarter;
    });
  }

  private getNextQuarter(current: Quarter, offset: number): Quarter {
    const seasons = ['Fall', 'Winter', 'Spring', 'Summer'];
    const currentIndex = seasons.indexOf(current.season);
    const newIndex = (currentIndex + offset) % seasons.length;
    const yearOffset = Math.floor((currentIndex + offset) / seasons.length);
    
    return {
      season: seasons[newIndex] as any,
      year: current.year + yearOffset
    };
  }

  private generateTimeSlots() {
    const slots = [];
    for (let hour = 8; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 50) {
        const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const endHour = minute === 0 ? hour + 1 : hour + 2;
        const endMinute = minute === 0 ? 50 : 40;
        const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
        
        slots.push({ startTime, endTime, days: ['M', 'W', 'F'] });
        slots.push({ startTime, endTime, days: ['T', 'R'] });
      }
    }
    return slots;
  }

  private findOptimalTimeSlot(
    course: Course,
    scheduled: ScheduledCourse[],
    timeSlots: any[],
    constraints: ScheduleConstraints
  ) {
    return timeSlots.find(slot => {
      return !scheduled.some(existing => 
        this.hasTimeConflict(slot, existing) && 
        this.hasDayOverlap(slot.days, existing.days)
      );
    });
  }

  private hasTimeConflict(slot1: any, slot2: any): boolean {
    const start1 = parseInt(slot1.startTime.replace(':', ''));
    const end1 = parseInt(slot1.endTime.replace(':', ''));
    const start2 = parseInt(slot2.startTime.replace(':', ''));
    const end2 = parseInt(slot2.endTime.replace(':', ''));
    
    return !(end1 <= start2 || end2 <= start1);
  }

  private hasDayOverlap(days1: string[], days2: string[]): boolean {
    return days1.some(day => days2.includes(day));
  }

  private assignLocation(course: Course): string {
    const buildings = {
      'CS': 'Boelter Hall',
      'MATH': 'MS Building',
      'PHYS': 'Physics & Astronomy',
      'CHEM': 'Young Hall'
    };
    const prefix = course.code.match(/^[A-Z]+/)?.[0] || 'GE';
    return buildings[prefix as keyof typeof buildings] || 'TBA';
  }

  private assignInstructor(course: Course): string {
    // In production, this would query instructor database
    return course.instructor || 'Staff';
  }

  private isValidAddition(
    course: Course,
    combination: Course[],
    constraints: ScheduleConstraints
  ): boolean {
    // Check for course conflicts, prerequisites, etc.
    return true; // Simplified for now
  }

  private estimateQuarterGPA(courses: ScheduledCourse[], student: StudentProfile): number {
    const baseGPA = student.currentGPA || 3.0;
    const difficultyAdjustment = courses.reduce((avg, course) => {
      const adjustment = { easy: 0.1, medium: 0, hard: -0.1 };
      return avg + (adjustment[course.difficulty] || 0);
    }, 0) / courses.length;

    return Math.max(0, Math.min(4.0, baseGPA + difficultyAdjustment));
  }

  private calculateWorkloadScore(courses: ScheduledCourse[]): number {
    const totalUnits = courses.reduce((sum, course) => sum + course.credits, 0);
    const difficultyScore = courses.reduce((sum, course) => {
      const scores = { easy: 1, medium: 2, hard: 3 };
      return sum + (scores[course.difficulty] || 2);
    }, 0);

    return Math.max(0, 100 - (difficultyScore * totalUnits / 4));
  }

  private detectConflicts(courses: ScheduledCourse[]): string[] {
    const conflicts: string[] = [];
    
    for (let i = 0; i < courses.length; i++) {
      for (let j = i + 1; j < courses.length; j++) {
        if (this.hasTimeConflict(courses[i], courses[j]) && 
            this.hasDayOverlap(courses[i].days, courses[j].days)) {
          conflicts.push(`${courses[i].code} conflicts with ${courses[j].code}`);
        }
      }
    }

    return conflicts;
  }

  private isGraduationComplete(student: StudentProfile, completed: string[]): boolean {
    // Check if all major requirements are satisfied
    // This would integrate with major requirements data
    return false; // Simplified
  }

  private buildMultiQuarterPlan(quarters: QuarterPlan[], student: StudentProfile): MultiQuarterPlan {
    const totalUnits = quarters.reduce((sum, q) => sum + q.totalUnits, 0);
    const weightedGPA = quarters.reduce((sum, q, index) => {
      return sum + (q.estimatedGPA * q.totalUnits);
    }, 0) / totalUnits;

    return {
      quarters,
      graduationDate: this.calculateGraduationDate(quarters),
      totalUnits,
      overallGPA: weightedGPA,
      completionRate: this.calculateCompletionRate(student, totalUnits)
    };
  }

  private calculateGraduationDate(quarters: QuarterPlan[]): string {
    const lastQuarter = quarters[quarters.length - 1];
    return `${lastQuarter.quarter.season} ${lastQuarter.quarter.year}`;
  }

  private calculateCompletionRate(student: StudentProfile, plannedUnits: number): number {
    const requiredUnits = 180; // Typical bachelor's degree
    const completedUnits = student.completedCourses.reduce((sum, course) => sum + course.credits, 0);
    return Math.min(100, ((completedUnits + plannedUnits) / requiredUnits) * 100);
  }
}

export default AIScheduler;
