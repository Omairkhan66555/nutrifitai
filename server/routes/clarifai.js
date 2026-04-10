import express from "express";
import axios from "axios";

const router = express.Router();

// ✅ Clarifai food detection
router.post("/analyze-food", async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    console.log("📤 Received imageBase64 length:", imageBase64?.length);

    const response = await axios.post(
      `https://api.clarifai.com/v2/models/${process.env.CLARIFAI_MODEL_ID}/outputs`,
      {
        user_app_id: {
          user_id: process.env.CLARIFAI_USER_ID,
          app_id: process.env.CLARIFAI_APP_ID,
        },
        inputs: [{ data: { image: { base64: imageBase64 } } }],
      },
      {
        headers: {
          Authorization: `Key ${process.env.CLARIFAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 253940,
      }
    );

    const concepts = response.data.outputs?.[0]?.data?.concepts || [];

    if (!concepts.length) {
      return res.status(400).json({ error: "No food detected" });
    }

    // ✅ return multiple concepts with confidence
    const mapped = concepts.map((c) => ({
      name: c.name,
      confidence: c.value,
    }));

    console.log("✅ Detected concepts:", mapped.slice(0, 5));
    res.json({ concepts: mapped });
  } catch (error) {
    console.error("❌ Clarifai API Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Clarifai API error" });
  }
});

export default router;
