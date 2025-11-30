import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

const emptyQuestion = () => ({
  questionType: "mcq",
  questionText: "",
  options: ["", ""], // at least 2 options for MCQ
  correctOptionIndex: 0,
  correctBoolean: true,
  correctTextAnswer: "",
  marks: 1,
});

export default function AdminPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([emptyQuestion()]);

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleQuestionChange = (index, field, value) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: value,
      };
      return copy;
    });
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const q = { ...copy[qIndex] };
      const options = [...(q.options || [])];
      options[optIndex] = value;
      q.options = options;
      copy[qIndex] = q;
      return copy;
    });
  };

  const handleAddOption = (qIndex) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const q = { ...copy[qIndex] };
      q.options = [...(q.options || []), ""];
      copy[qIndex] = q;
      return copy;
    });
  };

  const handleRemoveOption = (qIndex, optIndex) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const q = { ...copy[qIndex] };
      const options = [...(q.options || [])];
      options.splice(optIndex, 1);
      q.options = options;
      // adjust correctOptionIndex if needed
      if (q.correctOptionIndex >= options.length) {
        q.correctOptionIndex = Math.max(0, options.length - 1);
      }
      copy[qIndex] = q;
      return copy;
    });
  };

  const handleAddQuestion = () => {
    setQuestions((prev) => [...prev, emptyQuestion()]);
  };

  const handleRemoveQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const payload = {
        title,
        description,
        questions: questions.map((q) => {
          if (q.questionType === "mcq") {
            return {
              questionType: "mcq",
              questionText: q.questionText,
              options: q.options,
              correctOptionIndex: Number(q.correctOptionIndex) || 0,
              marks: Number(q.marks) || 1,
            };
          }

          if (q.questionType === "true_false") {
            return {
              questionType: "true_false",
              questionText: q.questionText,
              correctBoolean: Boolean(q.correctBoolean),
              marks: Number(q.marks) || 1,
            };
          }

          if (q.questionType === "text") {
            return {
              questionType: "text",
              questionText: q.questionText,
              correctTextAnswer: q.correctTextAnswer,
              marks: Number(q.marks) || 1,
            };
          }

          return q;
        }),
      };

      const res = await fetch("http://localhost:4000/api/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to create quiz");
      }

      const data = await res.json();
      setSuccessMessage(`Quiz created successfully (ID: ${data._id})`);

      // reset form (optional)
      setTitle("");
      setDescription("");
      setQuestions([emptyQuestion()]);
    } catch (err) {
      setErrorMessage(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={600} mb={2}>
        Admin – Create Quiz
      </Typography>

      <Box display="flex" flexDirection="column" gap={2} mb={3}>
        <TextField
          label="Quiz Title"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <TextField
          label="Description"
          fullWidth
          multiline
          minRows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Box
        mb={2}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant="h6" fontWeight={600}>
          Questions
        </Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddQuestion}
        >
          Add Question
        </Button>
      </Box>

      <Grid container spacing={2}>
        {questions.map((q, index) => (
          <Grid item xs={12} key={index}>
            <Card>
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1}
                >
                  <Typography variant="subtitle1" fontWeight={600}>
                    Question {index + 1}
                  </Typography>
                  {questions.length > 1 && (
                    <IconButton
                      aria-label="delete question"
                      onClick={() => handleRemoveQuestion(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>

                {/* Question type */}
                <FormControl fullWidth margin="normal">
                  <InputLabel id={`question-type-label-${index}`}>
                    Question Type
                  </InputLabel>
                  <Select
                    labelId={`question-type-label-${index}`}
                    label="Question Type"
                    value={q.questionType}
                    onChange={(e) =>
                      handleQuestionChange(
                        index,
                        "questionType",
                        e.target.value
                      )
                    }
                  >
                    <MenuItem value="mcq">MCQ</MenuItem>
                    <MenuItem value="true_false">True / False</MenuItem>
                    <MenuItem value="text">Text</MenuItem>
                  </Select>
                </FormControl>

                {/* Question text */}
                <TextField
                  label="Question Text"
                  fullWidth
                  margin="normal"
                  multiline
                  minRows={2}
                  value={q.questionText}
                  onChange={(e) =>
                    handleQuestionChange(index, "questionText", e.target.value)
                  }
                />

                {/* Marks */}
                <TextField
                  label="Marks"
                  type="number"
                  margin="normal"
                  value={q.marks}
                  onChange={(e) =>
                    handleQuestionChange(index, "marks", e.target.value)
                  }
                  sx={{ maxWidth: 120 }}
                />

                {/* MCQ fields */}
                {q.questionType === "mcq" && (
                  <Box mt={2}>
                    <Typography variant="subtitle2" mb={1}>
                      Options
                    </Typography>
                    {q.options.map((opt, optIndex) => (
                      <Box
                        key={optIndex}
                        display="flex"
                        alignItems="center"
                        gap={1}
                        mb={1}
                      >
                        <TextField
                          fullWidth
                          label={`Option ${optIndex + 1}`}
                          value={opt}
                          onChange={(e) =>
                            handleOptionChange(index, optIndex, e.target.value)
                          }
                        />
                        {q.options.length > 2 && (
                          <IconButton
                            aria-label="delete option"
                            onClick={() => handleRemoveOption(index, optIndex)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Box>
                    ))}

                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => handleAddOption(index)}
                      sx={{ mt: 1 }}
                    >
                      Add Option
                    </Button>

                    <Box mt={2}>
                      <TextField
                        label="Correct Option Index (0-based)"
                        type="number"
                        value={q.correctOptionIndex}
                        onChange={(e) =>
                          handleQuestionChange(
                            index,
                            "correctOptionIndex",
                            e.target.value
                          )
                        }
                        sx={{ maxWidth: 220 }}
                        helperText="0 = first option, 1 = second, etc."
                      />
                    </Box>
                  </Box>
                )}

                {/* True / False fields */}
                {q.questionType === "true_false" && (
                  <Box mt={2}>
                    <Typography variant="subtitle2" mb={1}>
                      Correct Answer
                    </Typography>
                    <RadioGroup
                      row
                      value={q.correctBoolean ? "true" : "false"}
                      onChange={(e) =>
                        handleQuestionChange(
                          index,
                          "correctBoolean",
                          e.target.value === "true"
                        )
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
                  </Box>
                )}

                {/* Text fields */}
                {q.questionType === "text" && (
                  <Box mt={2}>
                    <Typography variant="subtitle2" mb={1}>
                      Model Answer (used for checking)
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      value={q.correctTextAnswer}
                      onChange={(e) =>
                        handleQuestionChange(
                          index,
                          "correctTextAnswer",
                          e.target.value
                        )
                      }
                      placeholder="Enter the ideal answer here..."
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box mt={3} display="flex" flexDirection="column" gap={1}>
        {errorMessage && <Typography color="error">{errorMessage}</Typography>}
        {successMessage && (
          <Typography color="success.main">{successMessage}</Typography>
        )}

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting || !title || questions.length === 0}
        >
          {submitting ? "Creating..." : "Create Quiz"}
        </Button>
      </Box>
    </Container>
  );
}
