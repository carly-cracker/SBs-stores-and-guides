import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const auth = getAuth();
const db = getFirestore();

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const { role, firstName } = userDoc.data();
        if (role === "admin") {
          navigate("/add-item", { state: { welcomeName: firstName } });
        } else {
          navigate("/", { state: { welcomeName: firstName } });
        }
      } else {
        setError("No user data found.");
      }
    } catch (error) {
      setError(error.message.replace("Firebase:", "").trim());
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Login</h2>
      <form className="auth-form" onSubmit={handleLogin} autoComplete="off">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        <button type="submit">Log In</button>
        {error && <div className="error-message">{error}</div>}
        <div className="form-link">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </div>
      </form>
    </div>
  );
}

export default Login;