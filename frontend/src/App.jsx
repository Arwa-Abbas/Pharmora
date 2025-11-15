// frontend/src/App.jsx
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
import DoctorDashboard from "./DoctorDashboard";
import SupplierDashboard from "./SupplierDashboard";
import PharmacistDashboard from "./PharmacistDashboard";
import Cart from "./Cart";

function Layout({ children }) {
  const location = useLocation();
  const hideNavbarOn = ["/login", "/patient-dashboard", "/doctor-dashboard", "/supplier-dashboard", , "/pharmacist-dashboard"];

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
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/supplier-dashboard" element={<SupplierDashboard />} />
          <Route path="/pharmacist-dashboard" element={<PharmacistDashboard />} />
          <Route path="/cart" element={<Cart />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
