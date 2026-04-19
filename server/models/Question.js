const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  subject: {
    type: String,
    enum: ['Tamil', 'English', 'Maths', 'Science', 'Social'],
    required: true,
  },
  // MCQ = multiple choice, MATCH = match the following, PARAGRAPH = reading comprehension
  type: { type: String, enum: ['MCQ', 'MATCH', 'PARAGRAPH'], required: true },
  question: { type: String, required: true },

  // Used by MCQ and PARAGRAPH questions
  options: [String],
  correctAnswer: { type: String },

  // Used by MATCH questions — pairs of left and right items
  matchPairs: [
    {
      left: String,
      right: String,
    },
  ],

  // Shuffled right-side options shown to the student for MATCH questions
  shuffledOptions: [String],

  // Optional reading passage for PARAGRAPH type
  passage: { type: String },
});

module.exports = mongoose.model('Question', questionSchema);
