const { z } = require('zod');
const config = require('../config/env');

// User validation schemas
const signupSchema = z.object({
    firstName: z.string()
        .min(3, 'First name must be at least 3 characters')
        .max(50, 'First name must not exceed 50 characters')
        .trim(),
    lastName: z.string()
        .min(1, 'Last name is required')
        .max(50, 'Last name must not exceed 50 characters')
        .trim(),
    emailId: z.string()
        .email('Invalid email address')
        .toLowerCase()
        .trim(),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    age: z.number().min(13, 'Must be at least 13 years old').optional(),
    gender: z.enum(['Male', 'female', 'other']).optional()
});

const loginSchema = z.object({
    emailId: z.string().email('Invalid email address').toLowerCase().trim(),
    password: z.string().min(1, 'Password is required')
});

const editProfileSchema = z.object({
    firstName: z.string()
        .min(3, 'First name must be at least 3 characters')
        .max(50, 'First name must not exceed 50 characters')
        .trim()
        .optional(),
    lastName: z.string()
        .min(1, 'Last name is required')
        .max(50, 'Last name must not exceed 50 characters')
        .trim()
        .optional(),
    emailId: z.string()
        .email('Invalid email address')
        .toLowerCase()
        .trim()
        .optional(),
    photoUrl: z.string().url('Invalid photo URL').optional().or(z.literal('')),
    gender: z.enum(['Male', 'female', 'other']).optional(),
    age: z.number().min(13, 'Must be at least 13 years old').max(120).optional(),
    about: z.string().max(500, 'About section must not exceed 500 characters').optional(),
    skills: z.array(z.string()).max(20, 'Maximum 20 skills allowed').optional()
}).strict(); // Reject unknown fields

const updatePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
});

// Monastery validation schemas
const createMonasterySchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters').trim(),
    location: z.union([z.string(), z.record(z.any())]),
    region: z.enum(['East Sikkim', 'West Sikkim', 'North Sikkim', 'South Sikkim']),
    description: z.string().min(50, 'Description must be at least 50 characters'),
    imageUrl: z.string().url('Invalid image URL'),
    established: z.number().min(0).max(new Date().getFullYear()).optional(),
    foundedBy: z.string().optional(),
    sect: z.string().optional(),
    architectureStyle: z.string().optional(),
    features: z.array(z.string()).optional(),
    rating: z.number().min(0).max(5).optional(),
    openingHours: z.string().optional(),
    entryFee: z.string().optional(),
    bestTimeToVisit: z.string().optional(),
    contact: z.object({
        phone: z.string().optional(),
        email: z.string().email().optional()
    }).optional(),
    coordinates: z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180)
    }).optional()
});

// Connection request validation
const connectionRequestSchema = z.object({
    status: z.enum(['interested', 'ignored']),
    toUserId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID')
});

const reviewConnectionSchema = z.object({
    status: z.enum(['accepted', 'rejected']),
    requestId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid request ID')
});

// Review validation
const createReviewSchema = z.object({
    monasteryId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid monastery ID').optional(),
    guideId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid guide ID').optional(),
    rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must not exceed 5'),
    comment: z.string().min(config.review.minLength, `Comment must be at least ${config.review.minLength} characters`).max(config.review.maxLength, `Comment must not exceed ${config.review.maxLength} characters`),
    visitDate: z.string().datetime().optional()
}).refine(data => data.monasteryId || data.guideId, {
    message: 'Either monasteryId or guideId must be provided'
});

// Location validation
const createLocationSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters').trim(),
    type: z.enum(['monastery', 'hotel', 'restaurant', 'attraction', 'other']),
    description: z.string().min(20, 'Description must be at least 20 characters'),
    address: z.string().min(5, 'Address is required'),
    coordinates: z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180)
    }),
    contact: z.object({
        phone: z.string().optional(),
        email: z.string().email().optional(),
        website: z.string().url().optional()
    }).optional(),
    images: z.array(z.string().url()).optional(),
    amenities: z.array(z.string()).optional(),
    priceRange: z.string().optional()
});

// Guide profile validation
const createGuideProfileSchema = z.object({
    monasteryId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid monastery ID'),
    languages: z.array(z.string()).min(1, 'At least one language is required'),
    experience: z.number().min(0, 'Experience must be a positive number'),
    specializations: z.array(z.string()).optional(),
    availability: z.object({
        days: z.array(z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])),
        hours: z.string()
    }),
    pricing: z.object({
        hourly: z.number().min(0).optional(),
        halfDay: z.number().min(0).optional(),
        fullDay: z.number().min(0).optional()
    }),
    bio: z.string().min(config.bio.minLength, `Bio must be at least ${config.bio.minLength} characters`).max(config.bio.maxLength),
    certifications: z.array(z.string()).optional()
});

// Pagination validation
const paginationSchema = z.object({
    page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().min(1)).optional().default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().min(1).max(config.pagination.maxPageSize)).optional().default(String(config.pagination.defaultPageSize))
});

// MongoDB ObjectId validation
const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

// Validation middleware factory
const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        try {
            const data = source === 'body' ? req.body : 
                        source === 'query' ? req.query : 
                        source === 'params' ? req.params : req[source];
            
            const validated = schema.parse(data);
            req[source] = validated;
            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = {
    signupSchema,
    loginSchema,
    editProfileSchema,
    updatePasswordSchema,
    createMonasterySchema,
    connectionRequestSchema,
    reviewConnectionSchema,
    createReviewSchema,
    createLocationSchema,
    createGuideProfileSchema,
    paginationSchema,
    objectIdSchema,
    validate
};
