"""
Validation utilities for Study Strata backend.
"""

import re
from typing import List, Dict, Any, Optional, Set
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class ValidationError(Exception):
    """Custom validation error."""
    pass

class CourseValidator:
    """Validator for course-related data."""
    
    VALID_QUARTERS = {'Fall', 'Winter', 'Spring', 'Summer'}
    VALID_DIFFICULTIES = {1, 2, 3, 4, 5}
    VALID_UNITS = {1, 2, 3, 4, 5, 6, 7, 8}
    
    @classmethod
    def validate_course_id(cls, course_id: str) -> bool:
        """Validate course ID format."""
        if not course_id:
            return False
        
        # Course ID should be alphanumeric, possibly with spaces
        pattern = r'^[A-Z]+\d+[A-Z]*$'
        return bool(re.match(pattern, course_id.replace(' ', '')))
    
    @classmethod
    def validate_prerequisites(cls, course_id: str, prerequisites: List[str], all_courses: Set[str]) -> List[str]:
        """Validate prerequisite relationships."""
        errors = []
        
        # Check for self-reference
        if course_id in prerequisites:
            errors.append(f"Course {course_id} cannot be a prerequisite of itself")
        
        # Check if prerequisite courses exist
        for prereq in prerequisites:
            if prereq not in all_courses:
                errors.append(f"Prerequisite course {prereq} does not exist")
        
        return errors
    
    @classmethod
    def validate_course_data(cls, course_data: Dict[str, Any]) -> List[str]:
        """Validate complete course data."""
        errors = []
        
        # Validate required fields
        required_fields = ['id', 'title', 'units', 'difficulty']
        for field in required_fields:
            if field not in course_data or not course_data[field]:
                errors.append(f"Missing required field: {field}")
        
        # Validate course ID
        if 'id' in course_data and not cls.validate_course_id(course_data['id']):
            errors.append(f"Invalid course ID format: {course_data['id']}")
        
        # Validate units
        if 'units' in course_data and course_data['units'] not in cls.VALID_UNITS:
            errors.append(f"Invalid units value: {course_data['units']}. Must be 1-8")
        
        # Validate difficulty
        if 'difficulty' in course_data and course_data['difficulty'] not in cls.VALID_DIFFICULTIES:
            errors.append(f"Invalid difficulty value: {course_data['difficulty']}. Must be 1-5")
        
        # Validate offered quarters
        if 'offered' in course_data:
            for quarter in course_data['offered']:
                if quarter not in cls.VALID_QUARTERS:
                    errors.append(f"Invalid quarter: {quarter}. Must be one of {cls.VALID_QUARTERS}")
        
        return errors

class ScheduleValidator:
    """Validator for schedule-related data."""
    
    MAX_UNITS_PER_QUARTER = 24
    MIN_UNITS_PER_QUARTER = 8
    MAX_COURSES_PER_QUARTER = 6
    
    @classmethod
    def validate_quarter_schedule(cls, quarter_data: Dict[str, Any]) -> List[str]:
        """Validate a single quarter's schedule."""
        errors = []
        
        courses = quarter_data.get('courses', [])
        total_units = sum(course.get('units', 0) for course in courses)
        
        # Check unit constraints
        if total_units > cls.MAX_UNITS_PER_QUARTER:
            errors.append(f"Quarter exceeds maximum units ({cls.MAX_UNITS_PER_QUARTER}): {total_units}")
        
        if total_units < cls.MIN_UNITS_PER_QUARTER and courses:
            errors.append(f"Quarter below minimum units ({cls.MIN_UNITS_PER_QUARTER}): {total_units}")
        
        # Check course count
        if len(courses) > cls.MAX_COURSES_PER_QUARTER:
            errors.append(f"Quarter exceeds maximum courses ({cls.MAX_COURSES_PER_QUARTER}): {len(courses)}")
        
        # Check for duplicate courses
        course_ids = [course.get('id') for course in courses if course.get('id')]
        if len(course_ids) != len(set(course_ids)):
            errors.append("Duplicate courses found in quarter")
        
        return errors
    
    @classmethod
    def validate_prerequisite_chain(cls, schedule: List[Dict[str, Any]], prerequisite_map: Dict[str, List[str]]) -> List[str]:
        """Validate that prerequisites are satisfied in the schedule."""
        errors = []
        completed_courses = set()
        
        for quarter in schedule:
            quarter_courses = [course.get('id') for course in quarter.get('courses', [])]
            
            for course_id in quarter_courses:
                if course_id in prerequisite_map:
                    missing_prereqs = []
                    for prereq in prerequisite_map[course_id]:
                        if prereq not in completed_courses:
                            missing_prereqs.append(prereq)
                    
                    if missing_prereqs:
                        errors.append(f"Course {course_id} missing prerequisites: {missing_prereqs}")
            
            # Add completed courses
            completed_courses.update(quarter_courses)
        
        return errors
    
    @classmethod
    def validate_full_schedule(cls, schedule_data: Dict[str, Any]) -> List[str]:
        """Validate complete schedule."""
        errors = []
        
        quarters = schedule_data.get('quarters', [])
        
        # Validate each quarter
        for i, quarter in enumerate(quarters):
            quarter_errors = cls.validate_quarter_schedule(quarter)
            for error in quarter_errors:
                errors.append(f"Quarter {i+1}: {error}")
        
        # Check for duplicate courses across quarters
        all_courses = []
        for quarter in quarters:
            for course in quarter.get('courses', []):
                if course.get('id'):
                    all_courses.append(course['id'])
        
        if len(all_courses) != len(set(all_courses)):
            errors.append("Duplicate courses found across quarters")
        
        return errors

class StudentValidator:
    """Validator for student-related data."""
    
    VALID_ACADEMIC_YEARS = {'freshman', 'sophomore', 'junior', 'senior', 'graduate'}
    VALID_ENROLLMENT_STATUS = {'active', 'inactive', 'graduated', 'withdrawn', 'leave_of_absence'}
    
    @classmethod
    def validate_email(cls, email: str) -> bool:
        """Validate email format."""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    
    @classmethod
    def validate_gpa(cls, gpa: float) -> bool:
        """Validate GPA value."""
        return 0.0 <= gpa <= 4.0
    
    @classmethod
    def validate_student_profile(cls, profile_data: Dict[str, Any]) -> List[str]:
        """Validate student profile data."""
        errors = []
        
        # Validate email
        if 'email' in profile_data and not cls.validate_email(profile_data['email']):
            errors.append(f"Invalid email format: {profile_data['email']}")
        
        # Validate GPA
        if 'gpa' in profile_data and profile_data['gpa'] is not None:
            if not cls.validate_gpa(profile_data['gpa']):
                errors.append(f"Invalid GPA: {profile_data['gpa']}. Must be between 0.0 and 4.0")
        
        # Validate academic year
        if 'academic_year' in profile_data and profile_data['academic_year']:
            if profile_data['academic_year'] not in cls.VALID_ACADEMIC_YEARS:
                errors.append(f"Invalid academic year: {profile_data['academic_year']}")
        
        # Validate enrollment status
        if 'enrollment_status' in profile_data and profile_data['enrollment_status']:
            if profile_data['enrollment_status'] not in cls.VALID_ENROLLMENT_STATUS:
                errors.append(f"Invalid enrollment status: {profile_data['enrollment_status']}")
        
        return errors

class PreferenceValidator:
    """Validator for user preferences."""
    
    VALID_WORKLOAD_PREFERENCES = {'light', 'balanced', 'heavy'}
    VALID_DIFFICULTY_PREFERENCES = {'consistent', 'progressive', 'challenging'}
    VALID_GRADUATION_TIMELINES = {'3_years', '4_years', '5_years', '6_years'}
    
    @classmethod
    def validate_preferences(cls, preferences: Dict[str, Any]) -> List[str]:
        """Validate user preferences."""
        errors = []
        
        # Validate workload preference
        if 'workload_preference' in preferences:
            if preferences['workload_preference'] not in cls.VALID_WORKLOAD_PREFERENCES:
                errors.append(f"Invalid workload preference: {preferences['workload_preference']}")
        
        # Validate difficulty preference
        if 'difficulty_preference' in preferences:
            if preferences['difficulty_preference'] not in cls.VALID_DIFFICULTY_PREFERENCES:
                errors.append(f"Invalid difficulty preference: {preferences['difficulty_preference']}")
        
        # Validate graduation timeline
        if 'graduation_timeline' in preferences:
            if preferences['graduation_timeline'] not in cls.VALID_GRADUATION_TIMELINES:
                errors.append(f"Invalid graduation timeline: {preferences['graduation_timeline']}")
        
        # Validate quarter preferences (should be floats between 0 and 1)
        if 'quarter_preferences' in preferences:
            for quarter, weight in preferences['quarter_preferences'].items():
                if not isinstance(weight, (int, float)) or not (0 <= weight <= 1):
                    errors.append(f"Invalid quarter preference weight for {quarter}: {weight}")
        
        return errors

class APIValidator:
    """Validator for API requests and responses."""
    
    @classmethod
    def validate_pagination_params(cls, page: int, per_page: int) -> List[str]:
        """Validate pagination parameters."""
        errors = []
        
        if page < 1:
            errors.append("Page number must be >= 1")
        
        if per_page < 1:
            errors.append("Per page must be >= 1")
        elif per_page > 100:
            errors.append("Per page must be <= 100")
        
        return errors
    
    @classmethod
    def validate_search_params(cls, search_params: Dict[str, Any]) -> List[str]:
        """Validate search parameters."""
        errors = []
        
        # Validate difficulty range
        if 'difficulty_min' in search_params and 'difficulty_max' in search_params:
            min_diff = search_params['difficulty_min']
            max_diff = search_params['difficulty_max']
            
            if min_diff is not None and max_diff is not None:
                if min_diff > max_diff:
                    errors.append("difficulty_min cannot be greater than difficulty_max")
        
        # Validate units range
        if 'units_min' in search_params and 'units_max' in search_params:
            min_units = search_params['units_min']
            max_units = search_params['units_max']
            
            if min_units is not None and max_units is not None:
                if min_units > max_units:
                    errors.append("units_min cannot be greater than units_max")
        
        return errors

def validate_date_range(start_date: datetime, end_date: datetime) -> List[str]:
    """Validate date range."""
    errors = []
    
    if start_date >= end_date:
        errors.append("Start date must be before end date")
    
    # Check if dates are reasonable (not too far in past/future)
    now = datetime.utcnow()
    max_past = now - timedelta(days=365 * 10)  # 10 years ago
    max_future = now + timedelta(days=365 * 10)  # 10 years from now
    
    if start_date < max_past:
        errors.append("Start date is too far in the past")
    
    if end_date > max_future:
        errors.append("End date is too far in the future")
    
    return errors

def sanitize_input(input_str: str, max_length: int = 1000) -> str:
    """Sanitize user input."""
    if not isinstance(input_str, str):
        return ""
    
    # Remove potentially dangerous characters
    sanitized = re.sub(r'[<>"\']', '', input_str)
    
    # Limit length
    if len(sanitized) > max_length:
        sanitized = sanitized[:max_length]
    
    # Strip whitespace
    return sanitized.strip()

def validate_json_structure(data: Dict[str, Any], required_fields: List[str]) -> List[str]:
    """Validate JSON structure has required fields."""
    errors = []
    
    for field in required_fields:
        if field not in data:
            errors.append(f"Missing required field: {field}")
        elif data[field] is None:
            errors.append(f"Field cannot be null: {field}")
    
    return errors
