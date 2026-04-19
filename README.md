# 🎓 Intelligent Learning Difficulty Detection System

A full-stack MERN application that assesses students with 20 mixed questions,
detects difficulty levels, and recommends academic groups.

---

## 📁 Project Structure

```
learning-system/
├── server/                   ← Node.js + Express backend
│   ├── models/
│   │   ├── Student.js        ← User schema (bcrypt password hashing)
│   │   ├── Question.js       ← MCQ / Match / Paragraph schema
│   │   └── Result.js         ← Test result + group scores schema
│   ├── routes/
│   │   ├── auth.js           ← POST /login, POST /register
│   │   ├── questions.js      ← GET /questions (20 total, 4/subject)
│   │   ├── results.js        ← POST /submit, GET /results/:id
│   │   └── dashboard.js      ← GET /dashboard (teacher only)
│   ├── middleware/
│   │   └── auth.js           ← JWT protect + teacherOnly guards
│   ├── index.js              ← Express app entry point
│   ├── seed.js               ← Seeds 20 questions + 2 demo users
│   ├── .env                  ← MongoDB URI + JWT secret
│   └── package.json
│
└── client/                   ← React frontend
    ├── src/
    │   ├── api/
    │   │   └── axios.js      ← Axios instance with JWT interceptor
    │   ├── context/
    │   │   ├── AuthContext.js ← Global user/login/logout state
    │   │   └── TestContext.js ← Shares test result across pages
    │   ├── pages/
    │   │   ├── LoginPage.js        ← Login + Register
    │   │   ├── TestPage.js         ← 20 questions (MCQ, Match, Paragraph)
    │   │   ├── ResultPage.js       ← Score + difficulty level
    │   │   ├── GroupSuggestionPage.js ← Group recommendation
    │   │   └── TeacherDashboard.js ← All results + analytics
    │   ├── App.js            ← Routes + protected route guards
    │   ├── App.css           ← Global styles
    │   └── index.js          ← React entry point
    └── package.json
```

---

## 🚀 Setup Instructions

### Step 1 — Install backend dependencies
```bash
cd server
npm install
```

### Step 2 — Configure environment variables
Edit `server/.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/learning_system
JWT_SECRET=change_this_to_a_long_random_string
```

### Step 3 — Seed the database
```bash
cd server
npm run seed
```
This creates 20 questions (4 per subject) and 2 demo accounts.

### Step 4 — Start the backend
```bash
npm run dev
# Server runs on http://localhost:5000
```

### Step 5 — Install frontend dependencies (new terminal)
```bash
cd client
npm install
```

### Step 6 — Start the frontend
```bash
npm start
# App opens at http://localhost:3000
```

---

## 🔑 Demo Credentials

| Role    | Email               | Password    |
|---------|---------------------|-------------|
| Student | student@test.com    | student123  |
| Teacher | teacher@test.com    | teacher123  |

---

## 📋 Page Flow

```
/login  →  /test  →  /result  →  /group
                                  ↑
/dashboard  (teacher only)
```

---

## 🧠 Scoring Logic

| Total Score | Difficulty Level     |
|-------------|----------------------|
| 0 – 7       | High Difficulty      |
| 8 – 14      | Moderate Difficulty  |
| 15 – 20     | Good Understanding   |

### Group Formula
| Group            | Formula                         |
|------------------|---------------------------------|
| Arts             | avg(Tamil%, English%, Social%)  |
| Computer Science | avg(Maths%, Science%)           |
| Biology          | avg(Science%, Maths%)           |

---

## 🔒 Security Features
- Passwords hashed with **bcrypt** (10 rounds)
- Authentication via **JWT tokens** (8 hour expiry)
- Protected API routes via middleware
- Teacher-only dashboard route guard
