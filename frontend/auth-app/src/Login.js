import React from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const identifier = e.target.identifier.value;
    const password = e.target.password.value;

    try {
      const response = await fetch("http://localhost:8000/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username_or_email: identifier, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save auth data
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("user_id", data.user.id);

        // Redirect based on role
        if (data.user.role === "admin") {
          navigate("/admin"); // ✅ Admin goes to admin dashboard
        } else {
          navigate("/dashboard"); // ✅ Student goes to main dashboard
        }
      } else {
        alert(data.detail || "Login failed");
      }
    } catch (error) {
      console.error(error);
      alert("Login failed - server error");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="portal-title">Academic Portal</h1>

        <form onSubmit={handleSubmit}>
          <input
            name="identifier"
            type="text"
            placeholder="Username or Email"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
          />
          <button type="submit">Log In</button>
        </form>

        <div className="toggle-box">
          <p>
            Don't have an account?{" "}
            <span onClick={() => navigate("/register")} className="linkish">
              Sign up
            </span>
          </p>
        </div>
      </div>

      <footer className="auth-footer">
        © {new Date().getFullYear()} Academic Portal
      </footer>
    </div>
  );
}

export default Login;
