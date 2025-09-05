"""
Database connection and initialization for Study Strata.
"""

import asyncio
from typing import Optional, Dict, Any, List
from supabase import create_client, Client
from supabase.lib.client_options import ClientOptions
import logging

from .config import settings

logger = logging.getLogger(__name__)

class DatabaseManager:
    """Manages database connections and operations."""
    
    def __init__(self):
        self.supabase: Optional[Client] = None
        self.service_client: Optional[Client] = None
    
    async def initialize(self):
        """Initialize database connections."""
        try:
            # Regular client for user operations
            self.supabase = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_ANON_KEY,
                options=ClientOptions(
                    postgrest_client_timeout=10,
                    storage_client_timeout=10
                )
            )
            
            # Service client for admin operations
            self.service_client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_SERVICE_KEY,
                options=ClientOptions(
                    postgrest_client_timeout=10,
                    storage_client_timeout=10
                )
            )
            
            logger.info("Database connections initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize database: {e}")
            raise
    
    def get_client(self, service: bool = False) -> Client:
        """Get database client."""
        if service and self.service_client:
            return self.service_client
        elif self.supabase:
            return self.supabase
        else:
            raise RuntimeError("Database not initialized")

class CourseRepository:
    """Repository for course-related database operations."""
    
    def __init__(self, db_manager: DatabaseManager):
        self.db = db_manager
    
    async def get_all_courses(self) -> List[Dict[str, Any]]:
        """Retrieve all courses from database."""
        try:
            client = self.db.get_client()
            response = client.table('courses').select('*').execute()
            return response.data
        except Exception as e:
            logger.error(f"Error fetching courses: {e}")
            raise
    
    async def get_course_by_id(self, course_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a specific course by ID."""
        try:
            client = self.db.get_client()
            response = client.table('courses').select('*').eq('id', course_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error fetching course {course_id}: {e}")
            raise
    
    async def get_prerequisites(self, course_id: str) -> List[str]:
        """Get prerequisites for a course."""
        try:
            client = self.db.get_client()
            response = client.table('prerequisites').select('prereq_id').eq('course_id', course_id).execute()
            return [item['prereq_id'] for item in response.data]
        except Exception as e:
            logger.error(f"Error fetching prerequisites for {course_id}: {e}")
            raise
    
    async def search_courses(self, query: str, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Search courses with optional filters."""
        try:
            client = self.db.get_client()
            query_builder = client.table('courses').select('*')
            
            # Add text search
            if query:
                query_builder = query_builder.or_(
                    f"title.ilike.%{query}%,description.ilike.%{query}%,tags.cs.{{{query}}}"
                )
            
            # Add filters
            if filters:
                if 'difficulty' in filters:
                    query_builder = query_builder.eq('difficulty', filters['difficulty'])
                if 'units' in filters:
                    query_builder = query_builder.eq('units', filters['units'])
                if 'offered' in filters:
                    query_builder = query_builder.contains('offered', [filters['offered']])
            
            response = query_builder.execute()
            return response.data
        except Exception as e:
            logger.error(f"Error searching courses: {e}")
            raise

class StudentRepository:
    """Repository for student-related database operations."""
    
    def __init__(self, db_manager: DatabaseManager):
        self.db = db_manager
    
    async def get_student_courses(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all courses for a student."""
        try:
            client = self.db.get_client()
            response = client.table('student_courses').select(
                '*, courses(*)'
            ).eq('user_id', user_id).execute()
            return response.data
        except Exception as e:
            logger.error(f"Error fetching student courses for {user_id}: {e}")
            raise
    
    async def add_student_course(self, user_id: str, course_data: Dict[str, Any]) -> Dict[str, Any]:
        """Add a course to student's record."""
        try:
            client = self.db.get_client()
            course_data['user_id'] = user_id
            response = client.table('student_courses').insert(course_data).execute()
            return response.data[0]
        except Exception as e:
            logger.error(f"Error adding course for student {user_id}: {e}")
            raise
    
    async def update_student_course(self, user_id: str, course_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update a student's course record."""
        try:
            client = self.db.get_client()
            response = client.table('student_courses').update(updates).eq(
                'user_id', user_id
            ).eq('course_id', course_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error updating course {course_id} for student {user_id}: {e}")
            raise

class ScheduleRepository:
    """Repository for schedule-related database operations."""
    
    def __init__(self, db_manager: DatabaseManager):
        self.db = db_manager
    
    async def save_generated_schedule(self, user_id: str, schedule_data: Dict[str, Any]) -> Dict[str, Any]:
        """Save a generated schedule."""
        try:
            client = self.db.get_client()
            schedule_data['user_id'] = user_id
            response = client.table('generated_schedules').insert(schedule_data).execute()
            return response.data[0]
        except Exception as e:
            logger.error(f"Error saving schedule for user {user_id}: {e}")
            raise
    
    async def get_user_schedules(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all schedules for a user."""
        try:
            client = self.db.get_client()
            response = client.table('generated_schedules').select('*').eq(
                'user_id', user_id
            ).order('created_at', desc=True).execute()
            return response.data
        except Exception as e:
            logger.error(f"Error fetching schedules for user {user_id}: {e}")
            raise
    
    async def set_active_schedule(self, user_id: str, schedule_id: str) -> bool:
        """Set a schedule as active for a user."""
        try:
            client = self.db.get_client()
            
            # Deactivate all schedules for user
            client.table('generated_schedules').update(
                {'is_active': False}
            ).eq('user_id', user_id).execute()
            
            # Activate the selected schedule
            response = client.table('generated_schedules').update(
                {'is_active': True}
            ).eq('id', schedule_id).eq('user_id', user_id).execute()
            
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Error setting active schedule {schedule_id} for user {user_id}: {e}")
            raise

# Global database manager instance
db_manager = DatabaseManager()

# Repository instances
course_repo = CourseRepository(db_manager)
student_repo = StudentRepository(db_manager)
schedule_repo = ScheduleRepository(db_manager)

async def init_db():
    """Initialize database connections."""
    await db_manager.initialize()

def get_db_manager() -> DatabaseManager:
    """Dependency to get database manager."""
    return db_manager
