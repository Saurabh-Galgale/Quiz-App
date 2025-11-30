// routes/quizRoutes.js
const express = require("express");
const router = express.Router();
const Quiz = require("../models/Quiz");
const { shallowTextMatch } = require("../helper/textMatch");

/**
 * GET /api/quizzes
 * List all quizzes (basic info only)
 */
router.get("/", async (req, res) => {
  try {
    const quizzes = await Quiz.find(
      {},
      "title description createdAt updatedAt"
    );
    res.json(quizzes);
  } catch (err) {
    console.error("Error fetching quizzes:", err);
    res.status(500).json({ message: "Server error while fetching quizzes" });
  }
});

/**
 * GET /api/quizzes/:id
 * Get a single quiz (full details including questions)
 */
router.get("/:id", async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.json(quiz);
  } catch (err) {
    console.error("Error fetching quiz:", err);
    res.status(500).json({ message: "Server error while fetching quiz" });
  }
});

/**
 * POST /api/quizzes
 * Create a new quiz (Admin)
 * Expected body:
 * {
 *   "title": "JS Basics",
 *   "description": "Simple quiz",
 *   "questions": [
 *     {
 *       "questionType": "mcq",
 *       "questionText": "2 + 2 = ?",
 *       "options": ["1", "2", "4", "5"],
 *       "correctOptionIndex": 2,
 *       "marks": 1
 *     },
 *     {
 *       "questionType": "true_false",
 *       "questionText": "React is a library.",
 *       "correctBoolean": true,
 *       "marks": 1
 *     },
 *     {
 *       "questionType": "text",
 *       "questionText": "Capital of India?",
 *       "correctTextAnswer": "New Delhi",
 *       "marks": 2
 *     }
 *   ]
 * }
 */
router.post("/", async (req, res) => {
  try {
    const { title, description, questions } = req.body;

    if (
      !title ||
      !questions ||
      !Array.isArray(questions) ||
      questions.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Title and at least one question are required" });
    }

    const quiz = new Quiz({
      title,
      description,
      questions,
    });

    const savedQuiz = await quiz.save();
    res.status(201).json(savedQuiz);
  } catch (err) {
    console.error("Error creating quiz:", err);
    res.status(500).json({ message: "Server error while creating quiz" });
  }
});

/**
 * POST /api/quizzes/:id/submit
 * Submit answers for a quiz, calculate score
 *
 * Expected body (example):
 * {
 *   "answers": [
 *     { "questionId": "<qid1>", "answerOptionIndex": 2 },
 *     { "questionId": "<qid2>", "answerBoolean": true },
 *     { "questionId": "<qid3>", "answerText": "new delhi" }
 *   ]
 * }
 *
 * We compare based on questionType:
 * - mcq        → answerOptionIndex vs correctOptionIndex
 * - true_false → answerBoolean vs correctBoolean
 * - text       → answerText (case-insensitive trim) vs correctTextAnswer
 */
router.post("/:id/submit", async (req, res) => {
  try {
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: "answers array is required" });
    }

    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    let score = 0;
    let maxScore = 0;
    let correctCount = 0;

    const details = quiz.questions.map((question) => {
      const qMarks = question.marks || 1;
      maxScore += qMarks;

      const userAnswer = answers.find(
        (a) => String(a.questionId) === String(question._id)
      );

      let isCorrect = false;

      if (userAnswer) {
        if (question.questionType === "mcq") {
          isCorrect =
            userAnswer.answerOptionIndex === question.correctOptionIndex;
        } else if (question.questionType === "true_false") {
          isCorrect = userAnswer.answerBoolean === question.correctBoolean;
        } else if (question.questionType === "text") {
          const correct = question.correctTextAnswer || "";
          const given = userAnswer.answerText || "";

          // Shallow check: does user cover ~60% of important words?
          const MIN_MATCH_RATIO = 0.6;
          isCorrect = shallowTextMatch(correct, given, MIN_MATCH_RATIO);
        }
      }

      if (isCorrect) {
        score += qMarks;
        correctCount += 1;
      }

      return {
        questionId: question._id,
        questionText: question.questionText,
        questionType: question.questionType,
        marks: qMarks,
        isCorrect,
      };
    });

    res.json({
      quizId: quiz._id,
      title: quiz.title,
      score,
      maxScore,
      correctCount,
      totalQuestions: quiz.questions.length,
      details,
    });
  } catch (err) {
    console.error("Error submitting quiz:", err);
    res.status(500).json({ message: "Server error while submitting quiz" });
  }
});

module.exports = router;
