const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const { protect, teacherOnly } = require('../middleware/auth');

// ── GET /api/dashboard ───────────────────────────────────────
// Returns all student results + analytics summary
router.get('/', protect, teacherOnly, async (req, res) => {
  try {
    const { subject, difficulty, group } = req.query;

    // Build filter object from query params
    const filter = {};
    if (difficulty) filter.difficultyLevel = difficulty;
    if (group) filter.recommendedGroup = group;

    const results = await Result.find(filter).sort({ createdAt: -1 });

    // ── Analytics ────────────────────────────────────────────
    const totalStudents = results.length;

    const avgScore =
      totalStudents > 0
        ? Math.round(results.reduce((sum, r) => sum + r.totalScore, 0) / totalStudents)
        : 0;

    // Count students per difficulty level
    const difficultyDistribution = {
      'High Difficulty': 0,
      'Moderate Difficulty': 0,
      'Good Understanding': 0,
    };
    results.forEach((r) => {
      if (difficultyDistribution[r.difficultyLevel] !== undefined) {
        difficultyDistribution[r.difficultyLevel]++;
      }
    });

    // Count students per recommended group
    const groupDistribution = { Arts: 0, ComputerScience: 0, Biology: 0 };
    results.forEach((r) => {
      if (groupDistribution[r.recommendedGroup] !== undefined) {
        groupDistribution[r.recommendedGroup]++;
      }
    });

    // Average subject scores across all students
    const subjectAverages = { Tamil: 0, English: 0, Maths: 0, Science: 0, Social: 0 };
    if (totalStudents > 0) {
      results.forEach((r) => {
        Object.keys(subjectAverages).forEach((sub) => {
          subjectAverages[sub] += r.subjectScores[sub];
        });
      });
      Object.keys(subjectAverages).forEach((sub) => {
        subjectAverages[sub] = Math.round((subjectAverages[sub] / totalStudents / 4) * 100);
      });
    }

    res.json({
      results,
      analytics: {
        totalStudents,
        avgScore,
        difficultyDistribution,
        groupDistribution,
        subjectAverages,
      },
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ message: 'Error fetching dashboard data.' });
  }
});

module.exports = router;
