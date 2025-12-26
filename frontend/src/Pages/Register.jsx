import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserPlus, User, Mail, Lock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import "../Styles/Register.css";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/register", {
        username,
        email,
        password,
      });

      const data = res.data;

      if (res.status === 201) {
        setError("");
        console.log("Successfully Registered!");
        navigate("/Login");
      } else {
        setError(data.message || "Registration failed");
      }

      setUsername("");
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error("Error:", err);
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="register-page">
      <h1 className="app-title">Voice Journal</h1>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="register-card"
      >
        <div className="register-header">
          <h2 className="login-title">Register Page</h2>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="Choose a Username"
                className="form-input-register"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <input
                type="email"
                placeholder="Enter your Email"
                className="form-input-register"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <input
                type="password"
                placeholder="Create a Password"
                className="form-input-register"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-register-submit">
            REGISTER
          </button>
        </form>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="error-message"
          >
            {error}
          </motion.div>
        )}

        <div className="login-redirect">
          <p className="redirect-text">
            Already have an account?{" "}
            <Link to="/Login" className="link-highlight">
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default Register;
