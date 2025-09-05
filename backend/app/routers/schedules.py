"""
Schedule generation and management API endpoints.
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import logging
import hashlib
import json

from ..core.database import schedule_repo, student_repo, get_db_manager
from ..core.ai_engine import AISchedulingEngine, ScheduleConstraints
from ..core.cache import get_cached, set_cached, schedule_cache_key
from ..models.schedule import ScheduleRequest, ScheduleResponse, SchedulePreferences

logger = logging.getLogger(__name__)
router = APIRouter()

class GenerateScheduleRequest(BaseModel):
    """Request model for schedule generation."""
    constraints: Dict[str, Any] = Field(default_factory=dict)
    preferences: Dict[str, Any] = Field(default_factory=dict)
    graduation_timeline: str = Field("4_years", description="Target graduation timeline")
    max_units_per_quarter: int = Field(20, ge=12, le=24)
    min_units_per_quarter: int = Field(12, ge=8, le=20)
    preferred_difficulty_balance: bool = Field(True)
    avoid_back_to_back_difficult: bool = Field(True)

class ScheduleQuarter(BaseModel):
    """Model for a single quarter in a schedule."""
    quarter: str
    courses: List[Dict[str, Any]]
    total_units: int

class GeneratedSchedule(BaseModel):
    """Model for a generated schedule."""
    id: Optional[str] = None
    quarters: List[ScheduleQuarter]
    score: Dict[str, float]
    total_units: int
    estimated_graduation: str
    created_at: Optional[str] = None

class ScheduleGenerationResponse(BaseModel):
    """Response model for schedule generation."""
    recommended_schedule: Optional[GeneratedSchedule]
    alternative_schedules: List[GeneratedSchedule]
    generation_metadata: Dict[str, Any]

# Initialize AI engine
ai_engine = AISchedulingEngine()

@router.post("/generate", response_model=ScheduleGenerationResponse)
async def generate_schedule(
    request: GenerateScheduleRequest,
    user_id: str,
    background_tasks: BackgroundTasks
):
    """Generate optimized course schedules for a student."""
    try:
        # Create constraints object
        constraints = ScheduleConstraints(
            max_units_per_quarter=request.max_units_per_quarter,
            min_units_per_quarter=request.min_units_per_quarter,
            avoid_back_to_back_difficult=request.avoid_back_to_back_difficult,
            graduation_timeline=request.graduation_timeline
        )
        
        # Generate cache key based on request parameters
        request_hash = hashlib.md5(
            json.dumps(request.dict(), sort_keys=True).encode()
        ).hexdigest()
        cache_key = schedule_cache_key(user_id, request_hash)
        
        # Check cache first
        cached_result = await get_cached(cache_key)
        if cached_result:
            return ScheduleGenerationResponse(**cached_result)
        
        # Generate schedule using AI engine
        result = await ai_engine.generate_schedule(
            user_id=user_id,
            constraints=constraints,
            preferences=request.preferences
        )
        
        # Format response
        response_data = {
            "recommended_schedule": None,
            "alternative_schedules": [],
            "generation_metadata": result.get("generation_metadata", {})
        }
        
        if result.get("recommended_schedule"):
            response_data["recommended_schedule"] = GeneratedSchedule(
                quarters=[
                    ScheduleQuarter(**quarter) 
                    for quarter in result["recommended_schedule"]["quarters"]
                ],
                score=result["recommended_schedule"]["score"],
                total_units=result["recommended_schedule"]["total_units"],
                estimated_graduation=result["recommended_schedule"]["estimated_graduation"]
            )
        
        for alt_schedule in result.get("alternative_schedules", []):
            response_data["alternative_schedules"].append(GeneratedSchedule(
                quarters=[ScheduleQuarter(**quarter) for quarter in alt_schedule["quarters"]],
                score=alt_schedule["score"],
                total_units=alt_schedule["total_units"],
                estimated_graduation=alt_schedule["estimated_graduation"]
            ))
        
        # Cache the result
        await set_cached(cache_key, response_data, ttl=1800)  # 30 minutes
        
        # Save recommended schedule to database in background
        if response_data["recommended_schedule"]:
            background_tasks.add_task(
                save_schedule_to_db,
                user_id,
                response_data["recommended_schedule"].dict(),
                request.dict()
            )
        
        return ScheduleGenerationResponse(**response_data)
        
    except Exception as e:
        logger.error(f"Error generating schedule for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate schedule")

@router.get("/", response_model=List[GeneratedSchedule])
async def get_user_schedules(user_id: str):
    """Get all saved schedules for a user."""
    try:
        schedules = await schedule_repo.get_user_schedules(user_id)
        
        result = []
        for schedule in schedules:
            result.append(GeneratedSchedule(
                id=schedule['id'],
                quarters=[ScheduleQuarter(**quarter) for quarter in schedule['courses']],
                score=schedule['score'],
                total_units=sum(
                    quarter.get('total_units', 0) 
                    for quarter in schedule['courses']
                ),
                estimated_graduation="",  # Would calculate from quarters
                created_at=schedule['created_at']
            ))
        
        return result
        
    except Exception as e:
        logger.error(f"Error fetching schedules for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch schedules")

@router.post("/{schedule_id}/activate")
async def activate_schedule(schedule_id: str, user_id: str):
    """Set a schedule as active for a user."""
    try:
        success = await schedule_repo.set_active_schedule(user_id, schedule_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Schedule not found")
        
        return {"message": "Schedule activated successfully", "schedule_id": schedule_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error activating schedule {schedule_id} for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to activate schedule")

@router.get("/active", response_model=Optional[GeneratedSchedule])
async def get_active_schedule(user_id: str):
    """Get the active schedule for a user."""
    try:
        schedules = await schedule_repo.get_user_schedules(user_id)
        active_schedule = next((s for s in schedules if s.get('is_active')), None)
        
        if not active_schedule:
            return None
        
        return GeneratedSchedule(
            id=active_schedule['id'],
            quarters=[ScheduleQuarter(**quarter) for quarter in active_schedule['courses']],
            score=active_schedule['score'],
            total_units=sum(
                quarter.get('total_units', 0) 
                for quarter in active_schedule['courses']
            ),
            estimated_graduation="",  # Would calculate from quarters
            created_at=active_schedule['created_at']
        )
        
    except Exception as e:
        logger.error(f"Error fetching active schedule for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch active schedule")

@router.post("/validate")
async def validate_schedule(schedule: Dict[str, Any], user_id: str):
    """Validate a schedule for feasibility and constraints."""
    try:
        # Get student's completed courses
        student_courses = await student_repo.get_student_courses(user_id)
        completed_courses = [
            sc['course_id'] for sc in student_courses 
            if sc['status'] == 'completed'
        ]
        
        validation_results = {
            "is_valid": True,
            "issues": [],
            "warnings": [],
            "suggestions": []
        }
        
        # Validate prerequisites
        for quarter in schedule.get('quarters', []):
            for course in quarter.get('courses', []):
                course_id = course.get('id')
                # This would check prerequisites against completed courses
                # Simplified validation for now
                pass
        
        # Validate unit constraints
        for quarter in schedule.get('quarters', []):
            total_units = quarter.get('total_units', 0)
            if total_units > 24:
                validation_results["issues"].append(
                    f"Quarter {quarter.get('quarter')} exceeds maximum units (24): {total_units}"
                )
                validation_results["is_valid"] = False
            elif total_units < 8:
                validation_results["warnings"].append(
                    f"Quarter {quarter.get('quarter')} has very low units: {total_units}"
                )
        
        return validation_results
        
    except Exception as e:
        logger.error(f"Error validating schedule for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to validate schedule")

@router.post("/optimize")
async def optimize_existing_schedule(
    schedule: Dict[str, Any],
    user_id: str,
    optimization_goals: Dict[str, Any] = None
):
    """Optimize an existing schedule based on new constraints or goals."""
    try:
        # This would use the AI engine to re-optimize an existing schedule
        # For now, return the original schedule with a message
        
        return {
            "original_schedule": schedule,
            "optimized_schedule": schedule,  # Would be the optimized version
            "improvements": [],
            "message": "Schedule optimization not yet fully implemented"
        }
        
    except Exception as e:
        logger.error(f"Error optimizing schedule for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to optimize schedule")

async def save_schedule_to_db(user_id: str, schedule_data: Dict[str, Any], request_data: Dict[str, Any]):
    """Background task to save generated schedule to database."""
    try:
        await schedule_repo.save_generated_schedule(user_id, {
            "quarter": "Generated",
            "courses": schedule_data["quarters"],
            "score": schedule_data["score"],
            "preferences": request_data
        })
        logger.info(f"Saved generated schedule for user {user_id}")
    except Exception as e:
        logger.error(f"Error saving schedule to database for user {user_id}: {e}")

@router.get("/analytics")
async def get_schedule_analytics(user_id: str):
    """Get analytics and insights about user's schedules."""
    try:
        schedules = await schedule_repo.get_user_schedules(user_id)
        
        if not schedules:
            return {
                "total_schedules": 0,
                "average_score": 0,
                "insights": ["No schedules generated yet"]
            }
        
        # Calculate analytics
        total_schedules = len(schedules)
        scores = [s.get('score', {}).get('total_score', 0) for s in schedules]
        average_score = sum(scores) / len(scores) if scores else 0
        
        insights = []
        if average_score > 0.8:
            insights.append("Your schedules are well-optimized!")
        elif average_score > 0.6:
            insights.append("Good schedule optimization with room for improvement")
        else:
            insights.append("Consider adjusting preferences for better schedules")
        
        return {
            "total_schedules": total_schedules,
            "average_score": average_score,
            "best_score": max(scores) if scores else 0,
            "insights": insights,
            "schedule_count_by_quarter": {}  # Would implement quarter breakdown
        }
        
    except Exception as e:
        logger.error(f"Error getting schedule analytics for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get schedule analytics")
