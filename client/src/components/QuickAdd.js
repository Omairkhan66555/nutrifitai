import React, { useState } from "react";
import { Card, Form, Button, Spinner } from "react-bootstrap";
import axios from "axios";

const QuickAdd = ({ onSelect }) => {
  const [query, setQuery] = useState("");
  const [nutrition, setNutrition] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return alert("Enter a food name");

    try {
      setLoading(true);
      setNutrition(null);

      const res = await axios.post("http://localhost:5000/api/nutrition/get-nutrition", {
        query,
      });

      // ✅ Backend returns directly the nutrition object now
      const data = res.data.nutrition || res.data;

      console.log("✅ Nutrition received:", data);

      // ✅ Safety check for valid data
      if (!data || !data.calories) {
        alert("Nutrition not found. Try another food.");
        return;
      }

      // ✅ Fix: Handle “dat” typo if backend sends it
      data.fat = data.fat || data.dat || 0;

      // ✅ Store nutrition in state
      setNutrition(data);
    } catch (err) {
      console.error("QuickAdd nutrition error", err);
      alert("Nutrition lookup failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    if (nutrition) {
      onSelect(nutrition); // send nutrition data back to MealPlanner
      setQuery("");
      setNutrition(null);
    }
  };

  return (
    <Card className="p-3 shadow mb-3">
      <h6>⚡ Quick Add Food</h6>
      <Form.Control
        type="text"
        placeholder="e.g. 200g chicken breast"
        style={{ backgroundColor: "#fff", color: "#222" }}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-2"
      />

      <Button onClick={handleSearch} disabled={loading} className="mb-2">
        {loading ? <Spinner size="sm" animation="border" /> : "Get Nutrition"}
      </Button>

      {nutrition && (
        <div className="mt-3 border rounded p-2 bg-light">
          <p><strong>{nutrition.name}</strong></p>
          <p>🔥 Calories: {nutrition.calories}</p>
          <p>💪 Protein: {nutrition.protein} g</p>
          <p>🥑 Fat: {nutrition.fat} g</p>
          <p>🍞 Carbs: {nutrition.carbs} g</p>
          <Button variant="success" className="mt-2" onClick={handleAdd}>
            Add Meal
          </Button>
        </div>
      )}
    </Card>
  );
};

export default QuickAdd;