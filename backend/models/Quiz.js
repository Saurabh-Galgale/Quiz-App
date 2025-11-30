// models/Quiz.js
const mongoose = require("mongoose");

/**
 * Question types:
 * - "mcq"       → multiple choice (options + correctOptionIndex)
 * - "true_false"→ true/false (correctBoolean)
 * - "text"      → short text answer (correctTextAnswer)
 */

const questionSchema = new mongoose.Schema({
  questionType: {
    type: String,
    enum: ["mcq", "true_false", "text"],
    required: true,
  },

  questionText: { type: String, required: true },

  // MCQ only
  options: [
    {
      type: String,
      // not required globally, only used when questionType === "mcq"
    },
  ],
  correctOptionIndex: {
    type: Number,
    // used for MCQ
  },

  // True/False only
  correctBoolean: {
    type: Boolean,
    // used for true_false
  },

  // Text only
  correctTextAnswer: {
    type: String,
    // used for text
  },

  marks: {
    type: Number,
    default: 1,
  },
});

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    questions: [questionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", quizSchema);
