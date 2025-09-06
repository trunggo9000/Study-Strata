// AP Course to UCLA Course Conversions for Incoming Freshmen

export interface APCourse {
  apCourse: string;
  score: number;
  uclaEquivalent: string[];
  credits: number;
  description: string;
  satisfiesRequirement?: string;
}

export interface APConversion {
  studentLevel: 'freshman' | 'transfer';
  apCourses: APCourse[];
  recommendedFirstCourses: string[];
  skipToAdvanced?: string[];
}

export const apCourseConversions: APCourse[] = [
  // Computer Science Related
  {
    apCourse: "AP Computer Science A",
    score: 4,
    uclaEquivalent: ["CS31"],
    credits: 4,
    description: "Introduction to Computer Science I equivalent",
    satisfiesRequirement: "CS Core Prerequisite"
  },
  {
    apCourse: "AP Computer Science A",
    score: 5,
    uclaEquivalent: ["CS31", "CS32"],
    credits: 8,
    description: "Skip to CS33 or CS35L",
    satisfiesRequirement: "CS Core Prerequisites"
  },
  
  // Mathematics
  {
    apCourse: "AP Calculus AB",
    score: 4,
    uclaEquivalent: ["MATH31A"],
    credits: 4,
    description: "Differential Calculus equivalent",
    satisfiesRequirement: "Math Requirement"
  },
  {
    apCourse: "AP Calculus BC",
    score: 4,
    uclaEquivalent: ["MATH31A", "MATH31B"],
    credits: 8,
    description: "Differential and Integral Calculus equivalent",
    satisfiesRequirement: "Math Requirement"
  },
  {
    apCourse: "AP Statistics",
    score: 4,
    uclaEquivalent: ["STATS10"],
    credits: 4,
    description: "Introduction to Statistical Reasoning",
    satisfiesRequirement: "Statistics Requirement"
  },
  
  // Sciences
  {
    apCourse: "AP Physics C: Mechanics",
    score: 4,
    uclaEquivalent: ["PHYSICS1A"],
    credits: 4,
    description: "Mechanics equivalent",
    satisfiesRequirement: "Science Requirement"
  },
  {
    apCourse: "AP Physics C: Electricity and Magnetism",
    score: 4,
    uclaEquivalent: ["PHYSICS1B"],
    credits: 4,
    description: "Electricity and Magnetism equivalent",
    satisfiesRequirement: "Science Requirement"
  },
  {
    apCourse: "AP Chemistry",
    score: 4,
    uclaEquivalent: ["CHEM20A"],
    credits: 4,
    description: "General Chemistry equivalent",
    satisfiesRequirement: "Science Requirement"
  },
  {
    apCourse: "AP Biology",
    score: 4,
    uclaEquivalent: ["LIFESCI7A"],
    credits: 4,
    description: "Cell and Molecular Biology equivalent",
    satisfiesRequirement: "Science Requirement"
  },
  
  // General Education
  {
    apCourse: "AP English Language",
    score: 4,
    uclaEquivalent: ["ENGCOMP3"],
    credits: 4,
    description: "English Composition equivalent",
    satisfiesRequirement: "Writing I"
  },
  {
    apCourse: "AP English Literature",
    score: 4,
    uclaEquivalent: ["ENGCOMP3"],
    credits: 4,
    description: "English Composition equivalent",
    satisfiesRequirement: "Writing I"
  },
  {
    apCourse: "AP US History",
    score: 4,
    uclaEquivalent: ["HIST13A"],
    credits: 4,
    description: "US History equivalent",
    satisfiesRequirement: "Historical Analysis GE"
  },
  {
    apCourse: "AP World History",
    score: 4,
    uclaEquivalent: ["HIST1A"],
    credits: 4,
    description: "World History equivalent",
    satisfiesRequirement: "Historical Analysis GE"
  },
  {
    apCourse: "AP Psychology",
    score: 4,
    uclaEquivalent: ["PSYCH10"],
    credits: 4,
    description: "Introduction to Psychology",
    satisfiesRequirement: "Social Analysis GE"
  }
];

export const getAPConversions = (apScores: { course: string; score: number }[]): APCourse[] => {
  return apScores
    .map(({ course, score }) => 
      apCourseConversions.find(ap => 
        ap.apCourse === course && score >= ap.score
      )
    )
    .filter((conversion): conversion is APCourse => conversion !== undefined);
};

export const getRecommendedFirstCourses = (
  apConversions: APCourse[],
  major: string = "Computer Science"
): string[] => {
  const completedCourses = new Set(
    apConversions.flatMap(ap => ap.uclaEquivalent)
  );

  if (major === "Computer Science") {
    // Check CS progression
    if (completedCourses.has("CS32")) {
      return ["CS33", "CS35L", "MATH32A", "PHYSICS1A"];
    } else if (completedCourses.has("CS31")) {
      return ["CS32", "MATH31B", "PHYSICS1A", "ENGCOMP3"];
    } else {
      // True freshman - start with CS31
      return ["CS31", "MATH31A", "ENGCOMP3", "GE Course"];
    }
  }

  return ["CS31", "MATH31A", "ENGCOMP3", "GE Course"];
};

export const calculateAPCredits = (apConversions: APCourse[]): number => {
  return apConversions.reduce((total, ap) => total + ap.credits, 0);
};

export const getAdvancedPlacement = (apConversions: APCourse[]): {
  canSkipTo: string[];
  quartersSaved: number;
  creditsEarned: number;
} => {
  const completedCourses = new Set(
    apConversions.flatMap(ap => ap.uclaEquivalent)
  );
  
  const canSkipTo: string[] = [];
  
  // CS Progression
  if (completedCourses.has("CS32")) {
    canSkipTo.push("CS33", "CS35L");
  } else if (completedCourses.has("CS31")) {
    canSkipTo.push("CS32");
  }
  
  // Math Progression
  if (completedCourses.has("MATH31B")) {
    canSkipTo.push("MATH32A", "MATH33A");
  } else if (completedCourses.has("MATH31A")) {
    canSkipTo.push("MATH31B");
  }
  
  // Physics Progression
  if (completedCourses.has("PHYSICS1A")) {
    canSkipTo.push("PHYSICS1B");
  }
  
  const creditsEarned = calculateAPCredits(apConversions);
  const quartersSaved = Math.floor(creditsEarned / 12); // Assuming 12 credits per quarter
  
  return {
    canSkipTo,
    quartersSaved,
    creditsEarned
  };
};
