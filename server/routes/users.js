const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// @desc    Update current user profile
// @route   PUT /api/users/me
// @access  Private
router.put("/me", auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Update Failed" });
  }
});

module.exports = router;
