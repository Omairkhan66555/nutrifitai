import mongoose from "mongoose";

const quickFoodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    fat: { type: Number, required: true },
    carbs: { type: Number, required: true },
  },
  { timestamps: true }
);

const QuickFood = mongoose.model("QuickFood", quickFoodSchema);
export default QuickFood;
