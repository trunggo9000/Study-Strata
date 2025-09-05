"""
AI-Powered Course Scheduling Engine for Study Strata.
Uses machine learning and optimization algorithms to generate optimal course schedules.
"""

import asyncio
import json
import logging
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
import networkx as nx
import openai
from langchain.llms import OpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

from .config import settings
from .database import course_repo, student_repo

logger = logging.getLogger(__name__)

@dataclass
class CourseNode:
    """Represents a course in the scheduling graph."""
    id: str
    title: str
    units: int
    difficulty: int
    prerequisites: List[str]
    offered_quarters: List[str]
    tags: List[str]
    ge_categories: List[str]

@dataclass
class ScheduleConstraints:
    """Constraints for schedule generation."""
    max_units_per_quarter: int = 20
    min_units_per_quarter: int = 12
    preferred_difficulty_distribution: Dict[str, float] = None
    avoid_back_to_back_difficult: bool = True
    preferred_quarters: List[str] = None
    graduation_timeline: str = "4_years"

@dataclass
class ScheduleScore:
    """Scoring metrics for a generated schedule."""
    total_score: float
    difficulty_balance: float
    prerequisite_satisfaction: float
    preference_alignment: float
    timeline_efficiency: float
    workload_distribution: float

class AISchedulingEngine:
    """AI-powered course scheduling engine."""
    
    def __init__(self):
        self.openai_client = None
        self.llm_chain = None
        self.course_graph = None
        self.scaler = StandardScaler()
        self.initialized = False
        
    async def initialize(self):
        """Initialize the AI engine."""
        try:
            # Initialize OpenAI
            openai.api_key = settings.OPENAI_API_KEY
            self.openai_client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            
            # Initialize LangChain
            llm = OpenAI(
                temperature=settings.AI_TEMPERATURE,
                max_tokens=settings.MAX_TOKENS,
                openai_api_key=settings.OPENAI_API_KEY
            )
            
            # Create prompt template for course recommendations
            prompt_template = PromptTemplate(
                input_variables=["student_profile", "available_courses", "constraints"],
                template="""
                You are an expert academic advisor for computer science students. 
                
                Student Profile:
                {student_profile}
                
                Available Courses:
                {available_courses}
                
                Constraints:
                {constraints}
                
                Please recommend an optimal course schedule that:
                1. Satisfies all prerequisites
                2. Balances course difficulty
                3. Aligns with student preferences
                4. Ensures timely graduation
                5. Considers course availability
                
                Provide your recommendation in JSON format with reasoning.
                """
            )
            
            self.llm_chain = LLMChain(llm=llm, prompt=prompt_template)
            
            # Build course dependency graph
            await self._build_course_graph()
            
            self.initialized = True
            logger.info("AI Scheduling Engine initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize AI engine: {e}")
            raise
    
    def is_initialized(self) -> bool:
        """Check if the AI engine is initialized."""
        return self.initialized
    
    async def _build_course_graph(self):
        """Build a directed graph of course dependencies."""
        try:
            courses = await course_repo.get_all_courses()
            self.course_graph = nx.DiGraph()
            
            # Add nodes (courses)
            for course in courses:
                self.course_graph.add_node(
                    course['id'],
                    **course
                )
            
            # Add edges (prerequisites)
            for course in courses:
                prereqs = await course_repo.get_prerequisites(course['id'])
                for prereq in prereqs:
                    self.course_graph.add_edge(prereq, course['id'])
            
            logger.info(f"Built course graph with {len(courses)} courses")
            
        except Exception as e:
            logger.error(f"Error building course graph: {e}")
            raise
    
    async def generate_schedule(
        self,
        user_id: str,
        constraints: ScheduleConstraints,
        preferences: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate an optimal course schedule for a student."""
        try:
            # Get student's current progress
            student_courses = await student_repo.get_student_courses(user_id)
            completed_courses = [
                sc['course_id'] for sc in student_courses 
                if sc['status'] == 'completed'
            ]
            
            # Get available courses
            available_courses = await self._get_available_courses(completed_courses)
            
            # Generate multiple schedule options
            schedule_options = []
            for i in range(3):  # Generate 3 options
                schedule = await self._generate_single_schedule(
                    completed_courses,
                    available_courses,
                    constraints,
                    preferences,
                    variation=i
                )
                if schedule:
                    schedule_options.append(schedule)
            
            # Rank schedules by score
            ranked_schedules = sorted(
                schedule_options,
                key=lambda x: x['score']['total_score'],
                reverse=True
            )
            
            return {
                "recommended_schedule": ranked_schedules[0] if ranked_schedules else None,
                "alternative_schedules": ranked_schedules[1:],
                "generation_metadata": {
                    "timestamp": datetime.utcnow().isoformat(),
                    "constraints": constraints.__dict__,
                    "preferences": preferences
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating schedule for user {user_id}: {e}")
            raise
    
    async def _get_available_courses(self, completed_courses: List[str]) -> List[CourseNode]:
        """Get courses available for scheduling."""
        try:
            all_courses = await course_repo.get_all_courses()
            available = []
            
            for course in all_courses:
                if course['id'] in completed_courses:
                    continue
                
                # Check prerequisites
                prereqs = await course_repo.get_prerequisites(course['id'])
                if all(prereq in completed_courses for prereq in prereqs):
                    available.append(CourseNode(
                        id=course['id'],
                        title=course['title'],
                        units=course['units'],
                        difficulty=course['difficulty'],
                        prerequisites=prereqs,
                        offered_quarters=course['offered'],
                        tags=course['tags'],
                        ge_categories=course['ge_categories']
                    ))
            
            return available
            
        except Exception as e:
            logger.error(f"Error getting available courses: {e}")
            raise
    
    async def _generate_single_schedule(
        self,
        completed_courses: List[str],
        available_courses: List[CourseNode],
        constraints: ScheduleConstraints,
        preferences: Dict[str, Any],
        variation: int = 0
    ) -> Optional[Dict[str, Any]]:
        """Generate a single schedule option."""
        try:
            # Use AI to get course recommendations
            ai_recommendations = await self._get_ai_recommendations(
                completed_courses,
                available_courses,
                constraints,
                preferences
            )
            
            # Apply optimization algorithms
            optimized_schedule = await self._optimize_schedule(
                ai_recommendations,
                available_courses,
                constraints,
                variation
            )
            
            # Calculate schedule score
            score = await self._calculate_schedule_score(
                optimized_schedule,
                constraints,
                preferences
            )
            
            return {
                "quarters": optimized_schedule,
                "score": score.__dict__,
                "total_units": sum(
                    sum(course['units'] for course in quarter['courses'])
                    for quarter in optimized_schedule
                ),
                "estimated_graduation": self._estimate_graduation_date(optimized_schedule)
            }
            
        except Exception as e:
            logger.error(f"Error generating single schedule: {e}")
            return None
    
    async def _get_ai_recommendations(
        self,
        completed_courses: List[str],
        available_courses: List[CourseNode],
        constraints: ScheduleConstraints,
        preferences: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Get AI-powered course recommendations."""
        try:
            # Prepare input for AI
            student_profile = {
                "completed_courses": completed_courses,
                "total_completed_units": len(completed_courses) * 4,  # Approximate
                "academic_progress": f"{len(completed_courses)} courses completed"
            }
            
            available_courses_data = [
                {
                    "id": course.id,
                    "title": course.title,
                    "units": course.units,
                    "difficulty": course.difficulty,
                    "prerequisites": course.prerequisites,
                    "offered_quarters": course.offered_quarters
                }
                for course in available_courses[:20]  # Limit for token efficiency
            ]
            
            # Get AI recommendation
            response = await self.llm_chain.arun(
                student_profile=json.dumps(student_profile, indent=2),
                available_courses=json.dumps(available_courses_data, indent=2),
                constraints=json.dumps(constraints.__dict__, indent=2)
            )
            
            # Parse AI response
            try:
                ai_recommendations = json.loads(response)
            except json.JSONDecodeError:
                # Fallback to rule-based recommendations
                ai_recommendations = self._fallback_recommendations(available_courses)
            
            return ai_recommendations
            
        except Exception as e:
            logger.error(f"Error getting AI recommendations: {e}")
            return self._fallback_recommendations(available_courses)
    
    def _fallback_recommendations(self, available_courses: List[CourseNode]) -> Dict[str, Any]:
        """Fallback rule-based recommendations."""
        return {
            "recommended_courses": [course.id for course in available_courses[:8]],
            "reasoning": "Rule-based recommendation due to AI service unavailability",
            "priority_order": sorted(
                available_courses,
                key=lambda x: (len(x.prerequisites), x.difficulty)
            )[:8]
        }
    
    async def _optimize_schedule(
        self,
        ai_recommendations: Dict[str, Any],
        available_courses: List[CourseNode],
        constraints: ScheduleConstraints,
        variation: int
    ) -> List[Dict[str, Any]]:
        """Optimize the schedule using algorithmic approaches."""
        try:
            recommended_course_ids = ai_recommendations.get('recommended_courses', [])
            course_map = {course.id: course for course in available_courses}
            
            # Filter available courses based on recommendations
            priority_courses = [
                course_map[cid] for cid in recommended_course_ids
                if cid in course_map
            ]
            
            # Add variation for different options
            if variation == 1:
                # More conservative approach - lower difficulty courses first
                priority_courses.sort(key=lambda x: x.difficulty)
            elif variation == 2:
                # Aggressive approach - higher difficulty courses first
                priority_courses.sort(key=lambda x: x.difficulty, reverse=True)
            
            # Generate quarterly schedule
            quarters = []
            remaining_courses = priority_courses.copy()
            
            for quarter_num in range(12):  # 3 years worth of quarters
                if not remaining_courses:
                    break
                
                quarter_name = self._get_quarter_name(quarter_num)
                quarter_courses = []
                quarter_units = 0
                
                # Select courses for this quarter
                for course in remaining_courses.copy():
                    # Check if course is offered this quarter
                    if quarter_name not in course.offered_quarters:
                        continue
                    
                    # Check unit constraints
                    if quarter_units + course.units > constraints.max_units_per_quarter:
                        continue
                    
                    # Add course to quarter
                    quarter_courses.append({
                        "id": course.id,
                        "title": course.title,
                        "units": course.units,
                        "difficulty": course.difficulty
                    })
                    quarter_units += course.units
                    remaining_courses.remove(course)
                    
                    # Check if we've reached minimum units
                    if quarter_units >= constraints.min_units_per_quarter:
                        break
                
                if quarter_courses:
                    quarters.append({
                        "quarter": quarter_name,
                        "courses": quarter_courses,
                        "total_units": quarter_units
                    })
            
            return quarters
            
        except Exception as e:
            logger.error(f"Error optimizing schedule: {e}")
            return []
    
    def _get_quarter_name(self, quarter_num: int) -> str:
        """Get quarter name from number."""
        quarters = ["Fall", "Winter", "Spring"]
        year = 2024 + (quarter_num // 3)
        quarter = quarters[quarter_num % 3]
        return f"{quarter} {year}"
    
    async def _calculate_schedule_score(
        self,
        schedule: List[Dict[str, Any]],
        constraints: ScheduleConstraints,
        preferences: Dict[str, Any]
    ) -> ScheduleScore:
        """Calculate comprehensive score for a schedule."""
        try:
            # Difficulty balance score
            difficulties = []
            for quarter in schedule:
                avg_difficulty = np.mean([course['difficulty'] for course in quarter['courses']])
                difficulties.append(avg_difficulty)
            
            difficulty_balance = 1.0 - np.std(difficulties) / 5.0  # Normalize by max difficulty
            
            # Prerequisite satisfaction (always 1.0 since we enforce it)
            prerequisite_satisfaction = 1.0
            
            # Preference alignment
            preference_alignment = 0.8  # Placeholder - would implement based on actual preferences
            
            # Timeline efficiency
            total_quarters = len(schedule)
            timeline_efficiency = max(0, 1.0 - (total_quarters - 8) / 4)  # Penalize going over 2 years
            
            # Workload distribution
            units_per_quarter = [quarter['total_units'] for quarter in schedule]
            workload_std = np.std(units_per_quarter)
            workload_distribution = max(0, 1.0 - workload_std / 10)
            
            # Calculate total score
            total_score = (
                difficulty_balance * 0.25 +
                prerequisite_satisfaction * 0.25 +
                preference_alignment * 0.20 +
                timeline_efficiency * 0.15 +
                workload_distribution * 0.15
            )
            
            return ScheduleScore(
                total_score=total_score,
                difficulty_balance=difficulty_balance,
                prerequisite_satisfaction=prerequisite_satisfaction,
                preference_alignment=preference_alignment,
                timeline_efficiency=timeline_efficiency,
                workload_distribution=workload_distribution
            )
            
        except Exception as e:
            logger.error(f"Error calculating schedule score: {e}")
            return ScheduleScore(0.0, 0.0, 0.0, 0.0, 0.0, 0.0)
    
    def _estimate_graduation_date(self, schedule: List[Dict[str, Any]]) -> str:
        """Estimate graduation date based on schedule."""
        if not schedule:
            return "Unknown"
        
        last_quarter = schedule[-1]['quarter']
        return f"Expected graduation: {last_quarter}"
    
    async def get_course_recommendations(
        self,
        user_id: str,
        context: str = "general"
    ) -> Dict[str, Any]:
        """Get AI-powered course recommendations."""
        try:
            # Get student progress
            student_courses = await student_repo.get_student_courses(user_id)
            completed_courses = [
                sc['course_id'] for sc in student_courses 
                if sc['status'] == 'completed'
            ]
            
            # Get available courses
            available_courses = await self._get_available_courses(completed_courses)
            
            # Use AI to recommend courses
            recommendations = await self._get_ai_recommendations(
                completed_courses,
                available_courses,
                ScheduleConstraints(),
                {"context": context}
            )
            
            return {
                "recommendations": recommendations,
                "available_courses": len(available_courses),
                "completed_courses": len(completed_courses)
            }
            
        except Exception as e:
            logger.error(f"Error getting course recommendations for user {user_id}: {e}")
            raise
    
    async def analyze_academic_progress(self, user_id: str) -> Dict[str, Any]:
        """Analyze student's academic progress using AI."""
        try:
            # Get student data
            student_courses = await student_repo.get_student_courses(user_id)
            
            # Calculate progress metrics
            completed_courses = [sc for sc in student_courses if sc['status'] == 'completed']
            in_progress_courses = [sc for sc in student_courses if sc['status'] == 'in_progress']
            
            total_units = sum(course['courses']['units'] for course in completed_courses)
            avg_difficulty = np.mean([course['courses']['difficulty'] for course in completed_courses])
            
            # Generate AI analysis
            analysis_prompt = f"""
            Analyze this student's academic progress:
            - Completed courses: {len(completed_courses)}
            - Total units: {total_units}
            - Average difficulty: {avg_difficulty:.2f}
            - Currently taking: {len(in_progress_courses)} courses
            
            Provide insights on their progress, strengths, and recommendations.
            """
            
            response = await self.openai_client.chat.completions.create(
                model=settings.AI_MODEL,
                messages=[
                    {"role": "system", "content": "You are an expert academic advisor."},
                    {"role": "user", "content": analysis_prompt}
                ],
                temperature=settings.AI_TEMPERATURE,
                max_tokens=settings.MAX_TOKENS
            )
            
            return {
                "analysis": response.choices[0].message.content,
                "metrics": {
                    "completed_courses": len(completed_courses),
                    "total_units": total_units,
                    "average_difficulty": avg_difficulty,
                    "in_progress_courses": len(in_progress_courses)
                }
            }
            
        except Exception as e:
            logger.error(f"Error analyzing progress for user {user_id}: {e}")
            raise
