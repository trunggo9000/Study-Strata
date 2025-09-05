-- Insert comprehensive sample data for Study Strata

-- Insert additional sample courses for Computer Science
INSERT INTO public.courses (id, title, units, difficulty, offered, tags, ge_categories, description) VALUES 
('CS1', 'Introduction to Programming', 4, 2, '{"Fall", "Winter", "Spring"}', '{"programming", "introductory", "CS major"}', '{}', 'Introduction to programming concepts using Python'),
('CS35L', 'Software Construction Laboratory', 4, 3, '{"Fall", "Winter", "Spring"}', '{"programming", "tools", "CS major"}', '{}', 'Hands-on experience with software development tools and practices'),
('CS61A', 'Structure and Interpretation of Computer Programs', 4, 4, '{"Fall", "Spring"}', '{"programming", "theory", "CS major"}', '{}', 'Introduction to programming and computer science'),
('CS61B', 'Data Structures', 4, 4, '{"Fall", "Winter", "Spring"}', '{"data structures", "algorithms", "CS major"}', '{}', 'Fundamental data structures and algorithms'),
('CS61C', 'Machine Structures', 4, 4, '{"Fall", "Winter", "Spring"}', '{"systems", "architecture", "CS major"}', '{}', 'Introduction to computer architecture and assembly language'),
('CS70', 'Discrete Mathematics and Probability Theory', 4, 5, '{"Fall", "Spring"}', '{"math", "theory", "CS major"}', '{}', 'Mathematical foundations for computer science'),
('CS161', 'Computer Security', 4, 4, '{"Fall", "Spring"}', '{"security", "systems", "upper division"}', '{}', 'Introduction to computer security principles'),
('CS162', 'Operating Systems and System Programming', 4, 5, '{"Fall", "Spring"}', '{"systems", "operating systems", "upper division"}', '{}', 'Design and implementation of operating systems'),
('CS164', 'Programming Languages and Compilers', 4, 5, '{"Fall", "Spring"}', '{"compilers", "programming languages", "upper division"}', '{}', 'Design and implementation of programming languages'),
('CS170', 'Efficient Algorithms and Intractable Problems', 4, 5, '{"Fall", "Spring"}', '{"algorithms", "theory", "upper division"}', '{}', 'Design and analysis of efficient algorithms'),
('CS186', 'Introduction to Database Systems', 4, 4, '{"Fall", "Spring"}', '{"databases", "systems", "upper division"}', '{}', 'Database system architecture and implementation'),
('CS188', 'Introduction to Artificial Intelligence', 4, 4, '{"Fall", "Spring"}', '{"AI", "machine learning", "upper division"}', '{}', 'Principles and techniques of artificial intelligence'),
('CS189', 'Introduction to Machine Learning', 4, 5, '{"Fall", "Spring"}', '{"machine learning", "AI", "upper division"}', '{}', 'Theory and practice of machine learning'),
('EECS16A', 'Designing Information Devices and Systems I', 4, 4, '{"Fall", "Spring"}', '{"circuits", "linear algebra", "EECS"}', '{}', 'Linear algebra and circuit analysis'),
('EECS16B', 'Designing Information Devices and Systems II', 4, 4, '{"Winter", "Spring"}', '{"circuits", "control", "EECS"}', '{}', 'Differential equations and control systems'),
('MATH1A', 'Calculus', 4, 3, '{"Fall", "Winter", "Spring"}', '{"calculus", "math", "required"}', '{}', 'Differential and integral calculus'),
('MATH1B', 'Calculus', 4, 3, '{"Fall", "Winter", "Spring"}', '{"calculus", "math", "required"}', '{}', 'Infinite series and differential equations'),
('MATH53', 'Multivariable Calculus', 4, 4, '{"Fall", "Winter", "Spring"}', '{"calculus", "math", "required"}', '{}', 'Partial derivatives and multiple integrals'),
('MATH54', 'Linear Algebra and Differential Equations', 4, 4, '{"Fall", "Winter", "Spring"}', '{"linear algebra", "math", "required"}', '{}', 'Linear algebra and ordinary differential equations'),
('STAT134', 'Concepts of Probability', 4, 4, '{"Fall", "Spring"}', '{"probability", "statistics", "math"}', '{}', 'Introduction to probability theory'),
('PHYSICS7A', 'Physics for Scientists and Engineers', 4, 4, '{"Fall", "Winter", "Spring"}', '{"physics", "science", "required"}', '{"Physical Science"}', 'Mechanics and wave motion'),
('PHYSICS7B', 'Physics for Scientists and Engineers', 4, 4, '{"Fall", "Winter", "Spring"}', '{"physics", "science", "required"}', '{"Physical Science"}', 'Heat, electricity, and magnetism'),
('ENGL1A', 'Reading and Composition', 4, 2, '{"Fall", "Winter", "Spring"}', '{"writing", "english", "ge"}', '{"Writing"}', 'College-level reading and writing'),
('ENGL1B', 'Reading and Composition', 4, 2, '{"Fall", "Winter", "Spring"}', '{"writing", "english", "ge"}', '{"Writing"}', 'Advanced composition and critical thinking');

-- Insert additional prerequisites
INSERT INTO public.prerequisites (course_id, prereq_id) VALUES 
('CS61A', 'CS1'),
('CS61B', 'CS61A'),
('CS61C', 'CS61B'),
('CS70', 'MATH1A'),
('CS161', 'CS61B'),
('CS161', 'CS61C'),
('CS162', 'CS61B'),
('CS162', 'CS61C'),
('CS164', 'CS61B'),
('CS170', 'CS61B'),
('CS170', 'CS70'),
('CS186', 'CS61B'),
('CS188', 'CS61B'),
('CS188', 'CS70'),
('CS189', 'CS61B'),
('CS189', 'MATH53'),
('CS189', 'MATH54'),
('EECS16B', 'EECS16A'),
('MATH1B', 'MATH1A'),
('MATH53', 'MATH1B'),
('MATH54', 'MATH53'),
('PHYSICS7B', 'PHYSICS7A'),
('ENGL1B', 'ENGL1A');

-- Insert additional major requirements for CS
INSERT INTO public.major_requirements (major_id, course_id, requirement_type, category) VALUES 
('CS_BS_UCLA', 'CS1', 'required', 'lower_division'),
('CS_BS_UCLA', 'CS61A', 'required', 'lower_division'),
('CS_BS_UCLA', 'CS61B', 'required', 'lower_division'),
('CS_BS_UCLA', 'CS61C', 'required', 'lower_division'),
('CS_BS_UCLA', 'CS70', 'required', 'lower_division'),
('CS_BS_UCLA', 'CS161', 'required', 'upper_division'),
('CS_BS_UCLA', 'CS162', 'required', 'upper_division'),
('CS_BS_UCLA', 'CS170', 'required', 'upper_division'),
('CS_BS_UCLA', 'CS186', 'elective', 'upper_division'),
('CS_BS_UCLA', 'CS188', 'elective', 'upper_division'),
('CS_BS_UCLA', 'CS189', 'elective', 'upper_division'),
('CS_BS_UCLA', 'EECS16A', 'required', 'lower_division'),
('CS_BS_UCLA', 'EECS16B', 'required', 'lower_division'),
('CS_BS_UCLA', 'MATH1A', 'required', 'math'),
('CS_BS_UCLA', 'MATH1B', 'required', 'math'),
('CS_BS_UCLA', 'MATH53', 'required', 'math'),
('CS_BS_UCLA', 'MATH54', 'required', 'math'),
('CS_BS_UCLA', 'STAT134', 'required', 'math'),
('CS_BS_UCLA', 'PHYSICS7A', 'required', 'science'),
('CS_BS_UCLA', 'PHYSICS7B', 'required', 'science'),
('CS_BS_UCLA', 'ENGL1A', 'required', 'ge'),
('CS_BS_UCLA', 'ENGL1B', 'required', 'ge');

-- Insert sample academic advisors
INSERT INTO public.academic_advisors (user_id, name, email, department, specializations, office_location, office_hours) VALUES 
('00000000-0000-0000-0000-000000000001', 'Dr. Sarah Chen', 'sarah.chen@university.edu', 'Computer Science', '{"AI", "Machine Learning", "Data Science"}', 'Soda Hall 510', 'Mon/Wed 2-4pm'),
('00000000-0000-0000-0000-000000000002', 'Prof. Michael Rodriguez', 'michael.rodriguez@university.edu', 'Computer Science', '{"Systems", "Operating Systems", "Distributed Computing"}', 'Soda Hall 615', 'Tue/Thu 1-3pm'),
('00000000-0000-0000-0000-000000000003', 'Dr. Emily Johnson', 'emily.johnson@university.edu', 'Computer Science', '{"Theory", "Algorithms", "Complexity"}', 'Soda Hall 720', 'Mon/Fri 10am-12pm');

-- Insert sample course sequences
INSERT INTO public.course_sequences (id, name, description, sequence_type, courses, estimated_duration_quarters, difficulty_progression, tags) VALUES 
('CS_INTRO_SEQUENCE', 'CS Introduction Sequence', 'Foundational computer science courses', 'prerequisite_chain', '{"CS1", "CS61A", "CS61B", "CS61C"}', 4, '{2, 4, 4, 4}', '{"core", "programming", "systems"}'),
('CS_THEORY_TRACK', 'CS Theory Track', 'Theoretical computer science specialization', 'specialization', '{"CS70", "CS170", "CS172", "CS174"}', 4, '{5, 5, 5, 5}', '{"theory", "algorithms", "complexity"}'),
('CS_AI_TRACK', 'AI/ML Specialization', 'Artificial intelligence and machine learning track', 'specialization', '{"CS188", "CS189", "CS194", "CS195"}', 4, '{4, 5, 4, 4}', '{"AI", "machine learning", "data science"}'),
('CS_SYSTEMS_TRACK', 'Systems Track', 'Computer systems specialization', 'specialization', '{"CS162", "CS161", "CS164", "CS186"}', 4, '{5, 4, 5, 4}', '{"systems", "security", "databases"}'),
('MATH_FOUNDATION', 'Math Foundation for CS', 'Mathematical prerequisites for computer science', 'prerequisite_chain', '{"MATH1A", "MATH1B", "MATH53", "MATH54"}', 4, '{3, 3, 4, 4}', '{"math", "calculus", "linear algebra"}');

-- Insert sample degree pathways
INSERT INTO public.degree_pathways (id, name, degree_type, major_id, total_units_required, core_courses, elective_categories, capstone_requirements, estimated_completion_quarters) VALUES 
('CS_BS_STANDARD', 'Computer Science B.S. - Standard Track', 'BS', 'CS_BS_UCLA', 180, 
'{"CS1", "CS61A", "CS61B", "CS61C", "CS70", "CS161", "CS162", "CS170"}', 
'{"Upper Division Electives": 20, "Technical Electives": 12, "General Education": 24}', 
'{"CS Capstone Project", "Senior Seminar"}', 12),
('CS_BS_AI_TRACK', 'Computer Science B.S. - AI Track', 'BS', 'CS_BS_UCLA', 180, 
'{"CS1", "CS61A", "CS61B", "CS61C", "CS70", "CS188", "CS189", "CS170"}', 
'{"AI Electives": 16, "Math Electives": 8, "Technical Electives": 8, "General Education": 24}', 
'{"AI Capstone Project", "Research Seminar"}', 12),
('CS_BS_SYSTEMS_TRACK', 'Computer Science B.S. - Systems Track', 'BS', 'CS_BS_UCLA', 180, 
'{"CS1", "CS61A", "CS61B", "CS61C", "CS70", "CS161", "CS162", "CS186"}', 
'{"Systems Electives": 16, "Security Electives": 8, "Technical Electives": 8, "General Education": 24}', 
'{"Systems Capstone Project", "Industry Practicum"}', 12);

-- Insert sample schedule templates
INSERT INTO public.schedule_templates (id, name, description, major_id, degree_type, template_quarters, default_constraints, default_preferences, tags, created_by) VALUES 
('CS_4YEAR_STANDARD', 'CS 4-Year Standard Plan', 'Standard 4-year plan for CS major', 'CS_BS_UCLA', 'BS', 
'[
  {"quarter": "Fall 2024", "courses": ["CS1", "MATH1A", "ENGL1A", "GE1"], "units": 16},
  {"quarter": "Spring 2025", "courses": ["CS61A", "MATH1B", "ENGL1B", "GE2"], "units": 16},
  {"quarter": "Fall 2025", "courses": ["CS61B", "MATH53", "PHYSICS7A", "GE3"], "units": 16},
  {"quarter": "Spring 2026", "courses": ["CS61C", "MATH54", "PHYSICS7B", "GE4"], "units": 16}
]',
'{"max_units_per_quarter": 18, "min_units_per_quarter": 14}',
'{"workload_preference": "balanced", "difficulty_preference": "progressive"}',
'{"standard", "4-year", "balanced"}',
'00000000-0000-0000-0000-000000000001'),
('CS_3YEAR_ACCELERATED', 'CS 3-Year Accelerated Plan', 'Accelerated 3-year plan for advanced students', 'CS_BS_UCLA', 'BS',
'[
  {"quarter": "Fall 2024", "courses": ["CS1", "CS61A", "MATH1A", "ENGL1A"], "units": 16},
  {"quarter": "Winter 2025", "courses": ["CS61B", "MATH1B", "PHYSICS7A", "GE1"], "units": 16},
  {"quarter": "Spring 2025", "courses": ["CS61C", "CS70", "MATH53", "ENGL1B"], "units": 16}
]',
'{"max_units_per_quarter": 20, "min_units_per_quarter": 16}',
'{"workload_preference": "heavy", "difficulty_preference": "challenging"}',
'{"accelerated", "3-year", "intensive"}',
'00000000-0000-0000-0000-000000000002');

-- Insert sample academic calendar
INSERT INTO public.academic_calendar (quarter, year, start_date, end_date, registration_start, registration_end, add_drop_deadline, withdrawal_deadline, finals_start, finals_end) VALUES 
('Fall', 2024, '2024-08-26', '2024-12-13', '2024-04-15', '2024-08-23', '2024-09-06', '2024-11-08', '2024-12-09', '2024-12-13'),
('Winter', 2025, '2025-01-21', '2025-05-09', '2024-11-04', '2025-01-17', '2025-01-31', '2025-03-14', '2025-05-05', '2025-05-09'),
('Spring', 2025, '2025-03-31', '2025-06-13', '2025-01-13', '2025-03-28', '2025-04-11', '2025-05-16', '2025-06-09', '2025-06-13'),
('Summer', 2025, '2025-06-23', '2025-08-15', '2025-04-07', '2025-06-20', '2025-06-27', '2025-07-25', '2025-08-11', '2025-08-15'),
('Fall', 2025, '2025-08-25', '2025-12-12', '2025-04-14', '2025-08-22', '2025-09-05', '2025-11-07', '2025-12-08', '2025-12-12'),
('Winter', 2026, '2026-01-20', '2026-05-08', '2025-11-03', '2026-01-16', '2026-01-30', '2026-03-13', '2026-05-04', '2026-05-08');

-- Insert sample course reviews
INSERT INTO public.course_reviews (user_id, course_id, rating, difficulty_rating, workload_rating, review_text, would_recommend, quarter_taken, year_taken, instructor) VALUES 
('00000000-0000-0000-0000-000000000004', 'CS61A', 5, 4, 4, 'Excellent introduction to computer science. The projects are challenging but very rewarding.', true, 'Fall', 2023, 'Prof. DeNero'),
('00000000-0000-0000-0000-000000000005', 'CS61B', 4, 5, 5, 'Very challenging course but you learn a lot about data structures and algorithms.', true, 'Spring', 2024, 'Prof. Hilfinger'),
('00000000-0000-0000-0000-000000000006', 'CS70', 3, 5, 4, 'Difficult math course but essential for theoretical CS. Office hours are crucial.', true, 'Fall', 2023, 'Prof. Rao'),
('00000000-0000-0000-0000-000000000007', 'CS188', 5, 4, 3, 'Fascinating introduction to AI. The projects are really cool and practical.', true, 'Spring', 2024, 'Prof. Russell'),
('00000000-0000-0000-0000-000000000008', 'CS162', 4, 5, 5, 'Intense systems course. You will learn a lot about operating systems but be prepared to work hard.', true, 'Fall', 2024, 'Prof. Joseph');

-- Insert sample study groups
INSERT INTO public.study_groups (name, course_id, creator_id, description, max_members, meeting_schedule, location, tags) VALUES 
('CS61A Study Group', 'CS61A', '00000000-0000-0000-0000-000000000004', 'Weekly study sessions for CS61A projects and concepts', 6, 'Wednesdays 6-8pm', 'Soda Hall 310', '{"programming", "projects", "weekly"}'),
('CS70 Problem Solving', 'CS70', '00000000-0000-0000-0000-000000000005', 'Group for working through CS70 problem sets together', 5, 'Sundays 2-5pm', 'Moffitt Library', '{"math", "theory", "problem solving"}'),
('AI/ML Reading Group', 'CS188', '00000000-0000-0000-0000-000000000006', 'Discussing recent papers in AI and machine learning', 8, 'Fridays 4-6pm', 'Virtual (Zoom)', '{"AI", "research", "papers"}'),
('Systems Study Circle', 'CS162', '00000000-0000-0000-0000-000000000007', 'Deep dive into operating systems concepts and projects', 4, 'Tuesdays 7-9pm', 'Soda Hall 405', '{"systems", "OS", "projects"}');

-- Insert study group members
INSERT INTO public.study_group_members (group_id, user_id, role) VALUES 
((SELECT id FROM public.study_groups WHERE name = 'CS61A Study Group'), '00000000-0000-0000-0000-000000000004', 'creator'),
((SELECT id FROM public.study_groups WHERE name = 'CS61A Study Group'), '00000000-0000-0000-0000-000000000005', 'member'),
((SELECT id FROM public.study_groups WHERE name = 'CS61A Study Group'), '00000000-0000-0000-0000-000000000006', 'member'),
((SELECT id FROM public.study_groups WHERE name = 'CS70 Problem Solving'), '00000000-0000-0000-0000-000000000005', 'creator'),
((SELECT id FROM public.study_groups WHERE name = 'CS70 Problem Solving'), '00000000-0000-0000-0000-000000000007', 'member'),
((SELECT id FROM public.study_groups WHERE name = 'CS70 Problem Solving'), '00000000-0000-0000-0000-000000000008', 'member');

-- Insert sample course equivalencies
INSERT INTO public.course_equivalencies (original_course_id, equivalent_course_id, institution, equivalency_type, units_transferred, approved_date, approved_by) VALUES 
('APCS', 'CS1', 'College Board AP', 'direct', 4, '2024-01-15', 'Academic Affairs'),
('CC_CS101', 'CS1', 'Community College', 'direct', 4, '2024-02-20', 'Transfer Office'),
('CC_CALC1', 'MATH1A', 'Community College', 'direct', 4, '2024-02-20', 'Transfer Office'),
('CC_CALC2', 'MATH1B', 'Community College', 'direct', 4, '2024-02-20', 'Transfer Office'),
('IB_CS_HL', 'CS61A', 'International Baccalaureate', 'partial', 4, '2024-01-10', 'Academic Affairs');

-- Insert sample academic achievements
INSERT INTO public.academic_achievements (user_id, achievement_type, title, description, date_earned, issuing_organization, verification_status, related_courses) VALUES 
('00000000-0000-0000-0000-000000000004', 'academic', 'Deans List Fall 2023', 'Achieved GPA above 3.7 for Fall 2023 semester', '2023-12-15', 'College of Engineering', 'verified', '{"CS61A", "MATH1A", "ENGL1A"}'),
('00000000-0000-0000-0000-000000000005', 'extracurricular', 'ACM Programming Contest - 2nd Place', 'Second place in regional ACM programming competition', '2024-03-10', 'ACM', 'verified', '{"CS61B", "CS70"}'),
('00000000-0000-0000-0000-000000000006', 'leadership', 'CS Undergraduate Association President', 'Elected president of computer science student organization', '2024-04-15', 'CS Undergraduate Association', 'verified', '{}'),
('00000000-0000-0000-0000-000000000007', 'research', 'Undergraduate Research Award', 'Outstanding undergraduate research in artificial intelligence', '2024-05-20', 'Department of Computer Science', 'verified', '{"CS188", "CS189"}');

-- Update usage counts for schedule templates
UPDATE public.schedule_templates SET usage_count = 45, popularity_score = 0.85 WHERE id = 'CS_4YEAR_STANDARD';
UPDATE public.schedule_templates SET usage_count = 12, popularity_score = 0.65 WHERE id = 'CS_3YEAR_ACCELERATED';
