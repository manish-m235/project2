import React from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css"; // shared styling

function Login() {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const identifier = form.identifier.value;
    const password = form.password.value;

    try {
      // Your backend expects oauth form for /token, but if using custom /token you might adapt.
      // If you use the /token OAuth2PasswordRequestForm from FastAPI, send urlencoded:
      const response = await fetch("http://localhost:8000/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          username: identifier,
          password: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.access_token || "");
        localStorage.setItem("role", data.role || "");
        localStorage.setItem("user_id", data.user_id || "");
        navigate("/dashboard");
      } else {
        const err = await response.json().catch(() => ({}));
        alert(err.detail || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
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
            Don’t have an account?{" "}
            <span onClick={() => navigate("/register")} className="linkish">
              Sign up
            </span>
          </p>
        </div>
      </div>

      <footer className="auth-footer">© {new Date().getFullYear()} Academic Portal</footer>
    </div>
  );
}

export default Login;
