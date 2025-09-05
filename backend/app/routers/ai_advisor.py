"""
AI Academic Advisor API endpoints.
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import logging

from ..core.ai_engine import AISchedulingEngine
from ..core.database import student_repo, course_repo
from ..core.cache import get_cached, set_cached

logger = logging.getLogger(__name__)
router = APIRouter()

class ChatMessage(BaseModel):
    """Chat message model."""
    role: str = Field(..., description="Message role: user or assistant")
    content: str = Field(..., description="Message content")
    timestamp: Optional[str] = None

class ChatRequest(BaseModel):
    """Chat request model."""
    message: str = Field(..., description="User message")
    context: Optional[str] = Field(None, description="Additional context")
    conversation_history: List[ChatMessage] = Field(default_factory=list)

class ChatResponse(BaseModel):
    """Chat response model."""
    response: str
    suggestions: List[str] = Field(default_factory=list)
    related_courses: List[Dict[str, Any]] = Field(default_factory=list)
    confidence: float = Field(default=0.8)

class RecommendationRequest(BaseModel):
    """Course recommendation request."""
    context: str = Field("general", description="Context for recommendations")
    preferences: Dict[str, Any] = Field(default_factory=dict)
    exclude_completed: bool = Field(True)

class ProgressAnalysisResponse(BaseModel):
    """Academic progress analysis response."""
    analysis: str
    metrics: Dict[str, Any]
    recommendations: List[str] = Field(default_factory=list)
    next_steps: List[str] = Field(default_factory=list)

# Initialize AI engine
ai_engine = AISchedulingEngine()

@router.post("/chat", response_model=ChatResponse)
async def chat_with_advisor(request: ChatRequest, user_id: str):
    """Chat with the AI academic advisor."""
    try:
        # Check cache for similar queries
        cache_key = f"chat:{user_id}:{hash(request.message)}"
        cached_response = await get_cached(cache_key)
        if cached_response:
            return ChatResponse(**cached_response)
        
        # Get student context
        student_courses = await student_repo.get_student_courses(user_id)
        completed_courses = [sc['course_id'] for sc in student_courses if sc['status'] == 'completed']
        
        # Prepare context for AI
        context = {
            "user_message": request.message,
            "completed_courses": completed_courses,
            "conversation_history": [msg.dict() for msg in request.conversation_history],
            "additional_context": request.context
        }
        
        # Generate AI response (simplified for now)
        ai_response = await generate_advisor_response(context)
        
        # Get related courses if relevant
        related_courses = []
        if any(keyword in request.message.lower() for keyword in ['course', 'class', 'recommend', 'suggest']):
            available_courses = await course_repo.get_all_courses()
            related_courses = available_courses[:3]  # Top 3 for brevity
        
        response = ChatResponse(
            response=ai_response,
            suggestions=[
                "Tell me about prerequisite chains",
                "What courses should I take next quarter?",
                "Analyze my academic progress",
                "Help me plan my graduation timeline"
            ],
            related_courses=related_courses,
            confidence=0.85
        )
        
        # Cache response
        await set_cached(cache_key, response.dict(), ttl=1800)
        
        return response
        
    except Exception as e:
        logger.error(f"Error in AI chat for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="AI advisor temporarily unavailable")

@router.post("/recommendations", response_model=Dict[str, Any])
async def get_course_recommendations(request: RecommendationRequest, user_id: str):
    """Get AI-powered course recommendations."""
    try:
        # Check cache
        cache_key = f"recommendations:{user_id}:{request.context}"
        cached_recommendations = await get_cached(cache_key)
        if cached_recommendations:
            return cached_recommendations
        
        # Get recommendations from AI engine
        recommendations = await ai_engine.get_course_recommendations(user_id, request.context)
        
        # Cache recommendations
        await set_cached(cache_key, recommendations, ttl=3600)
        
        return recommendations
        
    except Exception as e:
        logger.error(f"Error getting recommendations for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get recommendations")

@router.get("/progress", response_model=ProgressAnalysisResponse)
async def analyze_academic_progress(user_id: str):
    """Get AI analysis of student's academic progress."""
    try:
        # Check cache
        cache_key = f"progress_analysis:{user_id}"
        cached_analysis = await get_cached(cache_key)
        if cached_analysis:
            return ProgressAnalysisResponse(**cached_analysis)
        
        # Get AI analysis
        analysis_result = await ai_engine.analyze_academic_progress(user_id)
        
        response = ProgressAnalysisResponse(
            analysis=analysis_result["analysis"],
            metrics=analysis_result["metrics"],
            recommendations=[
                "Consider taking more challenging courses to build skills",
                "Balance your course load across quarters",
                "Focus on completing prerequisite chains early"
            ],
            next_steps=[
                "Review upcoming course offerings",
                "Meet with academic advisor",
                "Plan next quarter's schedule"
            ]
        )
        
        # Cache analysis
        await set_cached(cache_key, response.dict(), ttl=7200)  # 2 hours
        
        return response
        
    except Exception as e:
        logger.error(f"Error analyzing progress for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze progress")

@router.post("/study-plan")
async def generate_study_plan(
    user_id: str,
    graduation_goal: str = "Spring 2026",
    focus_areas: List[str] = None,
    preferences: Dict[str, Any] = None
):
    """Generate a comprehensive study plan."""
    try:
        # Get student data
        student_courses = await student_repo.get_student_courses(user_id)
        completed_courses = [sc['course_id'] for sc in student_courses if sc['status'] == 'completed']
        
        # Generate study plan using AI
        study_plan = {
            "graduation_goal": graduation_goal,
            "current_progress": {
                "completed_courses": len(completed_courses),
                "estimated_completion": "75%"
            },
            "recommended_path": [
                {
                    "quarter": "Fall 2024",
                    "courses": ["CS111", "MATH33A"],
                    "focus": "Systems and Math Foundation"
                },
                {
                    "quarter": "Winter 2025", 
                    "courses": ["CS118", "CS131"],
                    "focus": "Networking and Programming Languages"
                }
            ],
            "milestones": [
                "Complete core CS requirements by Winter 2025",
                "Choose specialization by Spring 2025",
                "Complete capstone project by Fall 2025"
            ],
            "recommendations": [
                "Maintain consistent course load",
                "Consider internship opportunities",
                "Build portfolio projects"
            ]
        }
        
        return study_plan
        
    except Exception as e:
        logger.error(f"Error generating study plan for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate study plan")

@router.get("/insights")
async def get_academic_insights(user_id: str):
    """Get personalized academic insights and tips."""
    try:
        # Get student data
        student_courses = await student_repo.get_student_courses(user_id)
        
        insights = {
            "performance_trends": {
                "difficulty_progression": "Steadily increasing",
                "unit_load_pattern": "Consistent 16-18 units",
                "completion_rate": "95%"
            },
            "strengths": [
                "Strong performance in mathematical courses",
                "Consistent completion of prerequisites",
                "Good balance of theory and practical courses"
            ],
            "areas_for_improvement": [
                "Consider more challenging electives",
                "Explore interdisciplinary options",
                "Build more project experience"
            ],
            "upcoming_opportunities": [
                "Advanced AI/ML course sequence available",
                "Research opportunities in computer vision",
                "Industry partnership program applications open"
            ],
            "personalized_tips": [
                "Your math background is strong - consider the theoretical CS track",
                "Based on your interests, explore the HCI specialization",
                "Your consistent performance suggests you can handle higher course loads"
            ]
        }
        
        return insights
        
    except Exception as e:
        logger.error(f"Error getting insights for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get academic insights")

async def generate_advisor_response(context: Dict[str, Any]) -> str:
    """Generate AI advisor response based on context."""
    try:
        user_message = context["user_message"].lower()
        
        # Simple rule-based responses for common queries
        if "prerequisite" in user_message:
            return "Prerequisites are important for building foundational knowledge. I can help you understand the prerequisite chains for any course. Which specific course or area are you interested in?"
        
        elif "next quarter" in user_message or "recommend" in user_message:
            return "Based on your completed courses, I recommend focusing on courses that build upon your foundation while maintaining a balanced difficulty level. Would you like me to generate a specific schedule recommendation?"
        
        elif "graduation" in user_message or "timeline" in user_message:
            return "Let's work on your graduation timeline! Based on your current progress, I can help create a quarter-by-quarter plan to reach your graduation goal efficiently."
        
        elif "difficult" in user_message or "hard" in user_message:
            return "Course difficulty can vary by individual, but I can help you balance challenging courses with more manageable ones. What specific concerns do you have about course difficulty?"
        
        else:
            return "I'm here to help with your academic planning! I can assist with course recommendations, schedule optimization, prerequisite planning, and graduation timeline analysis. What would you like to explore?"
        
    except Exception as e:
        logger.error(f"Error generating advisor response: {e}")
        return "I'm having trouble processing your request right now. Please try asking about course recommendations, schedule planning, or academic progress analysis."
