const User = require('../models/User');

// GET /api/leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const { page = 1, limit = 50, sortBy = 'problemsSolved' } = req.query;

    const validSortFields = {
      problemsSolved: 'stats.problemsSolved',
      totalSubmissions: 'stats.totalSubmissions',
      streak: 'stats.streak',
    };

    const sortField = validSortFields[sortBy] || validSortFields.problemsSolved;
    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      User.find({ isActive: true, 'stats.problemsSolved': { $gt: 0 } })
        .select('username profile.firstName profile.lastName profile.avatar stats createdAt')
        .sort({ [sortField]: -1, createdAt: 1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments({ isActive: true, 'stats.problemsSolved': { $gt: 0 } }),
    ]);

    // Add rank
    const ranked = users.map((u, idx) => ({
      ...u.toObject(),
      rank: skip + idx + 1,
    }));

    // Find current user's rank
    let myRank = null;
    if (req.user) {
      const myPosition = await User.countDocuments({
        isActive: true,
        [sortField]: { $gt: req.user.stats[sortBy] || 0 },
      });
      myRank = myPosition + 1;
    }

    return res.status(200).json({
      success: true,
      data: ranked,
      myRank,
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

module.exports = { getLeaderboard };
