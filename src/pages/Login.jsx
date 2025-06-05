import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the return URL from location state if it exists
  const returnTo = location.state?.returnTo || "/";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
      
      // Check if there's a pending order in localStorage
      const pendingOrder = localStorage.getItem('pendingOrder');
      if (pendingOrder && returnTo === '/checkout') {
        // Navigate back to checkout
        navigate(returnTo);
      } else {
        // Regular navigation to home
        navigate("/");
      }
    } catch (error) {
      setError(error.message.replace("Firebase:", "").trim());
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Login</h2>
      {returnTo === '/checkout' && (
        <div className="auth-message">
          <p>Login to complete your order</p>
        </div>
      )}
      <form className="auth-form" onSubmit={handleLogin}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
        {error && <div className="error-message">{error}</div>}
        <div className="form-link">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </div>
      </form>
    </div>
  );
}

export default Login;