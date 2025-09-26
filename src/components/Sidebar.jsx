import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const SIDEBAR_WIDTH = 260;

function Sidebar({
  categories,
  groupedItems,
  categoryRefs,
  subcategoryRefs,
  isSidebarOpen,
  toggleSidebar,
  isSmallScreen,
  navOffset = 0, // NEW: pixels to offset from top (navbar height)
}) {
  const navigate = useNavigate();
  const [openCategory, setOpenCategory] = useState(null);

  const handleCategoryClick = (category) => {
    setOpenCategory((prev) => (prev === category ? null : category));

    navigate(`?category=${encodeURIComponent(category)}`);
    if (categoryRefs?.current?.[category]) {
      categoryRefs.current[category].scrollIntoView({ behavior: "smooth" });
    }

    if (isSmallScreen) toggleSidebar(); // Close sidebar on small screens
  };

  const handleSubcategoryClick = (category, subcategory) => {
    navigate(
      `?category=${encodeURIComponent(category)}&subcategory=${encodeURIComponent(
        subcategory
      )}`
    );
    const key = `${category}-${subcategory}`;
    if (subcategoryRefs?.current?.[key]) {
      subcategoryRefs.current[key].scrollIntoView({
        behavior: "smooth",
      });
    }

    if (isSmallScreen) toggleSidebar(); // Close sidebar on small screens
  };

  // Only hide the component when closed on small screens (overlay mode)
  if (!isSidebarOpen && isSmallScreen) return null;

  // Styles
  const basePanelStyle = {
    boxSizing: "border-box",
    background: "#f8f9fa",
    padding: "1rem",
    overflowY: "auto",         // make sidebar content scrollable
    overscrollBehavior: "contain",
    borderRight: "1px solid #e6e6e6",
  };

  // Desktop: fixed, scrollable panel; Mobile: fixed overlay that can slide in/out
  const panelStyle = isSmallScreen
    ? {
        ...basePanelStyle,
        width: "85%",
        height: `calc(100vh - ${navOffset}px)`,
        position: "fixed",
        top: navOffset,
        left: 0,
        boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
        zIndex: 1001,
        transition: "transform 0.3s ease",
        transform: isSidebarOpen ? "translateX(0)" : "translateX(-100%)",
      }
    : {
        ...basePanelStyle,
        width: `${SIDEBAR_WIDTH}px`,
        height: `calc(100vh - ${navOffset}px)`,
        position: "fixed",   // fixed so it doesn't move when shop content scrolls
        top: navOffset,
        left: 0,
        zIndex: 100,         // below mobile backdrop but above main content
      };

  return (
    <>
      {/* Backdrop only on small screens; do not cover the navbar */}
      {isSmallScreen && isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          style={{
            position: "fixed",
            top: navOffset,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 1000,
          }}
        />
      )}

      <div style={panelStyle}>
        {/* Close button only on small screens */}
        {isSmallScreen && (
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
        )}

        <h3 style={{ marginBottom: "1rem", fontSize: "1.2rem" }}>Categories</h3>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
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
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {category}
                <span
                  style={{
                    transform:
                      openCategory === category ? "rotate(90deg)" : "rotate(0)",
                    transition: "transform 0.2s",
                  }}
                >
                  ▶
                </span>
              </button>
              {openCategory === category && (
                <ul
                  style={{
                    listStyle: "none",
                    paddingLeft: "1rem",
                    marginTop: "0.3rem",
                  }}
                >
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
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default Sidebar;