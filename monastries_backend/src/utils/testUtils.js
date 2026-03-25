const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user');
const logger = require('../utils/logger');

// Test database configuration
const TEST_DB_URI = process.env.TEST_DB_URI || 'mongodb://localhost:27017/monastery_test';

// Test utilities
const testUtils = {
  // Setup test database
  async setupTestDB() {
    beforeAll(async () => {
      await mongoose.connect(TEST_DB_URI);
    });

    afterEach(async () => {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
      }
    });

    afterAll(async () => {
      await mongoose.connection.close();
    });
  },

  // Create test user
  async createTestUser(userData = {}) {
    const defaultUser = {
      firstName: 'Test',
      lastName: 'User',
      emailId: 'test@example.com',
      password: 'Test123!@#',
      age: 25,
      gender: 'other'
    };

    const user = new User({ ...defaultUser, ...userData });
    return await user.save();
  },

  // Get auth token for test user
  async getAuthToken(user) {
    const token = await user.getJWT();
    return token;
  },

  // Make authenticated request
  async authenticatedRequest(method, endpoint, data = null, token) {
    const req = request(app)[method.toLowerCase()](endpoint);
    
    if (token) {
      req.set('Cookie', `token=${token}`);
    }
    
    if (data) {
      req.send(data);
    }
    
    return req;
  },

  // Expect error response
  expectError(response, expectedStatus = 400) {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message');
  },

  // Expect success response
  expectSuccess(response, expectedStatus = 200) {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toHaveProperty('success', true);
  }
};

// Test data factory
const testData = {
  validUser: {
    firstName: 'John',
    lastName: 'Doe',
    emailId: 'john@example.com',
    password: 'ValidPass123!@',
    age: 30,
    gender: 'Male'
  },

  invalidUser: {
    firstName: 'J', // Too short
    lastName: '',
    emailId: 'invalid-email',
    password: '123', // Too weak
    age: -5, // Invalid
    gender: 'invalid'
  },

  validMonastery: {
    name: 'Test Monastery',
    location: 'Test Location, Sikkim',
    region: 'East Sikkim',
    description: 'This is a test monastery with sufficient description length to meet the minimum requirements of at least 50 characters. It contains detailed information about the monastery.',
    established: 1800,
    foundedBy: 'Test Lama',
    sect: 'Nyingma',
    architectureStyle: 'Traditional Tibetan'
  }
};

// Mock data for testing
const mockData = {
  // Mock Wikipedia API response
  wikipediaResponse: {
    data: {
      type: 'standard',
      thumbnail: {
        source: 'https://example.com/image.jpg'
      }
    }
  },

  // Mock Unsplash API response
  unsplashResponse: {
    data: {
      results: [
        {
          urls: {
            regular: 'https://example.com/unsplash.jpg'
          }
        }
      ]
    }
  }
};

// Performance testing utilities
const performanceUtils = {
  // Measure response time
  async measureResponseTime(requestFn) {
    const start = Date.now();
    const response = await requestFn();
    const duration = Date.now() - start;
    
    return {
      response,
      duration,
      isFast: duration < 1000 // Consider fast if under 1 second
    };
  },

  // Load testing helper
  async loadTest(requestFn, concurrency = 10, iterations = 100) {
    const results = [];
    
    for (let i = 0; i < iterations; i += concurrency) {
      const batch = [];
      
      for (let j = 0; j < concurrency && (i + j) < iterations; j++) {
        batch.push(this.measureResponseTime(requestFn));
      }
      
      const batchResults = await Promise.all(batch);
      results.push(...batchResults);
    }
    
    return {
      totalRequests: results.length,
      averageTime: results.reduce((sum, r) => sum + r.duration, 0) / results.length,
      minTime: Math.min(...results.map(r => r.duration)),
      maxTime: Math.max(...results.map(r => r.duration)),
      successRate: results.filter(r => r.response.status < 400).length / results.length * 100
    };
  }
};

// Integration test helpers
const integrationHelpers = {
  // Test complete user flow
  async testCompleteUserFlow() {
    // 1. Register user
    const registerResponse = await request(app)
      .post('/signup')
      .send(testData.validUser);
    
    testUtils.expectSuccess(registerResponse, 201);
    
    // 2. Login user
    const loginResponse = await request(app)
      .post('/login')
      .send({
        emailId: testData.validUser.emailId,
        password: testData.validUser.password
      });
    
    testUtils.expectSuccess(loginResponse);
    const token = loginResponse.headers['set-cookie']?.[0]?.split(';')[0]?.replace('token=', '');
    
    // 3. Get profile
    const profileResponse = await testUtils.authenticatedRequest('GET', '/profile', null, token);
    testUtils.expectSuccess(profileResponse);
    
    // 4. Update profile
    const updateResponse = await testUtils.authenticatedRequest(
      'PATCH', 
      '/profile/edit', 
      { about: 'Updated bio' }, 
      token
    );
    testUtils.expectSuccess(updateResponse);
    
    // 5. Logout
    const logoutResponse = await testUtils.authenticatedRequest('POST', '/logout', null, token);
    testUtils.expectSuccess(logoutResponse);
    
    return true;
  }
};

// Error boundary testing
const errorTests = {
  // Test malformed requests
  async testMalformedRequests() {
    const malformedRequests = [
      { method: 'POST', endpoint: '/signup', data: null },
      { method: 'POST', endpoint: '/login', data: { email: 'invalid' } },
      { method: 'GET', endpoint: '/invalid-endpoint' },
      { method: 'POST', endpoint: '/profile/edit', data: { invalidField: 'test' } }
    ];
    
    for (const req of malformedRequests) {
      const response = await request(app)[req.method.toLowerCase()](req.endpoint).send(req.data || {});
      expect(response.status).toBeGreaterThanOrEqual(400);
    }
  }
};

module.exports = {
  testUtils,
  testData,
  mockData,
  performanceUtils,
  integrationHelpers,
  errorTests
};
