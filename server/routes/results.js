const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const Question = require('../models/Question');
const { protect } = require('../middleware/auth');

// ── Helper: calculate difficulty level ──────────────────────
function getDifficultyLevel(totalScore) {
  if (totalScore <= 7) return 'High Difficulty';
  if (totalScore <= 14) return 'Moderate Difficulty';
  return 'Good Understanding';
}

// ── Helper: calculate group scores and best group ────────────
function getGroupRecommendation(subjectScores) {
  // Convert raw scores (0-4) to percentages (0-100)
  const pct = (score) => Math.round((score / 4) * 100);

  const T = pct(subjectScores.Tamil);
  const E = pct(subjectScores.English);
  const M = pct(subjectScores.Maths);
  const Sc = pct(subjectScores.Science);
  const So = pct(subjectScores.Social);

  const groupScores = {
    Arts:            Math.round((T + E + So) / 3),       // Tamil, English, Social
    ComputerScience: Math.round((M + Sc) / 2),            // Maths, Science
    Biology:         Math.round((Sc + So + T) / 3),       // Science, Social, Tamil
  };

  // Find the highest scoring group; tie-break: Arts > CS > Biology
  const sorted = Object.entries(groupScores).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    const priority = { Arts: 3, ComputerScience: 2, Biology: 1 };
    return priority[b[0]] - priority[a[0]];
  });

  return { groupScores, recommendedGroup: sorted[0][0] };
}

// ── POST /api/results/submit ─────────────────────────────────
// Body: { answers: { questionId: selectedAnswer, ... } }
router.post('/submit', protect, async (req, res) => {
  try {
    const { answers } = req.body;
    const studentId = req.user.userId;
    const studentName = req.user.name;

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ message: 'Answers are required.' });
    }

    // Fetch all questions that were answered
    const questionIds = Object.keys(answers);
    const questions = await Question.find({ _id: { $in: questionIds } });

    // Tally scores per subject
    const subjectScores = { Tamil: 0, English: 0, Maths: 0, Science: 0, Social: 0 };

    for (const q of questions) {
      const userAnswer = answers[q._id.toString()];
      let isCorrect = false;

      if (q.type === 'MCQ' || q.type === 'PARAGRAPH') {
        isCorrect = userAnswer === q.correctAnswer;
      } else if (q.type === 'MATCH') {
        // For MATCH, userAnswer should be an array of matched right-side values in order
        // e.g. ['Paris', 'Berlin', 'Rome'] matching left items in order
        if (Array.isArray(userAnswer)) {
          const correctOrder = q.matchPairs.map((p) => p.right);
          isCorrect = JSON.stringify(userAnswer) === JSON.stringify(correctOrder);
        }
      }

      if (isCorrect) subjectScores[q.subject] += 1;
    }

    const totalScore = Object.values(subjectScores).reduce((a, b) => a + b, 0);
    const percentage = Math.round((totalScore / 20) * 100);
    const difficultyLevel = getDifficultyLevel(totalScore);
    const { groupScores, recommendedGroup } = getGroupRecommendation(subjectScores);

    // Save result to DB
    const result = await Result.create({
      studentId,
      studentName,
      subjectScores,
      totalScore,
      percentage,
      difficultyLevel,
      groupScores,
      recommendedGroup,
    });

    res.status(201).json({
      message: 'Test submitted successfully',
      result,
    });
  } catch (err) {
    console.error('Submit error:', err);
    res.status(500).json({ message: 'Error submitting test.' });
  }
});

// ── GET /api/results/:studentId ──────────────────────────────
router.get('/:studentId', protect, async (req, res) => {
  try {
    const result = await Result.findOne({ studentId: req.params.studentId })
      .sort({ createdAt: -1 });

    if (!result) {
      return res.status(404).json({ message: 'No result found for this student.' });
    }

    res.json({ result });
  } catch (err) {
    console.error('Fetch result error:', err);
    res.status(500).json({ message: 'Error fetching result.' });
  }
});

module.exports = router;
