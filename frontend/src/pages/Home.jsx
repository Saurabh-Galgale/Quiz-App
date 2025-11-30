import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Grid,
} from "@mui/material";

// Home Page – List All Quizzes
export default function HomePage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await fetch("https://quizzywebapp.vercel.app/api/quizzes");
        if (!res.ok) {
          throw new Error("Failed to fetch quizzes");
        }
        const data = await res.json();
        setQuizzes(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={600} mb={3}>
        Available Quizzes
      </Typography>

      {loading && (
        <Box textAlign="center" py={4}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Typography color="error" textAlign="center">
          {error}
        </Typography>
      )}

      <Grid container spacing={2}>
        {quizzes.map((quiz) => (
          <Grid item xs={12} sm={6} key={quiz._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600}>
                  {quiz.title}
                </Typography>
                {quiz.description && (
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    {quiz.description}
                  </Typography>
                )}

                <Button
                  variant="contained"
                  size="small"
                  sx={{ mt: 2 }}
                  href={`/quiz/${quiz._id}`}
                >
                  Start Quiz
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
