import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { LogIn, User, Lock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import "../Styles/Login.css"

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/login", {
        username,
        password
      });

      const data = res.data;

      if (res.status === 200) {
        setError("");
        console.log("Successfully Login!");
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        navigate("/home");
      } else {
        setError(data.error || "Invalid Login");
      }

      setUsername("");
      setPassword("");
    } catch (err) {
      console.error("Error:", err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="login-page">
      <h1 className="app-title">Voice Journal</h1>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="login-card"
      >
        <div className="login-header">
          <h2 className="login-title">Login Page</h2>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="Enter your Username"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <input
                type="password"
                placeholder="Enter your Password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn-submit">
            LOGIN
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

        <div className="register-link">
          <p className="register-text">
            Don't have an account?{" "}
            <Link to="/Register" className="link-highlight">
              Register
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;