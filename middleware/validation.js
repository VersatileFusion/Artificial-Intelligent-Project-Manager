const { validationResult, check } = require('express-validator');

/**
 * Middleware to validate request
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg
      }))
    });
  }
  next();
};

/**
 * Project validation rules
 */
const projectValidationRules = [
  check('name')
    .trim()
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ max: 100 })
    .withMessage('Project name must be less than 100 characters'),
  
  check('description')
    .trim()
    .notEmpty()
    .withMessage('Project description is required'),
  
  check('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  check('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((endDate, { req }) => {
      if (new Date(endDate) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  check('status')
    .isIn(['planning', 'in-progress', 'completed', 'on-hold'])
    .withMessage('Invalid status value')
];

/**
 * Task validation rules
 */
const taskValidationRules = [
  check('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ max: 100 })
    .withMessage('Task title must be less than 100 characters'),
  
  check('description')
    .trim()
    .notEmpty()
    .withMessage('Task description is required'),
  
  check('status')
    .isIn(['todo', 'in-progress', 'review', 'completed'])
    .withMessage('Invalid status value'),
  
  check('priority')
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority value'),
  
  check('dueDate')
    .notEmpty()
    .withMessage('Due date is required')
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  
  check('project')
    .notEmpty()
    .withMessage('Project ID is required')
    .isMongoId()
    .withMessage('Invalid project ID format'),
  
  check('assignedTo')
    .notEmpty()
    .withMessage('Assigned user ID is required')
    .isMongoId()
    .withMessage('Invalid user ID format')
];

/**
 * User validation rules
 */
const userValidationRules = [
  check('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  
  check('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  
  check('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

/**
 * Login validation rules
 */
const loginValidationRules = [
  check('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  
  check('password')
    .notEmpty()
    .withMessage('Password is required')
];

module.exports = {
  validateRequest,
  projectValidationRules,
  taskValidationRules,
  userValidationRules,
  loginValidationRules
}; 