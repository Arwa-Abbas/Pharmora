import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleSignOut = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Hide navbar for dashboards
  if (
    location.pathname.includes("doctor-dashboard") ||
    location.pathname.includes("pharmacist-dashboard") ||
    location.pathname.includes("supplier-dashboard") ||
    location.pathname.includes("admin-dashboard")
  ) {
    return null;
  }

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md shadow-sm z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
        {/* Left side: Logo */}
        <div className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
          Pharmora
        </div>

        {/* Middle: Search bar */}
        <input
          type="text"
          placeholder="Search medicines..."
          className="p-2 rounded-lg w-72 text-gray-800 shadow focus:ring-2 focus:ring-cyan-600 outline-none"
        />

        {/* Right side: Navigation links + buttons */}
        <div className="flex items-center space-x-6">
          <Link to="/" className="text-gray-700 hover:text-cyan-600 transition">Home</Link>
          <Link to="/products" className="text-gray-700 hover:text-cyan-600 transition">Products</Link>
          <Link to="/doctors" className="text-gray-700 hover:text-cyan-600 transition">Doctors</Link>
          <Link to="/suppliers" className="text-gray-700 hover:text-cyan-600 transition">Suppliers</Link>
          <Link to="/pharmacists" className="text-gray-700 hover:text-cyan-600 transition">Pharmacists</Link>

          {!user ? (
            <Link to="/login">
              <button className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300">
                Sign In
              </button>
            </Link>
          ) : (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-700">Welcome, {user.role}</span>

              {/* My Account button */}
              <button
                onClick={() => navigate("/patient-dashboard")}
                className="px-4 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded transition"
              >
                My Account
              </button>

              {/* View Cart button */}
              <button
                onClick={() => navigate("/cart")}
                className="px-4 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded transition"
              >
                View Cart
              </button>

              {/* Sign Out button */}
              <button
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 px-4 py-1 rounded text-white transition"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
