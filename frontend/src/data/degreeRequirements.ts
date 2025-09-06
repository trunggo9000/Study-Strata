import { Course, allCourses } from "./courseData";

export interface DegreeRequirement {
  category: string;
  description: string;
  requiredCourses: string[];
  minCredits: number;
  electiveOptions?: string[];
  minElectives?: number;
}

export interface DegreeProgram {
  major: string;
  totalCredits: number;
  requirements: DegreeRequirement[];
}

export const computerScienceRequirements: DegreeProgram = {
  major: "Computer Science",
  totalCredits: 180,
  requirements: [
    {
      category: "Core CS Courses",
      description: "Fundamental computer science courses required for all CS majors",
      requiredCourses: ["CS31", "CS32", "CS33", "CS35L", "CS111", "CS131", "CS180", "CS181"],
      minCredits: 32
    },
    {
      category: "Mathematics",
      description: "Mathematical foundation courses",
      requiredCourses: ["MATH31A", "MATH31B", "MATH32A", "MATH32B", "MATH33A", "MATH61"],
      minCredits: 24
    },
    {
      category: "Statistics",
      description: "Statistical analysis and probability",
      requiredCourses: ["STATS100A"],
      minCredits: 4
    },
    {
      category: "Science",
      description: "Physical science requirements",
      requiredCourses: ["PHYSICS1A", "PHYSICS1B", "PHYSICS1C"],
      minCredits: 12
    },
    {
      category: "CS Electives",
      description: "Upper division computer science electives",
      requiredCourses: [],
      minCredits: 20,
      electiveOptions: ["CS143", "CS161", "CS162", "CS170A", "CS174A", "CS188", "CS118"],
      minElectives: 5
    },
    {
      category: "General Education",
      description: "Breadth requirements across disciplines",
      requiredCourses: ["ENGCOMP3"],
      minCredits: 60,
      electiveOptions: ["PHILOS7", "HIST13A", "PSYCH10", "ECON1"],
      minElectives: 14
    }
  ]
};

export const mathematicsRequirements: DegreeProgram = {
  major: "Mathematics",
  totalCredits: 180,
  requirements: [
    {
      category: "Core Mathematics",
      description: "Essential mathematics courses",
      requiredCourses: ["MATH31A", "MATH31B", "MATH32A", "MATH32B", "MATH33A", "MATH33B", "MATH61"],
      minCredits: 28
    },
    {
      category: "Advanced Mathematics",
      description: "Upper division mathematics courses",
      requiredCourses: [],
      minCredits: 32,
      electiveOptions: ["STATS100A", "STATS100B"],
      minElectives: 8
    },
    {
      category: "Science",
      description: "Physical science requirements",
      requiredCourses: ["PHYSICS1A", "PHYSICS1B"],
      minCredits: 8
    },
    {
      category: "General Education",
      description: "Breadth requirements",
      requiredCourses: ["ENGCOMP3"],
      minCredits: 60,
      electiveOptions: ["PHILOS7", "HIST13A", "PSYCH10", "ECON1"],
      minElectives: 14
    }
  ]
};

export const getDegreeRequirements = (major: string): DegreeProgram | null => {
  switch (major) {
    case "Computer Science":
      return computerScienceRequirements;
    case "Mathematics":
      return mathematicsRequirements;
    default:
      return null;
  }
};

export const calculateProgress = (major: string, completedCourses: string[]) => {
  const requirements = getDegreeRequirements(major);
  if (!requirements) return null;

  const progress = requirements.requirements.map(req => {
    const completedRequired = req.requiredCourses.filter(course => 
      completedCourses.includes(course)
    );
    
    const completedElectives = req.electiveOptions ? 
      req.electiveOptions.filter(course => completedCourses.includes(course)) : [];
    
    const totalCompleted = completedRequired.length + completedElectives.length;
    const totalRequired = req.requiredCourses.length + (req.minElectives || 0);
    
    const completedCredits = [...completedRequired, ...completedElectives]
      .reduce((total, courseCode) => {
        const course = allCourses.find(c => c.code === courseCode);
        return total + (course?.credits || 0);
      }, 0);

    return {
      category: req.category,
      description: req.description,
      completedRequired,
      remainingRequired: req.requiredCourses.filter(course => 
        !completedCourses.includes(course)
      ),
      completedElectives,
      remainingElectives: req.electiveOptions ? 
        req.electiveOptions.filter(course => !completedCourses.includes(course)) : [],
      minElectives: req.minElectives || 0,
      completedCredits,
      minCredits: req.minCredits,
      progress: totalRequired > 0 ? (totalCompleted / totalRequired) * 100 : 0,
      isComplete: completedCredits >= req.minCredits && 
                  completedRequired.length === req.requiredCourses.length &&
                  completedElectives.length >= (req.minElectives || 0)
    };
  });

  const totalCompletedCredits = completedCourses.reduce((total, courseCode) => {
    const course = allCourses.find(c => c.code === courseCode);
    return total + (course?.credits || 0);
  }, 0);

  return {
    requirements: progress,
    totalCredits: totalCompletedCredits,
    totalRequired: requirements.totalCredits,
    overallProgress: (totalCompletedCredits / requirements.totalCredits) * 100
  };
};
