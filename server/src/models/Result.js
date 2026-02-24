const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['mock-interview', 'coding-test', 'quiz'],
      required: true,
    },
    questions: [
      {
        question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
        userAnswer: { type: String, default: '' },
        isCorrect: { type: Boolean, default: false },
        pointsEarned: { type: Number, default: 0 },
        timeTaken: { type: Number, default: 0 }, // seconds
      },
    ],
    score: { type: Number, required: true },
    totalScore: { type: Number, required: true },
    timeTaken: { type: Number, default: 0 }, // total seconds
    completedAt: { type: Date, default: Date.now },
    aiAnalysis: { type: String, default: '' },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    recommendations: [{ type: String }],
  },
  { timestamps: true }
);

resultSchema.index({ user: 1, completedAt: -1 });

module.exports = mongoose.model('Result', resultSchema);
