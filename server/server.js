const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'https://learning-system-eta.vercel.app'
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Learning System Server is running! 🚀');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});