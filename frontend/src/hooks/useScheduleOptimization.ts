import { useState, useEffect, useCallback } from 'react';

export interface Course {
  id: string;
  title: string;
  units: number;
  difficulty: number;
  offered: string[];
  prerequisites: string[];
  tags: string[];
  description?: string;
  averageRating?: number;
  enrollmentCount?: number;
}

export interface ScheduleConstraints {
  maxUnitsPerQuarter: number;
  minUnitsPerQuarter: number;
  maxDifficultyPerQuarter: number;
  avoidBackToBackDifficult: boolean;
  preferredQuarters: string[];
  graduationTimeline: string;
  priorityTags: string[];
  avoidConflicts: boolean;
}

export interface QuarterSchedule {
  quarter: string;
  year: number;
  courses: Course[];
  totalUnits: number;
  averageDifficulty: number;
  conflicts: string[];
  score: number;
}

export interface OptimizationResult {
  schedule: QuarterSchedule[];
  score: number;
  improvements: string[];
  warnings: string[];
}

export interface UseScheduleOptimizationReturn {
  optimizeSchedule: (
    courses: Course[],
    constraints: ScheduleConstraints,
    currentSchedule?: QuarterSchedule[]
  ) => Promise<OptimizationResult>;
  validateSchedule: (schedule: QuarterSchedule[]) => string[];
  calculateScheduleScore: (schedule: QuarterSchedule[], constraints: ScheduleConstraints) => number;
  suggestImprovements: (schedule: QuarterSchedule[], constraints: ScheduleConstraints) => string[];
  isOptimizing: boolean;
  error: string | null;
}

export const useScheduleOptimization = (): UseScheduleOptimizationReturn => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validatePrerequisites = useCallback((schedule: QuarterSchedule[]): string[] => {
    const errors: string[] = [];
    const completedCourses = new Set<string>();

    schedule.forEach((quarter) => {
      quarter.courses.forEach((course) => {
        // Check if all prerequisites are satisfied
        course.prerequisites.forEach((prereq) => {
          if (!completedCourses.has(prereq)) {
            errors.push(`${quarter.quarter}: ${course.id} requires ${prereq} which hasn't been completed`);
          }
        });
      });

      // Add completed courses after checking prerequisites
      quarter.courses.forEach((course) => {
        completedCourses.add(course.id);
      });
    });

    return errors;
  }, []);

  const validateConstraints = useCallback((
    schedule: QuarterSchedule[],
    constraints: ScheduleConstraints
  ): string[] => {
    const errors: string[] = [];

    schedule.forEach((quarter) => {
      // Unit constraints
      if (quarter.totalUnits > constraints.maxUnitsPerQuarter) {
        errors.push(`${quarter.quarter}: Exceeds maximum units (${quarter.totalUnits}/${constraints.maxUnitsPerQuarter})`);
      }
      
      if (quarter.courses.length > 0 && quarter.totalUnits < constraints.minUnitsPerQuarter) {
        errors.push(`${quarter.quarter}: Below minimum units (${quarter.totalUnits}/${constraints.minUnitsPerQuarter})`);
      }

      // Difficulty constraints
      if (quarter.averageDifficulty > constraints.maxDifficultyPerQuarter) {
        errors.push(`${quarter.quarter}: Average difficulty too high (${quarter.averageDifficulty.toFixed(1)}/${constraints.maxDifficultyPerQuarter})`);
      }

      // Course availability
      quarter.courses.forEach((course) => {
        const season = quarter.quarter.split(' ')[0];
        if (!course.offered.includes(season)) {
          errors.push(`${quarter.quarter}: ${course.id} not offered in ${season}`);
        }
      });
    });

    // Back-to-back difficulty check
    if (constraints.avoidBackToBackDifficult) {
      for (let i = 0; i < schedule.length - 1; i++) {
        const current = schedule[i];
        const next = schedule[i + 1];
        
        if (current.averageDifficulty >= 4.0 && next.averageDifficulty >= 4.0) {
          errors.push(`Back-to-back difficult quarters: ${current.quarter} and ${next.quarter}`);
        }
      }
    }

    return errors;
  }, []);

  const validateSchedule = useCallback((schedule: QuarterSchedule[]): string[] => {
    const prerequisiteErrors = validatePrerequisites(schedule);
    return prerequisiteErrors;
  }, [validatePrerequisites]);

  const calculateQuarterScore = useCallback((
    quarter: QuarterSchedule,
    constraints: ScheduleConstraints
  ): number => {
    let score = 100;

    // Unit balance scoring
    const unitTarget = (constraints.maxUnitsPerQuarter + constraints.minUnitsPerQuarter) / 2;
    const unitDeviation = Math.abs(quarter.totalUnits - unitTarget) / unitTarget;
    score -= unitDeviation * 20;

    // Difficulty balance scoring
    const difficultyTarget = constraints.maxDifficultyPerQuarter * 0.8;
    const difficultyDeviation = Math.abs(quarter.averageDifficulty - difficultyTarget) / difficultyTarget;
    score -= difficultyDeviation * 15;

    // Priority tags bonus
    const priorityTagCount = quarter.courses.reduce((count, course) => {
      return count + course.tags.filter(tag => constraints.priorityTags.includes(tag)).length;
    }, 0);
    score += priorityTagCount * 5;

    // Conflict penalty
    score -= quarter.conflicts.length * 10;

    return Math.max(0, score);
  }, []);

  const calculateScheduleScore = useCallback((
    schedule: QuarterSchedule[],
    constraints: ScheduleConstraints
  ): number => {
    const quarterScores = schedule.map(quarter => calculateQuarterScore(quarter, constraints));
    const averageScore = quarterScores.reduce((sum, score) => sum + score, 0) / quarterScores.length;

    // Graduation timeline bonus/penalty
    const totalQuarters = schedule.filter(q => q.courses.length > 0).length;
    const targetQuarters = constraints.graduationTimeline === '3_years' ? 9 : 
                          constraints.graduationTimeline === '4_years' ? 12 : 15;
    
    const timelineDeviation = Math.abs(totalQuarters - targetQuarters) / targetQuarters;
    const timelineScore = Math.max(0, 100 - (timelineDeviation * 50));

    return (averageScore * 0.8) + (timelineScore * 0.2);
  }, [calculateQuarterScore]);

  const suggestImprovements = useCallback((
    schedule: QuarterSchedule[],
    constraints: ScheduleConstraints
  ): string[] => {
    const suggestions: string[] = [];

    // Analyze workload distribution
    const quarterLoads = schedule.map(q => q.totalUnits);
    const maxLoad = Math.max(...quarterLoads);
    const minLoad = Math.min(...quarterLoads.filter(load => load > 0));
    
    if (maxLoad - minLoad > 6) {
      suggestions.push('Consider redistributing courses for more balanced workload across quarters');
    }

    // Analyze difficulty distribution
    const difficultQuarters = schedule.filter(q => q.averageDifficulty >= 4.0);
    if (difficultQuarters.length > schedule.length * 0.4) {
      suggestions.push('Too many high-difficulty quarters. Consider spreading difficult courses more evenly');
    }

    // Check for prerequisite optimization
    const prerequisiteChains = new Map<string, string[]>();
    schedule.forEach(quarter => {
      quarter.courses.forEach(course => {
        if (course.prerequisites.length > 0) {
          prerequisiteChains.set(course.id, course.prerequisites);
        }
      });
    });

    if (prerequisiteChains.size > 0) {
      suggestions.push('Review prerequisite chains to ensure optimal course sequencing');
    }

    // Check graduation timeline
    const totalUnits = schedule.reduce((sum, quarter) => sum + quarter.totalUnits, 0);
    const requiredUnits = 180; // Typical bachelor's degree
    
    if (totalUnits < requiredUnits * 0.9) {
      suggestions.push('Add more courses to meet graduation requirements');
    }

    return suggestions;
  }, []);

  const generateOptimalSchedule = useCallback(async (
    courses: Course[],
    constraints: ScheduleConstraints,
    currentSchedule?: QuarterSchedule[]
  ): Promise<QuarterSchedule[]> => {
    // Simulate AI optimization algorithm
    await new Promise(resolve => setTimeout(resolve, 1500));

    const quarters: QuarterSchedule[] = [];
    const availableCourses = [...courses];
    const completedCourses = new Set<string>();

    // Generate quarters based on graduation timeline
    const numYears = constraints.graduationTimeline === '3_years' ? 3 : 
                    constraints.graduationTimeline === '4_years' ? 4 : 5;
    
    // Determine minimum courses per quarter for accelerated track
    const isAccelerated = constraints.graduationTimeline === '3_years';
    const minCoursesPerQuarter = isAccelerated ? 4 : 3;
    
    for (let year = 0; year < numYears; year++) {
      for (const season of ['Fall', 'Winter', 'Spring']) {
        if (!constraints.preferredQuarters.includes(season) && season === 'Winter') continue;

        const quarter: QuarterSchedule = {
          quarter: `${season} ${2024 + year}`,
          year: 2024 + year,
          courses: [],
          totalUnits: 0,
          averageDifficulty: 0,
          conflicts: [],
          score: 0
        };

        // Select courses for this quarter using intelligent algorithm
        const eligibleCourses = availableCourses.filter(course => {
          // Check prerequisites
          const prereqsSatisfied = course.prerequisites.every(prereq => 
            completedCourses.has(prereq)
          );
          
          // Check if offered this quarter
          const offeredThisQuarter = course.offered.includes(season);
          
          return prereqsSatisfied && offeredThisQuarter;
        });

        // Enhanced sorting based on course priority and performance prediction
        eligibleCourses.sort((a, b) => {
          let scoreA = 0;
          let scoreB = 0;

          // Priority by course type (core > math/science > electives > GE)
          const typeScores = { 'core': 100, 'math': 80, 'science': 80, 'elective': 60, 'ge': 40 };
          scoreA += typeScores[a.tags?.[0] as keyof typeof typeScores] || 0;
          scoreB += typeScores[b.tags?.[0] as keyof typeof typeScores] || 0;

          // Priority tags bonus
          const aPriority = constraints.priorityTags.some(tag => a.tags?.includes(tag)) ? 20 : 0;
          const bPriority = constraints.priorityTags.some(tag => b.tags?.includes(tag)) ? 20 : 0;
          scoreA += aPriority;
          scoreB += bPriority;

          // Prerequisites unlock potential
          const aUnlocks = availableCourses.filter(c => c.prerequisites.includes(a.id)).length;
          const bUnlocks = availableCourses.filter(c => c.prerequisites.includes(b.id)).length;
          scoreA += aUnlocks * 10;
          scoreB += bUnlocks * 10;

          // Difficulty balancing (prefer easier courses when quarter is already difficult)
          const currentDifficulty = quarter.courses.reduce((sum, c) => sum + c.difficulty, 0) / Math.max(1, quarter.courses.length);
          if (currentDifficulty >= 3.5) {
            scoreA += a.difficulty <= 2 ? 15 : -10;
            scoreB += b.difficulty <= 2 ? 15 : -10;
          }

          return scoreB - scoreA;
        });

        // Add courses to quarter with enhanced logic
        let currentUnits = 0;
        let currentDifficulty = 0;
        let coursesAdded = 0;
        
        for (const course of eligibleCourses) {
          const newUnits = currentUnits + course.units;
          const newDifficulty = quarter.courses.length === 0 ? course.difficulty :
            (currentDifficulty * quarter.courses.length + course.difficulty) / (quarter.courses.length + 1);

          // Check constraints
          const exceedsUnits = newUnits > constraints.maxUnitsPerQuarter;
          const exceedsDifficulty = newDifficulty > constraints.maxDifficultyPerQuarter;
          
          // For accelerated track, allow slight constraint flexibility to meet minimum courses
          const canAddForAccelerated = isAccelerated && coursesAdded < minCoursesPerQuarter && 
                                      newUnits <= constraints.maxUnitsPerQuarter + 2;

          if (!exceedsUnits && !exceedsDifficulty) {
            quarter.courses.push(course);
            currentUnits = newUnits;
            currentDifficulty = newDifficulty;
            coursesAdded++;
            
            // Remove from available courses
            const courseIndex = availableCourses.findIndex(c => c.id === course.id);
            if (courseIndex !== -1) {
              availableCourses.splice(courseIndex, 1);
            }
          } else if (canAddForAccelerated && !exceedsDifficulty) {
            // Add course for accelerated track even if slightly over unit limit
            quarter.courses.push(course);
            currentUnits = newUnits;
            currentDifficulty = newDifficulty;
            coursesAdded++;
            
            const courseIndex = availableCourses.findIndex(c => c.id === course.id);
            if (courseIndex !== -1) {
              availableCourses.splice(courseIndex, 1);
            }
          }

          // Stop conditions
          const hasMinimumCourses = coursesAdded >= minCoursesPerQuarter;
          const hasMinimumUnits = currentUnits >= constraints.minUnitsPerQuarter;
          const hasReasonableLoad = coursesAdded >= 5; // Maximum reasonable course load
          
          if (hasMinimumCourses && hasMinimumUnits && !isAccelerated) {
            break;
          }
          if (hasReasonableLoad) {
            break;
          }
        }

        quarter.totalUnits = currentUnits;
        quarter.averageDifficulty = currentDifficulty;
        quarter.score = calculateQuarterScore(quarter, constraints);

        // Add conflicts for accelerated track validation
        if (isAccelerated && coursesAdded < minCoursesPerQuarter && coursesAdded > 0) {
          quarter.conflicts.push(`Accelerated track requires minimum ${minCoursesPerQuarter} courses, only ${coursesAdded} scheduled`);
        }

        // Add completed courses
        quarter.courses.forEach(course => {
          completedCourses.add(course.id);
        });

        quarters.push(quarter);
      }
    }

    return quarters;
  }, [calculateQuarterScore]);

  const optimizeSchedule = useCallback(async (
    courses: Course[],
    constraints: ScheduleConstraints,
    currentSchedule?: QuarterSchedule[]
  ): Promise<OptimizationResult> => {
    setIsOptimizing(true);
    setError(null);

    try {
      const optimizedSchedule = await generateOptimalSchedule(courses, constraints, currentSchedule);
      const score = calculateScheduleScore(optimizedSchedule, constraints);
      const improvements = suggestImprovements(optimizedSchedule, constraints);
      const warnings = validateSchedule(optimizedSchedule);

      return {
        schedule: optimizedSchedule,
        score,
        improvements,
        warnings
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Optimization failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsOptimizing(false);
    }
  }, [generateOptimalSchedule, calculateScheduleScore, suggestImprovements, validateSchedule]);

  return {
    optimizeSchedule,
    validateSchedule,
    calculateScheduleScore,
    suggestImprovements,
    isOptimizing,
    error
  };
};
