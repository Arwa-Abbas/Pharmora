import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Home from "./Home";
import Products from "./Products";
import Suppliers from "./Suppliers";
import Doctors from "./Doctors";
import Pharmacists from "./Pharmacists";
import Login from "./Login";

// Wrapper to conditionally show Navbar
function Layout({ children }) {
  const location = useLocation();
  const hideNavbarOn = ["/login"]; // Add any route where navbar shouldn't show

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
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
