import { Course } from '@/data/courseData';
import { apCourseConversions, getAPConversions, getRecommendedFirstCourses } from '@/data/apCourseConversions';

export interface StudentProfile {
  year: 'freshman' | 'sophomore' | 'junior' | 'senior';
  major: string;
  completedCourses: string[];
  apScores?: { course: string; score: number }[];
  currentGPA?: number;
}

export interface CourseRecommendation {
  courseCode: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  quarter: string;
}

export const generatePersonalizedRecommendations = (
  profile: StudentProfile,
  availableCourses: Course[]
): CourseRecommendation[] => {
  const recommendations: CourseRecommendation[] = [];
  const completedSet = new Set(profile.completedCourses);

  // Handle AP conversions for freshmen
  if (profile.year === 'freshman' && profile.apScores) {
    const apConversions = getAPConversions(profile.apScores);
    const apEquivalents = apConversions.flatMap(ap => ap.uclaEquivalent);
    apEquivalents.forEach(course => completedSet.add(course));
  }

  // Get year-appropriate recommendations
  switch (profile.year) {
    case 'freshman':
      return getFreshmanRecommendations(profile, completedSet, availableCourses);
    case 'sophomore':
      return getSophomoreRecommendations(profile, completedSet, availableCourses);
    case 'junior':
      return getJuniorRecommendations(profile, completedSet, availableCourses);
    case 'senior':
      return getSeniorRecommendations(profile, completedSet, availableCourses);
    default:
      return [];
  }
};

const getFreshmanRecommendations = (
  profile: StudentProfile,
  completed: Set<string>,
  courses: Course[]
): CourseRecommendation[] => {
  const recommendations: CourseRecommendation[] = [];

  if (profile.major === 'Computer Science') {
    // Check AP conversions first
    if (profile.apScores) {
      const apConversions = getAPConversions(profile.apScores);
      const recommendedCourses = getRecommendedFirstCourses(apConversions, profile.major);
      
      recommendedCourses.forEach((courseCode, index) => {
        if (!completed.has(courseCode)) {
          let reason = '';
          let priority: 'high' | 'medium' | 'low' = 'medium';
          
          if (courseCode === 'CS31') {
            reason = 'Essential first course for Computer Science majors. Start your programming foundation here.';
            priority = 'high';
          } else if (courseCode === 'CS32') {
            reason = 'Continue your CS foundation with object-oriented programming and data structures.';
            priority = 'high';
          } else if (courseCode === 'CS33') {
            reason = 'Advanced placement allows you to skip to computer organization and assembly language.';
            priority = 'high';
          } else if (courseCode.startsWith('MATH')) {
            reason = 'Mathematical foundation required for advanced CS courses.';
            priority = 'high';
          } else if (courseCode === 'ENGCOMP3') {
            reason = 'Fulfill your Writing I requirement early.';
            priority = 'medium';
          } else {
            reason = 'Recommended based on your AP credit and major requirements.';
            priority = 'medium';
          }
          
          recommendations.push({
            courseCode,
            reason,
            priority,
            quarter: 'Fall'
          });
        }
      });
    } else {
      // No AP scores - true freshman path
      if (!completed.has('CS31')) {
        recommendations.push({
          courseCode: 'CS31',
          reason: 'Essential first course for Computer Science majors. All CS students must start here.',
          priority: 'high',
          quarter: 'Fall'
        });
      }
      
      if (!completed.has('MATH31A')) {
        recommendations.push({
          courseCode: 'MATH31A',
          reason: 'Differential calculus foundation required for CS and engineering.',
          priority: 'high',
          quarter: 'Fall'
        });
      }
      
      if (!completed.has('ENGCOMP3')) {
        recommendations.push({
          courseCode: 'ENGCOMP3',
          reason: 'Complete your Writing I requirement early in your academic career.',
          priority: 'medium',
          quarter: 'Fall'
        });
      }
    }
  }

  return recommendations;
};

const getSophomoreRecommendations = (
  profile: StudentProfile,
  completed: Set<string>,
  courses: Course[]
): CourseRecommendation[] => {
  const recommendations: CourseRecommendation[] = [];

  if (profile.major === 'Computer Science') {
    // Core CS sequence
    if (completed.has('CS31') && !completed.has('CS32')) {
      recommendations.push({
        courseCode: 'CS32',
        reason: 'Continue your CS foundation with object-oriented programming and data structures.',
        priority: 'high',
        quarter: 'Winter'
      });
    }
    
    if (completed.has('CS32') && !completed.has('CS33')) {
      recommendations.push({
        courseCode: 'CS33',
        reason: 'Computer organization and assembly language - prerequisite for many upper-division courses.',
        priority: 'high',
        quarter: 'Spring'
      });
    }
    
    if (completed.has('CS32') && !completed.has('CS35L')) {
      recommendations.push({
        courseCode: 'CS35L',
        reason: 'Software construction tools and environments - essential for practical programming.',
        priority: 'high',
        quarter: 'Winter'
      });
    }

    // Math progression
    if (completed.has('MATH31A') && !completed.has('MATH31B')) {
      recommendations.push({
        courseCode: 'MATH31B',
        reason: 'Integral calculus required for advanced mathematics and CS theory.',
        priority: 'high',
        quarter: 'Winter'
      });
    }
    
    if (completed.has('MATH31B') && !completed.has('MATH32A')) {
      recommendations.push({
        courseCode: 'MATH32A',
        reason: 'Multivariable calculus for advanced CS applications.',
        priority: 'medium',
        quarter: 'Spring'
      });
    }
  }

  return recommendations;
};

const getJuniorRecommendations = (
  profile: StudentProfile,
  completed: Set<string>,
  courses: Course[]
): CourseRecommendation[] => {
  const recommendations: CourseRecommendation[] = [];

  if (profile.major === 'Computer Science') {
    // Upper-division core courses
    if (completed.has('CS33') && completed.has('CS35L') && !completed.has('CS111')) {
      recommendations.push({
        courseCode: 'CS111',
        reason: 'Operating systems principles - critical for systems programming and advanced CS.',
        priority: 'high',
        quarter: 'Fall'
      });
    }
    
    if (!completed.has('CS180')) {
      recommendations.push({
        courseCode: 'CS180',
        reason: 'Algorithms and complexity - fundamental for all advanced CS work.',
        priority: 'high',
        quarter: 'Winter'
      });
    }
    
    // Specialization tracks
    if (completed.has('CS111') && !completed.has('CS118')) {
      recommendations.push({
        courseCode: 'CS118',
        reason: 'Computer networks - important for distributed systems and web development.',
        priority: 'medium',
        quarter: 'Spring'
      });
    }
  }

  return recommendations;
};

const getSeniorRecommendations = (
  profile: StudentProfile,
  completed: Set<string>,
  courses: Course[]
): CourseRecommendation[] => {
  const recommendations: CourseRecommendation[] = [];

  if (profile.major === 'Computer Science') {
    // Advanced electives and capstone
    if (!completed.has('CS143')) {
      recommendations.push({
        courseCode: 'CS143',
        reason: 'Database systems - highly valuable for industry applications.',
        priority: 'medium',
        quarter: 'Fall'
      });
    }
    
    if (!completed.has('CS161')) {
      recommendations.push({
        courseCode: 'CS161',
        reason: 'Artificial intelligence - increasingly important field with broad applications.',
        priority: 'medium',
        quarter: 'Winter'
      });
    }
    
    // Capstone or research
    recommendations.push({
      courseCode: 'CS188',
      reason: 'Senior capstone project to demonstrate your accumulated CS knowledge.',
      priority: 'high',
      quarter: 'Spring'
    });
  }

  return recommendations;
};

export const getInitialAdvisorMessage = (profile: StudentProfile): string => {
  if (profile.year === 'freshman') {
    if (profile.apScores && profile.apScores.length > 0) {
      const apConversions = getAPConversions(profile.apScores);
      const creditsEarned = apConversions.reduce((sum, ap) => sum + ap.credits, 0);
      
      if (apConversions.some(ap => ap.uclaEquivalent.includes('CS31'))) {
        return `Great news! Your AP Computer Science score allows you to skip CS31. I recommend starting with CS32 to continue building your programming foundation. You've earned ${creditsEarned} AP credits, giving you a head start!`;
      } else {
        return `Welcome to UCLA! As an incoming freshman, I recommend starting with CS31 - the essential first course for Computer Science majors. Your ${creditsEarned} AP credits will help with general education requirements.`;
      }
    } else {
      return `Welcome to UCLA! As a Computer Science freshman, I recommend starting with CS31 - this is where all CS students begin their programming journey. Pair it with MATH31A and a writing course for a balanced first quarter.`;
    }
  } else if (profile.year === 'sophomore') {
    return `As a sophomore CS major, you should focus on completing core prerequisites like CS33 and CS35L. These unlock many upper-division courses. What courses have you completed so far?`;
  } else if (profile.year === 'junior') {
    return `Junior year is perfect for diving into upper-division CS courses! Focus on CS111 (Operating Systems) and CS180 (Algorithms) as they're prerequisites for most advanced courses. What's your area of interest?`;
  } else {
    return `Senior year - time to specialize! Consider advanced electives in your area of interest and don't forget about capstone projects. Are you planning for industry or graduate school?`;
  }
};
