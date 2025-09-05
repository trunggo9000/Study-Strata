-- Create analytical views and stored procedures for Study Strata

-- View for course analytics
CREATE OR REPLACE VIEW course_analytics AS
SELECT 
    c.id,
    c.title,
    c.units,
    c.difficulty,
    c.offered,
    c.tags,
    COUNT(DISTINCT sc.user_id) as enrollment_count,
    AVG(cr.rating) as average_rating,
    AVG(cr.difficulty_rating) as average_difficulty_rating,
    AVG(cr.workload_rating) as average_workload_rating,
    COUNT(cr.id) as review_count,
    COUNT(CASE WHEN sc.status = 'completed' THEN 1 END) as completion_count,
    CASE 
        WHEN COUNT(DISTINCT sc.user_id) > 0 
        THEN COUNT(CASE WHEN sc.status = 'completed' THEN 1 END)::float / COUNT(DISTINCT sc.user_id)
        ELSE 0 
    END as completion_rate,
    COUNT(p.course_id) as prerequisite_count,
    COUNT(p2.prereq_id) as dependent_course_count
FROM public.courses c
LEFT JOIN public.student_courses sc ON c.id = sc.course_id
LEFT JOIN public.course_reviews cr ON c.id = cr.course_id
LEFT JOIN public.prerequisites p ON c.id = p.course_id
LEFT JOIN public.prerequisites p2 ON c.id = p2.prereq_id
GROUP BY c.id, c.title, c.units, c.difficulty, c.offered, c.tags;

-- View for student progress analytics
CREATE OR REPLACE VIEW student_progress_analytics AS
SELECT 
    p.id as user_id,
    p.full_name,
    p.major_id,
    p.academic_year,
    COUNT(CASE WHEN sc.status = 'completed' THEN 1 END) as courses_completed,
    COUNT(CASE WHEN sc.status = 'in_progress' THEN 1 END) as courses_in_progress,
    COUNT(CASE WHEN sc.status = 'planned' THEN 1 END) as courses_planned,
    SUM(CASE WHEN sc.status = 'completed' THEN c.units ELSE 0 END) as units_completed,
    SUM(CASE WHEN sc.status = 'in_progress' THEN c.units ELSE 0 END) as units_in_progress,
    AVG(CASE WHEN sc.status = 'completed' THEN c.difficulty END) as avg_difficulty_completed,
    COUNT(DISTINCT sc.quarter) as quarters_active,
    MIN(sc.created_at) as first_enrollment,
    MAX(sc.updated_at) as last_activity
FROM public.profiles p
LEFT JOIN public.student_courses sc ON p.id = sc.user_id
LEFT JOIN public.courses c ON sc.course_id = c.id
GROUP BY p.id, p.full_name, p.major_id, p.academic_year;

-- View for major requirements progress
CREATE OR REPLACE VIEW major_requirements_progress AS
SELECT 
    p.id as user_id,
    p.major_id,
    mr.requirement_type,
    mr.category,
    COUNT(mr.course_id) as total_required,
    COUNT(CASE WHEN sc.status = 'completed' THEN 1 END) as completed,
    COUNT(CASE WHEN sc.status IN ('completed', 'in_progress') THEN 1 END) as completed_or_in_progress,
    SUM(CASE WHEN sc.status = 'completed' THEN c.units ELSE 0 END) as units_completed,
    CASE 
        WHEN COUNT(mr.course_id) > 0 
        THEN COUNT(CASE WHEN sc.status = 'completed' THEN 1 END)::float / COUNT(mr.course_id)
        ELSE 0 
    END as completion_percentage
FROM public.profiles p
JOIN public.major_requirements mr ON p.major_id = mr.major_id
LEFT JOIN public.student_courses sc ON mr.course_id = sc.course_id AND p.id = sc.user_id
LEFT JOIN public.courses c ON mr.course_id = c.id
WHERE p.major_id IS NOT NULL
GROUP BY p.id, p.major_id, mr.requirement_type, mr.category;

-- View for popular course combinations
CREATE OR REPLACE VIEW popular_course_combinations AS
WITH quarter_combinations AS (
    SELECT 
        sc1.quarter,
        sc1.course_id as course1,
        sc2.course_id as course2,
        COUNT(*) as combination_count
    FROM public.student_courses sc1
    JOIN public.student_courses sc2 ON sc1.user_id = sc2.user_id 
        AND sc1.quarter = sc2.quarter 
        AND sc1.course_id < sc2.course_id
    WHERE sc1.status IN ('completed', 'in_progress')
        AND sc2.status IN ('completed', 'in_progress')
    GROUP BY sc1.quarter, sc1.course_id, sc2.course_id
)
SELECT 
    course1,
    course2,
    c1.title as course1_title,
    c2.title as course2_title,
    SUM(combination_count) as total_combinations,
    COUNT(DISTINCT quarter) as quarters_offered_together,
    AVG(combination_count) as avg_per_quarter
FROM quarter_combinations qc
JOIN public.courses c1 ON qc.course1 = c1.id
JOIN public.courses c2 ON qc.course2 = c2.id
GROUP BY course1, course2, c1.title, c2.title
HAVING SUM(combination_count) >= 3
ORDER BY total_combinations DESC;

-- View for schedule template effectiveness
CREATE OR REPLACE VIEW schedule_template_analytics AS
SELECT 
    st.id,
    st.name,
    st.major_id,
    st.usage_count,
    st.popularity_score,
    COUNT(gs.id) as schedules_generated,
    AVG((gs.score->>'total_score')::float) as avg_schedule_score,
    COUNT(CASE WHEN gs.is_active = true THEN 1 END) as active_schedules,
    AVG(CASE WHEN gs.is_active = true THEN (gs.score->>'total_score')::float END) as avg_active_score
FROM public.schedule_templates st
LEFT JOIN public.generated_schedules gs ON st.id = (gs.preferences->>'template_id')
GROUP BY st.id, st.name, st.major_id, st.usage_count, st.popularity_score;

-- Stored procedure to calculate prerequisite satisfaction rate
CREATE OR REPLACE FUNCTION calculate_prerequisite_satisfaction(course_id_param VARCHAR)
RETURNS DECIMAL AS $$
DECLARE
    total_enrollments INTEGER;
    satisfied_enrollments INTEGER;
    satisfaction_rate DECIMAL;
BEGIN
    -- Count total enrollments
    SELECT COUNT(DISTINCT sc.user_id) INTO total_enrollments
    FROM public.student_courses sc
    WHERE sc.course_id = course_id_param
        AND sc.status IN ('completed', 'in_progress');
    
    -- Count enrollments where all prerequisites were satisfied
    SELECT COUNT(DISTINCT sc.user_id) INTO satisfied_enrollments
    FROM public.student_courses sc
    WHERE sc.course_id = course_id_param
        AND sc.status IN ('completed', 'in_progress')
        AND NOT EXISTS (
            SELECT 1 FROM public.prerequisites p
            WHERE p.course_id = course_id_param
                AND NOT EXISTS (
                    SELECT 1 FROM public.student_courses sc2
                    WHERE sc2.user_id = sc.user_id
                        AND sc2.course_id = p.prereq_id
                        AND sc2.status = 'completed'
                        AND sc2.created_at < sc.created_at
                )
        );
    
    -- Calculate satisfaction rate
    IF total_enrollments > 0 THEN
        satisfaction_rate := satisfied_enrollments::DECIMAL / total_enrollments;
    ELSE
        satisfaction_rate := 0;
    END IF;
    
    RETURN satisfaction_rate;
END;
$$ LANGUAGE plpgsql;

-- Stored procedure to get student graduation timeline prediction
CREATE OR REPLACE FUNCTION predict_graduation_timeline(user_id_param UUID)
RETURNS TABLE(
    predicted_graduation VARCHAR,
    confidence_score DECIMAL,
    quarters_remaining INTEGER,
    units_remaining INTEGER,
    risk_factors TEXT[]
) AS $$
DECLARE
    total_units_required INTEGER := 180;
    units_completed INTEGER;
    units_in_progress INTEGER;
    avg_units_per_quarter DECIMAL;
    quarters_active INTEGER;
    current_gpa DECIMAL;
    risk_list TEXT[] := '{}';
BEGIN
    -- Get student progress data
    SELECT 
        COALESCE(SUM(CASE WHEN sc.status = 'completed' THEN c.units ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN sc.status = 'in_progress' THEN c.units ELSE 0 END), 0),
        COUNT(DISTINCT sc.quarter),
        AVG(CASE WHEN sc.status = 'completed' THEN c.difficulty END)
    INTO units_completed, units_in_progress, quarters_active, current_gpa
    FROM public.student_courses sc
    JOIN public.courses c ON sc.course_id = c.id
    WHERE sc.user_id = user_id_param;
    
    -- Calculate average units per quarter
    IF quarters_active > 0 THEN
        avg_units_per_quarter := (units_completed + units_in_progress)::DECIMAL / quarters_active;
    ELSE
        avg_units_per_quarter := 15; -- Default assumption
    END IF;
    
    -- Calculate remaining units and quarters
    units_remaining := total_units_required - units_completed;
    quarters_remaining := CEIL(units_remaining::DECIMAL / GREATEST(avg_units_per_quarter, 12));
    
    -- Identify risk factors
    IF avg_units_per_quarter < 12 THEN
        risk_list := array_append(risk_list, 'Low average units per quarter');
    END IF;
    
    IF current_gpa < 2.0 THEN
        risk_list := array_append(risk_list, 'Low GPA may affect graduation eligibility');
    END IF;
    
    IF quarters_remaining > 16 THEN
        risk_list := array_append(risk_list, 'Extended timeline may indicate course availability issues');
    END IF;
    
    -- Determine predicted graduation and confidence
    IF quarters_remaining <= 8 THEN
        predicted_graduation := 'On track for 4-year graduation';
        confidence_score := 0.9;
    ELSIF quarters_remaining <= 12 THEN
        predicted_graduation := 'Likely 4.5-5 year graduation';
        confidence_score := 0.75;
    ELSE
        predicted_graduation := 'Extended timeline likely';
        confidence_score := 0.6;
    END IF;
    
    RETURN QUERY SELECT 
        predicted_graduation,
        confidence_score,
        quarters_remaining,
        units_remaining,
        risk_list;
END;
$$ LANGUAGE plpgsql;

-- Stored procedure to generate course recommendations
CREATE OR REPLACE FUNCTION get_course_recommendations(user_id_param UUID, limit_param INTEGER DEFAULT 5)
RETURNS TABLE(
    course_id VARCHAR,
    course_title VARCHAR,
    recommendation_score DECIMAL,
    reasoning TEXT
) AS $$
DECLARE
    user_major VARCHAR;
    completed_courses TEXT[];
    rec_score DECIMAL;
    rec_reason TEXT;
BEGIN
    -- Get user's major and completed courses
    SELECT p.major_id INTO user_major
    FROM public.profiles p
    WHERE p.id = user_id_param;
    
    SELECT array_agg(sc.course_id) INTO completed_courses
    FROM public.student_courses sc
    WHERE sc.user_id = user_id_param AND sc.status = 'completed';
    
    -- Return recommendations based on major requirements not yet completed
    RETURN QUERY
    SELECT 
        c.id,
        c.title,
        CASE 
            WHEN mr.requirement_type = 'required' THEN 1.0
            WHEN mr.requirement_type = 'core' THEN 0.9
            ELSE 0.7
        END as score,
        CASE 
            WHEN mr.requirement_type = 'required' THEN 'Required course for your major'
            WHEN mr.requirement_type = 'core' THEN 'Core course for your major'
            ELSE 'Elective course that fits your major'
        END as reason
    FROM public.courses c
    JOIN public.major_requirements mr ON c.id = mr.course_id
    WHERE mr.major_id = user_major
        AND c.id != ALL(COALESCE(completed_courses, '{}'))
        AND NOT EXISTS (
            SELECT 1 FROM public.prerequisites p
            WHERE p.course_id = c.id
                AND p.prereq_id != ALL(COALESCE(completed_courses, '{}'))
        )
    ORDER BY score DESC, c.difficulty ASC
    LIMIT limit_param;
END;
$$ LANGUAGE plpgsql;

-- Create materialized view for performance-intensive analytics
CREATE MATERIALIZED VIEW course_popularity_trends AS
SELECT 
    c.id,
    c.title,
    extract(year from sc.created_at) as year,
    extract(quarter from sc.created_at) as quarter_num,
    COUNT(DISTINCT sc.user_id) as enrollment_count,
    AVG(c.difficulty) as avg_difficulty,
    COUNT(CASE WHEN sc.status = 'completed' THEN 1 END) as completion_count
FROM public.courses c
LEFT JOIN public.student_courses sc ON c.id = sc.course_id
WHERE sc.created_at >= CURRENT_DATE - INTERVAL '2 years'
GROUP BY c.id, c.title, extract(year from sc.created_at), extract(quarter from sc.created_at)
ORDER BY year DESC, quarter_num DESC, enrollment_count DESC;

-- Create index on materialized view
CREATE INDEX idx_course_popularity_trends_year_quarter ON course_popularity_trends(year, quarter_num);
CREATE INDEX idx_course_popularity_trends_enrollment ON course_popularity_trends(enrollment_count);

-- Create function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW course_popularity_trends;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically refresh views when student_courses is updated
CREATE OR REPLACE FUNCTION trigger_refresh_analytics()
RETURNS trigger AS $$
BEGIN
    -- Schedule a refresh (in a real system, this might be done via a job queue)
    PERFORM refresh_analytics_views();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Note: In production, you might want to refresh materialized views on a schedule
-- rather than on every update for performance reasons
