const Submission = require('../models/Submission');
const Question = require('../models/Question');
const User = require('../models/User');
const { runCode } = require('../utils/codeExecutor');
const { getCodeFeedback } = require('../utils/aiService');

// POST /api/submissions/run
const runSubmission = async (req, res) => {
  const { questionId, code, language } = req.body;
  if (!questionId || !code || !language) {
    return res.status(400).json({ success: false, message: 'questionId, code, and language are required' });
  }

  try {
    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

    const result = await runCode(code, language, question.testCases, false);

    // Save as "run" (not official submission)
    const submission = await Submission.create({
      user: req.user._id,
      question: questionId,
      code,
      language,
      status: result.status,
      runtime: result.runtime,
      memory: result.memory,
      testCasesPassed: result.testCasesPassed,
      totalTestCases: result.totalTestCases,
      isRun: true,
      errorMessage: result.errorMessage,
    });

    return res.status(200).json({
      success: true,
      data: {
        submissionId: submission._id,
        status: result.status,
        runtime: result.runtime,
        memory: result.memory,
        testCasesPassed: result.testCasesPassed,
        totalTestCases: result.totalTestCases,
        results: result.results,
        errorMessage: result.errorMessage,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/submissions/submit
const submitSolution = async (req, res) => {
  const { questionId, code, language } = req.body;
  if (!questionId || !code || !language) {
    return res.status(400).json({ success: false, message: 'questionId, code, and language are required' });
  }

  try {
    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

    const result = await runCode(code, language, question.testCases, true);

    // Generate AI feedback
    const feedback = await getCodeFeedback({
      code,
      language,
      questionTitle: question.title,
      status: result.status,
      testCasesPassed: result.testCasesPassed,
      totalTestCases: result.totalTestCases,
    });

    const submission = await Submission.create({
      user: req.user._id,
      question: questionId,
      code,
      language,
      status: result.status,
      runtime: result.runtime,
      memory: result.memory,
      testCasesPassed: result.testCasesPassed,
      totalTestCases: result.totalTestCases,
      feedback,
      isRun: false,
      errorMessage: result.errorMessage,
    });

    // Update question stats
    await Question.findByIdAndUpdate(questionId, {
      $inc: {
        totalSubmissions: 1,
        totalAccepted: result.status === 'Accepted' ? 1 : 0,
      },
    });

    // Update user stats if accepted (and not previously solved)
    if (result.status === 'Accepted') {
      const previousAccepted = await Submission.findOne({
        user: req.user._id,
        question: questionId,
        status: 'Accepted',
        _id: { $ne: submission._id },
        isRun: false,
      });

      if (!previousAccepted) {
        const difficultyField = {
          Easy: 'stats.easySolved',
          Medium: 'stats.mediumSolved',
          Hard: 'stats.hardSolved',
        }[question.difficulty] || 'stats.easySolved';

        await User.findByIdAndUpdate(req.user._id, {
          $inc: {
            'stats.problemsSolved': 1,
            [difficultyField]: 1,
          },
        });
      }
    }

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.totalSubmissions': 1 },
      $set: { 'stats.lastActiveDate': new Date() },
    });

    return res.status(200).json({
      success: true,
      data: {
        submissionId: submission._id,
        status: result.status,
        runtime: result.runtime,
        memory: result.memory,
        testCasesPassed: result.testCasesPassed,
        totalTestCases: result.totalTestCases,
        feedback,
        errorMessage: result.errorMessage,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/submissions/my
const getMySubmissions = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, language } = req.query;
    const query = { user: req.user._id, isRun: false };
    if (status) query.status = status;
    if (language) query.language = language;

    const skip = (Number(page) - 1) * Number(limit);
    const [submissions, total] = await Promise.all([
      Submission.find(query)
        .populate('question', 'title difficulty category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Submission.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: submissions,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/submissions/:questionId
const getSubmissionsForQuestion = async (req, res) => {
  try {
    const submissions = await Submission.find({
      user: req.user._id,
      question: req.params.questionId,
      isRun: false,
    })
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { runSubmission, submitSolution, getMySubmissions, getSubmissionsForQuestion };
