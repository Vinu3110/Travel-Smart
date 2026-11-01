
import React, { useEffect, useState } from "react";
import "./TravelTools.css";

const defaultItems = [
  { id: 1, name: "Clothes", packed: false },
  { id: 2, name: "Toothbrush", packed: false },
  { id: 3, name: "Phone charger", packed: false },
  { id: 4, name: "Travel documents", packed: false },
  { id: 5, name: "Medications", packed: false },
  { id: 6, name: "Water bottle", packed: false }
];

function PackingChecklist() {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem("travelSmartPacking");
      return saved ? JSON.parse(saved) : defaultItems;
    } catch {
      return defaultItems;
    }
  });

  const [newItem, setNewItem] = useState("");

  useEffect(() => {
    localStorage.setItem("travelSmartPacking", JSON.stringify(items));
  }, [items]);

  const addItem = (e) => {
    e.preventDefault();

    if (!newItem.trim()) return;

    setItems((previous) => [
      ...previous,
      {
        id: Date.now(),
        name: newItem.trim(),
        packed: false
      }
    ]);

    setNewItem("");
  };

  const toggleItem = (id) => {
    setItems((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, packed: !item.packed }
          : item
      )
    );
  };

  const deleteItem = (id) => {
    setItems((previous) =>
      previous.filter((item) => item.id !== id)
    );
  };

  const packedCount = items.filter((item) => item.packed).length;
  const percentage = items.length
    ? Math.round((packedCount / items.length) * 100)
    : 0;

  return (
    <div className="travel-tools">
      <h1>Smart Packing Checklist</h1>
      <p className="tool-description">
        Prepare for your journey and track everything you pack.
      </p>

      <div className="tool-card">
        <h3>Packing Progress</h3>
        <p>{packedCount} of {items.length} items packed</p>

        <div className="tool-progress">
          <div
            className="tool-progress-bar"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <strong>{percentage}% completed</strong>
      </div>

      <div className="tool-card">
        <form className="tool-form" onSubmit={addItem}>
          <input
            className="tool-input"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Add a packing item"
          />
          <button className="tool-button">Add Item</button>
        </form>

        {items.length === 0 && (
          <p className="tool-message">Your checklist is empty.</p>
        )}

        {items.map((item) => (
          <div className="tool-row" key={item.id}>
            <label>
              <input
                type="checkbox"
                checked={item.packed}
                onChange={() => toggleItem(item.id)}
              />
              <span
                style={{
                  textDecoration: item.packed ? "line-through" : "none"
                }}
              >
                {item.name}
              </span>
            </label>

            <button
              className="tool-button danger"
              onClick={() => deleteItem(item.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PackingChecklist;
