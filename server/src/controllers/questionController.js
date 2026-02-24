const { validationResult } = require('express-validator');
const Question = require('../models/Question');

// GET /api/questions
const getQuestions = async (req, res) => {
  try {
    const {
      category, difficulty, company, topic, subcategory,
      search, page = 1, limit = 20, tags,
    } = req.query;

    const query = { isActive: true };
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (subcategory) query.subcategory = subcategory;
    if (company) query.company = { $in: [company] };
    if (topic) query.topic = { $in: [topic] };
    if (tags) query.tags = { $in: tags.split(',') };
    if (search) query.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);
    const [questions, total] = await Promise.all([
      Question.find(query)
        .select('-testCases -starterCode')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('createdBy', 'username'),
      Question.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: questions,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/questions/:id
const getQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).populate('createdBy', 'username');
    if (!question || !question.isActive) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    // Hide hidden test cases from non-admins
    const isAdmin = req.user && req.user.role === 'admin';
    const data = question.toObject();
    if (!isAdmin) {
      data.testCases = data.testCases.filter((tc) => !tc.isHidden);
    }
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/questions (admin)
const createQuestion = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    const question = await Question.create({ ...req.body, createdBy: req.user._id });
    return res.status(201).json({ success: true, data: question });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/questions/:id (admin)
const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    return res.status(200).json({ success: true, data: question });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/questions/:id (admin - soft delete)
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    return res.status(200).json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/questions/meta/filters - Get distinct filter values
const getFilters = async (req, res) => {
  try {
    const [companies, topics, subcategories] = await Promise.all([
      Question.distinct('company', { isActive: true }),
      Question.distinct('topic', { isActive: true }),
      Question.distinct('subcategory', { isActive: true }),
    ]);
    return res.status(200).json({ success: true, data: { companies, topics, subcategories } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getQuestions, getQuestion, createQuestion, updateQuestion, deleteQuestion, getFilters };
