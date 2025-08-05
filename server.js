const express = require('express');
const mongoose = require('mongoose');
const shortenerRoutes = require('./routes/shortener');
const logger = require('./middleware/logger');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(console.error);
  
app.use(express.json());
app.use(logger);
app.use('/', shortenerRoutes);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
