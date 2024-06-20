const express = require('express');
const router = express.Router();
const transactionRoutes = require('./transactions');

router.use('/transactions', transactionRoutes);

module.exports = router;
