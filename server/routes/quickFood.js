import express from "express";
import QuickFood from "../models/QuickFood.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// ✅ Get all quick foods
router.get("/", async (req, res) => {
  try {
    const foods = await QuickFood.find().sort({ createdAt: -1 });
    res.json({ data: foods });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Add new quick food (admin/user)
router.post("/", auth, async (req, res) => {
  try {
    const { name, calories, protein, fat, carbs } = req.body;
    const food = await QuickFood.create({ name, calories, protein, fat, carbs });
    res.json({ data: food });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Delete quick food (optional)
router.delete("/:id", auth, async (req, res) => {
  try {
    await QuickFood.findByIdAndDelete(req.params.id);
    res.json({ message: "Food deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
