import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  
  next();
};

export const scheduleValidation = [
  body('studentProfile').isObject().withMessage('Student profile is required'),
  body('studentProfile.id').isString().withMessage('Student ID is required'),
  body('studentProfile.major').isString().withMessage('Major is required'),
  body('availableCourses').isArray().withMessage('Available courses must be an array'),
  body('constraints').optional().isObject(),
  body('targetQuarters').optional().isInt({ min: 1, max: 20 })
];

export const advisorQueryValidation = [
  body('question').isString().isLength({ min: 1 }).withMessage('Question is required'),
  body('type').isIn(['what-if', 'course-recommendation', 'schedule-optimization', 'career-guidance', 'general'])
    .withMessage('Invalid query type'),
  body('context').optional().isObject()
];
