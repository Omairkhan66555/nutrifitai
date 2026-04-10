import express from "express";
import axios from "axios";
const router = express.Router();

// ✅ POST: Get nutrition data from Edamam Food Database API
router.post("/get-nutrition", async (req, res) => {
  try {
    const { query } = req.body;
    console.log("🍎 Nutrition lookup for:", query);

    // 🔹 Edamam Food Database API endpoint (not Nutrition Analysis)
    const url = "https://api.edamam.com/api/food-database/v2/parser";

    const response = await axios.get(url, {
      params: {
        app_id: process.env.EDAMAM_APP_ID,
        app_key: process.env.EDAMAM_APP_KEY,
        ingr: query,
      },
    });

    // 🔹 Extract data
    const parsedFood = response.data.parsed?.[0]?.food;
    if (!parsedFood) {
      console.log("❌ No food found in Edamam API response");
      return res.status(404).json({ message: "Food not found" });
    }

    const nutrients = parsedFood.nutrients;

    const nutrition = {
      name: parsedFood.label,
      calories: nutrients.ENERC_KCAL || 0,
      protein: nutrients.PROCNT || 0,
      fat: nutrients.FAT || 0,
      carbs: nutrients.CHOCDF || 0,
    };

    console.log("✅ Nutrition Data:", nutrition);
    res.json(nutrition);
  } catch (error) {
    console.error("❌ Edamam Nutrition API Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Nutrition API error" });
  }
});

export default router;
