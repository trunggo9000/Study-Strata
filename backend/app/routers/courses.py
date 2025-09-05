"""
Course management API endpoints.
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import logging

from ..core.database import course_repo, get_db_manager
from ..core.cache import get_cached, set_cached, course_cache_key
from ..models.course import Course, CourseCreate, CourseUpdate, CourseSearch

logger = logging.getLogger(__name__)
router = APIRouter()

class CourseResponse(BaseModel):
    """Course response model."""
    id: str
    title: str
    units: int
    difficulty: int
    offered: List[str]
    tags: List[str]
    ge_categories: List[str]
    description: Optional[str] = None
    prerequisites: List[str] = []

class CourseSearchResponse(BaseModel):
    """Course search response model."""
    courses: List[CourseResponse]
    total: int
    page: int
    per_page: int

@router.get("/", response_model=CourseSearchResponse)
async def get_courses(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search query"),
    difficulty: Optional[int] = Query(None, ge=1, le=5, description="Filter by difficulty"),
    units: Optional[int] = Query(None, ge=1, le=8, description="Filter by units"),
    offered: Optional[str] = Query(None, description="Filter by quarter offered"),
    tags: Optional[str] = Query(None, description="Filter by tags")
):
    """Get all courses with optional filtering and pagination."""
    try:
        # Build cache key
        cache_key = f"courses:page:{page}:per_page:{per_page}:search:{search}:difficulty:{difficulty}:units:{units}:offered:{offered}:tags:{tags}"
        
        # Check cache
        cached_result = await get_cached(cache_key)
        if cached_result:
            return cached_result
        
        # Build filters
        filters = {}
        if difficulty:
            filters['difficulty'] = difficulty
        if units:
            filters['units'] = units
        if offered:
            filters['offered'] = offered
        
        # Search courses
        if search or filters:
            courses = await course_repo.search_courses(search or "", filters)
        else:
            courses = await course_repo.get_all_courses()
        
        # Get prerequisites for each course
        course_responses = []
        for course in courses:
            prerequisites = await course_repo.get_prerequisites(course['id'])
            course_responses.append(CourseResponse(
                id=course['id'],
                title=course['title'],
                units=course['units'],
                difficulty=course['difficulty'],
                offered=course['offered'],
                tags=course['tags'],
                ge_categories=course['ge_categories'],
                description=course.get('description'),
                prerequisites=prerequisites
            ))
        
        # Apply pagination
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        paginated_courses = course_responses[start_idx:end_idx]
        
        result = CourseSearchResponse(
            courses=paginated_courses,
            total=len(course_responses),
            page=page,
            per_page=per_page
        )
        
        # Cache result
        await set_cached(cache_key, result.dict(), ttl=3600)
        
        return result
        
    except Exception as e:
        logger.error(f"Error fetching courses: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch courses")

@router.get("/{course_id}", response_model=CourseResponse)
async def get_course(course_id: str):
    """Get a specific course by ID."""
    try:
        # Check cache
        cache_key = course_cache_key(course_id)
        cached_course = await get_cached(cache_key)
        if cached_course:
            return CourseResponse(**cached_course)
        
        # Get course from database
        course = await course_repo.get_course_by_id(course_id)
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Get prerequisites
        prerequisites = await course_repo.get_prerequisites(course_id)
        
        course_response = CourseResponse(
            id=course['id'],
            title=course['title'],
            units=course['units'],
            difficulty=course['difficulty'],
            offered=course['offered'],
            tags=course['tags'],
            ge_categories=course['ge_categories'],
            description=course.get('description'),
            prerequisites=prerequisites
        )
        
        # Cache result
        await set_cached(cache_key, course_response.dict(), ttl=3600)
        
        return course_response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching course {course_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch course")

@router.get("/{course_id}/prerequisites", response_model=List[CourseResponse])
async def get_course_prerequisites(course_id: str):
    """Get prerequisites for a specific course."""
    try:
        # Check if course exists
        course = await course_repo.get_course_by_id(course_id)
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Get prerequisite IDs
        prereq_ids = await course_repo.get_prerequisites(course_id)
        
        # Get full prerequisite course data
        prerequisites = []
        for prereq_id in prereq_ids:
            prereq_course = await course_repo.get_course_by_id(prereq_id)
            if prereq_course:
                prereq_prerequisites = await course_repo.get_prerequisites(prereq_id)
                prerequisites.append(CourseResponse(
                    id=prereq_course['id'],
                    title=prereq_course['title'],
                    units=prereq_course['units'],
                    difficulty=prereq_course['difficulty'],
                    offered=prereq_course['offered'],
                    tags=prereq_course['tags'],
                    ge_categories=prereq_course['ge_categories'],
                    description=prereq_course.get('description'),
                    prerequisites=prereq_prerequisites
                ))
        
        return prerequisites
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching prerequisites for course {course_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch prerequisites")

@router.get("/{course_id}/dependents")
async def get_course_dependents(course_id: str):
    """Get courses that depend on this course as a prerequisite."""
    try:
        # Check if course exists
        course = await course_repo.get_course_by_id(course_id)
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # This would require a reverse lookup in the prerequisites table
        # For now, return empty list as placeholder
        return {
            "course_id": course_id,
            "dependents": [],
            "message": "Dependent courses lookup not yet implemented"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching dependents for course {course_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch dependents")

@router.get("/search/advanced")
async def advanced_course_search(
    query: str = Query(..., description="Search query"),
    include_description: bool = Query(True, description="Include description in search"),
    include_tags: bool = Query(True, description="Include tags in search"),
    min_difficulty: Optional[int] = Query(None, ge=1, le=5),
    max_difficulty: Optional[int] = Query(None, ge=1, le=5),
    min_units: Optional[int] = Query(None, ge=1, le=8),
    max_units: Optional[int] = Query(None, ge=1, le=8),
    offered_quarters: Optional[List[str]] = Query(None, description="Filter by quarters offered"),
    required_tags: Optional[List[str]] = Query(None, description="Must have all these tags"),
    excluded_tags: Optional[List[str]] = Query(None, description="Must not have these tags")
):
    """Advanced course search with multiple filters."""
    try:
        # Build comprehensive filters
        filters = {}
        
        if min_difficulty is not None or max_difficulty is not None:
            filters['difficulty_range'] = (min_difficulty, max_difficulty)
        
        if min_units is not None or max_units is not None:
            filters['units_range'] = (min_units, max_units)
        
        if offered_quarters:
            filters['offered_quarters'] = offered_quarters
        
        if required_tags:
            filters['required_tags'] = required_tags
        
        if excluded_tags:
            filters['excluded_tags'] = excluded_tags
        
        # Perform search (simplified version)
        courses = await course_repo.search_courses(query, filters)
        
        # Convert to response format
        course_responses = []
        for course in courses:
            prerequisites = await course_repo.get_prerequisites(course['id'])
            course_responses.append(CourseResponse(
                id=course['id'],
                title=course['title'],
                units=course['units'],
                difficulty=course['difficulty'],
                offered=course['offered'],
                tags=course['tags'],
                ge_categories=course['ge_categories'],
                description=course.get('description'),
                prerequisites=prerequisites
            ))
        
        return {
            "query": query,
            "filters": filters,
            "results": course_responses,
            "total": len(course_responses)
        }
        
    except Exception as e:
        logger.error(f"Error in advanced course search: {e}")
        raise HTTPException(status_code=500, detail="Advanced search failed")
