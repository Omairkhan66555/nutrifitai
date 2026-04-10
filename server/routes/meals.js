import express from "express";
import Meal from "../models/Meal.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// ✅ Add meal
router.post("/", auth, async (req, res) => {
  try {
    const meal = new Meal({ ...req.body, user: req.user.id });
    await meal.save();
    res.json({ data: meal });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Get meals
router.get("/", auth, async (req, res) => {
  try {
    const meals = await Meal.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ data: meals });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Update meal
router.put("/:id", auth, async (req, res) => {
  try {
    let meal = await Meal.findOne({ _id: req.params.id, user: req.user.id });
    if (!meal) return res.status(404).json({ msg: "Meal not found" });

    meal = await Meal.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json({ data: meal });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Delete meal
router.delete("/:id", auth, async (req, res) => {
  try {
    const meal = await Meal.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!meal) return res.status(404).json({ msg: "Meal not found" });

    res.json({ msg: "Meal deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Delete all meals
router.delete("/", auth, async (req, res) => {
  try {
    await Meal.deleteMany({ user: req.user.id });
    res.json({ msg: "Meals reset" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
