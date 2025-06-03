import { useEffect, useState, useRef } from "react";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

function Shop() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Refs for each category section
  const categoryRefs = useRef({});

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

  // Group items by category
  const groupedItems = items.reduce((groups, item) => {
    const category = item.category || "Uncategorized";
    if (!groups[category]) groups[category] = [];
    groups[category].push(item);
    return groups;
  }, {});

  // Get all categories
  const categories = Object.keys(groupedItems);

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    const search = searchTerm.trim().toLowerCase();
    if (!search) return;

    // Find matching category (case-insensitive)
    const matchedCategory = categories.find(
      cat => cat.toLowerCase().includes(search)
    );
    if (matchedCategory && categoryRefs.current[matchedCategory]) {
      categoryRefs.current[matchedCategory].scrollIntoView({ behavior: "smooth" });
      setSelectedCategory(matchedCategory);
    } else {
      setSelectedCategory(""); // No match
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Shop Our Collection</h2>

      {/* Search Filter */}
      <form onSubmit={handleSearch} style={{ marginBottom: "1.5rem" }}>
        <input
          type="text"
          placeholder="Search category..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ padding: "0.5rem", width: "200px" }}
        />
        <button type="submit" style={{ marginLeft: "0.5rem", padding: "0.5rem 1rem" }}>
          Go
        </button>
      </form>

      {categories.map(category => (
        <div
          key={category}
          ref={el => (categoryRefs.current[category] = el)}
          id={category.toLowerCase().replace(/\s+/g, "-")}
          style={{
            marginTop: "2rem",
            border: selectedCategory === category ? "2px solid #007bff" : "none",
            borderRadius: "8px",
            padding: selectedCategory === category ? "1rem" : "0"
          }}
        >
          <h3 style={{ textTransform: "capitalize" }}>
            {category}
            {selectedCategory === category && (
              <span style={{ color: "#007bff", marginLeft: "0.5rem" }}>(Selected)</span>
            )}
          </h3>
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