import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const Checkout = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { cart } = useCart();

  // Case 1: Single item passed via navigate state
  if (state?.item) {
    const { item, quantity } = state;
    const total = item.price * quantity;

    const handleOrderNow = () => {
      const confirm = window.confirm("Are you sure you want to place this order?");
      if (confirm) {
        const message = `Hello, I would like to order:\n\n🛍 *${item.name}*\n📦 Quantity: ${quantity}\n💰 Total: KSh ${total}\n\nPlease confirm availability.`;
        const phone = "254799202039";
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank");
      }
    };

    return (
      <div style={{ padding: "2rem" }}>
        <h2>Checkout</h2>
        <div className="checkout-card">
          <img src={item.imageUrl} alt={item.name} width={150} />
          <h3>{item.name}</h3>
          <p>Quantity: {quantity}</p>
          <p>Total: KSh {total}</p>
          <button onClick={handleOrderNow}>Order Now via WhatsApp</button>
          <button onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </div>
    );
  }

  // Case 2: No state → checkout from cart
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCartOrder = () => {
    const confirm = window.confirm("Place your full cart order?");
    if (confirm) {
      const message = `🛍 Hello, I would like to order:\n\n${cart
        .map(item => `• ${item.name} x ${item.quantity} = KSh ${item.price * item.quantity}`)
        .join("\n")}\n\n💰 *Total: KSh ${totalPrice}*\n\nPlease confirm availability.`;

      const phone = "254799202039";
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank");
    }
  };

  if (!cart.length) {
    return <p style={{ padding: "2rem" }}>No item to checkout.</p>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Cart Checkout</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {cart.map(item => (
          <li key={item.id} style={{ marginBottom: "1rem" }}>
            <strong>{item.name}</strong> — {item.quantity} × KSh {item.price} = KSh {item.price * item.quantity}
          </li>
        ))}
      </ul>
      <h3>Total: KSh {totalPrice}</h3>
      <button onClick={handleCartOrder}>Order Now via WhatsApp</button>
      <button onClick={() => navigate(-1)} style={{ marginLeft: "1rem" }}>Cancel</button>
    </div>
  );
};

export default Checkout;
