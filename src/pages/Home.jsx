import React, { useEffect, useState } from "react";
import CategoryCard from "../components/CategoryCard";
import { useNavigate, useLocation } from "react-router-dom";
import CategoryBar from '../components/CategoryBar'

const categories = [
  {
    title: "Dresses",
    image: "https://i.pinimg.com/736x/05/68/35/0568354575c7b24d91baeb7930904328.jpg",
  },
  {
    title: "Tops",
    image: "https://i.pinimg.com/736x/1a/fc/a8/1afca82efc07593d9e9163599060c379.jpg",
  },
  {
    title: "Shoes",
    image: "https://i.pinimg.com/736x/50/13/ee/5013ee957824bae1236ee389f0847860.jpg",
  },
  {
    title: "Bags",
    image: "https://i.pinimg.com/736x/b6/a5/2d/b6a52d2dd63fcd52d4094d0c4a0027e4.jpg",
  },
  {
    title: "Watches",
    image: "https://i.pinimg.com/736x/cd/fa/6b/cdfa6b15d9ca911b3d07d6f7b884e3c1.jpg",
  },
  {
    title: "TV",
    image: "https://i.pinimg.com/736x/ab/a9/83/aba9833c7c6d68c9e67bde3b4157e3c3.jpg",
  },
  {
    title: "Breakfast set",
    image: "https://res.cloudinary.com/dir0qfbpu/image/upload/v1748852481/f82a17a4-7fa9-4ab5-b34f-3d5af93eaa9f_auv9gx.jpg",
  },
  {
    title: "Carpets",
    image: "https://res.cloudinary.com/dir0qfbpu/image/upload/v1748873593/b6c11c2e-843e-483b-a176-6d34901171b6_eqhcgn.jpg",
  },
  {
    title: "Cookware",
    image: "https://res.cloudinary.com/dir0qfbpu/image/upload/v1748843720/WhatsApp_Image_2025-06-01_at_9.05.08_PM_irwad4.jpg",
  },
  {
    title: "Pillow",
    image: "https://res.cloudinary.com/dir0qfbpu/image/upload/v1748872041/c8d84583-e922-44b0-bfbc-5d2b96d92df4_ga8mty.jpg",
  },
];

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [welcomeName, setWelcomeName] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Show welcome message if redirected from signup/login
  useEffect(() => {
    if (location.state && location.state.welcomeName) {
      setWelcomeName(location.state.welcomeName);
      // Clear the message after 4 seconds
      const timer = setTimeout(() => setWelcomeName(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const filteredCategories = categories.filter((cat) =>
    cat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewMore = (category) => {
    navigate(`/shop?category=${encodeURIComponent(category)}`);
  };

  // Add this function to handle category selection from the CategoryBar
  const handleCategorySelect = (category) => {
    navigate(`/shop?category=${encodeURIComponent(category)}`);
  };

  return (
    <div className="home">
      {welcomeName && (
        <div className="success-message" style={{ marginTop: "1rem" }}>
          Welcome, {welcomeName}!
        </div>
      )}

      <h1>Welcome to SBs Store</h1>
      <CategoryBar onSelectCategory={handleCategorySelect} />

      <input
        type="text"
        placeholder="Search for items..."
        className="search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="category-grid">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((cat) => (
            <CategoryCard
              key={cat.title}
              title={cat.title}
              image={cat.image}
              onViewMore={() => handleViewMore(cat.title)}
            />
          ))
        ) : (
          <p>No matching categories found.</p>
        )}
      </div>
    </div>
  );
};

export default Home;