"""
Schedule and planning data models for Study Strata.
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from enum import Enum

class ScheduleStatus(str, Enum):
    """Schedule status enumeration."""
    DRAFT = "draft"
    ACTIVE = "active"
    COMPLETED = "completed"
    ARCHIVED = "archived"

class CourseStatus(str, Enum):
    """Course enrollment status enumeration."""
    PLANNED = "planned"
    ENROLLED = "enrolled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    DROPPED = "dropped"
    FAILED = "failed"

class QuarterInfo(BaseModel):
    """Model for quarter information."""
    quarter: str = Field(..., description="Quarter name (e.g., 'Fall 2024')")
    year: int = Field(..., ge=2020, le=2030)
    season: str = Field(..., description="Season (Fall, Winter, Spring, Summer)")

    @validator('season')
    def validate_season(cls, v):
        valid_seasons = {'Fall', 'Winter', 'Spring', 'Summer'}
        if v not in valid_seasons:
            raise ValueError(f'Invalid season: {v}. Must be one of {valid_seasons}')
        return v

    @validator('quarter')
    def validate_quarter_format(cls, v, values):
        if 'season' in values and 'year' in values:
            expected = f"{values['season']} {values['year']}"
            if v != expected:
                raise ValueError(f'Quarter format mismatch. Expected: {expected}, got: {v}')
        return v

class ScheduledCourse(BaseModel):
    """Model for a course within a schedule."""
    course_id: str
    course_title: str
    units: int = Field(..., ge=1, le=8)
    difficulty: int = Field(..., ge=1, le=5)
    status: CourseStatus = CourseStatus.PLANNED
    grade: Optional[str] = None
    prerequisites_met: bool = True
    conflicts: List[str] = Field(default_factory=list)
    notes: Optional[str] = None

class QuarterSchedule(BaseModel):
    """Model for a single quarter's schedule."""
    quarter_info: QuarterInfo
    courses: List[ScheduledCourse] = Field(default_factory=list)
    total_units: int = Field(default=0)
    average_difficulty: float = Field(default=0.0)
    is_overload: bool = Field(default=False)
    conflicts: List[str] = Field(default_factory=list)
    notes: Optional[str] = None

    @validator('total_units', always=True)
    def calculate_total_units(cls, v, values):
        if 'courses' in values:
            return sum(course.units for course in values['courses'])
        return v

    @validator('average_difficulty', always=True)
    def calculate_average_difficulty(cls, v, values):
        if 'courses' in values and values['courses']:
            difficulties = [course.difficulty for course in values['courses']]
            return sum(difficulties) / len(difficulties)
        return 0.0

    @validator('is_overload', always=True)
    def check_overload(cls, v, values):
        if 'total_units' in values:
            return values['total_units'] > 20
        return v

class ScheduleConstraints(BaseModel):
    """Model for schedule generation constraints."""
    max_units_per_quarter: int = Field(20, ge=12, le=24)
    min_units_per_quarter: int = Field(12, ge=8, le=20)
    max_difficulty_per_quarter: float = Field(4.0, ge=1.0, le=5.0)
    avoid_back_to_back_difficult: bool = True
    preferred_quarters: List[str] = Field(default_factory=list)
    blackout_quarters: List[str] = Field(default_factory=list)
    required_courses: List[str] = Field(default_factory=list)
    preferred_courses: List[str] = Field(default_factory=list)
    avoided_courses: List[str] = Field(default_factory=list)

    @validator('max_units_per_quarter')
    def validate_max_units(cls, v, values):
        if 'min_units_per_quarter' in values and v < values['min_units_per_quarter']:
            raise ValueError('max_units_per_quarter must be >= min_units_per_quarter')
        return v

class SchedulePreferences(BaseModel):
    """Model for user schedule preferences."""
    graduation_timeline: str = Field("4_years", description="Target graduation timeline")
    workload_preference: str = Field("balanced", description="light, balanced, heavy")
    difficulty_preference: str = Field("progressive", description="consistent, progressive, challenging")
    quarter_preferences: Dict[str, float] = Field(default_factory=dict)
    course_type_preferences: Dict[str, float] = Field(default_factory=dict)
    time_preferences: Dict[str, Any] = Field(default_factory=dict)
    special_requirements: List[str] = Field(default_factory=list)

class ScheduleScore(BaseModel):
    """Model for schedule scoring and evaluation."""
    total_score: float = Field(..., ge=0.0, le=1.0)
    difficulty_balance: float = Field(..., ge=0.0, le=1.0)
    prerequisite_satisfaction: float = Field(..., ge=0.0, le=1.0)
    preference_alignment: float = Field(..., ge=0.0, le=1.0)
    timeline_efficiency: float = Field(..., ge=0.0, le=1.0)
    workload_distribution: float = Field(..., ge=0.0, le=1.0)
    conflict_penalty: float = Field(default=0.0, ge=0.0, le=1.0)
    detailed_scores: Dict[str, float] = Field(default_factory=dict)

class Schedule(BaseModel):
    """Complete schedule model."""
    id: Optional[str] = None
    user_id: str
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    status: ScheduleStatus = ScheduleStatus.DRAFT
    quarters: List[QuarterSchedule] = Field(default_factory=list)
    constraints: Optional[ScheduleConstraints] = None
    preferences: Optional[SchedulePreferences] = None
    score: Optional[ScheduleScore] = None
    total_units: int = Field(default=0)
    estimated_graduation: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    is_active: bool = Field(default=False)

    @validator('total_units', always=True)
    def calculate_total_units(cls, v, values):
        if 'quarters' in values:
            return sum(quarter.total_units for quarter in values['quarters'])
        return v

class ScheduleRequest(BaseModel):
    """Model for schedule generation requests."""
    user_id: str
    constraints: ScheduleConstraints
    preferences: SchedulePreferences
    starting_quarter: QuarterInfo
    target_graduation: Optional[str] = None
    include_summer: bool = Field(default=False)
    generate_alternatives: bool = Field(default=True)
    max_alternatives: int = Field(default=3, ge=1, le=10)

class ScheduleResponse(BaseModel):
    """Model for schedule generation responses."""
    primary_schedule: Schedule
    alternative_schedules: List[Schedule] = Field(default_factory=list)
    generation_metadata: Dict[str, Any] = Field(default_factory=dict)
    warnings: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)

class ScheduleValidation(BaseModel):
    """Model for schedule validation results."""
    is_valid: bool
    errors: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    suggestions: List[str] = Field(default_factory=list)
    prerequisite_issues: List[Dict[str, Any]] = Field(default_factory=list)
    unit_constraint_violations: List[Dict[str, Any]] = Field(default_factory=list)
    conflict_details: List[Dict[str, Any]] = Field(default_factory=list)

class ScheduleComparison(BaseModel):
    """Model for comparing multiple schedules."""
    schedules: List[Schedule]
    comparison_metrics: Dict[str, List[float]] = Field(default_factory=dict)
    recommendations: List[str] = Field(default_factory=list)
    best_schedule_id: Optional[str] = None
    trade_offs: Dict[str, str] = Field(default_factory=dict)

class ScheduleOptimization(BaseModel):
    """Model for schedule optimization parameters."""
    optimization_goals: List[str] = Field(default_factory=list)
    weight_preferences: Dict[str, float] = Field(default_factory=dict)
    constraints_to_relax: List[str] = Field(default_factory=list)
    optimization_algorithm: str = Field(default="genetic_algorithm")
    max_iterations: int = Field(default=1000, ge=100, le=10000)
    convergence_threshold: float = Field(default=0.001, ge=0.0001, le=0.1)

class ScheduleTemplate(BaseModel):
    """Model for schedule templates."""
    template_id: str
    name: str
    description: Optional[str] = None
    major: str
    degree_type: str
    template_quarters: List[Dict[str, Any]] = Field(default_factory=list)
    default_constraints: ScheduleConstraints
    default_preferences: SchedulePreferences
    tags: List[str] = Field(default_factory=list)
    popularity_score: float = Field(default=0.0, ge=0.0, le=1.0)

class ScheduleAnalytics(BaseModel):
    """Model for schedule analytics and insights."""
    schedule_id: str
    completion_probability: float = Field(..., ge=0.0, le=1.0)
    risk_factors: List[str] = Field(default_factory=list)
    optimization_opportunities: List[str] = Field(default_factory=list)
    benchmark_comparison: Dict[str, float] = Field(default_factory=dict)
    predicted_outcomes: Dict[str, Any] = Field(default_factory=dict)
    recommendations: List[str] = Field(default_factory=list)

class ScheduleHistory(BaseModel):
    """Model for tracking schedule changes."""
    schedule_id: str
    version: int
    change_type: str  # created, updated, activated, archived
    changes: Dict[str, Any] = Field(default_factory=dict)
    changed_by: str
    change_reason: Optional[str] = None
    timestamp: datetime

class ScheduleSharing(BaseModel):
    """Model for schedule sharing and collaboration."""
    schedule_id: str
    shared_by: str
    shared_with: List[str] = Field(default_factory=list)
    permission_level: str = Field(default="view")  # view, comment, edit
    share_link: Optional[str] = None
    expiration_date: Optional[datetime] = None
    is_public: bool = Field(default=False)

class ScheduleExport(BaseModel):
    """Model for schedule export configurations."""
    schedule_id: str
    export_format: str  # pdf, ical, csv, json
    include_details: bool = Field(default=True)
    include_descriptions: bool = Field(default=False)
    custom_fields: List[str] = Field(default_factory=list)
    export_options: Dict[str, Any] = Field(default_factory=dict)
