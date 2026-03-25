// Test setup file
const mongoose = require('mongoose');

// Set test environment
process.env.NODE_ENV = 'test';

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  // Uncomment to ignore specific console methods during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Setup and teardown hooks
beforeAll(async () => {
  // Connect to test database
  const TEST_DB_URI = process.env.TEST_DB_URI || 'mongodb://localhost:27017/monastery_test';
  
  try {
    await mongoose.connect(TEST_DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to test database');
  } catch (error) {
    console.error('Failed to connect to test database:', error);
    process.exit(1);
  }
});

afterAll(async () => {
  // Clean up and close database connection
  try {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    console.log('Test database cleaned up and closed');
  } catch (error) {
    console.error('Error cleaning up test database:', error);
  }
});

// Clean up after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    try {
      await collections[key].deleteMany({});
    } catch (error) {
      console.error(`Error cleaning collection ${key}:`, error);
    }
  }
});

// Global test utilities
global.testUtils = {
  // Create test user
  async createTestUser(userData = {}) {
    const User = require('../models/user');
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

  // Get auth token
  async getAuthToken(user) {
    return await user.getJWT();
  },

  // Wait for async operations
  async wait(ms = 100) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};

// Mock external services
jest.mock('../services/imageService', () => ({
  getMonasteryImageUrl: jest.fn().mockResolvedValue({
    url: 'https://example.com/test-image.jpg',
    source: 'fallback',
    verified: false
  }),
  updateMissingImages: jest.fn().mockResolvedValue()
}));

// Increase timeout for async operations
jest.setTimeout(10000);
