import React from "react";
import { useNavigate } from "react-router-dom";

function Sidebar({ categories, groupedItems, categoryRefs, subcategoryRefs, isSidebarOpen, toggleSidebar, isSmallScreen }) {
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    navigate(`?category=${encodeURIComponent(category)}`);
    if (categoryRefs.current[category]) {
      categoryRefs.current[category].scrollIntoView({ behavior: "smooth" });
    }
    if (isSmallScreen) {
      toggleSidebar(); // Hide sidebar on small screens after click
    }
  };

  const handleSubcategoryClick = (category, subcategory) => {
    navigate(
      `?category=${encodeURIComponent(category)}&subcategory=${encodeURIComponent(subcategory)}`
    );
    if (subcategoryRefs.current[`${category}-${subcategory}`]) {
      subcategoryRefs.current[`${category}-${subcategory}`].scrollIntoView({
        behavior: "smooth",
      });
    }
    if (isSmallScreen) {
      toggleSidebar(); // Hide sidebar on small screens after click
    }
  };

  if (!isSidebarOpen) return null; // Don't render sidebar if closed

  return (
    <div
      style={{
        width: isSmallScreen ? "100%" : "250px",
        minHeight: isSmallScreen ? "auto" : "100vh",
        background: "#f8f9fa",
        padding: "1rem",
        transition: "width 0.3s",
        position: isSmallScreen ? "absolute" : "fixed",
        top: 0,
        left: 0,
        boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
        overflowY: "auto",
        zIndex: 1000,
      }}
    >
      <button
        onClick={toggleSidebar}
        style={{
          width: "100%",
          padding: "0.5rem",
          background: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginBottom: "1rem",
        }}
      >
        ☰ Close
      </button>
      <div>
        <h3 style={{ marginBottom: "1rem", fontSize: "1.2rem" }}>
          Categories
        </h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {categories.map((category) => (
            <li key={category} style={{ marginBottom: "0.5rem" }}>
              <button
                onClick={() => handleCategoryClick(category)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "0.5rem",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "bold",
                  color: "#007bff",
                  textTransform: "capitalize",
                }}
              >
                {category}
              </button>
              <ul style={{ listStyle: "none", paddingLeft: "1rem" }}>
                {groupedItems[category] &&
                  Object.keys(groupedItems[category]).map((subcategory) => (
                    <li key={`${category}-${subcategory}`}>
                      <button
                        onClick={() =>
                          handleSubcategoryClick(category, subcategory)
                        }
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "0.3rem",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#555",
                          textTransform: "capitalize",
                        }}
                      >
                        {subcategory}
                      </button>
                    </li>
                  ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;