import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const MyAccount = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setLoading(false);
        setUser(null);
        return;
      }
      setUser(firebaseUser);
      const db = getFirestore();
      try {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          setErrorMsg("User data not found. Please contact support.");
        }
      } catch (error) {
        setErrorMsg("Error fetching user data.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      navigate("/");
    } catch (error) {
      setErrorMsg("Failed to sign out. Please try again.");
    }
  };

  const formatMemberSince = (createdAt) => {
    if (!createdAt) return "N/A";
    try {
      // Firestore Timestamp object
      if (createdAt.toDate) {
        return createdAt.toDate().toLocaleDateString();
      }
      // ISO string or Date
      const date = new Date(createdAt);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString();
      }
    } catch {
      return "N/A";
    }
    return "N/A";
  };

  if (loading) {
    return (
      <div className="account-container">
        <h2>My Account</h2>
        <p>Loading your information...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="account-container">
        <h2>My Account</h2>
        <p>You need to be logged in to view this page.</p>
        <button onClick={() => navigate("/login")}>Login</button>
        <button onClick={() => navigate("/signup")} style={{ marginLeft: "1rem" }}>Sign Up</button>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="account-container">
        <h2>My Account</h2>
        <p style={{ color: "red" }}>{errorMsg}</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="account-container">
        <h2>My Account</h2>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="account-container">
      <h2>My Account</h2>
      <div className="account-card">
        <div className="account-details">
          <h3>Personal Information</h3>
          <p><strong>Name:</strong> {userData.firstName || "-"} {userData.lastName || ""}</p>
          <p><strong>Email:</strong> {userData.email || "-"}</p>
          <p><strong>Phone:</strong> {userData.phone || "-"}</p>
          {userData.role === "admin" && (
            <p><strong>Account Type:</strong> Administrator</p>
          )}
          <p><strong>Member Since:</strong> {formatMemberSince(userData.createdAt)}</p>
        </div>
        <div className="account-actions">
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;