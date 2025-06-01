import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function Navbar() {
  const { totalItems } = useCart();
  return (
    <nav style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem" }}>
      <Link to="/">Home</Link>
      <Link to="/shop">Shop</Link>
      <div style={{ position: "relative", display: "inline-block" }}>
        <Link to="/cart" style={{ fontSize: "1.5rem" }}>
          🛒
        </Link>
        {totalItems > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-8px",
              right: "-8px",
              background: "red",
              color: "white",
              borderRadius: "50%",
              padding: "2px 6px",
              fontSize: "0.75rem",
              minWidth: "20px",
              textAlign: "center",
              fontWeight: "bold"
            }}
          >
            {totalItems}
          </span>
        )}
      </div>
      <Link to="/signup">Signup</Link>
      <Link to="/login">Login</Link>
    </nav>
  );
}

export default Navbar;