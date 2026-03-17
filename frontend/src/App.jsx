
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { NotificationProvider } from "./contexts/NotificationContext";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Doctors from "./pages/Doctors";
import Pharmacists from "./pages/Pharmacists";
import Suppliers from "./pages/Suppliers";
import Login from "./pages/Login";
import Cart from "./pages/Cart";
import PatientDashboard from "./pages/dashboard/PatientDashboard";
import DoctorDashboard from "./pages/dashboard/DoctorDashboard";
import PharmacistDashboard from "./pages/dashboard/PharmacistDashboard";
import SupplierDashboard from "./pages/dashboard/SupplierDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import "./index.css";

function App() {
  return (
    <NotificationProvider>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/pharmacists" element={<Pharmacists />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/patient-dashboard" element={<PatientDashboard />} />
            <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
            <Route path="/pharmacist-dashboard" element={<PharmacistDashboard />} />
            <Route path="/supplier-dashboard" element={<SupplierDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </MainLayout>
      </Router>
    </NotificationProvider>
  );
}

export default App;
