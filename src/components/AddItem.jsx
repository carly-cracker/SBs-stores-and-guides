// src/components/AddItem.jsx
import { useState } from "react";
import { db } from "../firebase/config";
import { collection, addDoc } from "firebase/firestore";

function AddItem() {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image: "",
    category: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "items"), {
        ...formData,
        price: parseFloat(formData.price)
      });
      alert("Item added!");
      setFormData({ name: "", price: "", image: "", category: "" });
    } catch (error) {
      console.error("Error adding item:", error);
      alert("Failed to add item.");
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "400px" }}>
      <h2>Add New Item</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Item name"
          value={formData.name}
          onChange={handleChange}
          required
        /><br />
        <input
          name="price"
          type="number"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          required
        /><br />
        <input
          name="image"
          placeholder="Image URL"
          value={formData.image}
          onChange={handleChange}
          required
        /><br />
        <input
          name="category"
          placeholder="Category (e.g. dresses)"
          value={formData.category}
          onChange={handleChange}
          required
        /><br />
        <button type="submit">Add Item</button>
      </form>
    </div>
  );
}

export default AddItem;
