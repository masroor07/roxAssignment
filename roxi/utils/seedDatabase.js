require('dotenv').config();
console.log('MONGO_URI:', process.env.MONGO_URI); // Debugging line to ensure MONGO_URI is loaded
const axios = require('axios');
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction'); // Adjust the path as needed

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Database connected');

    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const transactions = response.data;

    await Transaction.deleteMany({});
    await Transaction.insertMany(transactions);
    console.log('Database seeded');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database disconnected');
  }
};

seedDatabase();
