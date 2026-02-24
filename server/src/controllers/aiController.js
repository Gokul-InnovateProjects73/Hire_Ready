const { getCodeFeedback, analyzeResume, getInterviewTip, generateMockQuestions } = require('../utils/aiService');

// POST /api/ai/feedback
const codeFeedback = async (req, res) => {
  const { code, language, questionTitle, status, testCasesPassed, totalTestCases } = req.body;
  if (!code || !language) {
    return res.status(400).json({ success: false, message: 'code and language are required' });
  }
  try {
    const feedback = await getCodeFeedback({
      code,
      language,
      questionTitle: questionTitle || 'Coding Problem',
      status: status || 'Unknown',
      testCasesPassed: testCasesPassed || 0,
      totalTestCases: totalTestCases || 0,
    });
    return res.status(200).json({ success: true, data: { feedback } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/ai/resume
const resumeAnalysis = async (req, res) => {
  const { resumeText } = req.body;
  if (!resumeText || resumeText.trim().length < 50) {
    return res.status(400).json({ success: false, message: 'Please provide resume text (minimum 50 characters)' });
  }
  try {
    const analysis = await analyzeResume(resumeText);
    return res.status(200).json({ success: true, data: { analysis } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/ai/interview-tip
const interviewTip = async (req, res) => {
  const { topic } = req.body;
  if (!topic) {
    return res.status(400).json({ success: false, message: 'topic is required' });
  }
  try {
    const tip = await getInterviewTip(topic);
    return res.status(200).json({ success: true, data: { topic, tip } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/ai/mock-questions
const mockQuestions = async (req, res) => {
  const { category = 'DSA', difficulty = 'Medium', count = 5 } = req.query;
  const validCategories = ['DSA', 'HR', 'Core', 'System Design'];
  const validDifficulties = ['Easy', 'Medium', 'Hard'];

  if (!validCategories.includes(category)) {
    return res.status(400).json({ success: false, message: `category must be one of: ${validCategories.join(', ')}` });
  }
  if (!validDifficulties.includes(difficulty)) {
    return res.status(400).json({ success: false, message: `difficulty must be one of: ${validDifficulties.join(', ')}` });
  }

  try {
    const questions = await generateMockQuestions(category, difficulty, Math.min(Number(count), 10));
    return res.status(200).json({ success: true, data: { category, difficulty, questions } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { codeFeedback, resumeAnalysis, interviewTip, mockQuestions };
