const express = require('express');
const router  = express.Router();
const Result  = require('../models/Result');
const Student = require('../models/Student');
const { protect } = require('../middleware/auth');

// ── Static knowledge base ─────────────────────────────────────────────────────

const COURSE_INTRO = {
  Arts: `The Arts stream nurtures creativity, critical thinking, and humanistic inquiry. 
Students explore Language, History, Geography, Political Science, and allied subjects, 
preparing them for careers in Law, Civil Services, Journalism, Education, and the Social Sciences.`,

  ComputerScience: `The Computer Science stream blends rigorous Mathematics with Applied Science and 
Informatics. Students develop analytical and computational skills that open pathways 
into Engineering, Software Development, Data Science, Research, and Technology-driven industries.`,

  Biology: `The Biology stream integrates Life Sciences with Chemistry and Mathematics. 
Students build a strong foundation for careers in Medicine, Pharmacy, Biotechnology, 
Environmental Science, and Allied Health Professions.`,

  General: `This General programme provides a broad, balanced curriculum covering Languages, 
Mathematics, Science, and Social Studies, equipping students with core competencies 
for higher education and diverse career pathways.`,
};

const SUBJECT_BOOKS = {
  Tamil: [
    { title: 'Tamil Ilakkanam – Comprehensive Guide', author: 'Dr. S. Ilakkuvan', type: 'Revision' },
    { title: 'SURA Tamil Model Papers (Std X)', author: 'SURA Publications', type: 'Practice' },
    { title: 'Samacheer Kalvi Tamil Guide', author: 'Navodaya', type: 'Reference' },
  ],
  English: [
    { title: 'Wren & Martin – High School English Grammar', author: 'P.C. Wren', type: 'Revision' },
    { title: 'NCERT Footprints Without Feet', author: 'NCERT', type: 'Textbook' },
    { title: 'Oxford English Grammar Course', author: 'Michael Swan', type: 'Supplementary' },
  ],
  Maths: [
    { title: 'R.D. Sharma Mathematics (Class 10)', author: 'R.D. Sharma', type: 'Revision' },
    { title: 'NCERT Exemplar Problems – Mathematics', author: 'NCERT', type: 'Practice' },
    { title: 'Vedic Maths for Quick Calculations', author: 'Tirthaji Maharaja', type: 'Speed' },
  ],
  Science: [
    { title: 'NCERT Science (Class 10)', author: 'NCERT', type: 'Textbook' },
    { title: 'Lakhmir Singh & Manjit Kaur – Science', author: 'S. Chand', type: 'Revision' },
    { title: 'S. Chand Science Class 10', author: 'N.K. Chowdhury', type: 'Supplementary' },
  ],
  Social: [
    { title: 'NCERT Social Science Class 10 (Set)', author: 'NCERT', type: 'Textbook' },
    { title: 'Arihant Social Science Guide', author: 'Arihant Experts', type: 'Revision' },
    { title: 'Together with Social Science', author: 'Rachna Sagar', type: 'Practice' },
  ],
};

const SUBJECT_FEEDBACK = {
  Tamil: {
    low:  'Focus on grammar rules (ezhuthu, sol, porul), practice comprehension passages daily, and revise Thirukkural couplets.',
    mid:  'Strengthen essay writing and poem analysis. Attempt previous year question papers.',
    high: 'Excellent Tamil proficiency! Explore classical literature to deepen your understanding.',
  },
  English: {
    low:  'Revise tense rules, parts of speech, and reading comprehension strategies. Read an English newspaper daily.',
    mid:  'Work on essay structure and vocabulary. Practice precis writing and grammar exercises.',
    high: 'Outstanding English skills! Consider advanced reading to refine your expression.',
  },
  Maths: {
    low:  'Master basic arithmetic, LCM/HCF, and algebraic equations. Solve 10 problems per day without a calculator.',
    mid:  'Focus on geometry proofs, mensuration, and statistics. Time yourself while solving problems.',
    high: 'Great Maths performance! Challenge yourself with Olympiad-level problems.',
  },
  Science: {
    low:  'Revise all chapter diagrams, learn SI units, and practice explaining concepts in your own words.',
    mid:  'Focus on chemical reactions, electricity, and life processes. Create concept maps for Biology topics.',
    high: 'Excellent Science understanding! Explore NCERT Exemplar problems for deeper challenge.',
  },
  Social: {
    low:  'Make timeline charts for History, political maps for Geography, and flash cards for civics terms.',
    mid:  'Practise map pointing, improve answer structure, and revise cause-and-effect relationships in History.',
    high: 'Superb Social Science grasp! Try current affairs reading to connect syllabus topics to real events.',
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getLevel(pct) {
  if (pct >= 75) return 'high';
  if (pct >= 50) return 'mid';
  return 'low';
}

function buildSubjectAnalysis(subjectScores) {
  return Object.entries(subjectScores).map(([subject, rawScore]) => {
    const pct   = Math.round((rawScore / 4) * 100);
    const level = getLevel(pct);
    return {
      subject,
      rawScore,
      maxScore: 4,
      percentage: pct,
      grade: pct >= 75 ? 'A' : pct >= 50 ? 'B' : 'C',
      status: pct >= 75 ? '✅ Good' : pct >= 50 ? '⚠️ Average' : '❌ Needs Improvement',
      feedback: SUBJECT_FEEDBACK[subject]?.[level] || '',
      recommendedBooks: level !== 'high' ? SUBJECT_BOOKS[subject] : [],
      needsRemedial: pct < 50,
    };
  });
}

function getMotivationalMessage(percentage, difficultyLevel) {
  if (percentage >= 75) {
    return "🌟 Fantastic work! Your dedication is truly paying off. Keep pushing boundaries and aim for excellence in every subject.";
  }
  if (percentage >= 50) {
    return "💪 Good effort! You're on the right track. With a little more focus on the weaker areas, you can reach the top tier.";
  }
  return "🚀 Every expert was once a beginner. Identify your weak spots, use the recommended resources, and don't hesitate to ask your teacher for help. You can do this!";
}

function getAttendanceStatus(attendance) {
  if (attendance >= 80) {
    return {
      allowed: true,
      badge: '✅ Eligible',
      message: `Attendance ${attendance}% — Above the 80% threshold. Student is eligible to sit for tests and examinations.`,
      action: null,
    };
  }
  return {
    allowed: false,
    badge: '🚨 Below Threshold',
    message: `Attendance ${attendance}% — Below the required 80%. Student is NOT eligible for tests until attendance improves.`,
    action: 'Immediate follow-up required. Parent meeting recommended. Student must attend all remaining sessions to reach 80%.',
  };
}


// ── GET /api/report/:studentId ────────────────────────────────────────────────
router.get('/:studentId', protect, async (req, res) => {
  try {
    const studentId = req.params.studentId;

    // Only the student themselves or a teacher may access the report
    if (req.user.role !== 'teacher' && req.user.userId !== studentId) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const [student, result] = await Promise.all([
      Student.findById(studentId).select('-password'),
      Result.findOne({ studentId }).sort({ createdAt: -1 }),
    ]);

    if (!student) return res.status(404).json({ message: 'Student not found.' });
    if (!result)  return res.status(404).json({ message: 'No test result found for this student.' });

    const subjectAnalysis  = buildSubjectAnalysis(result.subjectScores);
    const attendanceStatus = getAttendanceStatus(student.attendance);
    const weakSubjects     = subjectAnalysis.filter(s => s.needsRemedial);
    const remedialSessions = weakSubjects.map(s => ({
      subject: s.subject,
      sessions: [
        `Extra class every Monday & Wednesday (1 hr) – ${s.subject} fundamentals`,
        `Online resources: Khan Academy / BYJU's – ${s.subject} module`,
        `Weekly doubt-clearing session with subject teacher`,
      ],
    }));

    const motivationalMessage = getMotivationalMessage(result.percentage, result.difficultyLevel);
    const courseGroup  = result.recommendedGroup || 'General';
    const courseIntro  = COURSE_INTRO[courseGroup] || COURSE_INTRO.General;

    const nextSteps = [
      attendanceStatus.allowed
        ? '✅ Maintain attendance above 80% to stay eligible for all tests.'
        : '🚨 Priority: Improve attendance to above 80% immediately.',
      weakSubjects.length > 0
        ? `📚 Start revision for: ${weakSubjects.map(s => s.subject).join(', ')} using the recommended books.`
        : '📚 No weak subjects — explore advanced materials for challenge.',
      'Meet the class teacher once a week to track progress.',
      'Complete at least one past-year model paper per subject before the next exam.',
      `Target for next test: ${Math.min(result.percentage + 15, 100)}% overall score.`,
    ];

    res.json({
      report: {
        generatedAt: new Date().toISOString(),

        // 1. Student Info
        studentInfo: {
          id:         student._id,
          name:       student.name,
          email:      student.email,
        },

        // 2. Department / Course
        departmentInfo: {
          department: student.department,
          course:     student.course,
          recommendedGroup: result.recommendedGroup,
          courseIntroduction: courseIntro,
        },

        // 3. Exam Marks
        examSummary: {
          totalScore:     result.totalScore,
          maxScore:       20,
          percentage:     result.percentage,
          difficultyLevel: result.difficultyLevel,
          groupScores:    result.groupScores,
          takenAt:        result.createdAt,
        },

        // 4. Subject-wise Feedback
        subjectAnalysis,

        // 5. Attendance Status
        attendanceStatus: {
          percentage: student.attendance,
          ...attendanceStatus,
        },

        // 7. Recommended Actions (books + remedial)
        recommendedActions: {
          books:           subjectAnalysis.filter(s => s.recommendedBooks.length).map(s => ({
            subject: s.subject,
            books: s.recommendedBooks,
          })),
          remedialSessions,
        },

        // 8. Motivational Feedback
        motivationalFeedback: motivationalMessage,

        // 9. Next Steps
        nextSteps,
      },
    });
  } catch (err) {
    console.error('Report error:', err);
    res.status(500).json({ message: 'Error generating report.' });
  }
});

// ── GET /api/report (teacher: all students) ───────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can access all reports.' });
    }

    const results = await Result.find().sort({ createdAt: -1 });
    const studentIds = [...new Set(results.map(r => r.studentId.toString()))];
    const students   = await Student.find({ _id: { $in: studentIds } }).select('-password');

    const studentMap = {};
    students.forEach(s => { studentMap[s._id.toString()] = s; });

    const summaries = results.map(result => {
      const student = studentMap[result.studentId.toString()];
      if (!student) return null;

      const subjectAnalysis  = buildSubjectAnalysis(result.subjectScores);
      const attendanceStatus = getAttendanceStatus(student.attendance);
      const weakSubjects     = subjectAnalysis.filter(s => s.needsRemedial);

      return {
        studentId:       student._id,
        studentName:     student.name,
        course:          student.course,
        department:      student.department,
        totalScore:      result.totalScore,
        percentage:      result.percentage,
        difficultyLevel: result.difficultyLevel,
        recommendedGroup: result.recommendedGroup,
        attendance:      student.attendance,
        attendanceAllowed: attendanceStatus.allowed,
        weakSubjects:    weakSubjects.map(s => s.subject),
        needsRemedial:   weakSubjects.length > 0,
        takenAt:         result.createdAt,
      };
    }).filter(Boolean);

    res.json({ reports: summaries, total: summaries.length });
  } catch (err) {
    console.error('All-reports error:', err);
    res.status(500).json({ message: 'Error fetching reports.' });
  }
});
module.exports = router;
