import mongoose from "mongoose";

const WorkoutSchema = new mongoose.Schema({
  name: { type: String, required: true },
  exercises: [
    {
      name: String,
      sets: Number,
      reps: Number,
      weight: Number,
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, { timestamps: true });

export default mongoose.model("Workout", WorkoutSchema);
