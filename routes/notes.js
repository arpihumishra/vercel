const express = require('express');
const { 
  createNote, 
  getNotes, 
  getNote, 
  updateNote, 
  deleteNote 
} = require('../controllers/notesController');
const { authenticate } = require('../middleware/auth');
const { 
  createNoteValidation, 
  updateNoteValidation, 
  noteIdValidation, 
  paginationValidation 
} = require('../validators/validators');
const { handleValidationErrors } = require('../middleware/errorHandler');

const router = express.Router();

// Apply authentication to all note routes
router.use(authenticate);

// @route   POST /api/notes
router.post(
  '/',
  createNoteValidation,
  handleValidationErrors,
  createNote
);

// @route   GET /api/notes
router.get(
  '/',
  paginationValidation,
  handleValidationErrors,
  getNotes
);

// @route   GET /api/notes/:id
router.get(
  '/:id',
  noteIdValidation,
  handleValidationErrors,
  getNote
);

// @route   PUT /api/notes/:id
router.put(
  '/:id',
  noteIdValidation,
  updateNoteValidation,
  handleValidationErrors,
  updateNote
);

// @route   DELETE /api/notes/:id
router.delete(
  '/:id',
  noteIdValidation,
  handleValidationErrors,
  deleteNote
);

module.exports = router;