"""
Course Recommendation Engine

This module provides intelligent course recommendations based on student's academic history,
prerequisites, and program requirements using collaborative filtering and content-based filtering.
"""
from typing import List, Dict, Optional
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer

class CourseRecommender:
    def __init__(self, courses_db: List[Dict], student_history: List[Dict]):
        """
        Initialize the course recommender with course database and student history.
        
        Args:
            courses_db: List of course dictionaries with metadata
            student_history: List of courses taken by the student
        """
        self.courses = courses_db
        self.student_history = student_history
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self._prepare_data()
    
    def _prepare_data(self) -> None:
        """Prepare course data for recommendation algorithms."""
        # Combine course features for TF-IDF
        self.course_texts = [
            f"{c['title']} {c['description']} {', '.join(c.get('topics', []))}"
            for c in self.courses
        ]
        
        # Create TF-IDF matrix
        self.tfidf_matrix = self.vectorizer.fit_transform(self.course_texts)
        
    def content_based_recommendations(
        self, 
        student_id: str, 
        n_recommendations: int = 5
    ) -> List[Dict]:
        """
        Generate content-based course recommendations.
        
        Args:
            student_id: ID of the student
            n_recommendations: Number of recommendations to return
            
        Returns:
            List of recommended course dictionaries
        """
        # Get student's course history
        student_courses = [c for c in self.student_history if c['student_id'] == student_id]
        
        if not student_courses:
            return self._get_popular_courses(n_recommendations)
        
        # Calculate similarity between courses
        course_indices = [i for i, c in enumerate(self.courses) 
                         if c['id'] in [sc['course_id'] for sc in student_courses]]
        
        if not course_indices:
            return self._get_popular_courses(n_recommendations)
            
        # Get average vector of student's courses
        avg_vector = np.mean(self.tfidf_matrix[course_indices], axis=0)
        
        # Calculate similarity to all courses
        similarities = cosine_similarity(avg_vector, self.tfidf_matrix).flatten()
        
        # Get top N recommendations (excluding already taken courses)
        taken_course_ids = {sc['course_id'] for sc in student_courses}
        recommendations = []
        
        for idx in similarities.argsort()[::-1]:
            course = self.courses[idx]
            if course['id'] not in taken_course_ids:
                recommendations.append({
                    'course_id': course['id'],
                    'title': course['title'],
                    'similarity': float(similarities[idx])
                })
                if len(recommendations) >= n_recommendations:
                    break
                    
        return recommendations
    
    def _get_popular_courses(self, n: int) -> List[Dict]:
        """Get most popular courses as fallback."""
        return sorted(
            self.courses,
            key=lambda x: x.get('popularity', 0),
            reverse=True
        )[:n]
    
    def get_prerequisites_met(self, course_id: str, student_id: str) -> bool:
        """Check if student has met all prerequisites for a course."""
        course = next((c for c in self.courses if c['id'] == course_id), None)
        if not course or 'prerequisites' not in course:
            return True
            
        student_courses = {c['course_id'] for c in self.student_history 
                         if c['student_id'] == student_id}
        
        return all(prereq in student_courses for prereq in course['prerequisites'])

    def get_term_recommendations(
        self, 
        student_id: str, 
        term: str, 
        n_recommendations: int = 5
    ) -> List[Dict]:
        """
        Get course recommendations for a specific academic term.
        
        Args:
            student_id: ID of the student
            term: Academic term (e.g., 'Fall 2023')
            n_recommendations: Number of recommendations to return
            
        Returns:
            List of recommended courses for the term
        """
        # Get content-based recommendations
        recommendations = self.content_based_recommendations(
            student_id, 
            n_recommendations * 2  # Get more to filter by term
        )
        
        # Filter by term availability and prerequisites
        filtered = []
        for rec in recommendations:
            course = next(c for c in self.courses if c['id'] == rec['course_id'])
            if (term in course.get('terms_offered', []) and 
                self.get_prerequisites_met(course['id'], student_id)):
                filtered.append({
                    'course_id': course['id'],
                    'title': course['title'],
                    'credits': course.get('credits', 4),
                    'description': course.get('description', ''),
                    'similarity': rec['similarity']
                })
                if len(filtered) >= n_recommendations:
                    break
                    
        return filtered
