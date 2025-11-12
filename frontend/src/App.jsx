import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Home from "./Home";
import Products from "./Products";
import Suppliers from "./Suppliers";
import Doctors from "./Doctors";
import Pharmacists from "./Pharmacists";
import Login from "./Login";
import PatientDashboard from "./PatientDashboard";
import Cart from "./Cart"; // ✅ Add this import

function Layout({ children }) {
  const location = useLocation();
  const hideNavbarOn = ["/login", "/patient-dashboard"]; // Hide Navbar on these routes

  return (
    <>
      {!hideNavbarOn.includes(location.pathname) && <Navbar />}
      <div className={hideNavbarOn.includes(location.pathname) ? "" : "pt-20"}>
        {children}
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/pharmacists" element={<Pharmacists />} />
          <Route path="/login" element={<Login />} />
          <Route path="/patient-dashboard" element={<PatientDashboard />} />
          <Route path="/cart" element={<Cart />} /> {/* ✅ Added Cart route */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
