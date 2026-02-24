const Submission = require('../models/Submission');
const Result = require('../models/Result');
const User = require('../models/User');
const Question = require('../models/Question');

// GET /api/progress/dashboard
const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    // Recent submissions
    const recentSubmissions = await Submission.find({ user: userId, isRun: false })
      .populate('question', 'title difficulty category')
      .sort({ createdAt: -1 })
      .limit(10);

    // Submissions by status
    const submissionStats = await Submission.aggregate([
      { $match: { user: userId, isRun: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Solved by category
    const solvedByCategory = await Submission.aggregate([
      { $match: { user: userId, status: 'Accepted', isRun: false } },
      { $lookup: { from: 'questions', localField: 'question', foreignField: '_id', as: 'questionData' } },
      { $unwind: '$questionData' },
      { $group: { _id: '$questionData.category', count: { $sum: 1 } } },
    ]);

    // Activity over last 30 days (for chart)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activityData = await Submission.aggregate([
      { $match: { user: userId, isRun: false, createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          accepted: { $sum: { $cond: [{ $eq: ['$status', 'Accepted'] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Recent results
    const recentResults = await Result.find({ user: userId }).sort({ completedAt: -1 }).limit(5);

    return res.status(200).json({
      success: true,
      data: {
        stats: user.stats,
        submissionStats,
        solvedByCategory,
        activityData,
        recentSubmissions,
        recentResults,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/progress/heatmap
const getHeatmap = async (req, res) => {
  try {
    const userId = req.user._id;
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const heatmapData = await Submission.aggregate([
      { $match: { user: userId, isRun: false, createdAt: { $gte: oneYearAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          accepted: { $sum: { $cond: [{ $eq: ['$status', 'Accepted'] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return res.status(200).json({ success: true, data: heatmapData });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/progress/streak
const getStreak = async (req, res) => {
  try {
    const userId = req.user._id;

    const submissions = await Submission.find({ user: userId, isRun: false })
      .select('createdAt')
      .sort({ createdAt: -1 });

    if (!submissions.length) {
      return res.status(200).json({ success: true, data: { currentStreak: 0, longestStreak: 0 } });
    }

    // Build set of active dates
    const activeDates = new Set(
      submissions.map((s) => s.createdAt.toISOString().split('T')[0])
    );

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let checkDate = new Date();

    // Start from today or yesterday for current streak
    if (!activeDates.has(today) && !activeDates.has(yesterday)) {
      currentStreak = 0;
    } else {
      let cursor = activeDates.has(today) ? new Date() : new Date(Date.now() - 86400000);
      while (true) {
        const dateStr = cursor.toISOString().split('T')[0];
        if (activeDates.has(dateStr)) {
          currentStreak++;
          cursor.setDate(cursor.getDate() - 1);
        } else break;
      }
    }

    // Longest streak
    const sortedDates = Array.from(activeDates).sort();
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prev = new Date(sortedDates[i - 1]);
        const curr = new Date(sortedDates[i]);
        const diff = (curr - prev) / 86400000;
        if (diff === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    }

    // Update user streak
    await User.findByIdAndUpdate(userId, { $set: { 'stats.streak': currentStreak } });

    return res.status(200).json({ success: true, data: { currentStreak, longestStreak } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboard, getHeatmap, getStreak };
