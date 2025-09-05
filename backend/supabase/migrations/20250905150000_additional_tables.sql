-- Additional tables for comprehensive academic planning

-- Create academic advisors table
CREATE TABLE public.academic_advisors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  department VARCHAR(100),
  specializations TEXT[] NOT NULL DEFAULT '{}',
  office_location VARCHAR(255),
  office_hours TEXT,
  contact_preferences JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student alerts table
CREATE TABLE public.student_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  alert_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'medium',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  action_required BOOLEAN NOT NULL DEFAULT false,
  suggested_actions TEXT[] NOT NULL DEFAULT '{}',
  related_courses TEXT[] NOT NULL DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create course reviews table
CREATE TABLE public.course_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id VARCHAR(20) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  difficulty_rating INTEGER NOT NULL CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  workload_rating INTEGER NOT NULL CHECK (workload_rating >= 1 AND workload_rating <= 5),
  review_text TEXT,
  would_recommend BOOLEAN NOT NULL DEFAULT true,
  quarter_taken VARCHAR(20),
  year_taken INTEGER,
  instructor VARCHAR(255),
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  helpful_votes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE,
  UNIQUE(user_id, course_id)
);

-- Create study groups table
CREATE TABLE public.study_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  course_id VARCHAR(20),
  creator_id UUID NOT NULL,
  description TEXT,
  max_members INTEGER NOT NULL DEFAULT 6 CHECK (max_members >= 2 AND max_members <= 20),
  current_members INTEGER NOT NULL DEFAULT 1,
  meeting_schedule VARCHAR(255),
  location VARCHAR(255),
  is_virtual BOOLEAN NOT NULL DEFAULT false,
  meeting_link VARCHAR(500),
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE SET NULL
);

-- Create study group members table
CREATE TABLE public.study_group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  FOREIGN KEY (group_id) REFERENCES public.study_groups(id) ON DELETE CASCADE,
  UNIQUE(group_id, user_id)
);

-- Create course waitlists table
CREATE TABLE public.course_waitlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id VARCHAR(20) NOT NULL,
  quarter VARCHAR(20) NOT NULL,
  position INTEGER NOT NULL,
  priority_score DECIMAL(5,2) NOT NULL DEFAULT 0.0,
  notification_preferences JSONB NOT NULL DEFAULT '{}',
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notified_at TIMESTAMP WITH TIME ZONE,
  enrolled_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) NOT NULL DEFAULT 'waiting',
  FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE,
  UNIQUE(user_id, course_id, quarter)
);

-- Create academic achievements table
CREATE TABLE public.academic_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date_earned DATE NOT NULL,
  issuing_organization VARCHAR(255),
  verification_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  is_public BOOLEAN NOT NULL DEFAULT true,
  related_courses TEXT[] NOT NULL DEFAULT '{}',
  evidence_urls TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create course equivalencies table
CREATE TABLE public.course_equivalencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_course_id VARCHAR(20) NOT NULL,
  equivalent_course_id VARCHAR(20) NOT NULL,
  institution VARCHAR(255) NOT NULL,
  equivalency_type VARCHAR(20) NOT NULL DEFAULT 'direct',
  units_transferred INTEGER NOT NULL,
  conditions TEXT,
  approved_date DATE NOT NULL,
  expiration_date DATE,
  approved_by VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (equivalent_course_id) REFERENCES public.courses(id) ON DELETE CASCADE
);

-- Create degree pathways table
CREATE TABLE public.degree_pathways (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  degree_type VARCHAR(10) NOT NULL,
  major_id VARCHAR(50) NOT NULL,
  total_units_required INTEGER NOT NULL,
  core_courses TEXT[] NOT NULL DEFAULT '{}',
  elective_categories JSONB NOT NULL DEFAULT '{}',
  capstone_requirements TEXT[] NOT NULL DEFAULT '{}',
  estimated_completion_quarters INTEGER NOT NULL,
  description TEXT,
  prerequisites TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (major_id) REFERENCES public.majors(id) ON DELETE CASCADE
);

-- Create course sequences table
CREATE TABLE public.course_sequences (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sequence_type VARCHAR(30) NOT NULL DEFAULT 'prerequisite_chain',
  courses TEXT[] NOT NULL,
  estimated_duration_quarters INTEGER NOT NULL,
  difficulty_progression INTEGER[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  popularity_score DECIMAL(3,2) NOT NULL DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create schedule templates table
CREATE TABLE public.schedule_templates (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  major_id VARCHAR(50) NOT NULL,
  degree_type VARCHAR(10) NOT NULL,
  template_quarters JSONB NOT NULL DEFAULT '[]',
  default_constraints JSONB NOT NULL DEFAULT '{}',
  default_preferences JSONB NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  popularity_score DECIMAL(3,2) NOT NULL DEFAULT 0.0,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (major_id) REFERENCES public.majors(id) ON DELETE CASCADE
);

-- Create academic calendar table
CREATE TABLE public.academic_calendar (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quarter VARCHAR(20) NOT NULL,
  year INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  registration_start DATE NOT NULL,
  registration_end DATE NOT NULL,
  add_drop_deadline DATE NOT NULL,
  withdrawal_deadline DATE NOT NULL,
  finals_start DATE NOT NULL,
  finals_end DATE NOT NULL,
  is_summer BOOLEAN NOT NULL DEFAULT false,
  special_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(quarter, year)
);

-- Enable RLS on new tables
ALTER TABLE public.academic_advisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_waitlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_equivalencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.degree_pathways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_calendar ENABLE ROW LEVEL SECURITY;

-- RLS Policies for student alerts
CREATE POLICY "Users can view their own alerts" 
ON public.student_alerts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts" 
ON public.student_alerts 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for course reviews
CREATE POLICY "Anyone can view course reviews" 
ON public.course_reviews 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own reviews" 
ON public.course_reviews 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" 
ON public.course_reviews 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for study groups
CREATE POLICY "Anyone can view active study groups" 
ON public.study_groups 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Users can create study groups" 
ON public.study_groups 
FOR INSERT 
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Group creators can update their groups" 
ON public.study_groups 
FOR UPDATE 
USING (auth.uid() = creator_id);

-- RLS Policies for study group members
CREATE POLICY "Group members can view membership" 
ON public.study_group_members 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() IN (
  SELECT creator_id FROM public.study_groups WHERE id = group_id
));

CREATE POLICY "Users can join study groups" 
ON public.study_group_members 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for course waitlists
CREATE POLICY "Users can view their own waitlist entries" 
ON public.course_waitlists 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own waitlist entries" 
ON public.course_waitlists 
FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for academic achievements
CREATE POLICY "Users can view public achievements" 
ON public.academic_achievements 
FOR SELECT 
USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own achievements" 
ON public.academic_achievements 
FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for public reference tables
CREATE POLICY "Anyone can view course equivalencies" 
ON public.course_equivalencies 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Anyone can view degree pathways" 
ON public.degree_pathways 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view course sequences" 
ON public.course_sequences 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view public schedule templates" 
ON public.schedule_templates 
FOR SELECT 
USING (is_public = true OR auth.uid() = created_by);

CREATE POLICY "Users can create schedule templates" 
ON public.schedule_templates 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Anyone can view academic calendar" 
ON public.academic_calendar 
FOR SELECT 
USING (true);

-- Create indexes for performance
CREATE INDEX idx_student_alerts_user_id ON public.student_alerts(user_id);
CREATE INDEX idx_student_alerts_created_at ON public.student_alerts(created_at);
CREATE INDEX idx_course_reviews_course_id ON public.course_reviews(course_id);
CREATE INDEX idx_course_reviews_rating ON public.course_reviews(rating);
CREATE INDEX idx_study_groups_course_id ON public.study_groups(course_id);
CREATE INDEX idx_study_groups_is_active ON public.study_groups(is_active);
CREATE INDEX idx_course_waitlists_course_quarter ON public.course_waitlists(course_id, quarter);
CREATE INDEX idx_academic_achievements_user_id ON public.academic_achievements(user_id);
CREATE INDEX idx_academic_achievements_type ON public.academic_achievements(achievement_type);
CREATE INDEX idx_course_equivalencies_original ON public.course_equivalencies(original_course_id);
CREATE INDEX idx_course_equivalencies_equivalent ON public.course_equivalencies(equivalent_course_id);
CREATE INDEX idx_schedule_templates_major ON public.schedule_templates(major_id);
CREATE INDEX idx_academic_calendar_quarter_year ON public.academic_calendar(quarter, year);

-- Create updated_at triggers
CREATE TRIGGER update_academic_advisors_updated_at
BEFORE UPDATE ON public.academic_advisors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_reviews_updated_at
BEFORE UPDATE ON public.course_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_study_groups_updated_at
BEFORE UPDATE ON public.study_groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_academic_achievements_updated_at
BEFORE UPDATE ON public.academic_achievements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_degree_pathways_updated_at
BEFORE UPDATE ON public.degree_pathways
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_sequences_updated_at
BEFORE UPDATE ON public.course_sequences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_schedule_templates_updated_at
BEFORE UPDATE ON public.schedule_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
