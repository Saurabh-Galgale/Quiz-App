// helpers/textMatch.js

// --- SIMPLE TEXT MATCH HELPERS ---

function normalizeText(str = "") {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ") // remove punctuation
    .replace(/\s+/g, " ") // collapse spaces
    .trim();
}

function extractImportantWords(str = "") {
  const stopwords = new Set([
    "the",
    "is",
    "am",
    "are",
    "a",
    "an",
    "of",
    "to",
    "in",
    "on",
    "and",
    "or",
    "for",
    "with",
    "by",
    "at",
    "from",
    "that",
    "this",
    "it",
    "as",
    "be",
    "was",
    "were",
    "has",
    "have",
    "had",
  ]);

  const normalized = normalizeText(str);
  const words = normalized.split(" ");

  // keep words with length >= 3 and not in stopwords
  return words.filter((w) => w.length >= 3 && !stopwords.has(w));
}

function shallowTextMatch(correctAnswer, userAnswer, minMatchRatio = 0.6) {
  const correctWords = extractImportantWords(correctAnswer);
  const userWords = extractImportantWords(userAnswer);

  if (correctWords.length === 0 || userWords.length === 0) return false;

  const userSet = new Set(userWords);

  let matchCount = 0;
  for (const w of correctWords) {
    if (userSet.has(w)) matchCount++;
  }

  const ratio = matchCount / correctWords.length; // how many important words user covered
  return ratio >= minMatchRatio;
}

module.exports = {
  normalizeText,
  extractImportantWords,
  shallowTextMatch,
};
