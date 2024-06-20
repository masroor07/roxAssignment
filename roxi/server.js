const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const routes = require('./routes/index');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/', routes);
app.use(cors());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
