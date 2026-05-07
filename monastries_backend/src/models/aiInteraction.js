const mongoose = require('mongoose');

const aiInteractionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    interactionType: {
      type: String,
      enum: ['chat', 'image_analysis', 'recommendation', 'search'],
      required: true,
    },
    monasteryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Monastery',
    },
    userInput: String,
    aiResponse: String,
    sessionId: String,
    rating: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
    },
    feedback: String,
    responseTime: Number,
    model: {
      type: String,
      default: 'claude-opus-4-7',
    },
  },
  {
    timestamps: true,
  }
);

aiInteractionSchema.index({ userId: 1, createdAt: -1 });
aiInteractionSchema.index({ monasteryId: 1 });
aiInteractionSchema.index({ interactionType: 1 });

module.exports = mongoose.model('AIInteraction', aiInteractionSchema);
