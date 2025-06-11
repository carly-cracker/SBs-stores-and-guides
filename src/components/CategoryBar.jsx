// src/components/CategoryBar.jsx
import React from 'react';

const categories = [
  'All', 'Dresses', 'Shoes', 'tops', 'Electronics', 'Bags', 'Watches', 'Tv', 'Breakfast set', 'Carpets','cookware','pillow'
];

export default function CategoryBar({ onSelectCategory }) {
  return (
    <div className="category-bar">
      {categories.map((cat) => (
        <button key={cat} className="category-btn" onClick={() => onSelectCategory?.(cat)}>
          {cat}
        </button>
      ))}
    </div>
  );
}