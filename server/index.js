import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve("./server/.env") });
console.log("Loaded ENV:", process.env);


import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.js";
import mealRoutes from "./routes/meals.js";
import clarifaiRoutes from "./routes/clarifai.js";
import nutritionRoutes from "./routes/nutrition.js";
import quickFoodRoutes from "./routes/quickFood.js";
import recipesRoutes from "./routes/recipes.js";
import workoutRoutes from "./routes/workouts.js";







connectDB();

const app = express();

// ✅ Increase payload size
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ✅ Allow frontend (React) access
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/clarifai", clarifaiRoutes);
app.use("/api/nutrition", nutritionRoutes);
app.use("/api/quickfood", quickFoodRoutes);
app.use("/api/recipes", recipesRoutes);
app.use("/api/workouts", workoutRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
