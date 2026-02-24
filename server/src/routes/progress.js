const express = require('express');
const router = express.Router();
const { getDashboard, getHeatmap, getStreak } = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

router.get('/dashboard', protect, getDashboard);
router.get('/heatmap', protect, getHeatmap);
router.get('/streak', protect, getStreak);

module.exports = router;
