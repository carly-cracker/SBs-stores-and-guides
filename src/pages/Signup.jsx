import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const auth = getAuth();
const db = getFirestore();

const ADMIN_EMAIL = "ckorir765@gmail.com";

function Signup() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setMessage("");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Basic validation
    if (!/^\d{10,15}$/.test(form.phone)) {
      setError("Please enter a valid phone number (10-15 digits).");
      return;
    }
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("Please enter your first and last name.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const user = userCredential.user;
      const role = form.email === ADMIN_EMAIL ? "admin" : "user";
      await setDoc(doc(db, "users", user.uid), {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        email: user.email,
        role: role,
      });
      setMessage("Signup successful! You can now log in.");
      setForm({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        password: "",
      });
    } catch (error) {
      setError(error.message.replace("Firebase:", "").trim());
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Sign Up</h2>
      <form className="auth-form" onSubmit={handleSignup} autoComplete="off">
        <label htmlFor="firstName">First Name</label>
        <input
          id="firstName"
          name="firstName"
          type="text"
          placeholder="First Name"
          value={form.firstName}
          onChange={handleChange}
          required
        />

        <label htmlFor="lastName">Last Name</label>
        <input
          id="lastName"
          name="lastName"
          type="text"
          placeholder="Last Name"
          value={form.lastName}
          onChange={handleChange}
          required
        />

        <label htmlFor="phone">Phone Number</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          placeholder="e.g. 0712345678"
          value={form.phone}
          onChange={handleChange}
          required
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button type="submit">Sign Up</button>
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}
        <div className="form-link">
          Already have an account? <a href="/login">Login</a>
        </div>
      </form>
    </div>
  );
}

export default Signup;