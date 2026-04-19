const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    studentName: { type: String, required: true },

    // Raw scores out of 4 per subject
    subjectScores: {
      Tamil: { type: Number, default: 0 },
      English: { type: Number, default: 0 },
      Maths: { type: Number, default: 0 },
      Science: { type: Number, default: 0 },
      Social: { type: Number, default: 0 },
    },

    totalScore: { type: Number, required: true },       // out of 20
    percentage: { type: Number, required: true },        // 0-100

    // "High Difficulty" | "Moderate Difficulty" | "Good Understanding"
    difficultyLevel: { type: String, required: true },

    // Group percentages computed from subject averages
    groupScores: {
      Arts: Number,           // avg(Tamil, English, Social)
      ComputerScience: Number, // avg(Maths, Science)
      Biology: Number,         // avg(Science, Social, Tamil)
    },

    recommendedGroup: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Result', resultSchema);
