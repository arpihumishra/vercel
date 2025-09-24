const { body, param, query } = require('express-validator');

// Auth validations
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 1 })
    .withMessage('Password is required')
];

// Note validations
const createNoteValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be between 1 and 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Content is required and must be between 1 and 10000 characters')
];

const updateNoteValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Content must be between 1 and 10000 characters')
];

// Parameter validations
const noteIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid note ID')
];

const tenantSlugValidation = [
  param('slug')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Invalid tenant slug format')
];

// Query validations
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

module.exports = {
  loginValidation,
  createNoteValidation,
  updateNoteValidation,
  noteIdValidation,
  tenantSlugValidation,
  paginationValidation
};