
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const telegramRoutes = require('./routes/telegram');
const bybitRoutes = require('./routes/bybit');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/telegram', telegramRoutes);
app.use('/api/bybit', bybitRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
