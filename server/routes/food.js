const express = require("express");
const axios = require("axios");
const router = express.Router();

// Detect food + calories using Clarifai
router.post("/analyze", async (req, res) => {
  try {
    const { imageUrl } = req.body;

    const response = await axios.post(
      "https://api.clarifai.com/v2/models/general-image-recognition/outputs",
      {
        inputs: [
          {
            data: {
              image: { url: imageUrl },
            },
          },
        ],
      },
      {
        headers: {
          Authorization: `Key ${process.env.CLARIFAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const concepts = response.data.outputs[0].data.concepts;

    res.json({ success: true, foods: concepts });
  } catch (err) {
    console.error("Clarifai API Error:", err.response?.data || err.message);
    res.status(500).json({ success: false, error: "Food detection failed" });
  }
});

module.exports = router;
