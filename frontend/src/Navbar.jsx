import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  const [searchTerm, setSearchTerm] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    // Load all medicines for search
    const loadMedicines = async () => {
      try {
        const response = await fetch("http://localhost:5000/medicines");
        const data = await response.json();
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
        medicine.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMedicines(filtered.slice(0, 5)); // Show top 5 results
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
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleMyAccount = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Navigate to the correct dashboard based on user role
    switch (user.role) {
      case "Doctor":
        navigate("/doctor-dashboard");
        break;
      case "Patient":
        navigate("/patient-dashboard");
        break;
      case "Pharmacist":
        navigate("/pharmacist-dashboard");
        break;
      case "Supplier":
        navigate("/supplier-dashboard");
        break;
      case "Admin":
        navigate("/admin-dashboard");
        break;
      default:
        navigate("/login");
    }
  };

  // ✅ Hide navbar for all dashboard routes
  if (
    location.pathname.includes("doctor-dashboard") ||
    location.pathname.includes("pharmacist-dashboard") ||
    location.pathname.includes("supplier-dashboard") ||
    location.pathname.includes("admin-dashboard") ||
    location.pathname.includes("patient-dashboard")
  ) {
    return null;
  }

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md shadow-sm z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
        {/* Left side: Logo - moved more to left */}
        <div className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent mr-4">
          Pharmora
        </div>

        {/* Middle: Search bar with suggestions - made bigger */}
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

          {/* Search Suggestions Dropdown */}
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
                      src={medicine.image_url || "/placeholder.jpg"}
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

          {/* No results message */}
          {showSuggestions && searchTerm && filteredMedicines.length === 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 z-50 p-4">
              <p className="text-gray-600 text-lg">No medicines found for "{searchTerm}"</p>
            </div>
          )}
        </div>

        {/* Right side: Navigation links + buttons */}
        <div className="flex items-center space-x-6">
          <Link to="/" className="text-gray-700 hover:text-cyan-600 transition font-medium">
            Home
          </Link>
          <Link to="/products" className="text-gray-700 hover:text-cyan-600 transition font-medium">
            Products
          </Link>
          <Link to="/doctors" className="text-gray-700 hover:text-cyan-600 transition font-medium">
            Doctors
          </Link>
          <Link to="/suppliers" className="text-gray-700 hover:text-cyan-600 transition font-medium">
            Suppliers
          </Link>
          <Link to="/pharmacists" className="text-gray-700 hover:text-cyan-600 transition font-medium">
            Pharmacists
          </Link>

          {!user ? (
            <Link to="/login">
              <button className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300">
                Sign In
              </button>
            </Link>
          ) : (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-700 font-medium">Welcome, {user.name || user.role}</span>

              {/* My Account button */}
              <button
                onClick={handleMyAccount}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded transition font-medium"
              >
                My Account
              </button>

              {/* View Cart button - ONLY FOR PATIENTS */}
              {user.role === "Patient" && (
                <button
                  onClick={() => navigate("/cart")}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded transition font-medium"
                >
                  View Cart
                </button>
              )}

              {/* Sign Out button */}
              <button
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white transition font-medium"
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