import { Router } from 'express';
import { GPTAdvisor } from '../ai/GPTAdvisor';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();
const advisor = new GPTAdvisor();

/**
 * Process natural language query
 * POST /api/advisor/query
 */
router.post('/query', authenticateToken, validateRequest, async (req, res) => {
  try {
    const { question, type, context } = req.body;
    
    const response = await advisor.processQuery({
      type,
      question,
      context
    });

    res.json({
      success: true,
      data: response,
      metadata: {
        processedAt: new Date().toISOString(),
        model: 'gpt-4-turbo'
      }
    });

  } catch (error) {
    console.error('Advisor query error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process query',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Analyze what-if scenario
 * POST /api/advisor/what-if
 */
router.post('/what-if', authenticateToken, async (req, res) => {
  try {
    const { student, scenario } = req.body;
    
    const analysis = await advisor.analyzeWhatIfScenario(student, scenario);

    res.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'What-if analysis failed'
    });
  }
});

/**
 * Get course recommendations
 * POST /api/advisor/recommend-courses
 */
router.post('/recommend-courses', authenticateToken, async (req, res) => {
  try {
    const { student, availableCourses, preferences } = req.body;
    
    const recommendations = await advisor.recommendCourses(
      student,
      availableCourses,
      preferences
    );

    res.json({
      success: true,
      data: recommendations
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Course recommendation failed'
    });
  }
});

/**
 * Get career guidance
 * POST /api/advisor/career-guidance
 */
router.post('/career-guidance', authenticateToken, async (req, res) => {
  try {
    const { student, careerInterests } = req.body;
    
    const guidance = await advisor.provideCareerGuidance(student, careerInterests);

    res.json({
      success: true,
      data: guidance
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Career guidance failed'
    });
  }
});

/**
 * Analyze academic performance
 * POST /api/advisor/analyze-performance
 */
router.post('/analyze-performance', authenticateToken, async (req, res) => {
  try {
    const { student, recentGrades } = req.body;
    
    const analysis = await advisor.analyzePerformance(student, recentGrades);

    res.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Performance analysis failed'
    });
  }
});

export default router;
