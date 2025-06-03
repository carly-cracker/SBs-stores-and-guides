import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function Navbar() {
  const { totalItems } = useCart();
  return (
    <nav className="navbar">
      <Link to="/">Home</Link>
      <Link to="/shop">Shop</Link>
      <div className="cart-link">
        <Link to="/cart" style={{ fontSize: "1.5rem" }}>
          🛒
        </Link>
        {totalItems > 0 && (
          <span className="cart-badge">
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