const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    monastery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Monastery",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      minLength: 5,
      maxLength: 1000,
    },
  },
  { timestamps: true }
);

// One review per user per monastery
reviewSchema.index({ monastery: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
