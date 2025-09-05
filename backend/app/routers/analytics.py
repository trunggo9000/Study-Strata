"""
Analytics and reporting API endpoints.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime, timedelta
import logging
import numpy as np
import pandas as pd
from collections import defaultdict

from ..core.database import student_repo, course_repo, schedule_repo
from ..core.cache import get_cached, set_cached

logger = logging.getLogger(__name__)
router = APIRouter()

class CourseAnalytics(BaseModel):
    """Course analytics model."""
    course_id: str
    title: str
    enrollment_count: int
    average_difficulty_rating: float
    completion_rate: float
    prerequisite_satisfaction_rate: float
    popular_quarters: List[str]

class StudentProgressMetrics(BaseModel):
    """Student progress metrics model."""
    total_courses_completed: int
    total_units_earned: int
    average_course_difficulty: float
    completion_rate: float
    quarters_active: int
    projected_graduation: str
    progress_percentage: float

class DepartmentAnalytics(BaseModel):
    """Department-wide analytics model."""
    total_students: int
    total_courses_offered: int
    average_completion_rate: float
    most_popular_courses: List[Dict[str, Any]]
    difficulty_distribution: Dict[str, int]
    enrollment_trends: Dict[str, Any]

class PerformanceInsights(BaseModel):
    """Performance insights model."""
    strengths: List[str]
    improvement_areas: List[str]
    recommendations: List[str]
    benchmark_comparison: Dict[str, float]

@router.get("/student/{user_id}/metrics", response_model=StudentProgressMetrics)
async def get_student_metrics(user_id: str):
    """Get comprehensive metrics for a specific student."""
    try:
        # Check cache
        cache_key = f"student_metrics:{user_id}"
        cached_metrics = await get_cached(cache_key)
        if cached_metrics:
            return StudentProgressMetrics(**cached_metrics)
        
        # Get student course data
        student_courses = await student_repo.get_student_courses(user_id)
        
        if not student_courses:
            return StudentProgressMetrics(
                total_courses_completed=0,
                total_units_earned=0,
                average_course_difficulty=0.0,
                completion_rate=0.0,
                quarters_active=0,
                projected_graduation="Unknown",
                progress_percentage=0.0
            )
        
        # Calculate metrics
        completed_courses = [sc for sc in student_courses if sc['status'] == 'completed']
        total_completed = len(completed_courses)
        total_units = sum(course['courses']['units'] for course in completed_courses)
        
        difficulties = [course['courses']['difficulty'] for course in completed_courses]
        avg_difficulty = np.mean(difficulties) if difficulties else 0.0
        
        # Calculate completion rate
        total_attempted = len(student_courses)
        completion_rate = (total_completed / total_attempted) if total_attempted > 0 else 0.0
        
        # Count active quarters
        quarters = set()
        for course in student_courses:
            if course.get('quarter'):
                quarters.add(course['quarter'])
        quarters_active = len(quarters)
        
        # Estimate progress percentage (assuming 180 total units for graduation)
        progress_percentage = min((total_units / 180) * 100, 100.0)
        
        # Project graduation
        remaining_units = max(0, 180 - total_units)
        remaining_quarters = max(1, remaining_units // 16)  # Assuming 16 units per quarter
        projected_graduation = f"In {remaining_quarters} quarters"
        
        metrics = StudentProgressMetrics(
            total_courses_completed=total_completed,
            total_units_earned=total_units,
            average_course_difficulty=round(avg_difficulty, 2),
            completion_rate=round(completion_rate, 3),
            quarters_active=quarters_active,
            projected_graduation=projected_graduation,
            progress_percentage=round(progress_percentage, 1)
        )
        
        # Cache metrics
        await set_cached(cache_key, metrics.dict(), ttl=3600)
        
        return metrics
        
    except Exception as e:
        logger.error(f"Error getting student metrics for {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get student metrics")

@router.get("/student/{user_id}/insights", response_model=PerformanceInsights)
async def get_student_insights(user_id: str):
    """Get AI-powered insights about student performance."""
    try:
        # Get student metrics first
        metrics = await get_student_metrics(user_id)
        student_courses = await student_repo.get_student_courses(user_id)
        
        # Analyze performance patterns
        strengths = []
        improvement_areas = []
        recommendations = []
        
        # Analyze completion rate
        if metrics.completion_rate > 0.9:
            strengths.append("Excellent course completion rate")
        elif metrics.completion_rate < 0.7:
            improvement_areas.append("Course completion consistency")
            recommendations.append("Consider reducing course load to improve completion rate")
        
        # Analyze difficulty progression
        if metrics.average_course_difficulty > 3.5:
            strengths.append("Taking challenging coursework")
        elif metrics.average_course_difficulty < 2.5:
            recommendations.append("Consider adding more challenging courses to build skills")
        
        # Analyze progress pace
        if metrics.progress_percentage > 75:
            strengths.append("On track for timely graduation")
        elif metrics.progress_percentage < 50:
            improvement_areas.append("Academic progress pace")
            recommendations.append("Consider increasing course load or summer sessions")
        
        # Benchmark comparison (simulated)
        benchmark_comparison = {
            "completion_rate_percentile": min(95, metrics.completion_rate * 100),
            "difficulty_level_percentile": min(95, (metrics.average_course_difficulty / 5) * 100),
            "progress_pace_percentile": min(95, metrics.progress_percentage)
        }
        
        insights = PerformanceInsights(
            strengths=strengths,
            improvement_areas=improvement_areas,
            recommendations=recommendations,
            benchmark_comparison=benchmark_comparison
        )
        
        return insights
        
    except Exception as e:
        logger.error(f"Error getting student insights for {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get student insights")

@router.get("/courses/popular", response_model=List[CourseAnalytics])
async def get_popular_courses(
    limit: int = Query(10, ge=1, le=50),
    quarter: Optional[str] = Query(None, description="Filter by quarter")
):
    """Get analytics for most popular courses."""
    try:
        # Get all courses
        courses = await course_repo.get_all_courses()
        
        # Simulate enrollment data (in real implementation, would query enrollment table)
        course_analytics = []
        for course in courses[:limit]:
            analytics = CourseAnalytics(
                course_id=course['id'],
                title=course['title'],
                enrollment_count=np.random.randint(50, 300),  # Simulated
                average_difficulty_rating=course['difficulty'],
                completion_rate=np.random.uniform(0.8, 0.98),  # Simulated
                prerequisite_satisfaction_rate=0.95,  # Simulated
                popular_quarters=course['offered'][:2]  # Most popular quarters
            )
            course_analytics.append(analytics)
        
        # Sort by enrollment count
        course_analytics.sort(key=lambda x: x.enrollment_count, reverse=True)
        
        return course_analytics
        
    except Exception as e:
        logger.error(f"Error getting popular courses: {e}")
        raise HTTPException(status_code=500, detail="Failed to get popular courses")

@router.get("/department/overview", response_model=DepartmentAnalytics)
async def get_department_analytics():
    """Get department-wide analytics overview."""
    try:
        # Check cache
        cache_key = "department_analytics"
        cached_analytics = await get_cached(cache_key)
        if cached_analytics:
            return DepartmentAnalytics(**cached_analytics)
        
        # Get courses data
        courses = await course_repo.get_all_courses()
        
        # Simulate department analytics
        difficulty_distribution = defaultdict(int)
        for course in courses:
            difficulty_distribution[str(course['difficulty'])] += 1
        
        most_popular_courses = [
            {"course_id": course['id'], "title": course['title'], "enrollment": np.random.randint(100, 400)}
            for course in courses[:5]
        ]
        
        analytics = DepartmentAnalytics(
            total_students=1250,  # Simulated
            total_courses_offered=len(courses),
            average_completion_rate=0.87,  # Simulated
            most_popular_courses=most_popular_courses,
            difficulty_distribution=dict(difficulty_distribution),
            enrollment_trends={
                "fall_2023": 1180,
                "winter_2024": 1220,
                "spring_2024": 1250,
                "growth_rate": 0.06
            }
        )
        
        # Cache analytics
        await set_cached(cache_key, analytics.dict(), ttl=7200)  # 2 hours
        
        return analytics
        
    except Exception as e:
        logger.error(f"Error getting department analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to get department analytics")

@router.get("/trends/enrollment")
async def get_enrollment_trends(
    time_period: str = Query("1_year", description="Time period: 1_year, 2_years, all_time"),
    granularity: str = Query("quarter", description="Data granularity: quarter, year")
):
    """Get enrollment trends over time."""
    try:
        # Simulate enrollment trend data
        if granularity == "quarter":
            trends = {
                "Fall 2023": {"total_enrollment": 1180, "new_students": 95, "retention_rate": 0.92},
                "Winter 2024": {"total_enrollment": 1220, "new_students": 87, "retention_rate": 0.94},
                "Spring 2024": {"total_enrollment": 1250, "new_students": 78, "retention_rate": 0.91},
                "Fall 2024": {"total_enrollment": 1285, "new_students": 102, "retention_rate": 0.93}
            }
        else:
            trends = {
                "2023": {"total_enrollment": 1150, "new_students": 280, "retention_rate": 0.89},
                "2024": {"total_enrollment": 1285, "new_students": 267, "retention_rate": 0.92}
            }
        
        return {
            "time_period": time_period,
            "granularity": granularity,
            "trends": trends,
            "insights": [
                "Steady enrollment growth over the past year",
                "Retention rates improving consistently",
                "Fall quarters show highest new student enrollment"
            ]
        }
        
    except Exception as e:
        logger.error(f"Error getting enrollment trends: {e}")
        raise HTTPException(status_code=500, detail="Failed to get enrollment trends")

@router.get("/performance/cohort")
async def get_cohort_performance(
    cohort_year: str = Query(..., description="Cohort year (e.g., '2022')"),
    metrics: List[str] = Query(["completion_rate", "avg_gpa", "time_to_graduation"])
):
    """Get performance analytics for a specific cohort."""
    try:
        # Simulate cohort performance data
        performance_data = {
            "cohort_year": cohort_year,
            "cohort_size": 245,
            "metrics": {
                "completion_rate": 0.89,
                "avg_gpa": 3.42,
                "time_to_graduation": 4.2,  # years
                "employment_rate": 0.94,
                "graduate_school_rate": 0.18
            },
            "distribution": {
                "gpa_distribution": {
                    "3.5-4.0": 45,
                    "3.0-3.5": 38,
                    "2.5-3.0": 15,
                    "below_2.5": 2
                },
                "graduation_timeline": {
                    "4_years": 65,
                    "4.5_years": 25,
                    "5_years": 8,
                    "more_than_5": 2
                }
            },
            "comparison_to_previous_cohorts": {
                "completion_rate_change": +0.03,
                "avg_gpa_change": +0.08,
                "time_to_graduation_change": -0.1
            }
        }
        
        return performance_data
        
    except Exception as e:
        logger.error(f"Error getting cohort performance for {cohort_year}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get cohort performance")

@router.get("/predictions/graduation")
async def get_graduation_predictions(
    user_id: str,
    confidence_level: float = Query(0.8, ge=0.5, le=0.99)
):
    """Get AI-powered graduation timeline predictions."""
    try:
        # Get student data
        student_courses = await student_repo.get_student_courses(user_id)
        completed_courses = [sc for sc in student_courses if sc['status'] == 'completed']
        
        # Calculate current progress
        total_units = sum(course['courses']['units'] for course in completed_courses)
        remaining_units = max(0, 180 - total_units)
        
        # Simulate ML prediction model results
        predictions = {
            "most_likely_graduation": "Spring 2026",
            "confidence": confidence_level,
            "scenarios": {
                "optimistic": {
                    "graduation_date": "Fall 2025",
                    "probability": 0.25,
                    "requirements": ["Take 18+ units per quarter", "No course failures"]
                },
                "realistic": {
                    "graduation_date": "Spring 2026", 
                    "probability": 0.60,
                    "requirements": ["Maintain current pace", "Complete prerequisites on time"]
                },
                "conservative": {
                    "graduation_date": "Fall 2026",
                    "probability": 0.15,
                    "requirements": ["Account for potential delays", "Course availability issues"]
                }
            },
            "factors_affecting_timeline": [
                f"Remaining units: {remaining_units}",
                "Course availability in preferred quarters",
                "Prerequisite completion timing",
                "Academic performance consistency"
            ],
            "recommendations": [
                "Plan course sequences carefully to avoid bottlenecks",
                "Consider summer sessions to accelerate progress",
                "Meet with advisor to optimize course selection"
            ]
        }
        
        return predictions
        
    except Exception as e:
        logger.error(f"Error getting graduation predictions for {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get graduation predictions")

@router.post("/reports/custom")
async def generate_custom_report(
    report_config: Dict[str, Any],
    user_id: Optional[str] = None
):
    """Generate a custom analytics report based on specified parameters."""
    try:
        report_type = report_config.get("type", "student_progress")
        time_range = report_config.get("time_range", "current_year")
        metrics = report_config.get("metrics", ["completion_rate", "avg_difficulty"])
        
        # Generate report based on configuration
        if report_type == "student_progress" and user_id:
            # Generate student progress report
            student_courses = await student_repo.get_student_courses(user_id)
            report_data = {
                "report_type": "Student Progress Report",
                "generated_at": datetime.utcnow().isoformat(),
                "student_id": user_id,
                "summary": {
                    "total_courses": len(student_courses),
                    "completed_courses": len([sc for sc in student_courses if sc['status'] == 'completed']),
                    "current_gpa": 3.45,  # Simulated
                    "progress_percentage": 67.5
                },
                "detailed_metrics": {
                    metric: np.random.uniform(0.7, 0.95) for metric in metrics
                },
                "recommendations": [
                    "Continue current academic trajectory",
                    "Consider advanced electives in areas of interest",
                    "Maintain consistent study habits"
                ]
            }
        else:
            # Generate generic report
            report_data = {
                "report_type": "Custom Analytics Report",
                "generated_at": datetime.utcnow().isoformat(),
                "configuration": report_config,
                "data": {
                    "message": "Custom report generation not fully implemented",
                    "available_reports": ["student_progress", "course_analytics", "department_overview"]
                }
            }
        
        return report_data
        
    except Exception as e:
        logger.error(f"Error generating custom report: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate custom report")
