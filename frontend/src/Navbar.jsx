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

  // Hide navbar entirely for dashboards (they have their own nav)
  if (
    location.pathname.includes("doctor-dashboard") ||
    location.pathname.includes("pharmacist-dashboard") ||
    location.pathname.includes("supplier-dashboard") ||
    location.pathname.includes('admin-dashboard')
  ) {
    return null;
  }

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-[#2b0d0d] text-white fixed w-full z-50 shadow-md">
      <h1 className="text-2xl font-bold">Pharmora</h1>

      <input
        type="text"
        placeholder="Search medicines..."
        className="p-2 rounded-lg w-72 text-black shadow focus:ring-2 focus:ring-[#2b0d0d]"
      />

      <div className="flex space-x-6 items-center">
        <Link to="/" className="hover:text-gray-300 transition">Home</Link>
        <Link to="/products" className="hover:text-gray-300 transition">Products</Link>
        <Link to="/doctors" className="hover:text-gray-300 transition">Doctors</Link>
        <Link to="/pharmacists" className="hover:text-gray-300 transition">Pharmacists</Link>
        <Link to="/suppliers" className="hover:text-gray-300 transition">Suppliers</Link>

        {!user ? (
          <Link to="/login">
            <button className="bg-green-600 hover:bg-green-700 px-4 py-1 rounded text-white transition">
              Sign In
            </button>
          </Link>
        ) : (
          <>
            <span className="text-sm text-gray-300">Welcome, {user.role}</span>
            <button
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-700 px-4 py-1 rounded text-white transition"
            >
              Sign Out
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
