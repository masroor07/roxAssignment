import React, { useState, useEffect } from 'react';

const TransactionsTable = () => {
  const [transactions, setTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(3); // March by default
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handleMonthChange = (e) => {
    setSelectedMonth(parseInt(e.target.value));
    setPage(1); // Reset page when month changes
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleSearch = () => {
    // Fetch transactions based on selected month and search text
    fetchTransactions(selectedMonth, searchText, page);
  };

  const fetchTransactions = async (month, search, page) => {
    try {
      const response = await fetch(`http://localhost:3000/transactions/?month=${month}&search=${search}&page=${page}`);
      const data = await response.json();
      setTransactions(data.transactions);
      setTotalPages(Math.ceil(data.totalCount / 10)); // Assuming 10 items per page
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  useEffect(() => {
    fetchTransactions(selectedMonth, searchText, page);
  }, [selectedMonth, searchText, page]);

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  return (
    <div>
      <label htmlFor="month">Select Month: </label>
      <select id="month" onChange={handleMonthChange} value={selectedMonth}>
        {/* Options for January to December */}
        {[...Array(12)].map((_, index) => (
          <option key={index + 1} value={index + 1}>{new Date(2000, index).toLocaleString('default', { month: 'long' })}</option>
        ))}
      </select>
      <input type="text" placeholder="Search..." value={searchText} onChange={handleSearchChange} />
      <button onClick={handleSearch}>Search</button>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction._id}>
              <td>{transaction.title}</td>
              <td>{transaction.description}</td>
              <td>{transaction.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handlePrevPage}>Previous</button>
      <button onClick={handleNextPage}>Next</button>
    </div>
  );
};

export default TransactionsTable;