import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useCart } from "../context/CartContext";

function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [relatedItems, setRelatedItems] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const { addToCart } = useCart();

  // Fetch single item by ID
  useEffect(() => {
    setLoading(true);
    setError(null);
    const fetchItem = async () => {
      try {
        const docRef = doc(db, "items", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setItem({ id: docSnap.id, ...docSnap.data() });
        } else {
          setItem(null);
          setError("Item not found.");
        }
      } catch (err) {
        setError("Error fetching item.");
        setItem(null);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  // Fetch related items from same category (excluding current item)
  useEffect(() => {
    if (!item || !item.category) return;

    const fetchRelated = async () => {
      try {
        const itemsCol = collection(db, "items");
        const q = query(itemsCol, where("category", "==", item.category));
        const querySnapshot = await getDocs(q);
        const others = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(i => i.id !== item.id);
        setRelatedItems(others);
      } catch (err) {
        // Optionally handle related items error
      }
    };

    fetchRelated();
  }, [item]);

  const handleBuyNow = () => {
    navigate("/checkout", { state: { item, quantity } });
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleProceedToCheckout = () => {
    setShowPopup(false);
    navigate("/cart");
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!item) return null;

  return (
    <div style={{ padding: "2rem" }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: "1rem" }}>
        ← Back
      </button>
      <div className="item-details">
        <img src={item.image} alt={item.name} style={{ maxWidth: "300px" }} />
        <h2>{item.name}</h2>
        <p>{item.description || "No description available."}</p>
        <h3>KSH {item.price}</h3>

        <div className="quantity-control" style={{ margin: "1rem 0" }}>
          <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
          <span style={{ margin: "0 1rem" }}>{quantity}</span>
          <button onClick={() => setQuantity(q => q + 1)}>+</button>
        </div>

        <button onClick={() => addToCart(item, quantity)} style={{ marginRight: "1rem" }}>
          Add to Cart
        </button>
        <button className="buy" onClick={handleBuyNow} style={{ background: "#007bff", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: "4px" }}>
          Buy Now
        </button>
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "2rem",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              textAlign: "center",
              minWidth: "300px"
            }}
          >
            <h2>Order Taken</h2>
            <p>Proceed to checkout</p>
            <div style={{ marginTop: "1.5rem" }}>
              <button onClick={handleProceedToCheckout} style={{ marginRight: "1rem", background: "#28a745", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: "4px" }}>
                Go to Cart
              </button>
              <button className="buy" onClick={handleBuyNow} style={{ background: "#ccc", color: "#333", border: "none", padding: "0.5rem 1rem", borderRadius: "4px" }}>
                Buy Now
              </button>
              <button  onClick={handleClosePopup} style={{ background: "#ccc", color: "#333", border: "none", padding: "0.5rem 1rem", borderRadius: "4px" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <hr style={{ margin: "2rem 0" }} />

      <h3>More items in {item.category} category</h3>
      <div className="item-grid">
        {relatedItems.length === 0 && <p>No related items found.</p>}
        {relatedItems.map(relItem => (
          <div
            key={relItem.id}
            className="item-card"
            onClick={() => navigate(`/item/${relItem.id}`)}
            style={{ cursor: "pointer" }}
          >
            <img src={relItem.image} alt={relItem.name} />
            <h4>{relItem.name}</h4>
            <p>KSH{relItem.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ItemDetails;