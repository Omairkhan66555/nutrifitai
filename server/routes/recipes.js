import express from "express";
import axios from "axios";

const router = express.Router();

// ✅ Recipe Search + Details
router.post("/get-recipes", async (req, res) => {
  const { query } = req.body;

  try {
    // Step 1: Search recipes
    const searchRes = await axios.get(
      `https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=5&apiKey=${process.env.SPOON_KEY}`
    );

    // Step 2: For each recipe, fetch detailed info
    const detailedRecipes = await Promise.all(
      searchRes.data.results.map(async (r) => {
        const detailRes = await axios.get(
          `https://api.spoonacular.com/recipes/${r.id}/information?includeNutrition=true&apiKey=${process.env.SPOON_KEY}`
        );

        return {
          id: r.id,
          title: r.title,
          image: r.image,
          calories:
            detailRes.data.nutrition?.nutrients?.find(
              (n) => n.name === "Calories"
            )?.amount || 0,
          protein:
            detailRes.data.nutrition?.nutrients?.find(
              (n) => n.name === "Protein"
            )?.amount || 0,
          fat:
            detailRes.data.nutrition?.nutrients?.find(
              (n) => n.name === "Fat"
            )?.amount || 0,
          carbs:
            detailRes.data.nutrition?.nutrients?.find(
              (n) => n.name === "Carbohydrates"
            )?.amount || 0,
          ingredients: detailRes.data.extendedIngredients.map((i) => i.original),
          instructions: detailRes.data.instructions,
        };
      })
    );

    res.json({ recipes: detailedRecipes });
  } catch (err) {
    console.error("❌ Recipe API Error:", err.response?.data || err.message);
    res.status(500).json({ msg: "Failed to fetch recipes" });
  }
});

export default router;
