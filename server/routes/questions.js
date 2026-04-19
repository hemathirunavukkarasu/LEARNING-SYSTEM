const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const { protect } = require('../middleware/auth');

// ── GET /api/questions ───────────────────────────────────────
// Returns exactly 4 questions per subject (20 total), shuffled
router.get('/', protect, async (req, res) => {
  try {
    const subjects = ['Tamil', 'English', 'Maths', 'Science', 'Social'];
    let allQuestions = [];

    for (const subject of subjects) {
      // Get 4 questions per subject
      const questions = await Question.find({ subject }).limit(4);
      if (questions.length < 4) {
        return res.status(500).json({
          message: `Not enough questions for subject: ${subject}. Please run the seed script.`,
        });
      }
      allQuestions = [...allQuestions, ...questions];
    }

    res.json({ questions: allQuestions });
  } catch (err) {
    console.error('Questions fetch error:', err);
    res.status(500).json({ message: 'Error fetching questions.' });
  }
});

module.exports = router;
