// Comprehensive course database for different majors
export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  type: "core" | "elective" | "ge" | "math" | "science";
  prerequisites: string[];
  difficulty: "easy" | "medium" | "hard";
  description: string;
  quarters: string[];
  major: string[];
  professors?: string[];
  avgGpa?: number;
  tags?: string[];
}

export interface ScheduledCourse extends Course {
  instructor: string;
  location: string;
  startTime: string;
  endTime: string;
  days: string[];
}

// Computer Science Courses
export const computerScienceCourses: Course[] = [
  // Core CS Courses
  {
    id: "cs31",
    code: "CS31",
    name: "Introduction to Computer Science I",
    credits: 4,
    prerequisites: [],
    description: "Introduction to computer science via problem solving, programming, and computational thinking.",
    difficulty: "medium",
    type: "core",
    quarters: ["Fall", "Winter", "Spring"],
    major: ["Computer Science"]
  },
  {
    id: "cs32",
    code: "CS32",
    name: "Introduction to Computer Science II",
    credits: 4,
    prerequisites: ["CS31"],
    description: "Object-oriented software development. Abstract data type definition and use.",
    difficulty: "medium",
    type: "core",
    quarters: ["Fall", "Winter", "Spring"],
    major: ["Computer Science"]
  },
  {
    id: "cs33",
    code: "CS33",
    name: "Introduction to Computer Organization",
    credits: 4,
    prerequisites: ["CS32"],
    description: "Introductory course on computer architecture, assembly language, and system programming.",
    difficulty: "hard",
    type: "core",
    quarters: ["Fall", "Winter", "Spring"],
    major: ["Computer Science"]
  },
  {
    id: "cs35l",
    code: "CS35L",
    name: "Software Construction",
    credits: 4,
    prerequisites: ["CS32"],
    description: "Fundamentals of tools and environments for software construction projects.",
    difficulty: "medium",
    type: "core",
    quarters: ["Fall", "Winter", "Spring"],
    major: ["Computer Science"]
  },
  {
    id: "cs111",
    code: "CS111",
    name: "Operating Systems Principles",
    credits: 4,
    prerequisites: ["CS33", "CS35L"],
    description: "Introduction to operating systems design and evaluation.",
    difficulty: "hard",
    type: "core",
    quarters: ["Fall", "Winter", "Spring"],
    major: ["Computer Science"]
  },
  {
    id: "cs118",
    code: "CS118",
    name: "Computer Network Fundamentals",
    credits: 4,
    prerequisites: ["CS111"],
    description: "Introduction to design and performance evaluation of computer networks.",
    difficulty: "hard",
    type: "core",
    quarters: ["Fall", "Spring"],
    major: ["Computer Science"]
  },
  {
    id: "cs131",
    code: "CS131",
    name: "Programming Languages",
    credits: 4,
    prerequisites: ["CS32", "CS33"],
    description: "Basic concepts in design and use of programming languages.",
    difficulty: "hard",
    type: "core",
    quarters: ["Fall", "Winter"],
    major: ["Computer Science"]
  },
  {
    id: "cs180",
    code: "CS180",
    name: "Introduction to Algorithms and Complexity",
    credits: 4,
    prerequisites: ["CS32", "MATH61"],
    description: "Introduction to design and analysis of algorithms.",
    difficulty: "hard",
    type: "core",
    quarters: ["Fall", "Winter", "Spring"],
    major: ["Computer Science"]
  },
  {
    id: "cs181",
    code: "CS181",
    name: "Introduction to Formal Languages and Automata Theory",
    credits: 4,
    prerequisites: ["CS32", "MATH61"],
    description: "Introduction to mathematical foundations of computer science.",
    difficulty: "hard",
    type: "core",
    quarters: ["Winter", "Spring"],
    major: ["Computer Science"]
  },
  
  // Upper Division Electives
  {
    id: "cs143",
    code: "CS143",
    name: "Database Systems",
    credits: 4,
    prerequisites: ["CS111"],
    description: "Introduction to database management systems.",
    difficulty: "medium",
    type: "elective",
    quarters: ["Fall", "Spring"],
    major: ["Computer Science"]
  },
  {
    id: "cs161",
    code: "CS161",
    name: "Fundamentals of Artificial Intelligence",
    credits: 4,
    prerequisites: ["CS180"],
    description: "Introduction to artificial intelligence techniques.",
    difficulty: "hard",
    type: "elective",
    quarters: ["Fall", "Winter"],
    major: ["Computer Science"]
  },
  {
    id: "cs162",
    code: "CS162",
    name: "Natural Language Processing",
    credits: 4,
    prerequisites: ["CS161"],
    description: "Introduction to computational linguistics and natural language processing.",
    difficulty: "hard",
    type: "elective",
    quarters: ["Spring"],
    major: ["Computer Science"]
  },
  {
    id: "cs170a",
    code: "CS170A",
    name: "Introduction to Machine Learning and Data Mining",
    credits: 4,
    prerequisites: ["CS180", "MATH33A", "STATS100A"],
    description: "Introduction to machine learning algorithms and data mining techniques.",
    difficulty: "hard",
    type: "elective",
    quarters: ["Fall", "Winter"],
    major: ["Computer Science"]
  },
  {
    id: "cs174a",
    code: "CS174A",
    name: "Introduction to Computer Graphics",
    credits: 4,
    prerequisites: ["CS180", "MATH33A"],
    description: "Introduction to computer graphics software and hardware.",
    difficulty: "medium",
    type: "elective",
    quarters: ["Fall", "Spring"],
    major: ["Computer Science"]
  },
  {
    id: "cs188",
    code: "CS188",
    name: "Computer Vision",
    credits: 4,
    prerequisites: ["CS180", "MATH33A"],
    description: "Introduction to computer vision and image processing.",
    difficulty: "hard",
    type: "elective",
    quarters: ["Winter"],
    major: ["Computer Science"]
  }
];

// Mathematics Courses
export const mathematicsCourses: Course[] = [
  {
    id: "math31a",
    code: "MATH31A",
    name: "Differential and Integral Calculus",
    credits: 4,
    prerequisites: [],
    description: "Introduction to differential and integral calculus.",
    difficulty: "medium",
    type: "math",
    quarters: ["Fall", "Winter", "Spring"],
    major: ["Computer Science", "Mathematics", "Engineering"]
  },
  {
    id: "math31b",
    code: "MATH31B",
    name: "Integration and Infinite Series",
    credits: 4,
    prerequisites: ["MATH31A"],
    description: "Continuation of differential and integral calculus.",
    difficulty: "medium",
    type: "math",
    quarters: ["Fall", "Winter", "Spring"],
    major: ["Computer Science", "Mathematics", "Engineering"]
  },
  {
    id: "math32a",
    code: "MATH32A",
    name: "Calculus of Several Variables",
    credits: 4,
    prerequisites: ["MATH31B"],
    description: "Introduction to multivariable calculus.",
    difficulty: "hard",
    type: "math",
    quarters: ["Fall", "Winter", "Spring"],
    major: ["Computer Science", "Mathematics", "Engineering"]
  },
  {
    id: "math32b",
    code: "MATH32B",
    name: "Calculus of Several Variables",
    credits: 4,
    prerequisites: ["MATH32A"],
    description: "Continuation of multivariable calculus.",
    difficulty: "hard",
    type: "math",
    quarters: ["Fall", "Winter", "Spring"],
    major: ["Computer Science", "Mathematics", "Engineering"]
  },
  {
    id: "math33a",
    code: "MATH33A",
    name: "Linear Algebra and Applications",
    credits: 4,
    prerequisites: ["MATH31B"],
    description: "Introduction to linear algebra with applications.",
    difficulty: "medium",
    type: "math",
    quarters: ["Fall", "Winter", "Spring"],
    major: ["Computer Science", "Mathematics", "Engineering"]
  },
  {
    id: "math33b",
    code: "MATH33B",
    name: "Differential Equations",
    credits: 4,
    prerequisites: ["MATH33A", "MATH32A"],
    description: "Introduction to ordinary differential equations.",
    difficulty: "hard",
    type: "math",
    quarters: ["Fall", "Winter", "Spring"],
    major: ["Computer Science", "Mathematics", "Engineering"]
  },
  {
    id: "math61",
    code: "MATH61",
    name: "Introduction to Discrete Structures",
    credits: 4,
    prerequisites: ["MATH31B"],
    description: "Introduction to discrete mathematics for computer science.",
    difficulty: "medium",
    type: "math",
    quarters: ["Fall", "Winter", "Spring"],
    major: ["Computer Science", "Mathematics"]
  }
];

// Statistics Courses
export const statisticsCourses: Course[] = [
  {
    id: "stats100a",
    code: "STATS100A",
    name: "Introduction to Probability",
    credits: 4,
    prerequisites: ["MATH32A"],
    description: "Introduction to probability theory.",
    difficulty: "medium",
    type: "math",
    quarters: ["Fall", "Winter", "Spring"],
    major: ["Computer Science", "Mathematics", "Statistics"]
  },
  {
    id: "stats100b",
    code: "STATS100B",
    name: "Introduction to Mathematical Statistics",
    credits: 4,
    prerequisites: ["STATS100A"],
    description: "Introduction to statistical inference.",
    difficulty: "hard",
    type: "math",
    quarters: ["Fall", "Winter", "Spring"],
    major: ["Computer Science", "Mathematics", "Statistics"]
  }
];

// General Education Courses
export const generalEducationCourses: Course[] = [
  {
    id: "engcomp3",
    code: "ENGCOMP3",
    name: "English Composition 3",
    credits: 4,
    prerequisites: [],
    description: "Advanced composition and critical thinking.",
    difficulty: "easy",
    type: "ge",
    quarters: ["Fall", "Winter", "Spring"],
    major: ["Computer Science", "Mathematics", "Engineering", "All"]
  },
  {
    id: "philos7",
    code: "PHILOS7",
    name: "Introduction to Philosophy",
    credits: 4,
    prerequisites: [],
    description: "Introduction to major philosophical problems and methods.",
    difficulty: "medium",
    type: "ge",
    quarters: ["Fall", "Winter", "Spring"],
    major: ["All"]
  },
  {
    id: "hist13a",
    code: "HIST13A",
    name: "History of the United States",
    credits: 4,
    prerequisites: [],
    description: "Survey of American history from colonial times to present.",
    difficulty: "easy",
    type: "ge",
    quarters: ["Fall", "Winter", "Spring"],
    major: ["All"]
  },
  {
    id: "psych10",
    code: "PSYCH10",
    name: "Introduction to Psychology",
    credits: 4,
    prerequisites: [],
    description: "Introduction to psychological science.",
    difficulty: "easy",
    type: "ge",
    quarters: ["Fall", "Winter", "Spring"],
    major: ["All"]
  },
  {
    id: "econ1",
    code: "ECON1",
    name: "Principles of Economics",
    credits: 4,
    prerequisites: [],
    description: "Introduction to microeconomic and macroeconomic principles.",
    difficulty: "medium",
    type: "ge",
    quarters: ["Fall", "Winter", "Spring"],
    major: ["All"]
  }
];

// Physics Courses
export const physicsCourses: Course[] = [
  {
    id: "physics1a",
    code: "PHYSICS1A",
    name: "Physics for Scientists and Engineers: Mechanics",
    credits: 4,
    prerequisites: ["MATH31A"],
    description: "Introduction to mechanics for science and engineering students.",
    difficulty: "hard",
    type: "science",
    quarters: ["Fall", "Winter", "Spring"],
    major: ["Computer Science", "Engineering", "Physics"]
  },
  {
    id: "physics1b",
    code: "PHYSICS1B",
    name: "Physics for Scientists and Engineers: Oscillations, Waves, Electric and Magnetic Fields",
    credits: 4,
    prerequisites: ["PHYSICS1A", "MATH32A"],
    description: "Continuation of physics for science and engineering students.",
    difficulty: "hard",
    type: "science",
    quarters: ["Fall", "Winter", "Spring"],
    major: ["Computer Science", "Engineering", "Physics"]
  },
  {
    id: "physics1c",
    code: "PHYSICS1C",
    name: "Physics for Scientists and Engineers: Electrodynamics, Optics, and Special Relativity",
    credits: 4,
    prerequisites: ["PHYSICS1B"],
    description: "Advanced topics in physics for science and engineering students.",
    difficulty: "hard",
    type: "science",
    quarters: ["Fall", "Winter", "Spring"],
    major: ["Computer Science", "Engineering", "Physics"]
  }
];

// Combine all courses
export const allCourses: Course[] = [
  ...computerScienceCourses,
  ...mathematicsCourses,
  ...statisticsCourses,
  ...generalEducationCourses,
  ...physicsCourses
];

// Get courses by major
export const getCoursesByMajor = (major: string): Course[] => {
  return allCourses.filter(course => 
    course.major.includes(major) || course.major.includes("All")
  );
};

// Get prerequisites for a course
export const getPrerequisites = (courseCode: string): Course[] => {
  const course = allCourses.find(c => c.code === courseCode);
  if (!course) return [];
  
  return course.prerequisites.map(prereqCode => 
    allCourses.find(c => c.code === prereqCode)
  ).filter(Boolean) as Course[];
};

// Check if prerequisites are met
export const arePrerequisitesMet = (courseCode: string, completedCourses: string[]): boolean => {
  const course = allCourses.find(c => c.code === courseCode);
  if (!course) return false;
  
  return course.prerequisites.every(prereq => completedCourses.includes(prereq));
};

// Get available courses (prerequisites met)
export const getAvailableCourses = (major: string, completedCourses: string[]): Course[] => {
  const majorCourses = getCoursesByMajor(major);
  return majorCourses.filter(course => 
    !completedCourses.includes(course.code) && 
    arePrerequisitesMet(course.code, completedCourses)
  );
};

// Sample current schedule data - 5 courses for 3-year accelerated track
export const sampleCurrentSchedule: ScheduledCourse[] = [
  {
    ...allCourses.find(c => c.code === "CS31")!,
    instructor: "Dr. Smith",
    location: "Boelter 5420",
    startTime: "09:00",
    endTime: "10:50",
    days: ["M", "W", "F"]
  },
  {
    ...allCourses.find(c => c.code === "MATH31A")!,
    instructor: "Prof. Johnson",
    location: "MS 6221",
    startTime: "11:00",
    endTime: "12:50",
    days: ["T", "R"]
  },
  {
    ...allCourses.find(c => c.code === "ENGCOMP3")!,
    instructor: "Dr. Williams",
    location: "Humanities A65",
    startTime: "14:00",
    endTime: "15:50",
    days: ["M", "W"]
  },
  {
    ...allCourses.find(c => c.code === "PHYSICS1A")!,
    instructor: "Prof. Chen",
    location: "Physics 1200",
    startTime: "13:00",
    endTime: "14:50",
    days: ["T", "R"]
  },
  {
    ...allCourses.find(c => c.code === "PHILOS7")!,
    instructor: "Dr. Martinez",
    location: "Humanities 210",
    startTime: "16:00",
    endTime: "17:50",
    days: ["M", "W", "F"]
  }
].filter((course, index, self) => 
  index === self.findIndex(c => c.code === course.code)
);
