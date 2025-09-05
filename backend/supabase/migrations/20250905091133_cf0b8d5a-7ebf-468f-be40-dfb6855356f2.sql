-- Create courses table
CREATE TABLE public.courses (
  id VARCHAR(20) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  units INTEGER NOT NULL,
  difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 5),
  offered TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  ge_categories TEXT[] NOT NULL DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create prerequisites table (many-to-many)
CREATE TABLE public.prerequisites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id VARCHAR(20) NOT NULL,
  prereq_id VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE,
  FOREIGN KEY (prereq_id) REFERENCES public.courses(id) ON DELETE CASCADE,
  UNIQUE(course_id, prereq_id)
);

-- Create majors table
CREATE TABLE public.majors (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  total_units INTEGER,
  ge_requirements JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create major requirements table
CREATE TABLE public.major_requirements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  major_id VARCHAR(50) NOT NULL,
  course_id VARCHAR(20) NOT NULL,
  requirement_type VARCHAR(50) NOT NULL DEFAULT 'required', -- 'required', 'elective', 'core'
  category VARCHAR(100), -- e.g., 'upper_division', 'lower_division'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (major_id) REFERENCES public.majors(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE,
  UNIQUE(major_id, course_id)
);

-- Create student courses table (tracks completed courses)
CREATE TABLE public.student_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id VARCHAR(20) NOT NULL,
  quarter VARCHAR(20), -- e.g., 'Fall 2023'
  grade VARCHAR(5), -- e.g., 'A', 'B+', 'Pass'
  status VARCHAR(20) NOT NULL DEFAULT 'completed', -- 'completed', 'in_progress', 'planned'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE,
  UNIQUE(user_id, course_id)
);

-- Create generated schedules table
CREATE TABLE public.generated_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  quarter VARCHAR(20) NOT NULL,
  courses JSONB NOT NULL DEFAULT '[]',
  score JSONB NOT NULL DEFAULT '{}',
  preferences JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add academic fields to existing profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS major_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS academic_year VARCHAR(20),
ADD COLUMN IF NOT EXISTS graduation_goal VARCHAR(20),
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- Add foreign key for major
ALTER TABLE public.profiles 
ADD CONSTRAINT fk_profiles_major 
FOREIGN KEY (major_id) REFERENCES public.majors(id);

-- Enable RLS on all tables
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prerequisites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.majors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.major_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for courses (public read access)
CREATE POLICY "Anyone can view courses" 
ON public.courses 
FOR SELECT 
USING (true);

-- RLS Policies for prerequisites (public read access)
CREATE POLICY "Anyone can view prerequisites" 
ON public.prerequisites 
FOR SELECT 
USING (true);

-- RLS Policies for majors (public read access)
CREATE POLICY "Anyone can view majors" 
ON public.majors 
FOR SELECT 
USING (true);

-- RLS Policies for major requirements (public read access)
CREATE POLICY "Anyone can view major requirements" 
ON public.major_requirements 
FOR SELECT 
USING (true);

-- RLS Policies for student courses (user-specific)
CREATE POLICY "Users can view their own courses" 
ON public.student_courses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own courses" 
ON public.student_courses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own courses" 
ON public.student_courses 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own courses" 
ON public.student_courses 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for generated schedules (user-specific)
CREATE POLICY "Users can view their own schedules" 
ON public.generated_schedules 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own schedules" 
ON public.generated_schedules 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own schedules" 
ON public.generated_schedules 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own schedules" 
ON public.generated_schedules 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create updated_at trigger for courses
CREATE TRIGGER update_courses_updated_at
BEFORE UPDATE ON public.courses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create updated_at trigger for majors
CREATE TRIGGER update_majors_updated_at
BEFORE UPDATE ON public.majors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create updated_at trigger for student_courses
CREATE TRIGGER update_student_courses_updated_at
BEFORE UPDATE ON public.student_courses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create updated_at trigger for generated_schedules
CREATE TRIGGER update_generated_schedules_updated_at
BEFORE UPDATE ON public.generated_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for CS major at UCLA
INSERT INTO public.majors (id, name, description, total_units, ge_requirements) VALUES 
('CS_BS_UCLA', 'Computer Science B.S.', 'Bachelor of Science in Computer Science at UCLA', 180, 
'{"Writing II": 1, "Diversity": 1, "Humanities": 3, "Social Science": 3, "Science": 6}');

-- Insert sample courses
INSERT INTO public.courses (id, title, units, difficulty, offered, tags, ge_categories) VALUES 
('CS31', 'Introduction to Computer Science I', 4, 3, '{"Fall", "Winter", "Spring"}', '{"programming", "core", "CS major"}', '{}'),
('CS32', 'Introduction to Computer Science II', 4, 4, '{"Fall", "Winter", "Spring"}', '{"programming", "core", "CS major", "data structures"}', '{}'),
('CS33', 'Introduction to Computer Organization', 4, 4, '{"Fall", "Winter", "Spring"}', '{"core", "CS major", "systems"}', '{}'),
('CS35L', 'Software Construction Laboratory', 4, 3, '{"Fall", "Winter", "Spring"}', '{"programming", "core", "CS major", "tools"}', '{}'),
('CS111', 'Operating Systems Principles', 4, 5, '{"Fall", "Winter", "Spring"}', '{"core", "CS major", "systems", "theory"}', '{}'),
('MATH32A', 'Calculus of Several Variables', 4, 4, '{"Fall", "Winter", "Spring"}', '{"math", "calculus", "required"}', '{}'),
('MATH32B', 'Calculus of Several Variables', 4, 4, '{"Fall", "Winter", "Spring"}', '{"math", "calculus", "required"}', '{}'),
('MATH33A', 'Linear Algebra and Applications', 4, 3, '{"Fall", "Winter", "Spring"}', '{"math", "linear algebra", "required"}', '{}');

-- Insert prerequisites
INSERT INTO public.prerequisites (course_id, prereq_id) VALUES 
('CS32', 'CS31'),
('CS33', 'CS32'),
('CS35L', 'CS31'),
('CS111', 'CS33'),
('MATH32B', 'MATH32A'),
('MATH33A', 'MATH32A');

-- Insert major requirements
INSERT INTO public.major_requirements (major_id, course_id, requirement_type, category) VALUES 
('CS_BS_UCLA', 'CS31', 'required', 'lower_division'),
('CS_BS_UCLA', 'CS32', 'required', 'lower_division'),
('CS_BS_UCLA', 'CS33', 'required', 'lower_division'),
('CS_BS_UCLA', 'CS35L', 'required', 'lower_division'),
('CS_BS_UCLA', 'CS111', 'required', 'upper_division'),
('CS_BS_UCLA', 'MATH32A', 'required', 'math'),
('CS_BS_UCLA', 'MATH32B', 'required', 'math'),
('CS_BS_UCLA', 'MATH33A', 'required', 'math');