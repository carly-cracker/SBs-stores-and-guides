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

// Initialize Firebase
const auth = getAuth();
const db = getFirestore();

const cloudName = "dir0qfbpu"; // Your Cloudinary cloud name
const uploadPreset = "dir0qfbpu"; // Your unsigned upload preset

function AddItem() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    image: "",
    description: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);

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
    setForm({ ...form, [e.target.name]: e.target.value });
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
      if (data.secure_url) {
        setForm((prev) => ({ ...prev, image: data.secure_url })); // Store URL in form.image
        setMessage("Image uploaded successfully!");
      } else {
        setError("Image upload failed: No secure URL returned.");
      }
      setUploading(false);
    } catch (err) {
      setError("Image upload failed.");
      setUploading(false);
    }
  };

  // Handle file input change or drop
  const handleFileChange = (e) => {
    const file =
      e.target?.files?.[0] || e.dataTransfer?.files?.[0];
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
      if (editingId) {
        // Update existing item
        await updateDoc(doc(db, "items", editingId), {
          ...form,
          price: Number(form.price),
        });
        setMessage("Item updated successfully!");
      } else {
        // Add new item
        await addDoc(collection(db, "items"), {
          ...form,
          price: Number(form.price),
        });
        setMessage("Item added successfully!");
      }
      setForm({
        name: "",
        price: "",
        category: "",
        image: "",
        description: "",
      });
      setEditingId(null);
      fetchItems();
    } catch (err) {
      setError("Failed to save item.");
    }
  };

  const handleEdit = (item) => {
    setForm({
      name: item.name,
      price: item.price,
      category: item.category,
      image: item.image,
      description: item.description || "",
    });
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
      image: "",
      description: "",
    });
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
        <input
          name="category"
          value={form.category}
          onChange={handleChange}
          required
        />
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
        placeholder="Search items by name, category, or description..."
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