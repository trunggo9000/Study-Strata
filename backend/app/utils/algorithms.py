"""
Advanced algorithms for course scheduling and optimization.
"""

import numpy as np
import networkx as nx
from typing import List, Dict, Any, Tuple, Optional, Set
from dataclasses import dataclass
from collections import defaultdict, deque
import heapq
import random
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

@dataclass
class SchedulingNode:
    """Node in the scheduling graph."""
    course_id: str
    units: int
    difficulty: int
    prerequisites: List[str]
    offered_quarters: List[str]
    priority: float = 0.0

@dataclass
class SchedulingSolution:
    """Solution for course scheduling problem."""
    quarters: List[Dict[str, Any]]
    total_score: float
    feasible: bool
    violations: List[str]

class GeneticScheduler:
    """Genetic algorithm for course schedule optimization."""
    
    def __init__(self, population_size: int = 50, generations: int = 100, mutation_rate: float = 0.1):
        self.population_size = population_size
        self.generations = generations
        self.mutation_rate = mutation_rate
        self.elite_size = max(2, population_size // 10)
    
    def optimize_schedule(
        self,
        courses: List[SchedulingNode],
        constraints: Dict[str, Any],
        preferences: Dict[str, Any]
    ) -> SchedulingSolution:
        """Optimize schedule using genetic algorithm."""
        try:
            # Initialize population
            population = self._initialize_population(courses, constraints)
            
            best_solution = None
            best_score = -float('inf')
            
            for generation in range(self.generations):
                # Evaluate fitness
                fitness_scores = []
                for individual in population:
                    score = self._evaluate_fitness(individual, constraints, preferences)
                    fitness_scores.append(score)
                    
                    if score > best_score:
                        best_score = score
                        best_solution = individual.copy()
                
                # Selection and reproduction
                population = self._evolve_population(population, fitness_scores)
                
                # Early stopping if converged
                if generation > 20 and self._has_converged(fitness_scores):
                    break
            
            return self._convert_to_solution(best_solution, best_score, constraints)
            
        except Exception as e:
            logger.error(f"Error in genetic scheduler: {e}")
            return SchedulingSolution([], 0.0, False, [str(e)])
    
    def _initialize_population(self, courses: List[SchedulingNode], constraints: Dict[str, Any]) -> List[List[Dict]]:
        """Initialize random population."""
        population = []
        max_quarters = constraints.get('max_quarters', 12)
        
        for _ in range(self.population_size):
            individual = self._create_random_schedule(courses, constraints, max_quarters)
            population.append(individual)
        
        return population
    
    def _create_random_schedule(self, courses: List[SchedulingNode], constraints: Dict[str, Any], max_quarters: int) -> List[Dict]:
        """Create a random valid schedule."""
        schedule = []
        remaining_courses = courses.copy()
        completed_courses = set()
        
        for quarter_idx in range(max_quarters):
            if not remaining_courses:
                break
            
            quarter_name = self._get_quarter_name(quarter_idx)
            quarter_courses = []
            quarter_units = 0
            max_units = constraints.get('max_units_per_quarter', 20)
            
            # Shuffle courses for randomness
            random.shuffle(remaining_courses)
            
            for course in remaining_courses.copy():
                # Check prerequisites
                if not all(prereq in completed_courses for prereq in course.prerequisites):
                    continue
                
                # Check quarter availability
                if quarter_name.split()[0] not in course.offered_quarters:
                    continue
                
                # Check unit constraints
                if quarter_units + course.units > max_units:
                    continue
                
                # Add course to quarter
                quarter_courses.append({
                    'id': course.course_id,
                    'units': course.units,
                    'difficulty': course.difficulty
                })
                quarter_units += course.units
                remaining_courses.remove(course)
                completed_courses.add(course.course_id)
                
                # Stop if we have enough courses
                if len(quarter_courses) >= 4:
                    break
            
            if quarter_courses:
                schedule.append({
                    'quarter': quarter_name,
                    'courses': quarter_courses,
                    'total_units': quarter_units
                })
        
        return schedule
    
    def _evaluate_fitness(self, individual: List[Dict], constraints: Dict[str, Any], preferences: Dict[str, Any]) -> float:
        """Evaluate fitness of an individual schedule."""
        score = 0.0
        
        # Unit balance score
        unit_scores = [quarter['total_units'] for quarter in individual]
        if unit_scores:
            unit_std = np.std(unit_scores)
            score += max(0, 1.0 - unit_std / 10.0) * 0.3
        
        # Difficulty progression score
        difficulty_scores = []
        for quarter in individual:
            if quarter['courses']:
                avg_difficulty = np.mean([course['difficulty'] for course in quarter['courses']])
                difficulty_scores.append(avg_difficulty)
        
        if len(difficulty_scores) > 1:
            # Prefer gradual increase in difficulty
            progression_score = 0.0
            for i in range(1, len(difficulty_scores)):
                if difficulty_scores[i] >= difficulty_scores[i-1]:
                    progression_score += 0.1
            score += min(progression_score, 0.3)
        
        # Timeline efficiency score
        total_quarters = len(individual)
        target_quarters = preferences.get('target_quarters', 8)
        timeline_score = max(0, 1.0 - abs(total_quarters - target_quarters) / target_quarters)
        score += timeline_score * 0.2
        
        # Constraint violation penalties
        for quarter in individual:
            max_units = constraints.get('max_units_per_quarter', 20)
            min_units = constraints.get('min_units_per_quarter', 12)
            
            if quarter['total_units'] > max_units:
                score -= (quarter['total_units'] - max_units) * 0.1
            elif quarter['total_units'] < min_units and quarter['courses']:
                score -= (min_units - quarter['total_units']) * 0.05
        
        return score
    
    def _evolve_population(self, population: List[List[Dict]], fitness_scores: List[float]) -> List[List[Dict]]:
        """Evolve population through selection, crossover, and mutation."""
        # Sort by fitness
        sorted_pop = sorted(zip(population, fitness_scores), key=lambda x: x[1], reverse=True)
        
        new_population = []
        
        # Keep elite individuals
        for i in range(self.elite_size):
            new_population.append(sorted_pop[i][0])
        
        # Generate offspring
        while len(new_population) < self.population_size:
            parent1 = self._tournament_selection(sorted_pop)
            parent2 = self._tournament_selection(sorted_pop)
            
            child1, child2 = self._crossover(parent1, parent2)
            
            if random.random() < self.mutation_rate:
                child1 = self._mutate(child1)
            if random.random() < self.mutation_rate:
                child2 = self._mutate(child2)
            
            new_population.extend([child1, child2])
        
        return new_population[:self.population_size]
    
    def _tournament_selection(self, sorted_population: List[Tuple], tournament_size: int = 3) -> List[Dict]:
        """Tournament selection for parent selection."""
        tournament = random.sample(sorted_population, min(tournament_size, len(sorted_population)))
        return max(tournament, key=lambda x: x[1])[0]
    
    def _crossover(self, parent1: List[Dict], parent2: List[Dict]) -> Tuple[List[Dict], List[Dict]]:
        """Crossover operation between two parents."""
        if not parent1 or not parent2:
            return parent1.copy(), parent2.copy()
        
        # Single-point crossover
        crossover_point = random.randint(1, min(len(parent1), len(parent2)) - 1)
        
        child1 = parent1[:crossover_point] + parent2[crossover_point:]
        child2 = parent2[:crossover_point] + parent1[crossover_point:]
        
        return child1, child2
    
    def _mutate(self, individual: List[Dict]) -> List[Dict]:
        """Mutation operation on an individual."""
        if not individual:
            return individual
        
        mutated = individual.copy()
        
        # Random mutation: swap courses between quarters
        if len(mutated) >= 2:
            quarter1_idx = random.randint(0, len(mutated) - 1)
            quarter2_idx = random.randint(0, len(mutated) - 1)
            
            if (mutated[quarter1_idx]['courses'] and 
                mutated[quarter2_idx]['courses'] and 
                quarter1_idx != quarter2_idx):
                
                course1_idx = random.randint(0, len(mutated[quarter1_idx]['courses']) - 1)
                course2_idx = random.randint(0, len(mutated[quarter2_idx]['courses']) - 1)
                
                # Swap courses
                course1 = mutated[quarter1_idx]['courses'][course1_idx]
                course2 = mutated[quarter2_idx]['courses'][course2_idx]
                
                mutated[quarter1_idx]['courses'][course1_idx] = course2
                mutated[quarter2_idx]['courses'][course2_idx] = course1
                
                # Update unit totals
                mutated[quarter1_idx]['total_units'] += course2['units'] - course1['units']
                mutated[quarter2_idx]['total_units'] += course1['units'] - course2['units']
        
        return mutated
    
    def _has_converged(self, fitness_scores: List[float], threshold: float = 0.01) -> bool:
        """Check if population has converged."""
        if len(fitness_scores) < 2:
            return False
        
        return (max(fitness_scores) - min(fitness_scores)) < threshold
    
    def _get_quarter_name(self, quarter_idx: int) -> str:
        """Get quarter name from index."""
        quarters = ["Fall", "Winter", "Spring"]
        year = 2024 + (quarter_idx // 3)
        quarter = quarters[quarter_idx % 3]
        return f"{quarter} {year}"
    
    def _convert_to_solution(self, best_individual: List[Dict], score: float, constraints: Dict[str, Any]) -> SchedulingSolution:
        """Convert best individual to solution format."""
        if not best_individual:
            return SchedulingSolution([], 0.0, False, ["No valid schedule found"])
        
        violations = []
        feasible = True
        
        # Check for constraint violations
        for quarter in best_individual:
            max_units = constraints.get('max_units_per_quarter', 20)
            min_units = constraints.get('min_units_per_quarter', 12)
            
            if quarter['total_units'] > max_units:
                violations.append(f"Quarter {quarter['quarter']} exceeds max units: {quarter['total_units']}")
                feasible = False
            elif quarter['total_units'] < min_units and quarter['courses']:
                violations.append(f"Quarter {quarter['quarter']} below min units: {quarter['total_units']}")
        
        return SchedulingSolution(
            quarters=best_individual,
            total_score=score,
            feasible=feasible,
            violations=violations
        )

class ConstraintSatisfactionScheduler:
    """Constraint satisfaction approach to course scheduling."""
    
    def __init__(self):
        self.variables = []  # Courses to schedule
        self.domains = {}    # Possible quarters for each course
        self.constraints = []  # Scheduling constraints
    
    def solve_schedule(
        self,
        courses: List[SchedulingNode],
        constraints: Dict[str, Any],
        max_quarters: int = 12
    ) -> SchedulingSolution:
        """Solve scheduling problem using constraint satisfaction."""
        try:
            # Set up CSP
            self._setup_csp(courses, constraints, max_quarters)
            
            # Solve using backtracking with constraint propagation
            assignment = self._backtrack_search({})
            
            if assignment:
                schedule = self._convert_assignment_to_schedule(assignment, courses)
                return SchedulingSolution(
                    quarters=schedule,
                    total_score=0.8,  # Placeholder score
                    feasible=True,
                    violations=[]
                )
            else:
                return SchedulingSolution(
                    quarters=[],
                    total_score=0.0,
                    feasible=False,
                    violations=["No feasible schedule found"]
                )
                
        except Exception as e:
            logger.error(f"Error in CSP scheduler: {e}")
            return SchedulingSolution([], 0.0, False, [str(e)])
    
    def _setup_csp(self, courses: List[SchedulingNode], constraints: Dict[str, Any], max_quarters: int):
        """Set up constraint satisfaction problem."""
        self.variables = [course.course_id for course in courses]
        
        # Create domains (possible quarters for each course)
        for course in courses:
            possible_quarters = []
            for quarter_idx in range(max_quarters):
                quarter_name = self._get_quarter_name(quarter_idx)
                season = quarter_name.split()[0]
                if season in course.offered_quarters:
                    possible_quarters.append(quarter_idx)
            self.domains[course.course_id] = possible_quarters
    
    def _backtrack_search(self, assignment: Dict[str, int]) -> Optional[Dict[str, int]]:
        """Backtracking search with constraint propagation."""
        if len(assignment) == len(self.variables):
            return assignment
        
        # Select unassigned variable (MRV heuristic)
        unassigned = [var for var in self.variables if var not in assignment]
        var = min(unassigned, key=lambda x: len(self.domains[x]))
        
        # Try each value in domain
        for value in self.domains[var]:
            if self._is_consistent(var, value, assignment):
                assignment[var] = value
                
                # Forward checking
                inferences = self._forward_check(var, value, assignment)
                if inferences is not None:
                    result = self._backtrack_search(assignment)
                    if result is not None:
                        return result
                
                # Backtrack
                del assignment[var]
                self._restore_domains(inferences)
        
        return None
    
    def _is_consistent(self, var: str, value: int, assignment: Dict[str, int]) -> bool:
        """Check if assignment is consistent with constraints."""
        # Check unit constraints for the quarter
        quarter_courses = [v for v, q in assignment.items() if q == value] + [var]
        # This would check actual unit constraints with course data
        return len(quarter_courses) <= 5  # Simplified constraint
    
    def _forward_check(self, var: str, value: int, assignment: Dict[str, int]) -> Optional[Dict]:
        """Forward checking constraint propagation."""
        # Simplified implementation
        return {}
    
    def _restore_domains(self, inferences: Dict):
        """Restore domains after backtracking."""
        # Simplified implementation
        pass
    
    def _get_quarter_name(self, quarter_idx: int) -> str:
        """Get quarter name from index."""
        quarters = ["Fall", "Winter", "Spring"]
        year = 2024 + (quarter_idx // 3)
        quarter = quarters[quarter_idx % 3]
        return f"{quarter} {year}"
    
    def _convert_assignment_to_schedule(self, assignment: Dict[str, int], courses: List[SchedulingNode]) -> List[Dict]:
        """Convert CSP assignment to schedule format."""
        schedule_dict = defaultdict(list)
        course_map = {course.course_id: course for course in courses}
        
        for course_id, quarter_idx in assignment.items():
            quarter_name = self._get_quarter_name(quarter_idx)
            course = course_map[course_id]
            
            schedule_dict[quarter_idx].append({
                'id': course_id,
                'units': course.units,
                'difficulty': course.difficulty
            })
        
        # Convert to list format
        schedule = []
        for quarter_idx in sorted(schedule_dict.keys()):
            courses_in_quarter = schedule_dict[quarter_idx]
            total_units = sum(course['units'] for course in courses_in_quarter)
            
            schedule.append({
                'quarter': self._get_quarter_name(quarter_idx),
                'courses': courses_in_quarter,
                'total_units': total_units
            })
        
        return schedule

class GraphBasedScheduler:
    """Graph-based approach using topological sorting and optimization."""
    
    def __init__(self):
        self.course_graph = nx.DiGraph()
        self.course_data = {}
    
    def create_optimal_schedule(
        self,
        courses: List[SchedulingNode],
        constraints: Dict[str, Any]
    ) -> SchedulingSolution:
        """Create optimal schedule using graph algorithms."""
        try:
            # Build prerequisite graph
            self._build_graph(courses)
            
            # Check for cycles
            if not nx.is_directed_acyclic_graph(self.course_graph):
                return SchedulingSolution([], 0.0, False, ["Prerequisite cycle detected"])
            
            # Topological sort to get valid ordering
            topo_order = list(nx.topological_sort(self.course_graph))
            
            # Create schedule using topological order
            schedule = self._create_schedule_from_order(topo_order, constraints)
            
            return SchedulingSolution(
                quarters=schedule,
                total_score=0.85,  # Placeholder score
                feasible=True,
                violations=[]
            )
            
        except Exception as e:
            logger.error(f"Error in graph-based scheduler: {e}")
            return SchedulingSolution([], 0.0, False, [str(e)])
    
    def _build_graph(self, courses: List[SchedulingNode]):
        """Build prerequisite dependency graph."""
        # Add nodes
        for course in courses:
            self.course_graph.add_node(course.course_id)
            self.course_data[course.course_id] = course
        
        # Add edges (prerequisites)
        for course in courses:
            for prereq in course.prerequisites:
                if prereq in self.course_data:
                    self.course_graph.add_edge(prereq, course.course_id)
    
    def _create_schedule_from_order(self, topo_order: List[str], constraints: Dict[str, Any]) -> List[Dict]:
        """Create schedule following topological order."""
        schedule = []
        remaining_courses = topo_order.copy()
        completed_courses = set()
        quarter_idx = 0
        
        max_units = constraints.get('max_units_per_quarter', 20)
        min_units = constraints.get('min_units_per_quarter', 12)
        
        while remaining_courses and quarter_idx < 12:
            quarter_name = self._get_quarter_name(quarter_idx)
            season = quarter_name.split()[0]
            quarter_courses = []
            quarter_units = 0
            
            for course_id in remaining_courses.copy():
                course = self.course_data[course_id]
                
                # Check prerequisites
                if not all(prereq in completed_courses for prereq in course.prerequisites):
                    continue
                
                # Check quarter availability
                if season not in course.offered_quarters:
                    continue
                
                # Check unit constraints
                if quarter_units + course.units > max_units:
                    continue
                
                # Add course
                quarter_courses.append({
                    'id': course_id,
                    'units': course.units,
                    'difficulty': course.difficulty
                })
                quarter_units += course.units
                remaining_courses.remove(course_id)
                completed_courses.add(course_id)
                
                # Stop if we have enough units
                if quarter_units >= min_units and len(quarter_courses) >= 3:
                    break
            
            if quarter_courses:
                schedule.append({
                    'quarter': quarter_name,
                    'courses': quarter_courses,
                    'total_units': quarter_units
                })
            
            quarter_idx += 1
        
        return schedule
    
    def _get_quarter_name(self, quarter_idx: int) -> str:
        """Get quarter name from index."""
        quarters = ["Fall", "Winter", "Spring"]
        year = 2024 + (quarter_idx // 3)
        quarter = quarters[quarter_idx % 3]
        return f"{quarter} {year}"

def calculate_schedule_similarity(schedule1: List[Dict], schedule2: List[Dict]) -> float:
    """Calculate similarity between two schedules."""
    if not schedule1 or not schedule2:
        return 0.0
    
    # Extract course sets
    courses1 = set()
    courses2 = set()
    
    for quarter in schedule1:
        for course in quarter.get('courses', []):
            courses1.add(course.get('id'))
    
    for quarter in schedule2:
        for course in quarter.get('courses', []):
            courses2.add(course.get('id'))
    
    # Jaccard similarity
    intersection = len(courses1.intersection(courses2))
    union = len(courses1.union(courses2))
    
    return intersection / union if union > 0 else 0.0

def optimize_schedule_diversity(schedules: List[List[Dict]], target_count: int = 3) -> List[List[Dict]]:
    """Select diverse schedules from a larger set."""
    if len(schedules) <= target_count:
        return schedules
    
    # Start with the best schedule
    selected = [schedules[0]]
    remaining = schedules[1:]
    
    while len(selected) < target_count and remaining:
        # Find schedule with maximum minimum distance to selected schedules
        best_schedule = None
        best_min_distance = -1
        
        for candidate in remaining:
            min_distance = float('inf')
            for selected_schedule in selected:
                similarity = calculate_schedule_similarity(candidate, selected_schedule)
                distance = 1.0 - similarity
                min_distance = min(min_distance, distance)
            
            if min_distance > best_min_distance:
                best_min_distance = min_distance
                best_schedule = candidate
        
        if best_schedule:
            selected.append(best_schedule)
            remaining.remove(best_schedule)
    
    return selected
