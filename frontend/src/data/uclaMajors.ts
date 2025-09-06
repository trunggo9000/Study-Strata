export interface UCLAMajor {
  id: string;
  name: string;
  school: string;
  degree: string;
  description: string;
  required_courses: string[];
  electives: {
    category: string;
    choose: number;
    options: string[];
  }[];
  ge_requirements: {
    [category: string]: number;
  };
  total_units: number;
  typical_duration: string;
}

export const uclaMajors: UCLAMajor[] = [
  // Engineering & Applied Science
  {
    id: "CS_BS",
    name: "Computer Science",
    school: "Henry Samueli School of Engineering and Applied Science",
    degree: "Bachelor of Science",
    description: "Comprehensive program covering algorithms, software engineering, systems, and theoretical computer science.",
    required_courses: [
      "CS31", "CS32", "CS33", "CS35L", "CS111", "CS118", "CS131", "CS132", "CS180", "CS181",
      "MATH31A", "MATH31B", "MATH32A", "MATH32B", "MATH33A", "MATH33B", "MATH61",
      "PHYSICS1A", "PHYSICS1B", "PHYSICS1C", "PHYSICS4AL", "PHYSICS4BL"
    ],
    electives: [
      {
        category: "Upper Division CS Electives",
        choose: 3,
        options: ["CS143", "CS144", "CS145", "CS146", "CS161", "CS162", "CS163", "CS164", "CS165", "CS166", "CS167", "CS168", "CS169", "CS170", "CS171", "CS172", "CS174A", "CS174B", "CS175", "CS176", "CS177", "CS178", "CS179", "CS183", "CS184", "CS185", "CS186", "CS187", "CS188", "CS189"]
      }
    ],
    ge_requirements: {
      "Writing I": 1,
      "Writing II": 1,
      "Foundations of Arts and Humanities": 3,
      "Foundations of Society and Culture": 3,
      "Foundations of Scientific Inquiry": 2
    },
    total_units: 180,
    typical_duration: "4 years"
  },
  {
    id: "CSE_BS",
    name: "Computer Science and Engineering",
    school: "Henry Samueli School of Engineering and Applied Science",
    degree: "Bachelor of Science",
    description: "Interdisciplinary program combining computer science with electrical engineering principles.",
    required_courses: [
      "CS31", "CS32", "CS33", "CS35L", "CS111", "CS118", "CS131",
      "ECE3", "ECE10", "ECE100", "ECE102", "ECE115A", "ECE115B", "ECE115C",
      "MATH31A", "MATH31B", "MATH32A", "MATH32B", "MATH33A", "MATH33B", "MATH61",
      "PHYSICS1A", "PHYSICS1B", "PHYSICS1C", "PHYSICS4AL", "PHYSICS4BL"
    ],
    electives: [
      {
        category: "Technical Electives",
        choose: 4,
        options: ["CS143", "CS161", "CS162", "CS180", "CS181", "ECE113", "ECE114", "ECE116", "ECE131A", "ECE132A"]
      }
    ],
    ge_requirements: {
      "Writing I": 1,
      "Writing II": 1,
      "Foundations of Arts and Humanities": 3,
      "Foundations of Society and Culture": 3,
      "Foundations of Scientific Inquiry": 2
    },
    total_units: 180,
    typical_duration: "4 years"
  },
  {
    id: "EE_BS",
    name: "Electrical Engineering",
    school: "Henry Samueli School of Engineering and Applied Science",
    degree: "Bachelor of Science",
    description: "Comprehensive electrical engineering program covering circuits, signals, systems, and electronics.",
    required_courses: [
      "ECE3", "ECE10", "ECE100", "ECE102", "ECE113", "ECE115A", "ECE115B", "ECE115C", "ECE131A", "ECE132A",
      "MATH31A", "MATH31B", "MATH32A", "MATH32B", "MATH33A", "MATH33B", "MATH61", "MATH131A",
      "PHYSICS1A", "PHYSICS1B", "PHYSICS1C", "PHYSICS4AL", "PHYSICS4BL"
    ],
    electives: [
      {
        category: "Technical Area Electives",
        choose: 5,
        options: ["ECE114", "ECE116", "ECE133A", "ECE133B", "ECE141", "ECE142", "ECE161", "ECE162", "ECE163", "ECE164"]
      }
    ],
    ge_requirements: {
      "Writing I": 1,
      "Writing II": 1,
      "Foundations of Arts and Humanities": 3,
      "Foundations of Society and Culture": 3,
      "Foundations of Scientific Inquiry": 2
    },
    total_units: 180,
    typical_duration: "4 years"
  },
  {
    id: "ME_BS",
    name: "Mechanical Engineering",
    school: "Henry Samueli School of Engineering and Applied Science",
    degree: "Bachelor of Science",
    description: "Mechanical engineering program covering thermodynamics, fluid mechanics, materials, and design.",
    required_courses: [
      "MAE2", "MAE3", "MAE94", "MAE101A", "MAE101B", "MAE102", "MAE103", "MAE105A", "MAE105D", "MAE107", "MAE131A", "MAE156A", "MAE162A", "MAE171A",
      "MATH31A", "MATH31B", "MATH32A", "MATH32B", "MATH33A", "MATH33B", "MATH61", "MATH131A",
      "PHYSICS1A", "PHYSICS1B", "PHYSICS1C", "PHYSICS4AL", "PHYSICS4BL",
      "CHEM20A", "CHEM20B"
    ],
    electives: [
      {
        category: "Technical Electives",
        choose: 4,
        options: ["MAE110A", "MAE130A", "MAE150A", "MAE160", "MAE166", "MAE175A", "MAE180A", "MAE185"]
      }
    ],
    ge_requirements: {
      "Writing I": 1,
      "Writing II": 1,
      "Foundations of Arts and Humanities": 3,
      "Foundations of Society and Culture": 3,
      "Foundations of Scientific Inquiry": 2
    },
    total_units: 180,
    typical_duration: "4 years"
  },

  // College of Letters and Science - Physical Sciences
  {
    id: "MATH_BS",
    name: "Mathematics",
    school: "College of Letters and Science",
    degree: "Bachelor of Science",
    description: "Rigorous mathematics program covering analysis, algebra, topology, and applied mathematics.",
    required_courses: [
      "MATH31A", "MATH31B", "MATH32A", "MATH32B", "MATH33A", "MATH33B", "MATH61", "MATH115A", "MATH131A", "MATH131B", "MATH132", "MATH142"
    ],
    electives: [
      {
        category: "Upper Division Mathematics",
        choose: 6,
        options: ["MATH110A", "MATH110B", "MATH115B", "MATH116", "MATH117", "MATH120A", "MATH120B", "MATH121", "MATH134", "MATH135", "MATH136", "MATH141", "MATH145", "MATH146", "MATH151A", "MATH151B", "MATH156", "MATH164", "MATH167", "MATH168", "MATH170A", "MATH170B", "MATH171", "MATH174", "MATH175", "MATH180", "MATH181", "MATH182", "MATH184", "MATH191A"]
      }
    ],
    ge_requirements: {
      "Writing I": 1,
      "Writing II": 1,
      "Foundations of Arts and Humanities": 3,
      "Foundations of Society and Culture": 3,
      "Foundations of Scientific Inquiry": 2,
      "Foundations of the Arts": 2,
      "Historical Analysis": 1,
      "Literary and Cultural Analysis": 1,
      "Philosophical and Linguistic Analysis": 1,
      "Visual and Performance Arts Analysis": 1
    },
    total_units: 180,
    typical_duration: "4 years"
  },
  {
    id: "PHYSICS_BS",
    name: "Physics",
    school: "College of Letters and Science",
    degree: "Bachelor of Science",
    description: "Comprehensive physics program covering classical mechanics, quantum mechanics, electromagnetism, and thermodynamics.",
    required_courses: [
      "PHYSICS1A", "PHYSICS1B", "PHYSICS1C", "PHYSICS4AL", "PHYSICS4BL", "PHYSICS4CL", "PHYSICS105A", "PHYSICS105B", "PHYSICS110A", "PHYSICS110B", "PHYSICS112", "PHYSICS115A", "PHYSICS115B", "PHYSICS115C",
      "MATH31A", "MATH31B", "MATH32A", "MATH32B", "MATH33A", "MATH33B", "MATH61", "MATH131A", "MATH131B", "MATH132"
    ],
    electives: [
      {
        category: "Upper Division Physics",
        choose: 3,
        options: ["PHYSICS116A", "PHYSICS116B", "PHYSICS116C", "PHYSICS117", "PHYSICS118", "PHYSICS119", "PHYSICS127", "PHYSICS129", "PHYSICS131", "PHYSICS132", "PHYSICS133", "PHYSICS134", "PHYSICS135A", "PHYSICS135B"]
      }
    ],
    ge_requirements: {
      "Writing I": 1,
      "Writing II": 1,
      "Foundations of Arts and Humanities": 3,
      "Foundations of Society and Culture": 3,
      "Foundations of Scientific Inquiry": 2,
      "Foundations of the Arts": 2,
      "Historical Analysis": 1,
      "Literary and Cultural Analysis": 1,
      "Philosophical and Linguistic Analysis": 1,
      "Visual and Performance Arts Analysis": 1
    },
    total_units: 180,
    typical_duration: "4 years"
  },
  {
    id: "CHEM_BS",
    name: "Chemistry",
    school: "College of Letters and Science",
    degree: "Bachelor of Science",
    description: "Chemistry program covering organic, inorganic, physical, and analytical chemistry.",
    required_courses: [
      "CHEM20A", "CHEM20B", "CHEM20L", "CHEM30A", "CHEM30AL", "CHEM30B", "CHEM30BL", "CHEM30C", "CHEM30CL", "CHEM110A", "CHEM113A", "CHEM113B", "CHEM156", "CHEM165", "CHEM171",
      "MATH31A", "MATH31B", "MATH32A", "MATH32B", "MATH33A",
      "PHYSICS1A", "PHYSICS1B", "PHYSICS1C", "PHYSICS4AL", "PHYSICS4BL"
    ],
    electives: [
      {
        category: "Advanced Chemistry",
        choose: 3,
        options: ["CHEM114", "CHEM115", "CHEM116", "CHEM117", "CHEM120A", "CHEM120B", "CHEM153A", "CHEM153B", "CHEM154", "CHEM155", "CHEM172", "CHEM173", "CHEM174", "CHEM175"]
      }
    ],
    ge_requirements: {
      "Writing I": 1,
      "Writing II": 1,
      "Foundations of Arts and Humanities": 3,
      "Foundations of Society and Culture": 3,
      "Foundations of Scientific Inquiry": 2,
      "Foundations of the Arts": 2,
      "Historical Analysis": 1,
      "Literary and Cultural Analysis": 1,
      "Philosophical and Linguistic Analysis": 1,
      "Visual and Performance Arts Analysis": 1
    },
    total_units: 180,
    typical_duration: "4 years"
  },
  {
    id: "STATS_BS",
    name: "Statistics",
    school: "College of Letters and Science",
    degree: "Bachelor of Science",
    description: "Statistics program covering probability theory, statistical inference, and data analysis.",
    required_courses: [
      "STATS10", "STATS100A", "STATS100B", "STATS100C", "STATS101A", "STATS101B", "STATS101C", "STATS102A", "STATS102B", "STATS102C",
      "MATH31A", "MATH31B", "MATH32A", "MATH32B", "MATH33A", "MATH33B", "MATH61", "MATH115A"
    ],
    electives: [
      {
        category: "Statistics Electives",
        choose: 4,
        options: ["STATS103", "STATS110", "STATS111", "STATS112", "STATS113", "STATS114", "STATS115", "STATS116", "STATS117", "STATS118", "STATS119", "STATS120A", "STATS120B", "STATS120C"]
      }
    ],
    ge_requirements: {
      "Writing I": 1,
      "Writing II": 1,
      "Foundations of Arts and Humanities": 3,
      "Foundations of Society and Culture": 3,
      "Foundations of Scientific Inquiry": 2,
      "Foundations of the Arts": 2,
      "Historical Analysis": 1,
      "Literary and Cultural Analysis": 1,
      "Philosophical and Linguistic Analysis": 1,
      "Visual and Performance Arts Analysis": 1
    },
    total_units: 180,
    typical_duration: "4 years"
  },

  // College of Letters and Science - Life Sciences
  {
    id: "BIOLOGY_BS",
    name: "Biology",
    school: "College of Letters and Science",
    degree: "Bachelor of Science",
    description: "Comprehensive biology program covering molecular biology, ecology, evolution, and physiology.",
    required_courses: [
      "LIFESCI7A", "LIFESCI7B", "LIFESCI7C", "LIFESCI23L", "LIFESCI30A", "LIFESCI30B", "LIFESCI30C", "LIFESCI107", "LIFESCI110",
      "CHEM14A", "CHEM14B", "CHEM14C", "CHEM14D", "CHEM153A",
      "MATH3A", "MATH3B", "STATS13"
    ],
    electives: [
      {
        category: "Upper Division Biology",
        choose: 6,
        options: ["LIFESCI102", "LIFESCI103", "LIFESCI104", "LIFESCI105", "LIFESCI106", "LIFESCI108", "LIFESCI109", "LIFESCI111", "LIFESCI112", "LIFESCI115", "LIFESCI120", "LIFESCI138", "LIFESCI140", "LIFESCI142", "LIFESCI143", "LIFESCI144", "LIFESCI145", "LIFESCI146", "LIFESCI147", "LIFESCI148", "LIFESCI149"]
      }
    ],
    ge_requirements: {
      "Writing I": 1,
      "Writing II": 1,
      "Foundations of Arts and Humanities": 3,
      "Foundations of Society and Culture": 3,
      "Foundations of Scientific Inquiry": 2,
      "Foundations of the Arts": 2,
      "Historical Analysis": 1,
      "Literary and Cultural Analysis": 1,
      "Philosophical and Linguistic Analysis": 1,
      "Visual and Performance Arts Analysis": 1
    },
    total_units: 180,
    typical_duration: "4 years"
  },

  // College of Letters and Science - Social Sciences
  {
    id: "ECON_BA",
    name: "Economics",
    school: "College of Letters and Science",
    degree: "Bachelor of Arts",
    description: "Economics program covering microeconomics, macroeconomics, econometrics, and economic theory.",
    required_courses: [
      "ECON1", "ECON2", "ECON11", "ECON41", "ECON101", "ECON102", "ECON103", "ECON106F", "ECON106G",
      "MATH31A", "MATH31B"
    ],
    electives: [
      {
        category: "Upper Division Economics",
        choose: 6,
        options: ["ECON104", "ECON105", "ECON106E", "ECON106I", "ECON106P", "ECON107", "ECON110A", "ECON110B", "ECON113", "ECON114", "ECON115", "ECON121", "ECON122", "ECON131", "ECON132", "ECON133", "ECON134", "ECON135", "ECON136", "ECON137", "ECON138", "ECON141", "ECON142", "ECON143", "ECON144", "ECON145", "ECON147", "ECON148", "ECON149", "ECON150", "ECON151", "ECON152", "ECON153", "ECON154", "ECON155", "ECON156", "ECON157", "ECON158", "ECON159", "ECON160", "ECON161", "ECON162", "ECON164", "ECON165", "ECON166", "ECON167", "ECON168", "ECON169", "ECON170", "ECON171", "ECON172", "ECON173", "ECON174", "ECON175", "ECON176", "ECON177", "ECON178", "ECON179", "ECON180", "ECON181", "ECON182", "ECON183", "ECON184", "ECON186", "ECON187", "ECON188"]
      }
    ],
    ge_requirements: {
      "Writing I": 1,
      "Writing II": 1,
      "Foundations of Arts and Humanities": 3,
      "Foundations of Society and Culture": 3,
      "Foundations of Scientific Inquiry": 3,
      "Foundations of the Arts": 2,
      "Historical Analysis": 1,
      "Literary and Cultural Analysis": 1,
      "Philosophical and Linguistic Analysis": 1,
      "Visual and Performance Arts Analysis": 1
    },
    total_units: 180,
    typical_duration: "4 years"
  },
  {
    id: "PSYCH_BA",
    name: "Psychology",
    school: "College of Letters and Science",
    degree: "Bachelor of Arts",
    description: "Psychology program covering cognitive, developmental, social, and clinical psychology.",
    required_courses: [
      "PSYCH10", "PSYCH100A", "PSYCH100B", "PSYCH110", "PSYCH115", "PSYCH120A", "PSYCH120B", "PSYCH127A",
      "STATS10"
    ],
    electives: [
      {
        category: "Upper Division Psychology",
        choose: 7,
        options: ["PSYCH85", "PSYCH119A", "PSYCH119B", "PSYCH119C", "PSYCH119D", "PSYCH119E", "PSYCH119F", "PSYCH119G", "PSYCH119H", "PSYCH119I", "PSYCH119J", "PSYCH119K", "PSYCH119L", "PSYCH119M", "PSYCH119N", "PSYCH119P", "PSYCH119Q", "PSYCH119R", "PSYCH119S", "PSYCH119T", "PSYCH119U", "PSYCH119V", "PSYCH119W", "PSYCH119X", "PSYCH120C", "PSYCH121", "PSYCH124A", "PSYCH124B", "PSYCH124C", "PSYCH124D", "PSYCH124E", "PSYCH124F", "PSYCH124G", "PSYCH124H", "PSYCH124I", "PSYCH124J", "PSYCH124K", "PSYCH124L", "PSYCH124M", "PSYCH124N", "PSYCH124P", "PSYCH124Q", "PSYCH124R", "PSYCH124S", "PSYCH124T", "PSYCH124U", "PSYCH124V", "PSYCH124W", "PSYCH124X", "PSYCH127B", "PSYCH129A", "PSYCH129B", "PSYCH129C", "PSYCH129D", "PSYCH129E", "PSYCH129F", "PSYCH129G", "PSYCH129H", "PSYCH129I", "PSYCH129J", "PSYCH129K", "PSYCH129L", "PSYCH129M", "PSYCH129N", "PSYCH129P", "PSYCH129Q", "PSYCH129R", "PSYCH129S", "PSYCH129T", "PSYCH129U", "PSYCH129V", "PSYCH129W", "PSYCH129X"]
      }
    ],
    ge_requirements: {
      "Writing I": 1,
      "Writing II": 1,
      "Foundations of Arts and Humanities": 3,
      "Foundations of Society and Culture": 3,
      "Foundations of Scientific Inquiry": 3,
      "Foundations of the Arts": 2,
      "Historical Analysis": 1,
      "Literary and Cultural Analysis": 1,
      "Philosophical and Linguistic Analysis": 1,
      "Visual and Performance Arts Analysis": 1
    },
    total_units: 180,
    typical_duration: "4 years"
  },

  // Business Economics (Special Program)
  {
    id: "BIZ_ECON_BA",
    name: "Business Economics",
    school: "College of Letters and Science",
    degree: "Bachelor of Arts",
    description: "Interdisciplinary program combining economics with business applications and management principles.",
    required_courses: [
      "ECON1", "ECON2", "ECON11", "ECON41", "ECON101", "ECON102", "ECON103", "ECON106F", "ECON106G",
      "MGMT1A", "MGMT1B", "MGMT1C", "MGMT120A", "MGMT120B", "MGMT122", "MGMT127", "MGMT160", "MGMT180",
      "MATH31A", "MATH31B"
    ],
    electives: [
      {
        category: "Business Economics Electives",
        choose: 4,
        options: ["ECON104", "ECON105", "ECON106E", "ECON106I", "ECON106P", "ECON107", "ECON110A", "ECON110B", "ECON113", "ECON114", "ECON115", "MGMT121", "MGMT123", "MGMT124", "MGMT125", "MGMT126", "MGMT128", "MGMT129", "MGMT130", "MGMT140", "MGMT150", "MGMT170", "MGMT190"]
      }
    ],
    ge_requirements: {
      "Writing I": 1,
      "Writing II": 1,
      "Foundations of Arts and Humanities": 3,
      "Foundations of Society and Culture": 3,
      "Foundations of Scientific Inquiry": 3,
      "Foundations of the Arts": 2,
      "Historical Analysis": 1,
      "Literary and Cultural Analysis": 1,
      "Philosophical and Linguistic Analysis": 1,
      "Visual and Performance Arts Analysis": 1
    },
    total_units: 180,
    typical_duration: "4 years"
  }
];

export const getMajorById = (id: string): UCLAMajor | undefined => {
  return uclaMajors.find(major => major.id === id);
};

export const getMajorsBySchool = (school: string): UCLAMajor[] => {
  return uclaMajors.filter(major => major.school === school);
};

export const getAllSchools = (): string[] => {
  return Array.from(new Set(uclaMajors.map(major => major.school)));
};

export const searchMajors = (query: string): UCLAMajor[] => {
  const lowercaseQuery = query.toLowerCase();
  return uclaMajors.filter(major => 
    major.name.toLowerCase().includes(lowercaseQuery) ||
    major.school.toLowerCase().includes(lowercaseQuery) ||
    major.id.toLowerCase().includes(lowercaseQuery)
  );
};
