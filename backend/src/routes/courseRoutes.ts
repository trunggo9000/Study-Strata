import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();

/**
 * Get all available courses
 * GET /api/courses
 */
router.get('/', async (req, res) => {
  try {
    const { major, quarter, difficulty, type, search } = req.query;
    
    // Mock course data - in production, this would query the database
    let courses = [
      {
        id: '1',
        code: 'CS31',
        name: 'Introduction to Computer Science I',
        credits: 4,
        difficulty: 'medium',
        type: 'core',
        prerequisites: [],
        description: 'Introduction to computer science via problem solving, programming, and data structures.',
        quarters: ['Fall', 'Winter', 'Spring'],
        major: ['Computer Science'],
        instructor: 'Dr. Smith',
        gpa: 3.2
      },
      {
        id: '2',
        code: 'CS32',
        name: 'Introduction to Computer Science II',
        credits: 4,
        difficulty: 'hard',
        type: 'core',
        prerequisites: ['CS31'],
        description: 'Object-oriented software development, data structures, algorithms.',
        quarters: ['Fall', 'Winter', 'Spring'],
        major: ['Computer Science'],
        instructor: 'Dr. Johnson',
        gpa: 2.9
      }
    ];

    // Apply filters
    if (major) courses = courses.filter(c => c.major.includes(major as string));
    if (quarter) courses = courses.filter(c => c.quarters.includes(quarter as string));
    if (difficulty) courses = courses.filter(c => c.difficulty === difficulty);
    if (type) courses = courses.filter(c => c.type === type);
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      courses = courses.filter(c => 
        c.code.toLowerCase().includes(searchTerm) ||
        c.name.toLowerCase().includes(searchTerm)
      );
    }

    res.json({
      success: true,
      data: courses,
      total: courses.length
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch courses'
    });
  }
});

/**
 * Get course by ID
 * GET /api/courses/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock course data
    const course = {
      id,
      code: 'CS31',
      name: 'Introduction to Computer Science I',
      credits: 4,
      difficulty: 'medium',
      type: 'core',
      prerequisites: [],
      description: 'Comprehensive introduction to computer science.',
      quarters: ['Fall', 'Winter', 'Spring'],
      major: ['Computer Science'],
      instructor: 'Dr. Smith',
      gpa: 3.2,
      sections: [
        {
          id: 'lec1',
          type: 'lecture',
          instructor: 'Dr. Smith',
          days: ['M', 'W', 'F'],
          startTime: '10:00',
          endTime: '10:50',
          location: 'Boelter 5420',
          capacity: 200,
          enrolled: 180
        }
      ]
    };

    res.json({
      success: true,
      data: course
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Course not found'
    });
  }
});

/**
 * Check prerequisites for a course
 * POST /api/courses/check-prerequisites
 */
router.post('/check-prerequisites', authenticateToken, async (req, res) => {
  try {
    const { courseId, completedCourses } = req.body;
    
    // Mock prerequisite check
    const result = {
      satisfied: true,
      missing: [],
      recommendations: []
    };

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Prerequisite check failed'
    });
  }
});

export default router;
