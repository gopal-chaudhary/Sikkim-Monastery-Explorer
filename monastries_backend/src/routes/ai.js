const express = require('express');
const AIService = require('../services/aiService');
const { userAuth } = require('../middlewares/auth');
const logger = require('../utils/logger');
const AIInteraction = require('../models/aiInteraction');

const router = express.Router();

// ── POST /ai/chat  (multi-turn, conversation history) ────────────────────────
router.post('/chat', userAuth, async (req, res) => {
  const start = Date.now();
  try {
    const { message, monasteryContext, conversationHistory } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }
    if (message.trim().length > 2000) {
      return res.status(400).json({ error: 'Message too long (max 2000 chars)' });
    }

    const { response, model } = await AIService.chatWithMonasteryQA(
      message.trim(),
      monasteryContext || null,
      Array.isArray(conversationHistory) ? conversationHistory : []
    );

    const responseTime = Date.now() - start;

    // Async interaction log (non-blocking)
    AIInteraction.create({
      userId: req.user._id,
      interactionType: 'chat',
      userInput: message.trim(),
      aiResponse: response,
      monasteryId: monasteryContext?.id || null,
      model,
      responseTime,
    }).catch(e => logger.warn({ e }, 'Failed to log AI interaction'));

    res.json({
      success: true,
      response,
      model,
      responseTime,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error({ error }, 'Chat endpoint error');
    res.status(500).json({
      error: 'Failed to process chat message',
      message: process.env.NODE_ENV === 'development' ? error.message : 'AI service temporarily unavailable',
    });
  }
});

// ── GET /ai/stream  (SSE streaming chat) ─────────────────────────────────────
router.get('/stream', userAuth, async (req, res) => {
  const { message, monasteryContext, history } = req.query;

  if (!message || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  try {
    let parsedContext = null;
    let parsedHistory = [];

    try { parsedContext = monasteryContext ? JSON.parse(monasteryContext) : null; } catch {}
    try { parsedHistory = history ? JSON.parse(history) : []; } catch {}

    const stream = await AIService.streamChat(message.trim(), parsedContext, parsedHistory);

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || '';
      if (delta) {
        res.write(`data: ${JSON.stringify({ delta })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    logger.error({ error }, 'Stream endpoint error');
    res.write(`data: ${JSON.stringify({ error: 'Stream failed', message: error.message })}\n\n`);
    res.end();
  }
});

// ── POST /ai/analyze-image ────────────────────────────────────────────────────
router.post('/analyze-image', userAuth, async (req, res) => {
  try {
    const { imageBase64, metadata } = req.body;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: 'Image data (base64) is required' });
    }
    if (imageBase64.length > 20 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image too large (max 20MB)' });
    }

    const result = await AIService.analyzeMonasteryImage(imageBase64, metadata || {});

    AIInteraction.create({
      userId: req.user._id,
      interactionType: 'image_analysis',
      userInput: `Image analysis: ${metadata?.monasteryName || 'unknown'}`,
      aiResponse: result.analysis,
      model: result.model,
    }).catch(() => {});

    res.json({
      success: true,
      analysis: result.analysis,
      model: result.model,
      timestamp: result.timestamp,
    });
  } catch (error) {
    logger.error({ error }, 'Image analysis endpoint error');
    res.status(500).json({
      error: 'Failed to analyze image',
      message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred',
    });
  }
});

// ── POST /ai/recommend ────────────────────────────────────────────────────────
router.post('/recommend', userAuth, async (req, res) => {
  try {
    const { userPreferences } = req.body;

    if (!userPreferences || typeof userPreferences !== 'object') {
      return res.status(400).json({ error: 'User preferences are required' });
    }

    const result = await AIService.getSmartRecommendations(userPreferences);

    AIInteraction.create({
      userId: req.user._id,
      interactionType: 'recommendation',
      userInput: JSON.stringify(userPreferences),
      aiResponse: result.recommendations,
      model: result.model,
    }).catch(() => {});

    res.json({
      success: true,
      recommendations: result.recommendations,
      model: result.model,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error({ error }, 'Recommendation endpoint error');
    res.status(500).json({
      error: 'Failed to generate recommendations',
      message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred',
    });
  }
});

// ── POST /ai/generate-description ────────────────────────────────────────────
router.post('/generate-description', userAuth, async (req, res) => {
  try {
    const { monasteryData } = req.body;

    if (!monasteryData?.name) {
      return res.status(400).json({ error: 'Monastery name is required' });
    }

    const result = await AIService.generateMonasteryDescription(monasteryData);

    res.json({
      success: true,
      description: result.description,
      model: result.model,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error({ error }, 'Description generation endpoint error');
    res.status(500).json({
      error: 'Failed to generate description',
      message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred',
    });
  }
});

// ── POST /ai/suggest  (search suggestions) ───────────────────────────────────
router.post('/suggest', userAuth, async (req, res) => {
  try {
    const { query, type } = req.body;

    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Query too short (min 2 chars)' });
    }

    const suggestions = await AIService.getSearchSuggestions(query.trim(), type);

    res.json({ success: true, suggestions });
  } catch (error) {
    logger.error({ error }, 'Suggestions endpoint error');
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

// ── GET /ai/fact/:monasteryName ───────────────────────────────────────────────
router.get('/fact/:monasteryName', userAuth, async (req, res) => {
  try {
    const { monasteryName } = req.params;
    if (!monasteryName || monasteryName.length < 2) {
      return res.status(400).json({ error: 'Monastery name required' });
    }

    const result = await AIService.getMonasteryFact(decodeURIComponent(monasteryName));
    res.json({ success: true, ...result });
  } catch (error) {
    logger.error({ error }, 'Fact endpoint error');
    res.status(500).json({ error: 'Failed to get monastery fact' });
  }
});

// ── POST /ai/track ────────────────────────────────────────────────────────────
router.post('/track', userAuth, async (req, res) => {
  try {
    const { interactionType, userInput, aiResponse, monasteryId, rating, model } = req.body;

    const interaction = await AIInteraction.create({
      userId: req.user._id,
      interactionType,
      userInput,
      aiResponse,
      monasteryId: monasteryId || null,
      rating,
      model,
    });

    res.json({ success: true, interactionId: interaction._id });
  } catch (error) {
    logger.error({ error }, 'Tracking endpoint error');
    res.status(500).json({ error: 'Failed to track interaction' });
  }
});

// ── POST /ai/rate/:interactionId ──────────────────────────────────────────────
router.post('/rate/:interactionId', userAuth, async (req, res) => {
  try {
    const { rating, feedback } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const interaction = await AIInteraction.findOneAndUpdate(
      { _id: req.params.interactionId, userId: req.user._id },
      { rating, feedback },
      { new: true }
    );

    if (!interaction) {
      return res.status(404).json({ error: 'Interaction not found' });
    }

    res.json({ success: true, interaction });
  } catch (error) {
    logger.error({ error }, 'Rating endpoint error');
    res.status(500).json({ error: 'Failed to submit rating' });
  }
});

// ── GET /ai/history ───────────────────────────────────────────────────────────
router.get('/history', userAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const interactions = await AIInteraction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .select('interactionType userInput aiResponse rating createdAt model')
      .lean();

    res.json({ success: true, interactions });
  } catch (error) {
    logger.error({ error }, 'History endpoint error');
    res.status(500).json({ error: 'Failed to get history' });
  }
});

module.exports = router;
