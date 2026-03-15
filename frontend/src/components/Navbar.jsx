// components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import authService from "../services/authService";
import medicineService from "../services/medicineService";
import { getFullName } from "../utils/formatters";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const loadMedicines = async () => {
      try {
        const data = await medicineService.getAllMedicines();
        setMedicines(data);
      } catch (err) {
        console.error("Error loading medicines:", err);
      }
    };
    loadMedicines();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredMedicines([]);
      setShowSuggestions(false);
    } else {
      const filtered = medicines.filter(medicine =>
        medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMedicines(filtered.slice(0, 5));
      setShowSuggestions(true);
    }
  }, [searchTerm, medicines]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (medicineName) => {
    navigate(`/products?search=${encodeURIComponent(medicineName)}`);
    setSearchTerm("");
    setShowSuggestions(false);
  };

  const handleSignOut = () => {
    authService.logout();
    navigate("/login");
  };

  const handleMyAccount = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    switch (user.role) {
      case "Doctor": navigate("/doctor-dashboard"); break;
      case "Patient": navigate("/patient-dashboard"); break;
      case "Pharmacist": navigate("/pharmacist-dashboard"); break;
      case "Supplier": navigate("/supplier-dashboard"); break;
      case "Admin": navigate("/admin-dashboard"); break;
      default: navigate("/login");
    }
  };

  if (
    location.pathname.includes("dashboard") ||
    location.pathname === "/login"
  ) {
    return null;
  }

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md shadow-sm z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent mr-4">
          Pharmora
        </Link>

        <div className="flex-1 max-w-2xl relative mx-4">
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => searchTerm && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="w-full p-4 rounded-lg text-gray-800 shadow focus:ring-2 focus:ring-cyan-600 outline-none border border-gray-300 text-lg"
            />
          </form>

          {showSuggestions && filteredMedicines.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 z-50 max-h-80 overflow-y-auto">
              {filteredMedicines.map((medicine) => (
                <div
                  key={medicine.medicine_id}
                  className="p-4 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                  onMouseDown={() => handleSuggestionClick(medicine.name)}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={medicine.image_url || "/images/placeholder.jpg"}
                      alt={medicine.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-lg">{medicine.name}</p>
                      <p className="text-gray-600">{medicine.category}</p>
                      <p className="text-green-700 font-semibold">Rs. {medicine.price}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-6">
          <Link to="/" className="text-gray-700 hover:text-cyan-600 transition font-medium">Home</Link>
          <Link to="/products" className="text-gray-700 hover:text-cyan-600 transition font-medium">Products</Link>
          <Link to="/doctors" className="text-gray-700 hover:text-cyan-600 transition font-medium">Doctors</Link>
          <Link to="/suppliers" className="text-gray-700 hover:text-cyan-600 transition font-medium">Suppliers</Link>
          <Link to="/pharmacists" className="text-gray-700 hover:text-cyan-600 transition font-medium">Pharmacists</Link>

          {!user ? (
            <Link to="/login">
              <button className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300">
                Sign In
              </button>
            </Link>
          ) : (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-700 font-medium">Welcome, {user.name || user.role}</span>
              <button onClick={handleMyAccount} className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded transition font-medium">
                My Account
              </button>
              {user.role === "Patient" && (
                <button onClick={() => navigate("/cart")} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded transition font-medium">
                  View Cart
                </button>
              )}
              <button onClick={handleSignOut} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white transition font-medium">
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