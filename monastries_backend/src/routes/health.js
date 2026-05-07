const express = require('express');
const mongoose = require('mongoose');
const logger = require('../utils/logger');
const config = require('../config/env');

const healthRouter = express.Router();

// Basic health check
healthRouter.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv
    });
});

// Detailed health check with database connectivity
healthRouter.get('/health/detailed', async (req, res) => {
    const healthCheck = {
        success: true,
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.nodeEnv,
        services: {
            database: 'unknown',
            memory: 'ok',
            cpu: 'ok'
        },
        details: {}
    };

    try {
        // Check database connection
        const dbState = mongoose.connection.readyState;
        const dbStates = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };
        
        healthCheck.services.database = dbStates[dbState];
        
        if (dbState === 1) {
            // Ping database
            await mongoose.connection.db.admin().ping();
            healthCheck.details.database = {
                status: 'connected',
                name: mongoose.connection.name,
                host: mongoose.connection.host
            };
        } else {
            healthCheck.success = false;
            healthCheck.status = 'degraded';
            healthCheck.services.database = 'disconnected';
        }

        // Memory usage
        const memUsage = process.memoryUsage();
        healthCheck.details.memory = {
            rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
            heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
            external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
        };

        // CPU usage
        const cpuUsage = process.cpuUsage();
        healthCheck.details.cpu = {
            user: cpuUsage.user,
            system: cpuUsage.system
        };

        const statusCode = healthCheck.success ? 200 : 503;
        res.status(statusCode).json(healthCheck);

    } catch (error) {
        logger.error({ err: error }, 'Health check failed');
        healthCheck.success = false;
        healthCheck.status = 'error';
        healthCheck.services.database = 'error';
        healthCheck.error = error.message;
        res.status(503).json(healthCheck);
    }
});

// Readiness probe (for Kubernetes/container orchestration)
healthRouter.get('/ready', async (req, res) => {
    try {
        const dbState = mongoose.connection.readyState;
        if (dbState === 1) {
            await mongoose.connection.db.admin().ping();
            res.status(200).json({ ready: true });
        } else {
            res.status(503).json({ ready: false, reason: 'Database not connected' });
        }
    } catch (error) {
        logger.error({ err: error }, 'Readiness check failed');
        res.status(503).json({ ready: false, reason: error.message });
    }
});

// Liveness probe (for Kubernetes/container orchestration)
healthRouter.get('/live', (req, res) => {
    res.status(200).json({ alive: true });
});

module.exports = healthRouter;
