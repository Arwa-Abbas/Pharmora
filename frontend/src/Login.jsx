import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "./NotificationContext";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [isSignup, setIsSignup] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");

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

  const validateForm = (fields) => {
    for (let field of fields) {
      if (!formData[field]) {
        showNotification(`Please fill in ${field}`, "warning");
        return false;
      }
    }
    if (formData.password.length < 8) {
      showNotification("Password must be at least 8 characters", "warning");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      showNotification("Passwords do not match", "warning");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      showNotification("Please fill in all fields", "warning");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showNotification(data.error, "error");
        return;
      }

      // ✅ Save user to localStorage so Navbar can detect login
      localStorage.setItem("user", JSON.stringify(data.user));

      showNotification("Login successful!", "success");

      switch (data.user.role) {
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
  case "Admin":  // Only "Admin" with capital A
  case "admin":  // Support lowercase as well
    navigate("/admin-dashboard");
    break;
  default:
    navigate("/");
}
    } catch (err) {
      console.error("Login error:", err);
      showNotification("Server error. Try again later.", "error");
    }
  };

  const handleSignup = async () => {
    const roleRequiredFields = roleFields[selectedRole];
    if (!validateForm(roleRequiredFields)) return;

    try {
      const response = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole, formData }),
      });

      const data = await response.json();

      if (!response.ok) {
        showNotification(data.error, "error");
        return;
      }

      showNotification("Account created successfully!", "success");
      setIsSignup(false);
      setSelectedRole("");
      setFormData(initialData);
      navigate("/");
    } catch (err) {
      console.error(err);
      showNotification("Server error. Try again later.", "error");
    }
  };

  // Fields per role
  const roleFields = {
    Patient: [
      "firstName",
      "lastName",
      "email",
      "phone",
      "address",
      "city",
      "country",
      "password",
      "confirmPassword",
    ],
    Doctor: [
      "firstName",
      "lastName",
      "email",
      "phone",
      "address",
      "city",
      "country",
      "specialty",
      "medicalLicense",
      "password",
      "confirmPassword",
    ],
    Supplier: [
      "firstName",
      "lastName",
      "email",
      "phone",
      "address",
      "city",
      "country",
      "companyName",
      "supplierId",
      "password",
      "confirmPassword",
    ],
    Pharmacist: [
      "firstName",
      "lastName",
      "email",
      "phone",
      "address",
      "city",
      "country",
      "pharmacyName",
      "pharmacyLicense",
      "password",
      "confirmPassword",
    ],
  };

  const fieldPlaceholders = {
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    phone: "Phone Number",
    address: "Address",
    city: "City",
    country: "Country",
    specialty: "Specialty",
    pharmacyName: "Pharmacy Name",
    companyName: "Company Name",
    medicalLicense: "Medical License",
    pharmacyLicense: "Pharmacy License",
    supplierId: "Supplier ID",
    password: "Password (min 8 characters)",
    confirmPassword: "Retype Password",
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
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className="login-input"
            />
            <button className="login-btn" onClick={handleLogin}>
              Sign In
            </button>

            <div className="login-footer">
              <button
                className="login-link"
                onClick={() => navigate("/")}
              >
                &larr; Back to Home
              </button>
              <span>
                New?{" "}
                <button
                  className="login-link"
                  onClick={() => setIsSignup(true)}
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
                  />
                ))}
                <button className="login-btn" onClick={handleSignup}>
                  Create Account
                </button>
                <button
                  className="login-link mt-3"
                  onClick={() => setSelectedRole("")}
                >
                  Back to Role Selection
                </button>
                <button
                  className="login-link mt-2"
                  onClick={() => setIsSignup(false)}
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