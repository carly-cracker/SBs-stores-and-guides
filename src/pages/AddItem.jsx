import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import useCategoryOptions from "../hooks/useCategoryOptions";


// Initialize Firebase
const auth = getAuth();
const db = getFirestore();

const cloudName = "dir0qfbpu"; // Your Cloudinary cloud name
const uploadPreset = "dir0qfbpu"; // Replace with your actual unsigned upload preset

function AddItem() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    subcategory: "",
    image: "",
    description: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [isNewSubcategory, setIsNewSubcategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [customSubcategory, setCustomSubcategory] = useState("");

  // Predefined categories and subcategories
  const staticOptions = {
    Electronics: ["Phones", "Laptops", "Accessories", "General"],
    Clothing: ["Shirts", "Pants", "Shoes", "General"],
    Furniture: ["Chairs", "Tables", "Beds", "General"],
    Uncategorized: ["General"],
  };

  const { options: categoryOptions, loading: catLoading } = useCategoryOptions({
    db,
    staticOptions,
    itemsCollection: "items",
  });


  // Fetch items on mount
  useEffect(() => {
    fetchItems();
  }, []);


  const fetchItems = async () => {
    try {
      const itemsCol = collection(db, "items");
      const snapshot = await getDocs(itemsCol);
      const itemList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(itemList);
    } catch (err) {
      setError("Failed to fetch items.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "category") {
      if (value === "new") {
        setIsNewCategory(true);
        setForm({ ...form, category: "", subcategory: "" });
        setCustomCategory("");
      } else {
        setIsNewCategory(false);
        setForm({ ...form, category: value, subcategory: "" });
        setCustomCategory(value);
      }
    } else if (name === "subcategory") {
      if (value === "new") {
        setIsNewSubcategory(true);
        setForm({ ...form, subcategory: "" });
        setCustomSubcategory("");
      } else {
        setIsNewSubcategory(false);
        setForm({ ...form, subcategory: value });
        setCustomSubcategory(value);
      }
    } else if (name === "customCategory") {
      setCustomCategory(value);
      setForm({ ...form, category: value });
    } else if (name === "customSubcategory") {
      setCustomSubcategory(value);
      setForm({ ...form, subcategory: value });
    } else {
      setForm({ ...form, [name]: value });
    }
    setError("");
    setMessage("");
  };

  // Handle Cloudinary file upload
  const handleFileUpload = async (file) => {
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      setUploading(true);
      const res = await fetch(url, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      console.log("Cloudinary response:", data); // For debugging
      if (res.ok && data.secure_url) {
        setForm((prev) => ({ ...prev, image: data.secure_url }));
        setMessage("Image uploaded successfully!");
      } else {
        setError(`Image upload failed: ${data.error?.message || "Unknown error"}`);
      }
      setUploading(false);
    } catch (err) {
      setError(`Image upload failed: ${err.message}`);
      setUploading(false);
    }
  };

  // Handle file input change or drop
  const handleFileChange = (e) => {
    const file = e.target?.files?.[0] || e.dataTransfer?.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        handleFileUpload(file);
      } else {
        setError("Please upload a valid image file.");
      }
    } else {
      setError("No file selected.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!form.name || !form.price || !form.category || !form.image) {
      setError("Please fill in all required fields.");
      return;
    }
    try {
      const itemData = {
        ...form,
        price: Number(form.price),
        subcategory: form.subcategory || "", // Ensure subcategory is saved
      };
      if (editingId) {
        // Update existing item
        await updateDoc(doc(db, "items", editingId), itemData);
        setMessage("Item updated successfully!");
      } else {
        // Add new item
        await addDoc(collection(db, "items"), itemData);
        setMessage("Item added successfully!");
      }
      setForm({
        name: "",
        price: "",
        category: "",
        subcategory: "",
        image: "",
        description: "",
      });
      setIsNewCategory(false);
      setIsNewSubcategory(false);
      setCustomCategory("");
      setCustomSubcategory("");
      setEditingId(null);
      fetchItems();
    } catch (err) {
      setError("Failed to save item.");
    }
  };

  const handleEdit = (item) => {
    const isCustomCategory = !Object.keys(categoryOptions).includes(item.category);
    const isCustomSubcategory = item.category && item.subcategory && !categoryOptions[item.category]?.includes(item.subcategory);
    
    setForm({
      name: item.name || "",
      price: item.price || "",
      category: item.category || "",
      subcategory: item.subcategory || "",
      image: item.image || "",
      description: item.description || "",
    });
    setIsNewCategory(isCustomCategory);
    setIsNewSubcategory(isCustomSubcategory);
    setCustomCategory(isCustomCategory ? item.category : "");
    setCustomSubcategory(isCustomSubcategory ? item.subcategory : "");
    setEditingId(item.id);
    setError("");
    setMessage("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteDoc(doc(db, "items", id));
      setMessage("Item deleted.");
      fetchItems();
    } catch (err) {
      setError("Failed to delete item.");
    }
  };

  const handleCancelEdit = () => {
    setForm({
      name: "",
      price: "",
      category: "",
      subcategory: "",
      image: "",
      description: "",
    });
    setIsNewCategory(false);
    setIsNewSubcategory(false);
    setCustomCategory("");
    setCustomSubcategory("");
    setEditingId(null);
    setError("");
    setMessage("");
  };

  // Handle drag-and-drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileChange(e);
  };

  // Filter items based on search
  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.category &&
        item.category.toLowerCase().includes(search.toLowerCase())) ||
      (item.subcategory &&
        item.subcategory.toLowerCase().includes(search.toLowerCase())) ||
      (item.description &&
        item.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="add-item-admin-container">
      <h2>{editingId ? "Edit Item" : "Add Item"}</h2>
      <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
        <label>Name*</label>
        <input name="name" value={form.name} onChange={handleChange} required />
        <label>Price (KSH)*</label>
        <input
          name="price"
          type="number"
          value={form.price}
          onChange={handleChange}
          required
        />
        <label>Category*</label>
        <select
          name="category"
          value={isNewCategory ? "new" : form.category}
          onChange={handleChange}
          required
        >
          <option value="">Select a category</option>
          {Object.keys(categoryOptions).map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
          <option value="new">Add New Category</option>
        </select>
        {isNewCategory && (
          <input
            name="customCategory"
            value={customCategory}
            onChange={handleChange}
            placeholder="Enter new category"
            style={{ marginTop: "0.5rem" }}
            required
          />
        )}
        <label>Subcategory</label>
        <select
          name="subcategory"
          value={isNewSubcategory ? "new" : form.subcategory}
          onChange={handleChange}
          disabled={!form.category && !isNewCategory}
        >
          <option value="">Select a subcategory (optional)</option>
          {form.category &&
            categoryOptions[form.category]?.map((subcat) => (
              <option key={subcat} value={subcat}>
                {subcat}
              </option>
            ))}
          <option value="new">Add New Subcategory</option>
        </select>
        {isNewSubcategory && (
          <input
            name="customSubcategory"
            value={customSubcategory}
            onChange={handleChange}
            placeholder="Enter new subcategory"
            style={{ marginTop: "0.5rem" }}
          />
        )}
        <label>Image*</label>
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{
            border: "2px dashed #ccc",
            padding: "1rem",
            textAlign: "center",
            marginBottom: "0.5rem",
            background: uploading ? "#f0f0f0" : "#fff",
          }}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
            id="file-input"
            disabled={uploading}
          />
          <label htmlFor="file-input">
            <button
              type="button"
              onClick={() => document.getElementById("file-input").click()}
              disabled={uploading}
              style={{
                background: uploading ? "#ccc" : "#007bff",
                color: "#fff",
                padding: "0.5rem 1rem",
                border: "none",
                borderRadius: "4px",
                cursor: uploading ? "not-allowed" : "pointer",
              }}
            >
              {uploading ? "Uploading..." : "Choose Image"}
            </button>
          </label>
          <p>or drag and drop an image here</p>
        </div>
        {form.image && (
          <div>
            <img
              src={form.image}
              alt="Preview"
              style={{
                width: "100px",
                height: "100px",
                objectFit: "cover",
                marginBottom: "0.5rem",
              }}
            />
          </div>
        )}
        <label>Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
        />
        <button type="submit" disabled={uploading}>
          {editingId ? "Update Item" : "Add Item"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={handleCancelEdit}
            style={{
              marginTop: "0.5rem",
              background: "#ccc",
              color: "#222",
            }}
          >
            Cancel Edit
          </button>
        )}
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}
      </form>

      <h3 style={{ marginTop: "2rem" }}>All Items</h3>
      <input
        type="text"
        placeholder="Search items by name, category, subcategory, or description..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
        style={{ marginBottom: "1.5rem" }}
      />
      <div className="admin-items-list">
        {filteredItems.length === 0 && <p>No items found.</p>}
        {filteredItems.map((item) => (
          <div key={item.id} className="admin-item-card">
            <img
              src={item.image}
              alt={item.name}
              style={{
                width: "60px",
                height: "60px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
            <div className="admin-item-info">
              <strong>{item.name}</strong>
              <div>KSH {item.price}</div>
              <div style={{ fontSize: "0.95em", color: "#666" }}>
                {item.category}
                {item.subcategory && ` > ${item.subcategory}`}
              </div>
              {item.description && (
                <div style={{ fontSize: "0.93em", color: "#888" }}>
                  {item.description}
                </div>
              )}
            </div>
            <div className="admin-item-actions">
              <button
                onClick={() => handleEdit(item)}
                className="admin-edit-btn"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="admin-delete-btn"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AddItem;