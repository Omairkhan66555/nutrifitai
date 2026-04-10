const Meal = require("../models/Meal");

// Add new meal
exports.addMeal = async (req, res) => {
  try {
    const meal = await Meal.create({ ...req.body, user: req.user.id });
    res.status(201).json({ success: true, data: meal });
  } catch (err) {
    console.error("❌ Meal add error:", err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get all meals for logged in user
exports.getMeals = async (req, res) => {
  try {
    const meals = await Meal.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: meals });
  } catch (err) {
    console.error("❌ Fetch meals error:", err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};
