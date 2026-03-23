const express = require('express');
const monasteryRouter = express.Router();
const Monastery = require('../models/monastery');
const monasterySeedData = require('../data/monasteries');

const REGIONS = ['East Sikkim', 'West Sikkim', 'North Sikkim', 'South Sikkim'];

const COORDINATE_FIXES = {
    'labrang monastery': { latitude: 27.418881, longitude: 88.581438 },
    'lachung monastery': { latitude: 27.6006, longitude: 88.7476 },
    'sang monastery': { latitude: 27.29, longitude: 88.23 },
    'hee gyathang monastery': { latitude: 27.48, longitude: 88.5 },
    'chawayng ani monastery': { latitude: 27.534, longitude: 88.512 }
};

function buildLocationText(location) {
    if (typeof location === 'string') return location;
    if (!location || typeof location !== 'object') return '';
    return Object.values(location)
        .filter((v) => typeof v === 'string' && v.trim())
        .join(', ');
}

function inferRegion(item) {
    if (REGIONS.includes(item.region)) return item.region;

    const regionText = [
        item?.location?.district,
        item?.location?.region,
        item?.location?.area,
        item?.location?.village,
        item?.location?.town,
        item?.location?.nearTown,
        item?.location?.peak,
        buildLocationText(item.location)
    ].filter(Boolean).join(' ').toLowerCase();

    if (regionText.includes('east')) return 'East Sikkim';
    if (regionText.includes('west') || regionText.includes('gyalshing') || regionText.includes('pelling')) return 'West Sikkim';
    if (regionText.includes('north') || regionText.includes('dzongu') || regionText.includes('lachen') || regionText.includes('lachung')) return 'North Sikkim';
    if (regionText.includes('south') || regionText.includes('namchi') || regionText.includes('ravangla') || regionText.includes('tendong')) return 'South Sikkim';

    return 'East Sikkim';
}

function normalizeMonastery(item) {
    const description = (item.description || `${item.name} is a Buddhist monastery in Sikkim, India.`).trim();
    const safeDescription = description.length >= 50
        ? description
        : `${description} This monastery is culturally and spiritually important in the region.`;

    const lat = item?.coordinates?.latitude;
    const lng = item?.coordinates?.longitude;

    return {
        name: item.name,
        link: item.link || null,
        dataAvailable: item.dataAvailable !== false,
        location: item.location || 'Sikkim, India',
        locationText: buildLocationText(item.location) || 'Sikkim, India',
        region: inferRegion(item),
        description: safeDescription,
        established: Number.isFinite(item.established) ? item.established : null,
        foundedBy: item.foundedBy || null,
        sect: item.sect || null,
        architectureStyle: item.architectureStyle || null,
        imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800',
        features: Array.isArray(item.features) ? item.features : [],
        rating: Number.isFinite(item.rating) ? item.rating : 4.5,
        visitors: Number.isFinite(item.visitors) ? item.visitors : 0,
        openingHours: item.openingHours || '6:00 AM - 6:00 PM',
        entryFee: item.entryFee || 'Free',
        bestTimeToVisit: item.bestTimeToVisit || 'October to May',
        nearbyAttractions: Array.isArray(item.nearbyAttractions) ? item.nearbyAttractions : [],
        coordinates: {
            latitude: Number.isFinite(lat) ? lat : null,
            longitude: Number.isFinite(lng) ? lng : null
        },
        altitude: Number.isFinite(item.altitude) ? item.altitude : 0,
        history: item.history || null,
        architecture: item.architecture || null,
        monks: Number.isFinite(item.monks) ? item.monks : null,
        festivals: Array.isArray(item.festivals) ? item.festivals : [],
        deitiesWorshipped: Array.isArray(item.deitiesWorshipped) ? item.deitiesWorshipped : [],
        culturalSignificance: item.culturalSignificance || null,
        restoration: item.restoration || null,
        earthquakeDamage: item.earthquakeDamage || null,
        infrastructure: item.infrastructure || null,
        isActive: item.isActive !== false
    };
}

function applyCoordinateFixes(monastery) {
    const fix = COORDINATE_FIXES[(monastery?.name || '').trim().toLowerCase()];
    if (!fix) return monastery;

    const hasCoords = Number.isFinite(monastery?.coordinates?.latitude)
        && Number.isFinite(monastery?.coordinates?.longitude);

    if (hasCoords) return monastery;

    // Return fixed coordinates for known records that were saved without GPS data.
    return {
        ...monastery.toObject(),
        coordinates: {
            latitude: fix.latitude,
            longitude: fix.longitude
        }
    };
}

// Get all monasteries (no pagination - max 20)
monasteryRouter.get('/monasteries/all', async (req, res) => {
    try {
        const monasteries = await Monastery.find({ isActive: true })
            .sort({ rating: -1 });

        const hydratedMonasteries = monasteries.map(applyCoordinateFixes);

        res.json({
            success: true,
            data: hydratedMonasteries
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: 'Error fetching monasteries: ' + err.message
        });
    }
});

// Get all monasteries with optional filters and pagination
monasteryRouter.get('/monasteries', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 50;
        limit = limit > 100 ? 100 : limit;
        const skip = (page - 1) * limit;

        // Build query
        let query = { isActive: true };

        // Filter by region
        if (req.query.region && req.query.region !== 'all') {
            query.region = req.query.region;
        }

        // Filter by age
        if (req.query.age) {
            const currentYear = new Date().getFullYear();
            if (req.query.age === '< 200 years') {
                query.established = { $gte: currentYear - 200 };
            } else if (req.query.age === '200-300 years') {
                query.established = { $gte: currentYear - 300, $lte: currentYear - 200 };
            } else if (req.query.age === '> 300 years') {
                query.established = { $lt: currentYear - 300 };
            }
        }

        // Text search - flexible regex matching
        if (req.query.search) {
            const searchTerm = req.query.search.trim();
            query.$or = [
                { name: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } },
                { locationText: { $regex: searchTerm, $options: 'i' } }
            ];
        }

        // Sorting
        let sort = {};
        if (req.query.sortBy === 'name') {
            sort.name = 1;
        } else if (req.query.sortBy === 'age') {
            sort.established = 1;
        } else if (req.query.sortBy === 'rating') {
            sort.rating = -1;
        } else if (req.query.sortBy === 'visitors') {
            sort.visitors = -1;
        } else {
            sort.name = 1; // Default sort by name
        }

        const monasteries = await Monastery.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit);

        const hydratedMonasteries = monasteries.map(applyCoordinateFixes);

        const total = await Monastery.countDocuments(query);

        res.json({
            success: true,
            data: hydratedMonasteries,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: 'Error fetching monasteries: ' + err.message
        });
    }
});

// Get a single monastery by ID
monasteryRouter.get('/monasteries/:id', async (req, res) => {
    try {
        const monastery = await Monastery.findOne({ 
            _id: req.params.id, 
            isActive: true 
        });

        if (!monastery) {
            return res.status(404).json({
                success: false,
                message: 'Monastery not found'
            });
        }

        res.json({
            success: true,
            data: applyCoordinateFixes(monastery)
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: 'Error fetching monastery: ' + err.message
        });
    }
});

// Get monastery statistics
monasteryRouter.get('/monasteries/stats/summary', async (req, res) => {
    try {
        const total = await Monastery.countDocuments({ isActive: true });
        const currentYear = new Date().getFullYear();
        const ancient = await Monastery.countDocuments({ 
            isActive: true,
            established: { $lt: currentYear - 300 }
        });

        const avgRatingResult = await Monastery.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: null, avgRating: { $avg: '$rating' } } }
        ]);

        const regions = await Monastery.distinct('region', { isActive: true });

        res.json({
            success: true,
            data: {
                total,
                ancient,
                avgRating: avgRatingResult[0]?.avgRating?.toFixed(1) || '4.5',
                regions: regions.length
            }
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: 'Error fetching statistics: ' + err.message
        });
    }
});

// Seed initial monastery data (for development/testing only)
monasteryRouter.post('/monasteries/seed', async (req, res) => {
    try {
        const forceReseed = req.query.force === 'true' || req.body?.force === true;

        // Check if monasteries already exist
        const count = await Monastery.countDocuments();
        if (count > 0 && !forceReseed) {
            return res.json({
                success: false,
                message: 'Monasteries already seeded. Use /monasteries/seed?force=true to replace old data with latest detailed dataset.'
            });
        }

        if (forceReseed) {
            await Monastery.deleteMany({});
        }

        const monasteries = monasterySeedData.map(normalizeMonastery);
        const created = await Monastery.insertMany(monasteries, { ordered: false });

        res.json({
            success: true,
            message: `Successfully seeded ${created.length} monasteries with detailed fields`,
            data: created
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: 'Error seeding monasteries: ' + err.message
        });
    }
});

module.exports = monasteryRouter;
