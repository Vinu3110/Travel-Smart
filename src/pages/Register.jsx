
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/auth";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const { name, email, password, confirmPassword } = formData;

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const result = registerUser(name.trim(), email.trim(), password);

      if (result && result.success === false) {
        setError(result.message || "Registration failed.");
        return;
      }

      navigate("/login", {
        replace: true,
        state: {
          notice: "Registration successful. Please log in.",
        },
      });
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">

        <div className="auth-visual register-visual">
            <div className="auth-visual-content">
            <span className="journey-label">
              START YOUR JOURNEY
            </span>

            <h1>Discover the world, one journey at a time.</h1>

            <p>
              Explore new destinations, create unforgettable
              memories, and make every trip special with TravelSmart.
            </p>
          </div>
        </div>

        <div className="register-form-section">
          <div className="register-form-content">

            <span className="register-small-heading">
              JOIN TRAVELSMART
            </span>

            <h2>Create an account</h2>

            <p className="register-description">
              Enter your details to get started.
            </p>

            {error && (
              <div className="register-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="register-input-group">
                <label>Full name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="register-input-group">
                <label>Email address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="register-input-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div className="register-input-group">
                <label>Confirm password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Enter password again"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>

              <button
                type="submit"
                className="register-submit-button"
              >
                Create Account <span>→</span>
              </button>
            </form>

            <p className="register-login-link">
              Already have an account? <Link to="/login">Log in</Link>
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Register;
