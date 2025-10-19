import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./Home";
import Products from "./Products";

function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-[#2b0d0d] text-white fixed w-full z-50 shadow-md">
      <h1 className="text-2xl font-bold">Pharmora</h1>
      <input
        type="text"
        placeholder="Search medicines..."
        className="p-2 rounded-lg w-72 text-black shadow focus:ring-2 focus:ring-[#2b0d0d]"
      />
      <div className="flex space-x-6">
        <Link to="/" className="hover:text-gray-300 transition">Home</Link>
        <Link to="/products" className="hover:text-gray-300 transition">Products</Link>
        <a href="#" className="hover:text-gray-300 transition">Doctors</a>
        <a href="#" className="hover:text-gray-300 transition">Pharmacists</a>
        <a href="#" className="hover:text-gray-300 transition">Suppliers</a>
        <a href="#" className="hover:text-gray-300 transition">Admin</a>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <Navbar />
      <div className="pt-20"> {/* Push content below fixed navbar */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
