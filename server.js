/**
 * Sort It Out! — Game Server
 * Serves static files and provides a simple high-score API.
 * Scores are persisted to scores.json in the project root.
 */

const express = require('express');
const fs      = require('fs');
const path    = require('path');

const app        = express();
const PORT       = process.env.PORT || 3000;
const SCORES_FILE = path.join(__dirname, 'scores.json');
const MAX_SCORES  = 100000; // keep top 100000 server-side entries

// ---- Middleware ----
app.use(express.json());
app.use(express.static(__dirname)); // serve index.html, css/, js/, assets/

// ---- Helper: load scores from disk ----
function loadScores() {
  try {
    const data = JSON.parse(fs.readFileSync(SCORES_FILE, 'utf8'));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// ---- Helper: save scores to disk ----
function persistScores(scores) {
  fs.writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 2), 'utf8');
}

// ---- GET /api/scores — return top scores ----
app.get('/api/scores', (req, res) => {
  const scores = loadScores();
  res.json(scores);
});

// ---- POST /api/scores — submit a new score ----
app.post('/api/scores', (req, res) => {
  const { name, score } = req.body;

  if (typeof score !== 'number' || score < 0 || score > 10) {
    return res.status(400).json({ error: 'Invalid score' });
  }

  const safeName = String(name || 'Anonymous').trim().slice(0, 20) || 'Anonymous';

  const scores = loadScores();
  scores.push({ name: safeName, score, date: Date.now() });
  scores.sort((a, b) => b.score - a.score || a.date - b.date);
  scores.splice(MAX_SCORES);
  persistScores(scores);

  res.json(scores);
});

// ---- Start ----
app.listen(PORT, () => {
  console.log(`Sort It Out! running at http://localhost:${PORT}`);
});
