const Transaction = require('../models/Transaction');

const getTransactions = async (req, res) => {
  const { search, page = 1, perPage = 10, month } = req.query;

  const query = {
    dateOfSale: {
      $gte: new Date(`${month}-01`),
      $lt: new Date(`${month}-31`)
    }
  };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { price: { $regex: search, $options: 'i' } }
    ];
  }

  const transactions = await Transaction.find(query)
    .skip((page - 1) * perPage)
    .limit(parseInt(perPage));

  res.json(transactions);
};

const getStatistics = async (req, res) => {
  const { month } = req.query;

  const query = {
    dateOfSale: {
      $gte: new Date(`${month}-01`),
      $lt: new Date(`${month}-31`)
    }
  };

  const totalSaleAmount = await Transaction.aggregate([
    { $match: query },
    { $group: { _id: null, totalAmount: { $sum: '$price' } } }
  ]);

  const totalSoldItems = await Transaction.countDocuments({ ...query, sold: true });
  const totalNotSoldItems = await Transaction.countDocuments({ ...query, sold: false });

  res.json({
    totalSaleAmount: totalSaleAmount[0]?.totalAmount || 0,
    totalSoldItems,
    totalNotSoldItems
  });
};

const getBarChart = async (req, res) => {
  const { month } = req.query;

  const query = {
    dateOfSale: {
      $gte: new Date(`${month}-01`),
      $lt: new Date(`${month}-31`)
    }
  };

  const priceRanges = [
    { range: '0-100', min: 0, max: 100 },
    { range: '101-200', min: 101, max: 200 },
    { range: '201-300', min: 201, max: 300 },
    { range: '301-400', min: 301, max: 400 },
    { range: '401-500', min: 401, max: 500 },
    { range: '501-600', min: 501, max: 600 },
    { range: '601-700', min: 601, max: 700 },
    { range: '701-800', min: 701, max: 800 },
    { range: '801-900', min: 801, max: 900 },
    { range: '901-above', min: 901, max: Infinity }
  ];

  const barChartData = await Promise.all(priceRanges.map(async range => {
    const count = await Transaction.countDocuments({
      ...query,
      price: { $gte: range.min, $lte: range.max }
    });

    return { range: range.range, count };
  }));

  res.json(barChartData);
};

const getPieChart = async (req, res) => {
  const { month } = req.query;

  const query = {
    dateOfSale: {
      $gte: new Date(`${month}-01`),
      $lt: new Date(`${month}-31`)
    }
  };

  const pieChartData = await Transaction.aggregate([
    { $match: query },
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);

  res.json(pieChartData);
};

const getCombinedData = async (req, res) => {
  const { month } = req.query;

  const statistics = await getStatistics({ query: { month } });
  const barChart = await getBarChart({ query: { month } });
  const pieChart = await getPieChart({ query: { month } });

  res.json({
    statistics,
    barChart,
    pieChart
  });
};

module.exports = {
  getTransactions,
  getStatistics,
  getBarChart,
  getPieChart,
  getCombinedData
};
