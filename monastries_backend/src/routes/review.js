const express = require("express");
const router = express.Router();
const Review = require("../models/review");
require("../models/user"); // ensure User schema is registered before populate() calls
const { userAuth } = require("../middlewares/auth");

// GET /monasteries/:id/reviews  – fetch all reviews for a monastery
router.get("/monasteries/:id/reviews", async (req, res) => {
  try {
    const reviews = await Review.find({ monastery: req.params.id })
      .populate("user", "firstName lastName photoUrl")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /monasteries/:id/reviews  – add or update a review (requires auth)
router.post("/monasteries/:id/reviews", userAuth, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5." });
    }
    if (!comment || comment.trim().length < 5) {
      return res.status(400).json({ success: false, message: "Comment must be at least 5 characters." });
    }
    if (comment.trim().length > 1000) {
      return res.status(400).json({ success: false, message: "Comment must be 1000 characters or fewer." });
    }

    // Upsert: one review per user per monastery
    const review = await Review.findOneAndUpdate(
      { monastery: req.params.id, user: req.user._id },
      { rating: Number(rating), comment: comment.trim() },
      { upsert: true, new: true, runValidators: true }
    );

    await review.populate("user", "firstName lastName photoUrl");

    res.status(200).json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /monasteries/:id/reviews  – delete own review (requires auth)
router.delete("/monasteries/:id/reviews", userAuth, async (req, res) => {
  try {
    const deleted = await Review.findOneAndDelete({
      monastery: req.params.id,
      user: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Review not found." });
    }

    res.json({ success: true, message: "Review deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
