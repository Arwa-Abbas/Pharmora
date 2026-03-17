
import React from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";

function MainLayout({ children }) {
  const location = useLocation();

  const hideNavbarOn = [
    "/login",
    "/patient-dashboard",
    "/doctor-dashboard",
    "/supplier-dashboard",
    "/pharmacist-dashboard",
    "/admin-dashboard"
  ];

  return (
    <>
      {!hideNavbarOn.includes(location.pathname) && <Navbar />}
      <div className={hideNavbarOn.includes(location.pathname) ? "" : "pt-20"}>
        {children}
      </div>
    </>
  );
}

export default MainLayout;
