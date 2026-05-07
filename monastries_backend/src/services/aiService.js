const Groq = require('groq-sdk');
const logger = require('../utils/logger');

// ── Client ────────────────────────────────────────────────────────────────────
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── Model ladder (primary → fallbacks) ───────────────────────────────────────
const MODELS = {
  primary:  'llama-3.3-70b-versatile',
  fallback: 'llama3-groq-70b-8192-tool-use-preview',
  fast:     'llama-3.1-8b-instant',
};

// ── System prompts ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are DharmaGuide, an expert AI assistant for the Sikkim Monastery Explorer platform.

You have deep knowledge about:
- Buddhist monasteries in Sikkim (Rumtek, Pemayangtse, Tashiding, Enchey, Namchi, etc.)
- Tibetan Buddhist traditions, sects (Nyingma, Kagyu, Sakya, Gelug) and practices
- Architecture styles: Dzong, Gompa, Lhakhang
- Cultural festivals: Losar, Saga Dawa, Losoong, Kagyed, Tse Chu
- Practical travel: best seasons, altitude sickness, permits, transport
- Meditation practices, prayer flags, thangka art, butter lamps, mandalas
- History of Buddhism's journey through Tibet into Sikkim

Guidelines:
- Be warm, respectful, and knowledgeable
- Format responses with clear structure using **bold** for key terms
- Use bullet points for lists
- Provide both cultural depth AND practical visitor information
- Always maintain respect for Buddhist traditions
- If asked something unrelated to monasteries or Buddhism, gently redirect
- Keep responses concise (150–300 words) unless the question requires depth`;

const RECOMMENDATION_SYSTEM = `You are a monastery recommendation engine for Sikkim Monastery Explorer.
Return structured, JSON-friendly recommendations. Be specific about monastery names, locations, and why they match user preferences.
Format each recommendation as:
**[Monastery Name]** — [District]
• Why it matches: [reason]
• Best for: [visitor type]
• Pro tip: [practical advice]`;

const DESCRIPTION_SYSTEM = `You are a travel content writer specializing in Buddhist heritage sites.
Write vivid, evocative descriptions that capture both spiritual atmosphere and practical visitor information.
Use sensory language. Be factual yet poetic. Target length: 2–3 paragraphs.`;

// ── Helper: call with model fallback ─────────────────────────────────────────
async function callWithFallback(messages, { maxTokens = 1024, system, fast = false } = {}) {
  const modelOrder = fast
    ? [MODELS.fast, MODELS.fallback]
    : [MODELS.primary, MODELS.fallback, MODELS.fast];

  let lastError;
  for (const model of modelOrder) {
    try {
      const payload = {
        model,
        max_tokens: maxTokens,
        temperature: 0.7,
        messages: system
          ? [{ role: 'system', content: system }, ...messages]
          : messages,
      };

      const response = await client.chat.completions.create(payload);
      logger.debug({ model }, 'AI call succeeded');
      return { content: response.choices[0].message.content, model };
    } catch (err) {
      lastError = err;
      logger.warn({ model, err: err.message }, 'Model failed, trying fallback');
    }
  }
  throw new Error(`All AI models failed. Last error: ${lastError?.message}`);
}

// ── Helper: format conversation history ──────────────────────────────────────
function formatHistory(history = []) {
  return history
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .slice(-10) // last 10 messages for context window management
    .map(m => ({ role: m.role, content: String(m.content) }));
}

// ── AI Service ────────────────────────────────────────────────────────────────
class AIService {
  /**
   * Multi-turn monastery Q&A chat
   */
  static async chatWithMonasteryQA(message, monasteryContext = null, conversationHistory = []) {
    try {
      const historyMessages = formatHistory(conversationHistory);

      let userContent = message;
      if (monasteryContext) {
        userContent = `[Context: Viewing "${monasteryContext.name}" monastery` +
          (monasteryContext.location ? ` in ${monasteryContext.location}` : '') +
          (monasteryContext.description ? `. ${monasteryContext.description.slice(0, 200)}` : '') +
          `]\n\nUser question: ${message}`;
      }

      const messages = [
        ...historyMessages,
        { role: 'user', content: userContent },
      ];

      const { content, model } = await callWithFallback(messages, {
        system: SYSTEM_PROMPT,
        maxTokens: 1024,
      });

      return { response: content, model };
    } catch (error) {
      logger.error({ error }, 'AI chat error');
      throw new Error(`AI service error: ${error.message}`);
    }
  }

  /**
   * Streaming chat — returns a Groq stream object
   */
  static async streamChat(message, monasteryContext = null, conversationHistory = []) {
    const historyMessages = formatHistory(conversationHistory);

    let userContent = message;
    if (monasteryContext) {
      userContent = `[Context: "${monasteryContext.name}" monastery]\n\nUser question: ${message}`;
    }

    const stream = await client.chat.completions.create({
      model: MODELS.primary,
      max_tokens: 1024,
      temperature: 0.7,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...historyMessages,
        { role: 'user', content: userContent },
      ],
      stream: true,
    });

    return stream;
  }

  /**
   * Smart monastery recommendations
   */
  static async getSmartRecommendations(userPreferences) {
    try {
      const prompt = `Generate 4 personalised monastery recommendations based on these preferences:

Interests: ${userPreferences.interests?.join(', ') || 'General Buddhist heritage'}
Experience level: ${userPreferences.experienceLevel || 'Beginner'}
Accessibility needs: ${userPreferences.accessibility || 'None'}
Preferred season: ${userPreferences.season || 'Any'}
Budget: ${userPreferences.budget || 'Not specified'}
Recently viewed: ${userPreferences.recentlyViewed || 'None'}

Recommend monasteries from: Rumtek, Pemayangtse, Tashiding, Enchey, Namchi, Ralong, Ralang, Dubdi, Samdruptse, Yuksom, Kewzing.
Do NOT repeat recently viewed monasteries if possible.`;

      const { content, model } = await callWithFallback(
        [{ role: 'user', content: prompt }],
        { system: RECOMMENDATION_SYSTEM, maxTokens: 800 }
      );

      return { recommendations: content, model };
    } catch (error) {
      logger.error({ error }, 'Recommendation generation error');
      throw new Error(`Recommendation failed: ${error.message}`);
    }
  }

  /**
   * Generate monastery description
   */
  static async generateMonasteryDescription(monasteryData) {
    try {
      const prompt = `Write an engaging visitor description for this monastery:

Name: ${monasteryData.name}
Location/District: ${monasteryData.location || 'Sikkim'}
Altitude: ${monasteryData.altitude || 'Not specified'}
Founded: ${monasteryData.established || monasteryData.builtYear || 'Ancient'}
Sect/Tradition: ${monasteryData.sect || monasteryData.architecture || 'Tibetan Buddhist'}
Significance: ${monasteryData.description || 'Important Buddhist site'}

Target: tourists and spiritual seekers. Include: history, architecture, spiritual significance, and visitor tips.`;

      const { content, model } = await callWithFallback(
        [{ role: 'user', content: prompt }],
        { system: DESCRIPTION_SYSTEM, maxTokens: 600 }
      );

      return { description: content, model };
    } catch (error) {
      logger.error({ error }, 'Description generation error');
      throw new Error(`Description generation failed: ${error.message}`);
    }
  }

  /**
   * Image context analysis (text-based since Groq vision is not publicly available)
   * Uses monastery name/metadata to generate a rich contextual analysis
   */
  static async analyzeMonasteryImage(imageBase64, metadata = {}) {
    try {
      const monasteryName = metadata.monasteryName || 'an unknown monastery';
      const region = metadata.region || 'Sikkim';

      const prompt = `A visitor has uploaded a photo taken at or near "${monasteryName}" monastery in ${region}, India.

Based on your knowledge of this monastery and typical monastery photography, provide a detailed analysis covering:

1. **What to look for** — Key architectural and visual elements likely visible
2. **Historical context** — Background and significance of what they photographed
3. **Spiritual symbolism** — Meaning of colours, motifs, or structures they captured
4. **Photography insights** — What makes this a compelling shot from this location
5. **Hidden details** — What most visitors miss when photographing here

Provide a rich, educational response as if you can see the image and are pointing out its details.`;

      const { content, model } = await callWithFallback(
        [{ role: 'user', content: prompt }],
        { system: SYSTEM_PROMPT, maxTokens: 700 }
      );

      return {
        analysis: content,
        model,
        timestamp: new Date(),
        note: 'Analysis based on monastery knowledge and metadata',
      };
    } catch (error) {
      logger.error({ error }, 'Image analysis error');
      throw new Error(`Image analysis failed: ${error.message}`);
    }
  }

  /**
   * Fast AI suggestions for search autocomplete
   */
  static async getSearchSuggestions(query, type = 'general') {
    try {
      const prompt = `Generate 5 specific, useful search suggestions for someone exploring Sikkim monasteries who typed: "${query}"

Type of search: ${type}
Return ONLY a JSON array of strings. No explanation. Example: ["suggestion 1", "suggestion 2"]`;

      const { content } = await callWithFallback(
        [{ role: 'user', content: prompt }],
        { fast: true, maxTokens: 200 }
      );

      // Parse JSON or fallback to template suggestions
      try {
        const parsed = JSON.parse(content.trim());
        if (Array.isArray(parsed)) return parsed.slice(0, 5);
      } catch {
        // fallback
      }

      return [
        `${query} monastery in Sikkim`,
        `Best time to visit ${query}`,
        `History of ${query}`,
        `${query} architecture and art`,
        `Travel guide to ${query}`,
      ];
    } catch (error) {
      logger.warn({ error }, 'Search suggestions failed, using templates');
      return [
        `${query} monastery`,
        `${query} Buddhist site`,
        `Visit ${query} Sikkim`,
      ];
    }
  }

  /**
   * Generate a quick monastery fact/did-you-know snippet
   */
  static async getMonasteryFact(monasteryName) {
    try {
      const prompt = `Share one fascinating, lesser-known fact about ${monasteryName} monastery in Sikkim. 
Keep it to 2-3 sentences. Start with "Did you know..." Make it surprising and educational.`;

      const { content, model } = await callWithFallback(
        [{ role: 'user', content: prompt }],
        { fast: true, maxTokens: 150 }
      );

      return { fact: content, model };
    } catch (error) {
      logger.warn({ error }, 'Monastery fact generation failed');
      return { fact: null };
    }
  }
}

module.exports = AIService;
