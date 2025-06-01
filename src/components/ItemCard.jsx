import React from "react";
import { useNavigate } from "react-router-dom";

const ItemCard = ({ item }) => {
  const navigate = useNavigate();

  return (
    <div
      className="item-card"
      onClick={() => navigate(`/item/${item.id}`)}
      style={{ cursor: "pointer" }}
    >
      <img src={item.image} alt={item.name} />
      <h4>{item.name}</h4>
      <p>KSh {item.price}</p>
    </div>
  );
};

export default ItemCard;
