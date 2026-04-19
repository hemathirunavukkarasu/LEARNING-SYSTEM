const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'https://learning-system-eta.vercel.app'
}));

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/report', require('./routes/report'));
app.use('/api/results', require('./routes/results'));

app.get('/', (req, res) => {
  res.send('Learning System Server is running! 🚀');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});