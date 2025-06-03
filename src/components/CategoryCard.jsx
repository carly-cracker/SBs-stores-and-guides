import { Link } from "react-router-dom";

const CategoryCard = ({ image, title, onViewMore }) => (
  <div className="category-card">
    <img src={image} alt={title} />
    <h3>{title}</h3>
    <button onClick={onViewMore}>View More</button>
  </div>
);

export default CategoryCard;