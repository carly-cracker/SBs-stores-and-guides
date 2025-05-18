import { Link } from "react-router-dom";

const CategoryCard = ({ image, title }) => {
  return (
    <div className="category-card">
      <img src={image} alt={title} />
      <h3>{title}</h3>
      <Link to={`/shop?category=${title.toLowerCase()}`}>View More</Link>
    </div>
  );
};

export default CategoryCard;