const express = require('express');
const router = express.Router();
const {
  runSubmission, submitSolution, getMySubmissions, getSubmissionsForQuestion,
} = require('../controllers/submissionController');
const { protect } = require('../middleware/auth');

router.post('/run', protect, runSubmission);
router.post('/submit', protect, submitSolution);
router.get('/my', protect, getMySubmissions);
router.get('/:questionId', protect, getSubmissionsForQuestion);

module.exports = router;
