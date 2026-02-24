const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  getQuestions, getQuestion, createQuestion, updateQuestion, deleteQuestion, getFilters,
} = require('../controllers/questionController');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');

const questionValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('difficulty').isIn(['Easy', 'Medium', 'Hard']).withMessage('Invalid difficulty'),
  body('category').isIn(['DSA', 'HR', 'Core', 'System Design']).withMessage('Invalid category'),
  body('subcategory').notEmpty().withMessage('Subcategory is required'),
];

router.get('/meta/filters', getFilters);
router.get('/', protect, getQuestions);
router.get('/:id', protect, getQuestion);
router.post('/', protect, isAdmin, questionValidation, createQuestion);
router.put('/:id', protect, isAdmin, updateQuestion);
router.delete('/:id', protect, isAdmin, deleteQuestion);

module.exports = router;
