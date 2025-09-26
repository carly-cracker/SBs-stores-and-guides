import { useEffect, useState, useRef } from "react";
import { db } from "../firebase/config";
import { useCart } from "../context/CartContext";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar, { SIDEBAR_WIDTH } from "../components/Sidebar";
import useGroupedItemsFromFirestore from "../hooks/useGroupedItemsFromFirestore";

const NAVBAR_HEIGHT = 64; // adjust to your actual navbar height

function Shop() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // Refs for each category and subcategory section
  const categoryRefs = useRef({});
  const subcategoryRefs = useRef({});

  // Real-time categories and grouped items from Firestore
  const { categories, groupedItems, loading, error } =
    useGroupedItemsFromFirestore({
      db,
      collectionName: "items",
    });

  useEffect(() => {
    const handleResize = () => {
      const smallScreen = window.innerWidth < 768;
      setIsSmallScreen(smallScreen);
      setIsSidebarOpen(!smallScreen);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen((v) => !v);

  // Sync URL params to selection
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get("category");
    const subcat = params.get("subcategory");
    if (cat) {
      setSelectedCategory(cat);
      setSelectedSubcategory(subcat || "");
      setSearchTerm("");
    } else {
      setSelectedCategory("");
      setSelectedSubcategory("");
    }
  }, [location.search]);

  // Filtering
  const filteredGroupedItems = {};
  let filteredCategories = [];

  if (selectedCategory && groupedItems[selectedCategory]) {
    filteredCategories = [selectedCategory];
    filteredGroupedItems[selectedCategory] = {};
    const subcategories = Object.keys(groupedItems[selectedCategory]);
    subcategories.forEach((subcategory) => {
      const filtered = groupedItems[selectedCategory][subcategory].filter((item) => {
        const term = searchTerm.toLowerCase();
        return (
          item.name?.toLowerCase().includes(term) ||
          item.description?.toLowerCase().includes(term) ||
          item.category?.toLowerCase().includes(term) ||
          item.subcategory?.toLowerCase().includes(term) ||
          (item.price && item.price.toString().includes(searchTerm))
        );
      });
      if (filtered.length > 0 && (!selectedSubcategory || selectedSubcategory === subcategory)) {
        filteredGroupedItems[selectedCategory][subcategory] = filtered;
      }
    });
    if (Object.keys(filteredGroupedItems[selectedCategory]).length === 0) {
      delete filteredGroupedItems[selectedCategory];
      filteredCategories = [];
    }
  } else {
    categories.forEach((category) => {
      const subcategories = Object.keys(groupedItems[category] || {});
      subcategories.forEach((subcategory) => {
        const filtered = groupedItems[category][subcategory].filter((item) => {
          const term = searchTerm.toLowerCase();
          return (
            item.name?.toLowerCase().includes(term) ||
            item.description?.toLowerCase().includes(term) ||
            item.category?.toLowerCase().includes(term) ||
            item.subcategory?.toLowerCase().includes(term) ||
            (item.price && item.price.toString().includes(searchTerm))
          );
        });
        if (filtered.length > 0) {
          if (!filteredGroupedItems[category]) filteredGroupedItems[category] = {};
          filteredGroupedItems[category][subcategory] = filtered;
        }
      });
    });
    filteredCategories = Object.keys(filteredGroupedItems);
  }

  const handleSearch = (e) => {
    e.preventDefault();
    const search = searchTerm.trim().toLowerCase();
    if (!search) return;

    let matchedCategory = null;
    let matchedSubcategory = null;

    for (const category of categories) {
      if (category.toLowerCase().includes(search)) {
        matchedCategory = category;
        break;
      }
      const subcategories = Object.keys(groupedItems[category] || {});
      const foundSubcategory = subcategories.find((subcat) =>
        subcat.toLowerCase().includes(search)
      );
      if (foundSubcategory) {
        matchedCategory = category;
        matchedSubcategory = foundSubcategory;
        break;
      }
    }

    if (
      matchedSubcategory &&
      subcategoryRefs.current[`${matchedCategory}-${matchedSubcategory}`]
    ) {
      subcategoryRefs.current[`${matchedCategory}-${matchedSubcategory}`].scrollIntoView({
        behavior: "smooth",
      });
      setSelectedCategory(matchedCategory);
      setSelectedSubcategory(matchedSubcategory);
      if (isSmallScreen) setIsSidebarOpen(false);
    } else if (matchedCategory && categoryRefs.current[matchedCategory]) {
      categoryRefs.current[matchedCategory].scrollIntoView({ behavior: "smooth" });
      setSelectedCategory(matchedCategory);
      setSelectedSubcategory("");
      if (isSmallScreen) setIsSidebarOpen(false);
    } else {
      setSelectedCategory("");
      setSelectedSubcategory("");
    }
  };

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
          subcategoryRefs.current[`${selectedCategory}-${selectedSubcategory}`].scrollIntoView({
            behavior: "smooth",
          });
        } else {
          categoryRefs.current[selectedCategory].scrollIntoView({ behavior: "smooth" });
        }
      }, 0);
    }
  }, [selectedCategory, selectedSubcategory, filteredCategories]);

  return (
    // FLEX LAYOUT: sidebar is fixed below navbar; content offset by margin-left (desktop)
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        width: "100%",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      <Sidebar
        categories={categories}
        groupedItems={groupedItems}
        categoryRefs={categoryRefs}
        subcategoryRefs={subcategoryRefs}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        isSmallScreen={isSmallScreen}
        navOffset={NAVBAR_HEIGHT} // keep sidebar below sticky navbar
      />

      <main
        style={{
          flex: 1,
          minWidth: 0,
          padding: "1rem",
          // For sticky navbar we do NOT add extra paddingTop; sticky stays in flow.
          marginLeft: isSmallScreen ? 0 : `${SIDEBAR_WIDTH}px`,
        }}
      >
        <h2>Shop Our Collection</h2>

        <div style={{ marginBottom: "1.5rem" }}>
          <form
            onSubmit={handleSearch}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}
          >
            <input
              type="text"
              placeholder="Search by name, price, description, category, or subcategory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: "0.5rem", width: "300px", maxWidth: "100%" }}
            />
            <button type="submit" style={{ padding: "0.5rem 1rem" }}>
              Go
            </button>
          </form>
          <button
            onClick={toggleSidebar}
            style={{
              padding: "0.5rem 1rem",
              background: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              margin: 0,
              lineHeight: "1.5",
              width: "fit-content",
            }}
          >
            {isSmallScreen ? (isSidebarOpen ? "Hide Categories" : "Show Categories") : "Toggle Categories"}
          </button>
        </div>

        {error && <p style={{ color: "red" }}>Failed to load items.</p>}
        {!error && loading && <p>Loading items...</p>}

        {!loading && filteredCategories.length === 0 && (
          <p>No items found matching your search.</p>
        )}

        {!loading &&
          filteredCategories.map((category) => (
            <section
              key={category}
              ref={(el) => (categoryRefs.current[category] = el)}
              id={category.toLowerCase().replace(/\s+/g, "-")}
              style={{ marginTop: "2rem" }}
            >
              <h3 style={{ textTransform: "capitalize" }}>{category}</h3>
              {Object.keys(filteredGroupedItems[category] || {}).map((subcategory) => (
                <div
                  key={`${category}-${subcategory}`}
                  ref={(el) =>
                    (subcategoryRefs.current[`${category}-${subcategory}`] = el)
                  }
                  id={`${category.toLowerCase().replace(/\s+/g, "-")}-${subcategory
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                  style={{ marginTop: "1rem", paddingLeft: "1rem" }}
                >
                  <h4 style={{ textTransform: "capitalize", marginBottom: "0.5rem" }}>
                    {subcategory}
                  </h4>
                  <div className="item-grid">
                    {filteredGroupedItems[category][subcategory]?.map((item) => (
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
                          onClick={(e) => {
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
            </section>
          ))}
      </main>
    </div>
  );
}

export default Shop;