# 📋 Performance Report Feature — Integration Guide

## What Was Added

This document describes all new files and changes made to implement the **Student Performance Management Report** feature.

---

## New Files

### Backend
| File | Purpose |
|------|---------|
| `server/routes/report.js` | Core report engine — generates the full 9-section report per student, plus a teacher summary of all students |

### Frontend
| File | Purpose |
|------|---------|
| `client/src/pages/ReportPage.js` | Student-facing full performance report UI |
| `client/src/pages/AllReportsPage.js` | Teacher-facing overview table of all students' reports with filters |

---

## Modified Files

| File | Change |
|------|--------|
| `server/models/Student.js` | Added `parentEmail`, `department`, `course`, `attendance` fields |
| `server/index.js` | Registered `/api/report` route |
| `server/routes/auth.js` | Exposed `userId` in login response |
| `server/seed.js` | Updated demo student with `attendance`, `department`, `course`, `parentEmail` |
| `client/src/App.js` | Added `/report` (student) and `/reports` (teacher) routes |
| `client/src/pages/GroupSuggestionPage.js` | Added "View Full Performance Report" button |
| `client/src/pages/TeacherDashboard.js` | Added "All Reports" button linking to `/reports` |

---

## New API Endpoints

### `GET /api/report/:studentId`
- **Auth:** JWT required (student can only access own report; teacher can access any)
- **Returns:** Full 9-section performance report JSON

**Response shape:**
```json
{
  "report": {
    "generatedAt": "...",
    "studentInfo": { "id", "name", "email", "parentEmail" },
    "departmentInfo": { "department", "course", "recommendedGroup", "courseIntroduction" },
    "examSummary": { "totalScore", "maxScore", "percentage", "difficultyLevel", "groupScores", "takenAt" },
    "subjectAnalysis": [
      { "subject", "rawScore", "maxScore", "percentage", "grade", "status",
        "feedback", "recommendedBooks", "needsRemedial" }
    ],
    "attendanceStatus": { "percentage", "allowed", "badge", "message", "action" },
    "parentEmail": { "to", "subject", "body" },
    "recommendedActions": { "books": [...], "remedialSessions": [...] },
    "motivationalFeedback": "...",
    "nextSteps": ["..."]
  }
}
```

### `GET /api/report`
- **Auth:** Teacher JWT required
- **Returns:** Summary list of all students' reports with key flags

---

## Report Sections (9 Total)

1. **Student Info** — name, email, department, course, recommended stream
2. **Course Introduction** — contextual description of the student's recommended stream (Arts / CS / Biology)
3. **Exam Summary** — total score, percentage, difficulty badge, group scores
4. **Subject-wise Feedback** — per-subject grade, progress bar, personalised feedback text
5. **Attendance Status** — eligibility check (≥80% = eligible, <80% = flagged for follow-up)
6. **Parental Communication** — pre-drafted parent email with full summary (one-click copy)
7. **Recommended Actions** — model revision books per weak subject + remedial session schedule
8. **Motivational Feedback** — personalised encouragement message based on performance tier
9. **Next Steps** — concrete action plan with target score for next exam

---

## Navigation Flow

```
Student:  Login → Test → Result → Group Suggestion → 📋 View Full Report
Teacher:  Login → Dashboard → 📋 All Reports (filterable table)
```

---

## Setting Student Attendance & Profile

Currently attendance and department are set in `seed.js` for the demo user.
In production, add a teacher-facing form or API endpoint:

```
PATCH /api/students/:id
Body: { attendance: 85, department: "Science", course: "Standard X", parentEmail: "parent@mail.com" }
```

---

## Attendance Rule

| Attendance | Status | Test Eligibility |
|-----------|--------|-----------------|
| ≥ 80% | ✅ Eligible | Can sit all tests |
| < 80% | 🚨 Flagged | Blocked + parent follow-up triggered |

