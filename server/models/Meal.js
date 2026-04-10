import mongoose from "mongoose";

const mealSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack"],
      default: "breakfast",
    },
    calories: {
      type: Number,
      default: 0,
    },
    protein: {
      type: Number,
      default: 0,
    },
    fat: {
      type: Number,
      default: 0,
    },
    carbs: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Meal = mongoose.model("Meal", mealSchema);

export default Meal;
