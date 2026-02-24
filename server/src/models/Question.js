const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  output: { type: String, required: true },
  explanation: { type: String, default: '' },
  isHidden: { type: Boolean, default: false },
});

const exampleSchema = new mongoose.Schema({
  input: { type: String },
  output: { type: String },
  explanation: { type: String },
});

const starterCodeSchema = new mongoose.Schema({
  language: {
    type: String,
    enum: ['javascript', 'python', 'java', 'cpp', 'c'],
    required: true,
  },
  code: { type: String, required: true },
});

const questionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title must not exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: [true, 'Difficulty is required'],
    },
    category: {
      type: String,
      enum: ['DSA', 'HR', 'Core', 'System Design'],
      required: [true, 'Category is required'],
    },
    subcategory: {
      type: String,
      required: [true, 'Subcategory is required'],
      // e.g. Arrays, Linked Lists, OOP, DBMS, OS, Networks, Behavioral
    },
    tags: [{ type: String }],
    starterCode: [starterCodeSchema],
    testCases: [testCaseSchema],
    hints: [{ type: String }],
    company: [{ type: String }],
    topic: [{ type: String }],
    constraints: { type: String, default: '' },
    examples: [exampleSchema],
    isActive: { type: Boolean, default: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    acceptanceRate: { type: Number, default: 0 },
    totalSubmissions: { type: Number, default: 0 },
    totalAccepted: { type: Number, default: 0 },
  },
  { timestamps: true }
);

questionSchema.index({ category: 1, difficulty: 1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ company: 1 });
questionSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Question', questionSchema);
