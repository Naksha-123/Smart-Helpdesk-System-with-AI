const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { generateAIResponse } = require("../controllers/aiController");

// @POST /api/ai/suggest - Get AI suggestion for a query
router.post("/suggest", protect, async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required.",
      });
    }

    const suggestion = await generateAIResponse(
      title,
      description,
      category || "General",
      []
    );

    res.json({ success: true, suggestion });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "AI service error: " + error.message,
    });
  }
});

module.exports = router;