const AIService = require('../services/aiService');
const Monastery = require('../models/monastery');

async function enrichMonasteryContext(monasteryId) {
  if (!monasteryId) return null;

  try {
    const monastery = await Monastery.findById(monasteryId)
      .select('name location description established architecture altitude')
      .lean();

    return monastery ? {
      name: monastery.name,
      location: monastery.location?.district || monastery.location?.village,
      description: monastery.description,
      established: monastery.established,
      architecture: monastery.architecture,
      altitude: monastery.altitude,
    } : null;
  } catch (err) {
    return null;
  }
}

async function generateContextAwareRecommendation(userHistory, preferences) {
  try {
    const recentMonasteries = userHistory?.slice(-5) || [];
    const monasteryNames = recentMonasteries
      .filter(m => m.monasteryName)
      .map(m => m.monasteryName)
      .join(', ');

    const enhancedPreferences = {
      ...preferences,
      recentlyViewed: monasteryNames,
    };

    return await AIService.getSmartRecommendations(enhancedPreferences);
  } catch (err) {
    return null;
  }
}

async function generatePersonalizedMonasteryDescription(monastery, userProfile) {
  try {
    const enhancedData = {
      ...monastery,
      userInterestLevel: userProfile?.experienceLevel,
      accessibility: userProfile?.accessibility,
    };

    return await AIService.generateMonasteryDescription(enhancedData);
  } catch (err) {
    return null;
  }
}

module.exports = {
  enrichMonasteryContext,
  generateContextAwareRecommendation,
  generatePersonalizedMonasteryDescription,
};
