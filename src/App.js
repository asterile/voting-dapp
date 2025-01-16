// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Web3Provider } from './context/Web3Context';
import AdminDashboard from './pages/AdminDashboard';

import HomePage from './pages/HomePage';

function App() {
  return (
    <Web3Provider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            
          </Routes>
        </div>
      </Router>
    </Web3Provider>
  );
}

export default App;
