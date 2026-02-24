const express = require('express');
const router = express.Router();
const { codeFeedback, resumeAnalysis, interviewTip, mockQuestions } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/feedback', protect, codeFeedback);
router.post('/resume', protect, resumeAnalysis);
router.post('/interview-tip', protect, interviewTip);
router.get('/mock-questions', protect, mockQuestions);

module.exports = router;
