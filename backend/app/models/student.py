"""
Student and academic progress data models for Study Strata.
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from enum import Enum

class AcademicYear(str, Enum):
    """Academic year classification."""
    FRESHMAN = "freshman"
    SOPHOMORE = "sophomore"
    JUNIOR = "junior"
    SENIOR = "senior"
    GRADUATE = "graduate"
    POST_GRAD = "post_grad"

class EnrollmentStatus(str, Enum):
    """Student enrollment status."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    GRADUATED = "graduated"
    WITHDRAWN = "withdrawn"
    LEAVE_OF_ABSENCE = "leave_of_absence"

class GradeScale(str, Enum):
    """Grade scale options."""
    LETTER = "letter"  # A, B, C, D, F
    PLUS_MINUS = "plus_minus"  # A+, A, A-, B+, etc.
    PASS_FAIL = "pass_fail"  # Pass, Fail
    NUMERICAL = "numerical"  # 0-100

class StudentProfile(BaseModel):
    """Complete student profile model."""
    id: str
    email: str
    full_name: str
    student_id: Optional[str] = None
    major_id: Optional[str] = None
    minor_ids: List[str] = Field(default_factory=list)
    academic_year: Optional[AcademicYear] = None
    enrollment_status: EnrollmentStatus = EnrollmentStatus.ACTIVE
    admission_date: Optional[datetime] = None
    expected_graduation: Optional[str] = None
    gpa: Optional[float] = Field(None, ge=0.0, le=4.0)
    total_units_earned: int = Field(default=0, ge=0)
    total_units_attempted: int = Field(default=0, ge=0)
    preferences: Dict[str, Any] = Field(default_factory=dict)
    academic_advisor: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    @validator('gpa')
    def validate_gpa(cls, v):
        if v is not None and (v < 0.0 or v > 4.0):
            raise ValueError('GPA must be between 0.0 and 4.0')
        return v

    @validator('total_units_attempted')
    def validate_units_attempted(cls, v, values):
        if 'total_units_earned' in values and v < values['total_units_earned']:
            raise ValueError('Units attempted cannot be less than units earned')
        return v

class StudentCourse(BaseModel):
    """Model for student course enrollment and completion."""
    id: Optional[str] = None
    user_id: str
    course_id: str
    quarter: Optional[str] = None
    year: Optional[int] = None
    status: str = Field(default="planned")  # planned, enrolled, in_progress, completed, dropped, failed
    grade: Optional[str] = None
    grade_points: Optional[float] = None
    units: int = Field(..., ge=1, le=8)
    attempt_number: int = Field(default=1, ge=1)
    withdrawal_date: Optional[datetime] = None
    completion_date: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    @validator('grade_points')
    def validate_grade_points(cls, v):
        if v is not None and (v < 0.0 or v > 4.0):
            raise ValueError('Grade points must be between 0.0 and 4.0')
        return v

class AcademicProgress(BaseModel):
    """Model for tracking student academic progress."""
    user_id: str
    major_id: str
    total_units_required: int = Field(default=180)
    units_completed: int = Field(default=0)
    units_in_progress: int = Field(default=0)
    units_planned: int = Field(default=0)
    current_gpa: float = Field(default=0.0, ge=0.0, le=4.0)
    major_gpa: float = Field(default=0.0, ge=0.0, le=4.0)
    progress_percentage: float = Field(default=0.0, ge=0.0, le=100.0)
    quarters_completed: int = Field(default=0)
    quarters_remaining: int = Field(default=12)
    on_track_for_graduation: bool = Field(default=True)
    academic_standing: str = Field(default="good_standing")
    probation_status: Optional[str] = None
    honors_status: Optional[str] = None
    last_updated: datetime

class DegreeRequirement(BaseModel):
    """Model for degree requirements tracking."""
    requirement_id: str
    major_id: str
    category: str  # core, elective, ge, capstone
    name: str
    description: Optional[str] = None
    units_required: int = Field(..., ge=1)
    courses_required: List[str] = Field(default_factory=list)
    alternative_courses: List[List[str]] = Field(default_factory=list)
    minimum_grade: Optional[str] = None
    prerequisite_requirements: List[str] = Field(default_factory=list)
    is_satisfied: bool = Field(default=False)
    satisfying_courses: List[str] = Field(default_factory=list)
    units_satisfied: int = Field(default=0)

class StudentRequirementProgress(BaseModel):
    """Model for tracking student progress on degree requirements."""
    user_id: str
    requirement_id: str
    is_satisfied: bool = Field(default=False)
    units_completed: int = Field(default=0)
    units_required: int
    satisfying_courses: List[str] = Field(default_factory=list)
    remaining_courses: List[str] = Field(default_factory=list)
    notes: Optional[str] = None
    last_updated: datetime

class AcademicPlan(BaseModel):
    """Model for student academic planning."""
    id: Optional[str] = None
    user_id: str
    plan_name: str
    major_id: str
    target_graduation: str
    created_date: datetime
    last_modified: datetime
    is_active: bool = Field(default=True)
    planned_courses: Dict[str, List[str]] = Field(default_factory=dict)  # quarter -> course_ids
    milestones: List[Dict[str, Any]] = Field(default_factory=list)
    notes: Optional[str] = None
    advisor_approved: bool = Field(default=False)
    approval_date: Optional[datetime] = None

class StudentAlert(BaseModel):
    """Model for student academic alerts and notifications."""
    id: Optional[str] = None
    user_id: str
    alert_type: str  # prerequisite_missing, gpa_warning, graduation_risk, course_conflict
    severity: str = Field(default="medium")  # low, medium, high, critical
    title: str
    message: str
    action_required: bool = Field(default=False)
    suggested_actions: List[str] = Field(default_factory=list)
    related_courses: List[str] = Field(default_factory=list)
    is_read: bool = Field(default=False)
    is_resolved: bool = Field(default=False)
    created_at: datetime
    expires_at: Optional[datetime] = None

class StudentGoal(BaseModel):
    """Model for student academic goals."""
    id: Optional[str] = None
    user_id: str
    goal_type: str  # gpa, graduation_date, course_completion, skill_development
    title: str
    description: Optional[str] = None
    target_value: Union[str, float, int]
    current_value: Union[str, float, int, None] = None
    target_date: Optional[datetime] = None
    is_achieved: bool = Field(default=False)
    progress_percentage: float = Field(default=0.0, ge=0.0, le=100.0)
    milestones: List[Dict[str, Any]] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

class StudyGroup(BaseModel):
    """Model for student study groups."""
    id: Optional[str] = None
    name: str
    course_id: Optional[str] = None
    creator_id: str
    members: List[str] = Field(default_factory=list)
    max_members: int = Field(default=6, ge=2, le=20)
    description: Optional[str] = None
    meeting_schedule: Optional[str] = None
    location: Optional[str] = None
    is_active: bool = Field(default=True)
    tags: List[str] = Field(default_factory=list)
    created_at: datetime

class StudentMentor(BaseModel):
    """Model for student mentoring relationships."""
    id: Optional[str] = None
    mentee_id: str
    mentor_id: str
    relationship_type: str = Field(default="peer")  # peer, faculty, industry, alumni
    start_date: datetime
    end_date: Optional[datetime] = None
    is_active: bool = Field(default=True)
    focus_areas: List[str] = Field(default_factory=list)
    meeting_frequency: Optional[str] = None
    notes: Optional[str] = None

class StudentActivity(BaseModel):
    """Model for tracking student activities and engagement."""
    id: Optional[str] = None
    user_id: str
    activity_type: str  # login, course_view, schedule_generate, advisor_chat
    activity_data: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime
    session_id: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

class StudentFeedback(BaseModel):
    """Model for student feedback and surveys."""
    id: Optional[str] = None
    user_id: str
    feedback_type: str  # course_review, system_feedback, advisor_rating
    subject: str
    content: str
    rating: Optional[int] = Field(None, ge=1, le=5)
    is_anonymous: bool = Field(default=False)
    related_course_id: Optional[str] = None
    related_schedule_id: Optional[str] = None
    status: str = Field(default="submitted")  # submitted, reviewed, resolved
    created_at: datetime
    reviewed_at: Optional[datetime] = None

class StudentPreferences(BaseModel):
    """Model for detailed student preferences."""
    user_id: str
    learning_style: Optional[str] = None  # visual, auditory, kinesthetic, reading
    preferred_difficulty_progression: str = Field(default="gradual")  # gradual, consistent, challenging
    preferred_workload: str = Field(default="balanced")  # light, balanced, heavy
    preferred_quarters: List[str] = Field(default_factory=list)
    avoided_quarters: List[str] = Field(default_factory=list)
    preferred_time_slots: List[str] = Field(default_factory=list)
    course_type_preferences: Dict[str, float] = Field(default_factory=dict)
    notification_preferences: Dict[str, bool] = Field(default_factory=dict)
    privacy_settings: Dict[str, bool] = Field(default_factory=dict)
    accessibility_needs: List[str] = Field(default_factory=list)
    updated_at: datetime

class StudentAchievement(BaseModel):
    """Model for student achievements and recognitions."""
    id: Optional[str] = None
    user_id: str
    achievement_type: str  # academic, extracurricular, leadership, service
    title: str
    description: Optional[str] = None
    date_earned: datetime
    issuing_organization: Optional[str] = None
    verification_status: str = Field(default="pending")  # pending, verified, rejected
    is_public: bool = Field(default=True)
    related_courses: List[str] = Field(default_factory=list)
    evidence_urls: List[str] = Field(default_factory=list)

class StudentPortfolio(BaseModel):
    """Model for student academic portfolio."""
    user_id: str
    portfolio_name: str = Field(default="Academic Portfolio")
    bio: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    projects: List[Dict[str, Any]] = Field(default_factory=list)
    achievements: List[str] = Field(default_factory=list)
    course_highlights: List[str] = Field(default_factory=list)
    extracurricular_activities: List[Dict[str, Any]] = Field(default_factory=list)
    is_public: bool = Field(default=False)
    custom_sections: Dict[str, Any] = Field(default_factory=dict)
    last_updated: datetime
