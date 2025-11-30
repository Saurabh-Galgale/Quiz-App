require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const app = express();
app.use(cors());
app.use(express.json());
const connectDB = require("./db");
const quizRoutes = require("./routes/quizRoutes");

connectDB();

if (process.env.NODE_ENV === "production") {
  app.use(helmet());
} else {
  app.use(helmet({ contentSecurityPolicy: false }));
}

app.get("/", (req, res) => {
  res.json({ message: "Backend is running ✔️" });
});
app.use("/api/quizzes", quizRoutes);

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
