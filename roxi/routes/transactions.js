// routes/transactions.js

const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// List all transactions with search and pagination
router.get('/', async (req, res) => {
  const { page = 1, perPage = 10, search = '' } = req.query;
  const query = {
    $or: [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ]
  };

  try {
    const transactions = await Transaction.find(query)
      .skip((page - 1) * perPage)
      .limit(Number(perPage));
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a route for /transactions/statistics
router.get('/statistics', async (req, res) => {
  try {
    const totalSaleAmount = await Transaction.aggregate([
      { $match: { /* your query to filter transactions for the selected month */ } },
      { $group: { _id: null, totalSaleAmount: { $sum: "$price" } } }
    ]);

    const totalSoldItems = await Transaction.countDocuments({ /* your query to filter transactions for the selected month */ });

    const totalNotSoldItems = await Transaction.countDocuments({ sold: false, /* your query to filter transactions for the selected month */ });

    res.json({ totalSaleAmount, totalSoldItems, totalNotSoldItems });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a route for /transactions/bar-chart
router.get('/bar-chart', async (req, res) => {
  try {
    const priceRanges = [
      { range: '0 - 100', count: await Transaction.countDocuments({ price: { $gte: 0, $lte: 100 } }) },
      { range: '101 - 200', count: await Transaction.countDocuments({ price: { $gte: 101, $lte: 200 } }) },
      { range: '201 - 300', count: await Transaction.countDocuments({ price: { $gte: 201, $lte: 300 } }) },
      { range: '301 - 400', count: await Transaction.countDocuments({ price: { $gte: 301, $lte: 400 } }) },
      { range: '401 - 500', count: await Transaction.countDocuments({ price: { $gte: 401, $lte: 500 } }) },
      { range: '501 - 600', count: await Transaction.countDocuments({ price: { $gte: 501, $lte: 600 } }) },
      { range: '601 - 700', count: await Transaction.countDocuments({ price: { $gte: 601, $lte: 700 } }) },
      { range: '701 - 800', count: await Transaction.countDocuments({ price: { $gte: 701, $lte: 800 } }) },
      { range: '801 - 900', count: await Transaction.countDocuments({ price: { $gte: 801, $lte: 900 } }) },
      { range: '901 - above', count: await Transaction.countDocuments({ price: { $gte: 901 } }) }
    ];

    res.json(priceRanges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a route for /transactions/pie-chart
router.get('/pie-chart', async (req, res) => {
  try {
    const categories = await Transaction.aggregate([
      { $match: { /* your query to filter transactions for the selected month */ } },
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/pie-chart-sort', async (req, res) => {
    try {
      const { month } = req.query;
  
      // Parse the month parameter into a valid date range
      const monthIndex = parseInt(month.split('-')[0]) - 1; // months are zero-indexed in JavaScript Date object
      const startDate = new Date(0); // The 0 date is the Unix epoch
      startDate.setUTCMonth(monthIndex);
      const endDate = new Date(startDate);
      endDate.setUTCMonth(startDate.getUTCMonth() + 1); // Setting the month to the next month gets the last day of the selected month
  
      // Find transactions within the selected month
      const transactions = await Transaction.find({
        dateOfSale: {
          $gte: startDate,
          $lt: endDate
        }
      });
  
      // Calculate categories
      const categories = transactions.reduce((acc, transaction) => {
        if (!acc[transaction.category]) {
          acc[transaction.category] = 0;
        }
        acc[transaction.category]++;
        return acc;
      }, {});
  
      // Format the response
      const categoryList = Object.keys(categories).map(category => ({
        category,
        count: categories[category]
      }));
  
      res.json(categoryList);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

// Add a route for /transactions/combined
router.get('/combined', async (req, res) => {
    const { month } = req.query;
  
    try {
      const transactions = await Transaction.aggregate([
        {
          $addFields: {
            month: { $month: { date: "$dateOfSale", timezone: "+00:00" } },
            day: { $dayOfMonth: { date: "$dateOfSale", timezone: "+00:00" } }
          }
        },
        {
          $match: {
            month: Number(month.split('-')[1]), // Extract month from query param
            day: Number(month.split('-')[0]) // Extract day from query param
          }
        }
      ]);
  
      // Calculate total sale amount
      const totalSaleAmount = transactions.reduce((total, transaction) => total + transaction.price, 0);
  
      // Calculate total sold and not sold items
      const totalSoldItems = transactions.filter(transaction => transaction.sold).length;
      const totalNotSoldItems = transactions.filter(transaction => !transaction.sold).length;
  
      // Calculate price ranges
      const priceRanges = [
        { range: '0 - 100', count: transactions.filter(transaction => transaction.price >= 0 && transaction.price <= 100).length },
        { range: '101 - 200', count: transactions.filter(transaction => transaction.price >= 101 && transaction.price <= 200).length },
        // Add more ranges as needed
      ];
  
      // Calculate categories
      const categories = transactions.reduce((acc, transaction) => {
        if (!acc[transaction.category]) {
          acc[transaction.category] = 0;
        }
        acc[transaction.category]++;
        return acc;
      }, {});
  
      res.json({ transactions, totalSaleAmount, totalSoldItems, totalNotSoldItems, priceRanges, categories });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
module.exports = router;
