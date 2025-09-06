"""
AI and Data Services Package

This package contains services for course recommendations, academic progress tracking,
and other AI-powered features for Study Strata.
"""
from .course_recommender import CourseRecommender
from .progress_tracker import ProgressTracker, AcademicStanding

__all__ = ['CourseRecommender', 'ProgressTracker', 'AcademicStanding']
