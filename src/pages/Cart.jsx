import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

const Cart = () => {
  const { cart, removeFromCart } = useCart();
  const navigate = useNavigate();

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>My Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {cart.map(item => (
              <li key={item.id} style={{
                marginBottom: '1rem',
                borderBottom: '1px solid #ccc',
                paddingBottom: '1rem'
              }}>
                <p><strong>{item.name}</strong> x {item.quantity}</p>
                {item.image && <img src={item.image} alt={item.name} width="100" />}
                <p>Price per item: KSH {item.price}</p>
                <p>Total: KSH {item.price * item.quantity}</p>
                <button onClick={() => removeFromCart(item.id)}>Remove</button>
              </li>
            ))}
          </ul>

          <h3>Checkout Total: KSH {totalPrice}</h3>
          <button onClick={() => navigate("/checkout")} style={{ marginTop: "1rem" }}>
            Buy Now
          </button>
        </>
      )}
    </div>
  );
};

export default Cart;
