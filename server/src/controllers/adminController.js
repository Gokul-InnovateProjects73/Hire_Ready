const User = require('../models/User');
const Question = require('../models/Question');
const Submission = require('../models/Submission');
const Result = require('../models/Result');

// GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: users,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/users/:id
const updateUser = async (req, res) => {
  try {
    const { role, isActive } = req.body;
    const updates = {};
    if (role) updates.role = role;
    if (isActive !== undefined) updates.isActive = isActive;

    const user = await User.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/stats
const getPlatformStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalQuestions,
      totalSubmissions,
      totalResults,
      recentUsers,
      submissionsByStatus,
      questionsByCategory,
      questionsByDifficulty,
    ] = await Promise.all([
      User.countDocuments(),
      Question.countDocuments({ isActive: true }),
      Submission.countDocuments({ isRun: false }),
      Result.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(5).select('username email createdAt role'),
      Submission.aggregate([
        { $match: { isRun: false } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Question.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
      Question.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$difficulty', count: { $sum: 1 } } },
      ]),
    ]);

    // New users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: startOfMonth } });

    return res.status(200).json({
      success: true,
      data: {
        overview: { totalUsers, totalQuestions, totalSubmissions, totalResults, newUsersThisMonth },
        recentUsers,
        submissionsByStatus,
        questionsByCategory,
        questionsByDifficulty,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/admin/questions/bulk
const bulkImportQuestions = async (req, res) => {
  const { questions } = req.body;
  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ success: false, message: 'questions array is required' });
  }
  if (questions.length > 100) {
    return res.status(400).json({ success: false, message: 'Maximum 100 questions per bulk import' });
  }

  try {
    const toInsert = questions.map((q) => ({ ...q, createdBy: req.user._id }));
    const inserted = await Question.insertMany(toInsert, { ordered: false });
    return res.status(201).json({
      success: true,
      message: `${inserted.length} questions imported successfully`,
      data: { count: inserted.length },
    });
  } catch (error) {
    if (error.insertedDocs) {
      return res.status(207).json({
        success: true,
        message: `Partial import: ${error.insertedDocs.length} questions imported`,
        errors: error.writeErrors?.map((e) => e.errmsg),
      });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.status(200).json({ success: true, message: 'User deactivated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllUsers, updateUser, getPlatformStats, bulkImportQuestions, deleteUser };
