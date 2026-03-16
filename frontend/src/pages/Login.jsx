// pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../contexts/NotificationContext";
import authService from "../services/authService";
import "../styles/login.css";

function Login() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [isSignup, setIsSignup] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);

  const initialData = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    specialty: "",
    pharmacyName: "",
    companyName: "",
    medicalLicense: "",
    pharmacyLicense: "",
    supplierId: "",
    password: "",
    confirmPassword: "",
  };

  const [formData, setFormData] = useState(initialData);

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      showNotification("Please fill in all fields", "warning");
      return;
    }

    setLoading(true);
    try {
      const data = await authService.login(formData.email, formData.password);

      showNotification("Login successful!", "success");

      const storedUser = authService.getCurrentUser();

      if (!storedUser) {
        showNotification("Login error: User data not stored", "error");
        setLoading(false);
        return;
      }

      const role = storedUser.role;

      switch (role) {
        case "Doctor":
          navigate("/doctor-dashboard");
          break;
        case "Pharmacist":
          navigate("/pharmacist-dashboard");
          break;
        case "Supplier":
          navigate("/supplier-dashboard");
          break;
        case "Patient":
          navigate("/patient-dashboard");
          break;
        case "Admin":
          navigate("/admin-dashboard");
          break;
        default:
          navigate("/");
      }

    } catch (err) {
      showNotification(err.message || "Login failed. Please check your credentials.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      showNotification("Please fill in all required fields", "warning");
      return;
    }

    if (formData.password.length < 8) {
      showNotification("Password must be at least 8 characters", "warning");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showNotification("Passwords do not match", "warning");
      return;
    }

    setLoading(true);
    try {
      const data = await authService.signup(selectedRole, formData);

      showNotification("Account created successfully! Please login.", "success");

      setIsSignup(false);
      setSelectedRole("");
      setFormData(initialData);
    } catch (err) {
      showNotification(err.message || "Signup failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const roleFields = {
    Patient: ["firstName", "lastName", "email", "phone", "address", "city", "country", "password", "confirmPassword"],
    Doctor: ["firstName", "lastName", "email", "phone", "address", "city", "country", "specialty", "medicalLicense", "password", "confirmPassword"],
    Supplier: ["firstName", "lastName", "email", "phone", "address", "city", "country", "companyName", "supplierId", "password", "confirmPassword"],
    Pharmacist: ["firstName", "lastName", "email", "phone", "address", "city", "country", "pharmacyName", "pharmacyLicense", "password", "confirmPassword"],
  };

  const fieldPlaceholders = {
    firstName: "First Name *",
    lastName: "Last Name *",
    email: "Email *",
    phone: "Phone Number",
    address: "Address",
    city: "City",
    country: "Country",
    specialty: "Specialty *",
    pharmacyName: "Pharmacy Name *",
    companyName: "Company Name *",
    medicalLicense: "Medical License *",
    pharmacyLicense: "Pharmacy License *",
    supplierId: "Supplier ID *",
    password: "Password (min 8 characters) *",
    confirmPassword: "Retype Password *",
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">Pharmora</div>

        {!isSignup ? (
          <>
            <h2 className="login-title">Welcome Back!</h2>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className="login-input"
              disabled={loading}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="login-input"
              disabled={loading}
            />
            <button
              className="login-btn"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <div className="login-footer">
              <button
                className="login-link"
                onClick={() => navigate("/")}
                disabled={loading}
              >
                &larr; Back to Home
              </button>
              <span>
                New?{" "}
                <button
                  className="login-link"
                  onClick={() => setIsSignup(true)}
                  disabled={loading}
                >
                  Create Account
                </button>
              </span>
            </div>
          </>
        ) : (
          <>
            {!selectedRole ? (
              <>
                <h2 className="login-title">Select Role</h2>
                <div className="role-grid">
                  {Object.keys(roleFields).map((role) => (
                    <div
                      key={role}
                      className="role-card"
                      onClick={() => setSelectedRole(role)}
                    >
                      {role}
                    </div>
                  ))}
                </div>
                <button
                  className="login-link mt-4"
                  onClick={() => setIsSignup(false)}
                  disabled={loading}
                >
                  Back to Login
                </button>
              </>
            ) : (
              <>
                <h2 className="login-title">Create {selectedRole} Account</h2>
                {roleFields[selectedRole].map((field) => (
                  <input
                    key={field}
                    type={field.includes("password") ? "password" : "text"}
                    name={field}
                    placeholder={fieldPlaceholders[field]}
                    value={formData[field]}
                    onChange={handleInputChange}
                    className="login-input"
                    disabled={loading}
                  />
                ))}
                <button
                  className="login-btn"
                  onClick={handleSignup}
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
                <button
                  className="login-link mt-3"
                  onClick={() => setSelectedRole("")}
                  disabled={loading}
                >
                  Back to Role Selection
                </button>
                <button
                  className="login-link mt-2"
                  onClick={() => setIsSignup(false)}
                  disabled={loading}
                >
                  &larr; Back to Login
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
