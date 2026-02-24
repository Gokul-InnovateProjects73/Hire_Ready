const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      enum: ['javascript', 'python', 'java', 'cpp', 'c'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Pending', 'Running'],
      default: 'Pending',
    },
    runtime: { type: Number, default: 0 },   // ms
    memory: { type: Number, default: 0 },    // KB
    testCasesPassed: { type: Number, default: 0 },
    totalTestCases: { type: Number, default: 0 },
    feedback: {
      type: String,
      default: '',
    },
    isRun: { type: Boolean, default: false }, // true if just "run", false if "submit"
    errorMessage: { type: String, default: '' },
  },
  { timestamps: true }
);

submissionSchema.index({ user: 1, question: 1 });
submissionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Submission', submissionSchema);
