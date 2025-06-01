import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

function Shop() {
  const [items, setItems] = useState([]);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const itemsCol = collection(db, "items");
        const itemSnapshot = await getDocs(itemsCol);
        const itemList = itemSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setItems(itemList);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };
    fetchItems();
  }, []);

  const groupedItems = items.reduce((groups, item) => {
    const category = item.category || "Uncategorized";
    if (!groups[category]) groups[category] = [];
    groups[category].push(item);
    return groups;
  }, {});

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Shop Our Collection</h2>

      {Object.keys(groupedItems).map(category => (
        <div key={category} style={{ marginTop: "2rem" }}>
          <h3 style={{ textTransform: "capitalize" }}>{category}</h3>
          <div className="item-grid">
            {groupedItems[category].map(item => (
              <div
                key={item.id}
                className="item-card"
                onClick={() => navigate(`/item/${item.id}`)}
                style={{ cursor: "pointer" }}
              >
                <img src={item.image} alt={item.name} />
                <h4>{item.name}</h4>
                <p>KSH{item.price}</p>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    addToCart(item);
                  }}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Shop;
