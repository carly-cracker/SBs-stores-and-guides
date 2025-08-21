import { useEffect, useState, useRef } from "react";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { useCart } from "../context/CartContext";
import { useNavigate, useLocation } from "react-router-dom";

function Shop() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // Refs for each category and subcategory section
  const categoryRefs = useRef({});
  const subcategoryRefs = useRef({});

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

  // Read category and subcategory from query string
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get("category");
    const subcat = params.get("subcategory");
    if (cat) {
      setSelectedCategory(cat);
      setSelectedSubcategory(subcat || "");
      setSearchTerm(""); // Clear search if navigating by category/subcategory
    } else {
      setSelectedCategory("");
      setSelectedSubcategory("");
    }
  }, [location.search]);

  // Group items by category and subcategory
  const groupedItems = items.reduce((groups, item) => {
    const category = item.category || "Uncategorized";
    const subcategory = item.subcategory || "General";
    if (!groups[category]) {
      groups[category] = {};
    }
    if (!groups[category][subcategory]) {
      groups[category][subcategory] = [];
    }
    groups[category][subcategory].push(item);
    return groups;
  }, {});

  // Get all categories
  const categories = Object.keys(groupedItems);

  // Enhanced filter: filter items by name, price, description, category, or subcategory
  const filteredGroupedItems = {};
  let filteredCategories = [];

  if (selectedCategory && groupedItems[selectedCategory]) {
    // Filter by selected category and optionally subcategory
    filteredCategories = [selectedCategory];
    filteredGroupedItems[selectedCategory] = {};

    const subcategories = Object.keys(groupedItems[selectedCategory]);
    subcategories.forEach(subcategory => {
      const filtered = groupedItems[selectedCategory][subcategory].filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.subcategory && item.subcategory.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.price && item.price.toString().includes(searchTerm))
      );
      if (filtered.length > 0 && (!selectedSubcategory || selectedSubcategory === subcategory)) {
        filteredGroupedItems[selectedCategory][subcategory] = filtered;
      }
    });

    // If no subcategories match, clear filtered items for this category
    if (Object.keys(filteredGroupedItems[selectedCategory]).length === 0) {
      delete filteredGroupedItems[selectedCategory];
      filteredCategories = [];
    }
  } else {
    // Filter across all categories and subcategories
    categories.forEach(category => {
      const subcategories = Object.keys(groupedItems[category]);
      subcategories.forEach(subcategory => {
        const filtered = groupedItems[category][subcategory].filter(item =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.subcategory && item.subcategory.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.price && item.price.toString().includes(searchTerm))
        );
        if (filtered.length > 0) {
          if (!filteredGroupedItems[category]) {
            filteredGroupedItems[category] = {};
          }
          filteredGroupedItems[category][subcategory] = filtered;
        }
      });
    });
    filteredCategories = Object.keys(filteredGroupedItems);
  }

  // Handle search submit (scroll to category or subcategory if exact match)
  const handleSearch = (e) => {
    e.preventDefault();
    const search = searchTerm.trim().toLowerCase();
    if (!search) return;

    // Find matching category or subcategory
    let matchedCategory = null;
    let matchedSubcategory = null;

    for (const category of categories) {
      if (category.toLowerCase().includes(search)) {
        matchedCategory = category;
        break;
      }
      const subcategories = Object.keys(groupedItems[category]);
      const foundSubcategory = subcategories.find(subcat =>
        subcat.toLowerCase().includes(search)
      );
      if (foundSubcategory) {
        matchedCategory = category;
        matchedSubcategory = foundSubcategory;
        break;
      }
    }

    if (matchedSubcategory && subcategoryRefs.current[`${matchedCategory}-${matchedSubcategory}`]) {
      subcategoryRefs.current[`${matchedCategory}-${matchedSubcategory}`].scrollIntoView({ behavior: "smooth" });
      setSelectedCategory(matchedCategory);
      setSelectedSubcategory(matchedSubcategory);
    } else if (matchedCategory && categoryRefs.current[matchedCategory]) {
      categoryRefs.current[matchedCategory].scrollIntoView({ behavior: "smooth" });
      setSelectedCategory(matchedCategory);
      setSelectedSubcategory("");
    } else {
      setSelectedCategory("");
      setSelectedSubcategory("");
    }
  };

  // Scroll to the selected category or subcategory section
  useEffect(() => {
    if (
      selectedCategory &&
      filteredCategories.includes(selectedCategory) &&
      categoryRefs.current[selectedCategory]
    ) {
      setTimeout(() => {
        if (
          selectedSubcategory &&
          filteredGroupedItems[selectedCategory]?.[selectedSubcategory] &&
          subcategoryRefs.current[`${selectedCategory}-${selectedSubcategory}`]
        ) {
          subcategoryRefs.current[`${selectedCategory}-${selectedSubcategory}`].scrollIntoView({ behavior: "smooth" });
        } else {
          categoryRefs.current[selectedCategory].scrollIntoView({ behavior: "smooth" });
        }
      }, 0);
    }
  }, [selectedCategory, selectedSubcategory, filteredCategories]);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Shop Our Collection</h2>

      {/* Search Filter */}
      <form onSubmit={handleSearch} style={{ marginBottom: "1.5rem" }}>
        <input
          type="text"
          placeholder="Search by name, price, description, category, or subcategory..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ padding: "0.5rem", width: "300px" }}
        />
        <button type="submit" style={{ marginLeft: "0.5rem", padding: "0.5rem 1rem" }}>
          Go
        </button>
      </form>

      {filteredCategories.length === 0 && (
        <p>No items found matching your search.</p>
      )}

      {filteredCategories.map(category => (
        <div
          key={category}
          ref={el => (categoryRefs.current[category] = el)}
          id={category.toLowerCase().replace(/\s+/g, "-")}
          style={{
            marginTop: "2rem",
            border: selectedCategory === category ? "2px solid #007bff" : "none",
            borderRadius: "8px",
            padding: selectedCategory === category ? "1rem" : "0",
          }}
        >
          <h3 style={{ textTransform: "capitalize" }}>
            {category}
            {selectedCategory === category && (
              <span style={{ color: "#007bff", marginLeft: "0.5rem" }}>(Selected)</span>
            )}
          </h3>
          {Object.keys(filteredGroupedItems[category]).map(subcategory => (
            <div
              key={`${category}-${subcategory}`}
              ref={el => (subcategoryRefs.current[`${category}-${subcategory}`] = el)}
              id={`${category.toLowerCase().replace(/\s+/g, "-")}-${subcategory.toLowerCase().replace(/\s+/g, "-")}`}
              style={{
                marginTop: "1rem",
                paddingLeft: "1rem",
                borderLeft: selectedSubcategory === subcategory ? "4px solid #007bff" : "none",
              }}
            >
              <h4 style={{ textTransform: "capitalize", marginBottom: "0.5rem" }}>
                {subcategory}
                {selectedSubcategory === subcategory && (
                  <span style={{ color: "#007bff", marginLeft: "0.5rem" }}>(Selected)</span>
                )}
              </h4>
              <div className="item-grid">
                {filteredGroupedItems[category][subcategory].map(item => (
                  <div
                    key={item.id}
                    className="item-card"
                    onClick={() => navigate(`/item/${item.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <img src={item.image} alt={item.name} />
                    <h4>{item.name}</h4>
                    <p>KSH {item.price}</p>
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
      ))}
    </div>
  );
}

export default Shop;