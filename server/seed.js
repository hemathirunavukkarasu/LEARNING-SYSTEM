// Run this once: node seed.js
// It creates 2 demo users and 20 questions (4 per subject)

require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');
const Question = require('./models/Question');

const questions = [
  // ── TAMIL (4 questions) ──────────────────────────────────
  {
    subject: 'Tamil',
    type: 'MCQ',
    question: 'தமிழ் எழுத்துக்களின் எண்ணிக்கை எத்தனை?',
    options: ['247', '216', '247', '256'],
    correctAnswer: '247',
  },
  {
    subject: 'Tamil',
    type: 'MCQ',
    question: 'தொல்காப்பியம் எந்த இலக்கணத்தை விவரிக்கிறது?',
    options: ['செய்யுள்', 'எழுத்து, சொல், பொருள்', 'நடை', 'இசை'],
    correctAnswer: 'எழுத்து, சொல், பொருள்',
  },
  {
    subject: 'Tamil',
    type: 'MATCH',
    question: 'பொருத்துக: தமிழ் இலக்கியங்கள்',
    matchPairs: [
      { left: 'திருக்குறள்',   right: 'திருவள்ளுவர்' },
      { left: 'சிலப்பதிகாரம்', right: 'இளங்கோவடிகள்' },
      { left: 'மணிமேகலை',     right: 'சீத்தலைச் சாத்தனார்' },
    ],
    shuffledOptions: ['சீத்தலைச் சாத்தனார்', 'திருவள்ளுவர்', 'இளங்கோவடிகள்'],
  },
  {
    subject: 'Tamil',
    type: 'PARAGRAPH',
    passage:
      'தமிழ் மொழி உலகின் பழமையான மொழிகளில் ஒன்றாகும். இது திராவிட மொழிக் குடும்பத்தைச் சேர்ந்தது. தமிழ் இலக்கியம் சங்க காலம் முதல் இன்று வரை தொடர்ந்து வளர்ந்து வருகிறது.',
    question: 'தமிழ் எந்த மொழிக் குடும்பத்தைச் சேர்ந்தது?',
    options: ['இந்தோ-ஆரிய', 'திராவிட', 'சீன-திபெத்திய', 'ஆஸ்திரோ-ஆசிய'],
    correctAnswer: 'திராவிட',
  },

  // ── ENGLISH (4 questions) ────────────────────────────────
  {
    subject: 'English',
    type: 'MCQ',
    question: 'Which of the following is a noun?',
    options: ['Run', 'Quickly', 'Beautiful', 'Happiness'],
    correctAnswer: 'Happiness',
  },
  {
    subject: 'English',
    type: 'MCQ',
    question: 'Choose the correct form: She ___ to school every day.',
    options: ['go', 'goes', 'going', 'went'],
    correctAnswer: 'goes',
  },
  {
    subject: 'English',
    type: 'MATCH',
    question: 'Match the words with their antonyms:',
    matchPairs: [
      { left: 'Happy', right: 'Sad'  },
      { left: 'Hot',   right: 'Cold' },
      { left: 'Fast',  right: 'Slow' },
    ],
    shuffledOptions: ['Slow', 'Sad', 'Cold'],
  },
  {
    subject: 'English',
    type: 'PARAGRAPH',
    passage:
      "The Sun is the star at the center of our Solar System. It is a nearly perfect sphere of hot plasma. The Sun's energy output supports almost all life on Earth via photosynthesis and drives Earth's climate and weather.",
    question: 'What process does the Sun\'s energy support on Earth?',
    options: ['Respiration', 'Photosynthesis', 'Fermentation', 'Digestion'],
    correctAnswer: 'Photosynthesis',
  },

  // ── MATHS (4 questions) ──────────────────────────────────
  {
    subject: 'Maths',
    type: 'MCQ',
    question: 'What is 15% of 200?',
    options: ['25', '30', '35', '40'],
    correctAnswer: '30',
  },
  {
    subject: 'Maths',
    type: 'MCQ',
    question: 'Solve: 3x + 7 = 22. What is x?',
    options: ['3', '4', '5', '6'],
    correctAnswer: '5',
  },
  {
    subject: 'Maths',
    type: 'MATCH',
    question: 'Match the shapes with their area formulas:',
    matchPairs: [
      { left: 'Circle',    right: 'πr²'       },
      { left: 'Rectangle', right: 'l × b'     },
      { left: 'Triangle',  right: '½ × b × h' },
    ],
    shuffledOptions: ['l × b', '½ × b × h', 'πr²'],
  },
  {
    subject: 'Maths',
    type: 'MCQ',
    question: 'What is the LCM of 4 and 6?',
    options: ['8', '12', '16', '24'],
    correctAnswer: '12',
  },

  // ── SCIENCE (4 questions) ────────────────────────────────
  {
    subject: 'Science',
    type: 'MCQ',
    question: 'Which gas is released during photosynthesis?',
    options: ['Carbon dioxide', 'Nitrogen', 'Oxygen', 'Hydrogen'],
    correctAnswer: 'Oxygen',
  },
  {
    subject: 'Science',
    type: 'MCQ',
    question: 'What is the unit of electric current?',
    options: ['Volt', 'Watt', 'Ohm', 'Ampere'],
    correctAnswer: 'Ampere',
  },
  {
    subject: 'Science',
    type: 'MATCH',
    question: 'Match the scientists with their discoveries:',
    matchPairs: [
      { left: 'Newton',   right: 'Gravity'               },
      { left: 'Einstein', right: 'Theory of Relativity'  },
      { left: 'Darwin',   right: 'Evolution'              },
    ],
    shuffledOptions: ['Evolution', 'Gravity', 'Theory of Relativity'],
  },
  {
    subject: 'Science',
    type: 'PARAGRAPH',
    passage:
      'Cells are the basic unit of life. There are two main types of cells: prokaryotic and eukaryotic. Prokaryotic cells, like bacteria, have no nucleus. Eukaryotic cells, found in plants and animals, have a membrane-bound nucleus.',
    question: 'Which type of cell has no nucleus?',
    options: ['Eukaryotic', 'Prokaryotic', 'Plant cell', 'Animal cell'],
    correctAnswer: 'Prokaryotic',
  },

  // ── SOCIAL (4 questions) ─────────────────────────────────
  {
    subject: 'Social',
    type: 'MCQ',
    question: 'Who was the first President of India?',
    options: ['Jawaharlal Nehru', 'Mahatma Gandhi', 'Dr. Rajendra Prasad', 'B.R. Ambedkar'],
    correctAnswer: 'Dr. Rajendra Prasad',
  },
  {
    subject: 'Social',
    type: 'MCQ',
    question: 'Which is the largest continent by area?',
    options: ['Africa', 'North America', 'Asia', 'Europe'],
    correctAnswer: 'Asia',
  },
  {
    subject: 'Social',
    type: 'MATCH',
    question: 'Match the countries with their capitals:',
    matchPairs: [
      { left: 'France', right: 'Paris'    },
      { left: 'Japan',  right: 'Tokyo'    },
      { left: 'Brazil', right: 'Brasília' },
    ],
    shuffledOptions: ['Tokyo', 'Brasília', 'Paris'],
  },
  {
    subject: 'Social',
    type: 'PARAGRAPH',
    passage:
      'The Indian Constitution came into effect on January 26, 1950. It is the longest written constitution in the world. Dr. B.R. Ambedkar is known as the chief architect of the Indian Constitution.',
    question: 'Who is the chief architect of the Indian Constitution?',
    options: ['Mahatma Gandhi', 'Jawaharlal Nehru', 'Dr. B.R. Ambedkar', 'Sardar Patel'],
    correctAnswer: 'Dr. B.R. Ambedkar',
  },
];

const users = [
  {
    name: 'Arun Kumar',
    email: 'student@test.com',
    password: 'student123',
    role: 'student',
    department: 'Science',
    course: 'Standard X',
    attendance: 85,
  },
  {
    name: 'Ms. Priya',
    email: 'teacher@test.com',
    password: 'teacher123',
    role: 'teacher',
    department: 'Faculty',
    course: 'N/A',
    attendance: 100,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Question.deleteMany({});
    await Student.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Insert questions
    await Question.insertMany(questions);
    console.log(`✅ Inserted ${questions.length} questions`);

    // Insert users (password hashing happens via pre-save hook)
    for (const u of users) {
      await Student.create(u);
    }
    console.log(`✅ Created ${users.length} users`);

    console.log('\n── Demo Credentials ─────────────────────');
    console.log('Student → student@test.com / student123');
    console.log('Teacher → teacher@test.com / teacher123');
    console.log('─────────────────────────────────────────\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
