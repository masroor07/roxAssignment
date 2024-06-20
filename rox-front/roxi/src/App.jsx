import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TransactionsTable from './TransactionTable';
import TransactionStatistics from './TransactionsStatistics';

const App = () => {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Transactions</Link>
            </li>
            <li>
              <Link to="/statistics">Statistics</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/statistics" element={<TransactionStatistics />} />
          <Route path="/" element={<TransactionsTable />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
