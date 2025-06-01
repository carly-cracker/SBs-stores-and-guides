import React, { useState } from "react";
import { useCart } from "../context/CartContext";


const ItemModal = ({ item, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(item, quantity);
    onClose();
  };

  const handleBuyNow = () => {
    addToCart(item, quantity);
    alert("Proceeding to checkout...");
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        <img src={item.imageUrl} alt={item.name} className="modal-image" />
        <h2>{item.name}</h2>
        <p>{item.description}</p>
        <h3>KSh {item.price}</h3>

        <div className="quantity-control">
          <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
          <span>{quantity}</span>
          <button onClick={() => setQuantity(q => q + 1)}>+</button>
        </div>

        <div className="modal-buttons">
          <button className="add-cart" onClick={handleAddToCart}>Add to Cart</button>
          <button className="buy-now" onClick={handleBuyNow}>Buy Now</button>
        </div>
      </div>
    </div>
  );
};

export default ItemModal;