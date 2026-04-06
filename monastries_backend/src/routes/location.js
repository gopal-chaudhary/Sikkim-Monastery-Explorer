const express = require('express');
const locationRouter = express.Router();
const UserLocation = require('../models/userLocation');
const LocationSubscription = require('../models/locationSubscription');
const { userAuth } = require('../middlewares/auth');

// Create a new location listing
locationRouter.post('/location/create', userAuth, async (req, res) => {
    try {
        const { name, type, description, phone, website, hours, address, coordinates, imageUrl, acceptTerms, planType } = req.body;

        // Validate required fields
        if (!name || !type || !description || !phone || !address || !coordinates || !imageUrl) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        if (!acceptTerms) {
            return res.status(400).json({ message: 'Must accept subscription terms' });
        }

        // Validate coordinates format [longitude, latitude]
        if (!Array.isArray(coordinates) || coordinates.length !== 2) {
            return res.status(400).json({ message: 'Invalid coordinates format' });
        }

        const [longitude, latitude] = coordinates;
        if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
            return res.status(400).json({ message: 'Invalid latitude/longitude values' });
        }

        // Calculate renewal date based on plan type
        const nextRenewalDate = new Date();
        const subscriptionPlanType = planType || 'monthly';
        if (subscriptionPlanType === 'annual') {
            nextRenewalDate.setFullYear(nextRenewalDate.getFullYear() + 1);
        } else if (subscriptionPlanType === 'quarterly') {
            nextRenewalDate.setMonth(nextRenewalDate.getMonth() + 3);
        } else {
            nextRenewalDate.setMonth(nextRenewalDate.getMonth() + 1);
        }

        // Create user location with temporary auto-approval
        const userLocation = new UserLocation({
            name,
            type,
            description,
            phone,
            website: website || null,
            hours: hours || 'Not specified',
            location: {
                type: 'Point',
                coordinates: [longitude, latitude],
                address
            },
            imageUrl,
            userId: req.user._id,
            subscriptionStatus: 'active', // Temporary auto-activation
            isApproved: true, // Auto-approved
            expiresAt: nextRenewalDate
        });
        const savedLocation = await userLocation.save();

        const subscription = new LocationSubscription({
            userId: req.user._id,
            locationId: savedLocation._id,
            planType: subscriptionPlanType,
            autopayDate: new Date().getDate(),
            nextRenewalDate,
            termsAccepted: true,
            termsAcceptedAt: new Date(),
            lastPaymentStatus: 'success', // Mark as successful payment
            lastPaymentDate: new Date(),
            isActive: true,
        });

        const savedSubscription = await subscription.save();

        // Back-link subscription to location
        savedLocation.subscriptionId = savedSubscription._id;
        await savedLocation.save();

        res.status(201).json({
            message: 'Location created successfully and is now live on the map!',
            location: savedLocation,
            subscription: savedSubscription
        });

    } catch (error) {
        console.error('Error creating location:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get all user's locations with pagination
locationRouter.get('/location/my-locations', userAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 12;
        limit = limit > 100 ? 100 : limit;
        const skip = (page - 1) * limit;

        const locations = await UserLocation.find({ userId: req.user._id })
            .populate('subscriptionId', 'isActive nextRenewalDate monthlyAmount subscriptionStatus planType')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await UserLocation.countDocuments({ userId: req.user._id });

        res.json({
            success: true,
            data: locations,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get all active locations (for map display) with pagination
locationRouter.get('/location/all-active', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 20;
        limit = limit > 100 ? 100 : limit;
        const skip = (page - 1) * limit;

        const locations = await UserLocation.find({
            subscriptionStatus: 'active',
            isApproved: true
        })
            .populate('userId', 'firstName lastName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await UserLocation.countDocuments({
            subscriptionStatus: 'active',
            isApproved: true
        });

        res.json({
            success: true,
            data: locations,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching active locations:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get single location by ID
locationRouter.get('/location/:id', async (req, res) => {
    try {
        const location = await UserLocation.findById(req.params.id)
            .populate('userId', 'firstName lastName phoneNumber')
            .populate('subscriptionId');

        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }

        res.json(location);
    } catch (error) {
        console.error('Error fetching location:', error);
        res.status(500).json({ message: error.message });
    }
});

// Track a location view (separate from fetch to avoid accidental double increments)
locationRouter.post('/location/:id/view', async (req, res) => {
    try {
        const location = await UserLocation.findById(req.params.id);

        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }

        location.views += 1;
        await location.save();

        res.json({ message: 'View tracked', views: location.views });
    } catch (error) {
        console.error('Error tracking view:', error);
        res.status(500).json({ message: error.message });
    }
});

// Update location
locationRouter.patch('/location/:id', userAuth, async (req, res) => {
    try {
        const location = await UserLocation.findById(req.params.id);

        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }

        // Check if user is owner
        if (location.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Don't allow editing approved locations without re-approval
        if (location.isApproved) {
            location.isApproved = false;
        }

        const allowedFields = ['name', 'description', 'phone', 'website', 'hours'];
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                location[field] = req.body[field];
            }
        });

        // Update image
        if (req.body.imageUrl !== undefined) {
            location.imageUrl = req.body.imageUrl;
        }

        // Update address
        if (req.body.address !== undefined) {
            location.location.address = req.body.address;
        }

        // Update coordinates (expects [longitude, latitude])
        if (req.body.coordinates !== undefined) {
            const coordinates = req.body.coordinates;
            if (!Array.isArray(coordinates) || coordinates.length !== 2) {
                return res.status(400).json({ message: 'Invalid coordinates format' });
            }

            const [longitude, latitude] = coordinates;
            if (!Number.isFinite(longitude) || !Number.isFinite(latitude) || longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
                return res.status(400).json({ message: 'Invalid latitude/longitude values' });
            }

            location.location.coordinates = [longitude, latitude];
        }

        const updatedLocation = await location.save();

        res.json({
            message: 'Location updated successfully',
            location: updatedLocation
        });
    } catch (error) {
        console.error('Error updating location:', error);
        res.status(500).json({ message: error.message });
    }
});

// Delete location
locationRouter.delete('/location/:id', userAuth, async (req, res) => {
    try {
        const location = await UserLocation.findById(req.params.id);

        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }

        // Check if user is owner
        if (location.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Delete associated subscription
        if (location.subscriptionId) {
            await LocationSubscription.findByIdAndDelete(location.subscriptionId);
        }

        await UserLocation.findByIdAndDelete(req.params.id);

        res.json({ message: 'Location deleted successfully' });
    } catch (error) {
        console.error('Error deleting location:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get subscription details for a location
locationRouter.get('/location/:id/subscription', userAuth, async (req, res) => {
    try {
        const location = await UserLocation.findById(req.params.id);

        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }

        if (location.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const subscription = await LocationSubscription.findById(location.subscriptionId);

        res.json(subscription);
    } catch (error) {
        console.error('Error fetching subscription:', error);
        res.status(500).json({ message: error.message });
    }
});

// Renew subscription for a location
locationRouter.post('/location/:id/renew-subscription', userAuth, async (req, res) => {
    try {
        const location = await UserLocation.findById(req.params.id);

        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }

        if (location.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const subscription = await LocationSubscription.findById(location.subscriptionId);

        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        // Renew is only allowed if subscription has ended
        if (location.subscriptionStatus !== 'expired' && location.subscriptionStatus !== 'suspended') {
            return res.status(400).json({ message: 'Renew is only available for ended subscriptions' });
        }

        // Renew subscription
        const nextRenewalDate = new Date();
        nextRenewalDate.setMonth(nextRenewalDate.getMonth() + 1);

        subscription.nextRenewalDate = nextRenewalDate;
        subscription.isActive = true;
        subscription.lastPaymentStatus = 'pending';
        subscription.lastPaymentAttemptDate = new Date();
        subscription.failedAttempts = 0;

        await subscription.save();

        // Reactivate location
        location.subscriptionStatus = 'active';
        location.expiresAt = nextRenewalDate;
        await location.save();

        res.json({
            message: 'Subscription renewed successfully',
            subscription,
            location
        });
    } catch (error) {
        console.error('Error renewing subscription:', error);
        res.status(500).json({ message: error.message });
    }
});

// Cancel subscription (for user)
locationRouter.post('/location/:id/cancel-subscription', userAuth, async (req, res) => {
    try {
        const location = await UserLocation.findById(req.params.id);

        if (!location) {
            return res.status(404).json({ message: 'Location not found' });
        }

        if (location.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const subscription = await LocationSubscription.findById(location.subscriptionId);

        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        subscription.isActive = false;
        subscription.suspendReason = 'user_cancelled';
        subscription.suspendedAt = new Date();
        await subscription.save();

        location.subscriptionStatus = 'expired';
        location.expiresAt = new Date();
        await location.save();

        res.json({ message: 'Subscription cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        res.status(500).json({ message: error.message });
    }
});

// Search locations by type or name
locationRouter.get('/location/search/:query', async (req, res) => {
    try {
        const { query } = req.params;
        const locations = await UserLocation.find({
            $and: [
                {
                    $or: [
                        { name: { $regex: query, $options: 'i' } },
                        { type: { $regex: query, $options: 'i' } },
                        { 'location.address': { $regex: query, $options: 'i' } }
                    ]
                },
                { subscriptionStatus: 'active', isApproved: true }
            ]
        }).limit(20);

        res.json(locations);
    } catch (error) {
        console.error('Error searching locations:', error);
        res.status(500).json({ message: error.message });
    }
});

// Find locations within radius (for map)
locationRouter.post('/location/find-nearby', async (req, res) => {
    try {
        const { coordinates, maxDistance } = req.body;

        if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
            return res.status(400).json({ message: 'Invalid coordinates' });
        }

        const locations = await UserLocation.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: coordinates
                    },
                    $maxDistance: maxDistance || 5000 // 5km default
                }
            },
            subscriptionStatus: 'active',
            isApproved: true
        });

        res.json(locations);
    } catch (error) {
        console.error('Error finding nearby locations:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = locationRouter;
