const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'https://learning-system-eta.vercel.app'
}));

app.use(express.json());

// MongoDB Connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB error:', err));

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