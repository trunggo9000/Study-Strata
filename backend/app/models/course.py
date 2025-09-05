"""
Course data models for Study Strata.
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime

class CourseBase(BaseModel):
    """Base course model with common fields."""
    title: str = Field(..., min_length=1, max_length=255)
    units: int = Field(..., ge=1, le=8)
    difficulty: int = Field(..., ge=1, le=5)
    offered: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    ge_categories: List[str] = Field(default_factory=list)
    description: Optional[str] = None

    @validator('offered')
    def validate_offered_quarters(cls, v):
        valid_quarters = {'Fall', 'Winter', 'Spring', 'Summer'}
        for quarter in v:
            if quarter not in valid_quarters:
                raise ValueError(f'Invalid quarter: {quarter}. Must be one of {valid_quarters}')
        return v

    @validator('tags')
    def validate_tags(cls, v):
        # Ensure tags are lowercase and contain no spaces
        return [tag.lower().replace(' ', '_') for tag in v]

class CourseCreate(CourseBase):
    """Model for creating a new course."""
    id: str = Field(..., min_length=1, max_length=20)
    prerequisites: List[str] = Field(default_factory=list)

    @validator('id')
    def validate_course_id(cls, v):
        # Course ID should be alphanumeric with possible numbers
        if not v.replace(' ', '').isalnum():
            raise ValueError('Course ID must be alphanumeric')
        return v.upper()

class CourseUpdate(CourseBase):
    """Model for updating an existing course."""
    title: Optional[str] = None
    units: Optional[int] = None
    difficulty: Optional[int] = None
    offered: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    ge_categories: Optional[List[str]] = None
    description: Optional[str] = None

class Course(CourseBase):
    """Complete course model with all fields."""
    id: str
    prerequisites: List[str] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CourseSearch(BaseModel):
    """Model for course search parameters."""
    query: Optional[str] = None
    difficulty_min: Optional[int] = Field(None, ge=1, le=5)
    difficulty_max: Optional[int] = Field(None, ge=1, le=5)
    units_min: Optional[int] = Field(None, ge=1, le=8)
    units_max: Optional[int] = Field(None, ge=1, le=8)
    offered_quarters: Optional[List[str]] = None
    required_tags: Optional[List[str]] = None
    excluded_tags: Optional[List[str]] = None
    has_prerequisites: Optional[bool] = None

    @validator('difficulty_max')
    def validate_difficulty_range(cls, v, values):
        if v is not None and 'difficulty_min' in values and values['difficulty_min'] is not None:
            if v < values['difficulty_min']:
                raise ValueError('difficulty_max must be >= difficulty_min')
        return v

    @validator('units_max')
    def validate_units_range(cls, v, values):
        if v is not None and 'units_min' in values and values['units_min'] is not None:
            if v < values['units_min']:
                raise ValueError('units_max must be >= units_min')
        return v

class CoursePrerequisite(BaseModel):
    """Model for course prerequisite relationships."""
    course_id: str
    prerequisite_id: str
    requirement_type: str = "required"  # required, recommended, corequisite

class CourseOffering(BaseModel):
    """Model for course offering information."""
    course_id: str
    quarter: str
    year: int
    instructor: Optional[str] = None
    capacity: Optional[int] = None
    enrolled: Optional[int] = None
    waitlist: Optional[int] = None

    @validator('quarter')
    def validate_quarter(cls, v):
        valid_quarters = {'Fall', 'Winter', 'Spring', 'Summer'}
        if v not in valid_quarters:
            raise ValueError(f'Invalid quarter: {v}. Must be one of {valid_quarters}')
        return v

    @validator('year')
    def validate_year(cls, v):
        current_year = datetime.now().year
        if v < current_year - 1 or v > current_year + 5:
            raise ValueError(f'Year must be between {current_year - 1} and {current_year + 5}')
        return v

class CourseReview(BaseModel):
    """Model for course reviews and ratings."""
    course_id: str
    user_id: str
    rating: int = Field(..., ge=1, le=5)
    difficulty_rating: int = Field(..., ge=1, le=5)
    workload_rating: int = Field(..., ge=1, le=5)
    review_text: Optional[str] = None
    would_recommend: bool = True
    quarter_taken: Optional[str] = None
    year_taken: Optional[int] = None

    @validator('review_text')
    def validate_review_length(cls, v):
        if v is not None and len(v) > 2000:
            raise ValueError('Review text must be 2000 characters or less')
        return v

class CourseStatistics(BaseModel):
    """Model for course statistics and analytics."""
    course_id: str
    total_enrollments: int = 0
    average_rating: float = 0.0
    average_difficulty: float = 0.0
    average_workload: float = 0.0
    completion_rate: float = 0.0
    grade_distribution: Dict[str, int] = Field(default_factory=dict)
    popular_quarters: List[str] = Field(default_factory=list)
    prerequisite_satisfaction_rate: float = 0.0

class CourseRecommendation(BaseModel):
    """Model for AI-generated course recommendations."""
    course_id: str
    course_title: str
    recommendation_score: float = Field(..., ge=0.0, le=1.0)
    reasoning: str
    fit_factors: Dict[str, float] = Field(default_factory=dict)
    prerequisites_met: bool = True
    estimated_difficulty: int = Field(..., ge=1, le=5)
    recommended_quarter: Optional[str] = None

class CourseSequence(BaseModel):
    """Model for course sequences and pathways."""
    sequence_id: str
    name: str
    description: Optional[str] = None
    courses: List[str] = Field(..., min_items=2)
    sequence_type: str = "prerequisite_chain"  # prerequisite_chain, specialization, track
    estimated_duration_quarters: int = Field(..., ge=1)
    difficulty_progression: List[int] = Field(default_factory=list)

    @validator('difficulty_progression')
    def validate_difficulty_progression(cls, v, values):
        if v and 'courses' in values:
            if len(v) != len(values['courses']):
                raise ValueError('Difficulty progression length must match courses length')
            if any(d < 1 or d > 5 for d in v):
                raise ValueError('All difficulty ratings must be between 1 and 5')
        return v

class CoursePlanning(BaseModel):
    """Model for course planning and scheduling."""
    user_id: str
    planned_courses: List[str]
    target_quarter: str
    target_year: int
    planning_constraints: Dict[str, Any] = Field(default_factory=dict)
    alternative_options: List[str] = Field(default_factory=list)
    notes: Optional[str] = None

class CourseConflict(BaseModel):
    """Model for course scheduling conflicts."""
    conflict_type: str  # time_conflict, prerequisite_missing, capacity_full
    affected_courses: List[str]
    severity: str = "medium"  # low, medium, high, critical
    description: str
    suggested_resolution: Optional[str] = None

class CoursePathway(BaseModel):
    """Model for academic pathways and degree requirements."""
    pathway_id: str
    name: str
    degree_type: str  # BS, BA, MS, etc.
    major: str
    total_units_required: int
    core_courses: List[str] = Field(default_factory=list)
    elective_categories: Dict[str, int] = Field(default_factory=dict)  # category: min_units
    capstone_requirements: List[str] = Field(default_factory=list)
    estimated_completion_quarters: int = Field(..., ge=4)

class CourseEquivalency(BaseModel):
    """Model for course equivalencies and transfers."""
    original_course_id: str
    equivalent_course_id: str
    institution: str
    equivalency_type: str = "direct"  # direct, partial, conditional
    units_transferred: int
    conditions: Optional[str] = None
    approved_date: datetime
    expiration_date: Optional[datetime] = None
