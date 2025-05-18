import { useCart } from "../context/CartContext";

function Cart() {
  const { cart } = useCart();

  // Calculate total price
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>My Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul>
            {cart.map(item => (
              <div key={item.id} style={{ marginBottom: '1rem' }}>
                <p>{item.name} x {item.quantity}</p>
                <p>Price per item: KSH{item.price}</p>
                <p>Total: KSH{item.price * item.quantity}</p>
              </div>
            ))}
          </ul>
          <h3>Checkout Total: KSH{totalPrice}</h3>
        </>
      )}
    </div>
  );
}

export default Cart;
