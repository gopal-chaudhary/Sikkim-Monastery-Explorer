const express = require('express');
const contributionRouter = express.Router();
const Contribution = require('../models/contribution');
const Monastery = require('../models/monastery');
const User = require('../models/user');
const { userAuth } = require('../middlewares/auth');

// POST /contributions/submit - Submit a new monastery for review
contributionRouter.post('/contributions/submit', userAuth, async (req, res) => {
    try {
        const {
            monasteryName,
            location,
            region,
            description,
            established,
            coordinates,
            imageUrl,
            additionalInfo
        } = req.body;

        // Validation
        if (!monasteryName || !location || !region || !description || !coordinates) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: monasteryName, location, region, description, coordinates'
            });
        }

        if (!coordinates.latitude || !coordinates.longitude) {
            return res.status(400).json({
                success: false,
                message: 'Valid coordinates (latitude and longitude) are required'
            });
        }

        // Check if monastery already exists
        const existingMonastery = await Monastery.findOne({
            name: new RegExp(`^${monasteryName}$`, 'i'),
            location: new RegExp(location, 'i')
        });

        if (existingMonastery) {
            return res.status(400).json({
                success: false,
                message: 'This monastery already exists in our database'
            });
        }

        // Check if already submitted
        const existingContribution = await Contribution.findOne({
            monasteryName: new RegExp(`^${monasteryName}$`, 'i'),
            status: { $in: ['pending', 'approved'] }
        });

        if (existingContribution) {
            return res.status(400).json({
                success: false,
                message: 'This monastery has already been submitted and is under review'
            });
        }

        // Create contribution
        const contribution = new Contribution({
            monasteryName,
            location,
            region,
            description,
            established,
            coordinates,
            imageUrl,
            additionalInfo,
            contributedBy: req.user._id,
            contributorName: `${req.user.firstName} ${req.user.lastName}`,
            contributorEmail: req.user.emailId,
            status: 'pending'
        });

        await contribution.save();

        // Update user's contribution count
        await User.findByIdAndUpdate(req.user._id, {
            $inc: { contributionsCount: 1 }
        });

        res.json({
            success: true,
            message: 'Thank you! Your contribution has been submitted for review.',
            data: contribution
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error submitting contribution: ' + error.message
        });
    }
});

// GET /contributions/my - Get user's contributions with pagination
contributionRouter.get('/contributions/my', userAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 20;
        limit = limit > 100 ? 100 : limit;
        const skip = (page - 1) * limit;

        const contributions = await Contribution.find({
            contributedBy: req.user._id
        }).sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Contribution.countDocuments({
            contributedBy: req.user._id
        });

        const allContributions = await Contribution.find({
            contributedBy: req.user._id
        });

        const stats = {
            total: allContributions.length,
            pending: allContributions.filter(c => c.status === 'pending').length,
            approved: allContributions.filter(c => c.status === 'approved').length,
            rejected: allContributions.filter(c => c.status === 'rejected').length,
            totalPoints: allContributions.reduce((sum, c) => sum + c.pointsAwarded, 0)
        };

        res.json({
            success: true,
            data: contributions,
            stats: stats,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching contributions: ' + error.message
        });
    }
});

// GET /contributions/pending - Get all pending contributions (admin only)
contributionRouter.get('/contributions/pending', userAuth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const contributions = await Contribution.find({ status: 'pending' })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('contributedBy', 'firstName lastName emailId contributionPoints');

        const total = await Contribution.countDocuments({ status: 'pending' });

        res.json({
            success: true,
            data: contributions,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching pending contributions: ' + error.message
        });
    }
});

// GET /contributions/all - Get all contributions with filters (admin only)
contributionRouter.get('/contributions/all', userAuth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const status = req.query.status || 'all';

        let query = {};
        if (status !== 'all') {
            query.status = status;
        }

        const contributions = await Contribution.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('contributedBy', 'firstName lastName emailId contributionPoints')
            .populate('reviewedBy', 'firstName lastName');

        const total = await Contribution.countDocuments(query);

        const stats = {
            totalContributions: await Contribution.countDocuments(),
            pending: await Contribution.countDocuments({ status: 'pending' }),
            approved: await Contribution.countDocuments({ status: 'approved' }),
            rejected: await Contribution.countDocuments({ status: 'rejected' })
        };

        res.json({
            success: true,
            data: contributions,
            stats: stats,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching contributions: ' + error.message
        });
    }
});

// POST /contributions/:id/review - Approve or reject a contribution (admin only)
contributionRouter.post('/contributions/:id/review', userAuth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const { action, reviewNotes, pointsToAward } = req.body;

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: 'Action must be either "approve" or "reject"'
            });
        }

        const contribution = await Contribution.findById(req.params.id);

        if (!contribution) {
            return res.status(404).json({
                success: false,
                message: 'Contribution not found'
            });
        }

        if (contribution.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'This contribution has already been reviewed'
            });
        }

        if (action === 'approve') {
            // Create monastery from contribution
            const newMonastery = new Monastery({
                name: contribution.monasteryName,
                location: contribution.location,
                region: contribution.region,
                description: contribution.description,
                established: contribution.established || new Date().getFullYear() - 100,
                imageUrl: contribution.imageUrl || 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800',
                coordinates: contribution.coordinates,
                features: ['Community Contributed'],
                rating: 4.5,
                visitors: 0,
                isActive: true
            });

            await newMonastery.save();

            // Award points to contributor
            const points = pointsToAward || 100; // Default 100 points
            await User.findByIdAndUpdate(contribution.contributedBy, {
                $inc: { contributionPoints: points }
            });

            // Update badges
            const user = await User.findById(contribution.contributedBy);
            const newBadges = [...user.badges];
            
            if (user.contributionPoints + points >= 100 && !newBadges.includes('Explorer')) {
                newBadges.push('Explorer');
            }
            if (user.contributionPoints + points >= 500 && !newBadges.includes('Pathfinder')) {
                newBadges.push('Pathfinder');
            }
            if (user.contributionPoints + points >= 1000 && !newBadges.includes('Guardian')) {
                newBadges.push('Guardian');
            }

            await User.findByIdAndUpdate(contribution.contributedBy, { badges: newBadges });

            // Update contribution
            contribution.status = 'approved';
            contribution.reviewedBy = req.user._id;
            contribution.reviewedAt = new Date();
            contribution.reviewNotes = reviewNotes || 'Approved and added to database';
            contribution.pointsAwarded = points;
            await contribution.save();

            res.json({
                success: true,
                message: `Contribution approved! ${points} points awarded to contributor.`,
                data: contribution,
                monastery: newMonastery
            });

        } else {
            // Reject contribution
            contribution.status = 'rejected';
            contribution.reviewedBy = req.user._id;
            contribution.reviewedAt = new Date();
            contribution.reviewNotes = reviewNotes || 'Contribution does not meet requirements';
            await contribution.save();

            res.json({
                success: true,
                message: 'Contribution rejected',
                data: contribution
            });
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error reviewing contribution: ' + error.message
        });
    }
});

// GET /contributions/leaderboard - Get top contributors
contributionRouter.get('/contributions/leaderboard', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const topContributors = await User.find({
            contributionPoints: { $gt: 0 }
        })
        .select('firstName lastName photoUrl contributionPoints contributionsCount badges')
        .sort({ contributionPoints: -1 })
        .limit(limit);

        res.json({
            success: true,
            data: topContributors
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching leaderboard: ' + error.message
        });
    }
});

// GET /contributions/stats - Get contribution statistics
contributionRouter.get('/contributions/stats', async (req, res) => {
    try {
        const stats = {
            totalContributions: await Contribution.countDocuments(),
            pending: await Contribution.countDocuments({ status: 'pending' }),
            approved: await Contribution.countDocuments({ status: 'approved' }),
            rejected: await Contribution.countDocuments({ status: 'rejected' }),
            totalContributors: await Contribution.distinct('contributedBy').then(arr => arr.length),
            totalPointsAwarded: await Contribution.aggregate([
                { $match: { status: 'approved' } },
                { $group: { _id: null, total: { $sum: '$pointsAwarded' } } }
            ]).then(result => result[0]?.total || 0)
        };

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching stats: ' + error.message
        });
    }
});

module.exports = contributionRouter;
