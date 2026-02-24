const express = require('express');
const router = express.Router();
const {
  getAllUsers, updateUser, getPlatformStats, bulkImportQuestions, deleteUser,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');

router.use(protect, isAdmin);

router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/stats', getPlatformStats);
router.post('/questions/bulk', bulkImportQuestions);

module.exports = router;
