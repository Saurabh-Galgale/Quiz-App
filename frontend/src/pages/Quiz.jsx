import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Button,
  CircularProgress,
  Grid,
  Divider,
} from "@mui/material";
import { useParams } from "react-router-dom";

export default function QuizPage() {
  const { id } = useParams(); // quiz id from /quiz/:id

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Fetch single quiz
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://quizzywebapp.vercel.app/api/quizzes/${id}`
        );
        if (!res.ok) {
          throw new Error("Failed to fetch quiz");
        }
        const data = await res.json();
        setQuiz(data);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchQuiz();
    }
  }, [id]);

  // Handlers to update answers state
  const handleMcqChange = (questionId, optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {}),
        questionId,
        answerOptionIndex: Number(optionIndex),
      },
    }));
  };

  const handleTrueFalseChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {}),
        questionId,
        answerBoolean: value === "true",
      },
    }));
  };

  const handleTextChange = (questionId, text) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {}),
        questionId,
        answerText: text,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    setSubmitting(true);
    setSubmitError(null);
    setResult(null);

    try {
      // Build answers array expected by backend
      const answersArray = quiz.questions
        .map((q) => {
          const ans = answers[q._id];
          if (!ans) return null; // unanswered → treated as wrong
          if (q.questionType === "mcq") {
            if (ans.answerOptionIndex === undefined) return null;
            return {
              questionId: q._id,
              answerOptionIndex: ans.answerOptionIndex,
            };
          }
          if (q.questionType === "true_false") {
            if (ans.answerBoolean === undefined) return null;
            return {
              questionId: q._id,
              answerBoolean: ans.answerBoolean,
            };
          }
          if (q.questionType === "text") {
            return {
              questionId: q._id,
              answerText: ans.answerText || "",
            };
          }
          return null;
        })
        .filter(Boolean);

      const res = await fetch(
        `https://quizzywebapp.vercel.app/api/quizzes/${quiz._id}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ answers: answersArray }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to submit quiz");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setSubmitError(err.message || "Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box textAlign="center" py={4}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography color="error" textAlign="center">
          {error}
        </Typography>
      </Container>
    );
  }

  if (!quiz) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography textAlign="center">Quiz not found.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={600} mb={1}>
        {quiz.title}
      </Typography>
      {quiz.description && (
        <Typography variant="body1" color="text.secondary" mb={3}>
          {quiz.description}
        </Typography>
      )}

      <Grid container spacing={2}>
        {quiz.questions.map((q, index) => {
          const qResult = result?.details?.find((d) => d.questionId === q._id);
          const hasResult = !!qResult;
          const isCorrect = qResult?.isCorrect;

          return (
            <Grid item xs={12} key={q._id}>
              <Card
                sx={
                  hasResult
                    ? {
                        border: "1px solid",
                        borderColor: isCorrect ? "success.main" : "error.main",
                        backgroundColor: isCorrect
                          ? "success.light"
                          : "error.light",
                      }
                    : undefined
                }
              >
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Question {index + 1} ({q.marks} mark
                    {q.marks > 1 ? "s" : ""})
                  </Typography>
                  <Typography variant="body1" fontWeight={500} mt={1} mb={2}>
                    {q.questionText}
                  </Typography>

                  {/* MCQ */}
                  {q.questionType === "mcq" && (
                    <RadioGroup
                      value={
                        answers[q._id]?.answerOptionIndex?.toString() ?? ""
                      }
                      onChange={(e) => handleMcqChange(q._id, e.target.value)}
                    >
                      {q.options.map((opt, optIndex) => (
                        <FormControlLabel
                          key={optIndex}
                          value={optIndex.toString()}
                          control={<Radio />}
                          label={opt}
                        />
                      ))}
                    </RadioGroup>
                  )}

                  {/* True / False */}
                  {q.questionType === "true_false" && (
                    <RadioGroup
                      row
                      value={
                        answers[q._id]?.answerBoolean === true
                          ? "true"
                          : answers[q._id]?.answerBoolean === false
                          ? "false"
                          : ""
                      }
                      onChange={(e) =>
                        handleTrueFalseChange(q._id, e.target.value)
                      }
                    >
                      <FormControlLabel
                        value="true"
                        control={<Radio />}
                        label="True"
                      />
                      <FormControlLabel
                        value="false"
                        control={<Radio />}
                        label="False"
                      />
                    </RadioGroup>
                  )}

                  {/* Text */}
                  {q.questionType === "text" && (
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      placeholder="Type your answer here..."
                      value={answers[q._id]?.answerText || ""}
                      onChange={(e) => handleTextChange(q._id, e.target.value)}
                    />
                  )}

                  {/* After submit: show correct / incorrect + correct answer */}
                  {hasResult && (
                    <Box mt={2}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color={isCorrect ? "success.main" : "error.main"}
                      >
                        {isCorrect ? "Correct" : "Incorrect"}
                      </Typography>

                      {q.questionType === "mcq" && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          Correct answer: {q.options[q.correctOptionIndex]}
                        </Typography>
                      )}

                      {q.questionType === "true_false" && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          Correct answer: {q.correctBoolean ? "True" : "False"}
                        </Typography>
                      )}

                      {q.questionType === "text" && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          Model answer: {q.correctTextAnswer}
                        </Typography>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Box mt={3} display="flex" flexDirection="column" gap={2}>
        {submitError && <Typography color="error">{submitError}</Typography>}

        {/* 🔹 Before submission — show Submit button */}
        {!result && (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Quiz"}
          </Button>
        )}

        {/* 🔹 After submission — show Home button */}
        {result && (
          <>
            <Button
              variant="contained"
              color="success"
              onClick={() => (window.location.href = "/")}
            >
              Go to Home
            </Button>

            <Box mt={2}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="h6" fontWeight={600} mb={1}>
                Result
              </Typography>
              <Typography variant="body1">
                Score: {result.score} / {result.maxScore}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Correct: {result.correctCount} / {result.totalQuestions}
              </Typography>
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
}
