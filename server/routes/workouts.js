import express from "express";
import auth from "../middleware/auth.js";
import Workout from "../models/Workout.js";

const router = express.Router();

// ✅ Save workout
router.post("/", auth, async (req, res) => {
  try {
    const workout = new Workout({
      user: req.user.id,
      name: req.body.name,
      exercises: req.body.exercises,
    });
    await workout.save();
    res.json({ data: workout });
  } catch (err) {
    console.error("Workout Save Error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Get workouts
router.get("/", auth, async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json({ data: workouts });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Delete workout
router.delete("/:id", auth, async (req, res) => {
  try {
    await Workout.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ msg: "Workout deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// 🆕 ✅ Home workout generator (simple logic)
router.post("/home-suggestion", async (req, res) => {
  const { goal } = req.body;

  try {
    let plan = { title: "", exercises: [] };

    if (goal.toLowerCase().includes("chest")) {
      plan = {
        title: "Home Chest Workout",
        exercises: [
          "Push-ups - 4x15",
          "Incline Push-ups - 3x12",
          "Diamond Push-ups - 3x10",
          "Wide Push-ups - 3x15",
        ],
      };
    } else if (goal.toLowerCase().includes("legs")) {
      plan = {
        title: "Home Legs Workout",
        exercises: [
          "Squats - 4x20",
          "Lunges - 3x12 each leg",
          "Wall Sit - 3x45 sec",
          "Calf Raises - 4x20",
        ],
      };
    } else if (goal.toLowerCase().includes("abs")) {
      plan = {
        title: "Home Abs Workout",
        exercises: [
          "Crunches - 4x20",
          "Plank - 3x45 sec",
          "Leg Raises - 3x15",
          "Bicycle Crunches - 3x20",
        ],
      };
    } else {
      plan = {
        title: "Full Body Home Workout",
        exercises: [
          "Jumping Jacks - 3x30 sec",
          "Push-ups - 3x15",
          "Bodyweight Squats - 3x20",
          "Plank - 3x45 sec",
        ],
      };
    }

    res.json(plan);
  } catch (err) {
    console.error("Home Workout Error:", err.message);
    res.status(500).json({ msg: "Failed to generate home workout" });
  }
});

export default router;
