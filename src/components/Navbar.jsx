import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { totalItems } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogout = async () => {
    // Add your logout logic here, e.g.:
    // await signOut(auth);
    // navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/">Home</Link>
        <Link to="/shop">Shop</Link>
        <div className="cart-link">
          <Link to="/cart" style={{ fontSize: "1.5rem" }}>🛒</Link>
          {totalItems > 0 && (
            <span className="cart-badge">{totalItems}</span>
          )}
        </div>
      </div>
      <div className="navbar-right">
        <div className="my-account-dropdown" ref={dropdownRef}>
          {currentUser ? (
            <>
              <Link to="/my-account" className="my-account-btn">My Account</Link>
              <button onClick={handleLogout} style={{ marginLeft: "1rem" }}>Logout</button>
            </>
          ) : (
            <>
              <button
                className="my-account-btn"
                onClick={() => setDropdownOpen((open) => !open)}
              >
                My Account ▼
              </button>
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <button
                    className="dropdown-item"
                    onClick={() => { setDropdownOpen(false); navigate("/login"); }}
                  >
                    Login
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => { setDropdownOpen(false); navigate("/signup"); }}
                  >
                    Signup
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;