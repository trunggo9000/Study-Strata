"""
Academic Progress Tracker

This module provides functionality to track and analyze student academic progress
against degree requirements and academic standing.
"""
from typing import Dict, List, Tuple, Optional
from datetime import datetime
from enum import Enum

class AcademicStanding(str, Enum):
    GOOD = "Good"
    PROBATION = "Academic Probation"
    WARNING = "Warning"
    DISQUALIFIED = "Academic Disqualification"

class ProgressTracker:
    def __init__(self, student_data: Dict, degree_requirements: Dict):
        """
        Initialize the progress tracker with student data and degree requirements.
        
        Args:
            student_data: Dictionary containing student's academic record
            degree_requirements: Dictionary containing degree requirements
        """
        self.student = student_data
        self.requirements = degree_requirements
    
    def calculate_gpa(self, term: Optional[str] = None) -> float:
        """
        Calculate GPA for a specific term or cumulative.
        
        Args:
            term: Optional term to calculate GPA for (e.g., 'Fall 2023')
            
        Returns:
            GPA as a float
        """
        if term:
            courses = [c for c in self.student['courses'] if c['term'] == term]
        else:
            courses = self.student['courses']
        
        if not courses:
            return 0.0
            
        total_quality_points = sum(
            self._grade_to_points(c['grade']) * c['credits'] 
            for c in courses 
            if c['grade'] and c['credits']
        )
        
        total_credits = sum(
            c['credits'] 
            for c in courses 
            if c['grade'] and c['credits']
        )
        
        return round(total_quality_points / total_credits, 2) if total_credits > 0 else 0.0
    
    def check_requirements(self) -> Dict:
        """
        Check progress against degree requirements.
        
        Returns:
            Dictionary with requirement fulfillment status
        """
        completed_courses = {c['id'] for c in self.student['courses'] if c.get('completed', False)}
        
        results = {
            'core_requirements': self._check_core_requirements(completed_courses),
            'electives': self._check_electives(completed_courses),
            'total_credits': self._check_credit_requirements(),
            'gpa': self._check_gpa_requirements(),
            'residency': self._check_residency_requirements()
        }
        
        results['on_track'] = all(
            req['met'] 
            for req in results.values() 
            if isinstance(req, dict)
        )
        
        return results
    
    def get_academic_standing(self) -> Dict:
        """
        Determine student's academic standing.
        
        Returns:
            Dictionary with standing and details
        """
        gpa = self.calculate_gpa()
        term_gpa = self.calculate_gpa(self._get_current_term())
        
        if gpa < 1.5:
            return {
                'standing': AcademicStanding.DISQUALIFIED,
                'reason': 'Cumulative GPA below 1.5',
                'action_required': True
            }
        elif gpa < 2.0 or term_gpa < 2.0:
            return {
                'standing': AcademicStanding.PROBATION,
                'reason': 'GPA below 2.0',
                'action_required': True
            }
        elif gpa < 2.5:
            return {
                'standing': AcademicStanding.WARNING,
                'reason': 'GPA below 2.5',
                'action_required': False
            }
        
        return {
            'standing': AcademicStanding.GOOD,
            'reason': 'Meeting academic standards',
            'action_required': False
        }
    
    def get_graduation_eligibility(self) -> Dict:
        """
        Check if student is eligible to graduate.
        
        Returns:
            Dictionary with eligibility status and unmet requirements
        """
        requirements = self.check_requirements()
        standing = self.get_academic_standing()
        
        eligible = (
            requirements['on_track'] and 
            standing['standing'] != AcademicStanding.DISQUALIFIED
        )
        
        return {
            'eligible': eligible,
            'unmet_requirements': [
                name for name, req in requirements.items() 
                if isinstance(req, dict) and not req['met']
            ],
            'academic_standing': standing['standing']
        }
    
    def _check_core_requirements(self, completed_courses: set) -> Dict:
        """Check core course requirements."""
        required = set(self.requirements['core_courses'])
        completed = required & completed_courses
        
        return {
            'required': len(required),
            'completed': len(completed),
            'met': len(completed) >= len(required),
            'missing': list(required - completed)
        }
    
    def _check_electives(self, completed_courses: set) -> Dict:
        """Check elective requirements."""
        required = self.requirements['electives']
        completed = [c for c in completed_courses if c in required['allowed_courses']]
        
        return {
            'required': required['required'],
            'completed': len(completed),
            'met': len(completed) >= required['required'],
            'taken': list(completed)
        }
    
    def _check_credit_requirements(self) -> Dict:
        """Check total credit requirements."""
        total_credits = sum(
            c['credits'] 
            for c in self.student['courses'] 
            if c.get('completed', False)
        )
        
        return {
            'required': self.requirements['total_credits'],
            'completed': total_credits,
            'met': total_credits >= self.requirements['total_credits']
        }
    
    def _check_gpa_requirements(self) -> Dict:
        """Check GPA requirements."""
        gpa = self.calculate_gpa()
        return {
            'required': self.requirements['min_gpa'],
            'current': gpa,
            'met': gpa >= self.requirements['min_gpa']
        }
    
    def _check_residency_requirements(self) -> Dict:
        """Check residency requirements."""
        # Implementation depends on institution's specific requirements
        return {'met': True}  # Placeholder
    
    @staticmethod
    def _grade_to_points(grade: str) -> float:
        """Convert letter grade to grade points."""
        grade_map = {
            'A+': 4.0, 'A': 4.0, 'A-': 3.7,
            'B+': 3.3, 'B': 3.0, 'B-': 2.7,
            'C+': 2.3, 'C': 2.0, 'C-': 1.7,
            'D+': 1.3, 'D': 1.0, 'D-': 0.7,
            'F': 0.0
        }
        return grade_map.get(grade.upper(), 0.0)
    
    @staticmethod
    def _get_current_term() -> str:
        """Get current academic term."""
        now = datetime.now()
        month = now.month
        
        if 1 <= month <= 4:
            return f'Spring {now.year}'
        elif 5 <= month <= 8:
            return f'Summer {now.year}'
        else:
            return f'Fall {now.year}'
