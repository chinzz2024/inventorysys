// In src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // Import the Toaster
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import StockReport from './components/StockReport';
import './App.css'; 

function App() {
  return (
    <Router>
      {/* Add Toaster for non-blocking notifications */}
      <Toaster position="top-right" reverseOrder={false} />
      
      <div className="App">
        <nav className="navbar">
          <div className="nav-brand">InventorySys</div>
          <div className="nav-links">
            <NavLink to="/">Product List</NavLink>
            <NavLink to="/create">Create Product</NavLink>
            <NavLink to="/report">Stock Report</NavLink>
          </div>
        </nav>

        <main className="content">
          <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/create" element={<ProductForm />} />
            <Route path="/report" element={<StockReport />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;