import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TransactionStatistics = () => {
  const [selectedMonth, setSelectedMonth] = useState('March'); // Default selected month
  const [statistics, setStatistics] = useState({
    totalSaleAmount: 0,
    totalSoldItems: 0,
    totalNotSoldItems: 0
  });

  useEffect(() => {
    fetchStatistics(selectedMonth);
  }, [selectedMonth]);

  const fetchStatistics = async (month) => {
    try {
      const response = await axios.get(`/transactions/statistics?month=${month}`);
      setStatistics(response.data);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  return (
    <div>
      <h2>Transaction Statistics</h2>
      <label htmlFor="month">Select Month: </label>
      <select id="month" onChange={handleMonthChange} value={selectedMonth}>
        <option value="January">January</option>
        <option value="February">February</option>
        <option value="March">March</option>
        <option value="April">April</option>
        <option value="May">May</option>
        <option value="June">June</option>
        <option value="July">July</option>
        <option value="August">August</option>
        <option value="September">September</option>
        <option value="October">October</option>
        <option value="November">November</option>
        <option value="December">December</option>
      </select>
      <div>
        <h3>Selected Month: {selectedMonth}</h3>
        <p>Total Sale Amount: ${typeof statistics.totalSaleAmount === 'number' ? statistics.totalSaleAmount.toFixed(2) : 'N/A'}</p>
        <p>Total Sold Items: {statistics.totalSoldItems}</p>
        <p>Total Not Sold Items: {statistics.totalNotSoldItems}</p>
      </div>
    </div>
  );
};

export default TransactionStatistics;
