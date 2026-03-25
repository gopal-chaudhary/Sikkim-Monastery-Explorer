const request = require('supertest');
const { testUtils, testData } = require('../utils/testUtils');

describe('Authentication Endpoints', () => {
  testUtils.setupTestDB();

  describe('POST /signup', () => {
    it('should create a new user with valid data', async () => {
      const response = await request(app)
        .post('/signup')
        .send(testData.validUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'User created successfully');
      expect(response.body.user).toHaveProperty('firstName', testData.validUser.firstName);
      expect(response.body.user).toHaveProperty('emailId', testData.validUser.emailId);
      expect(response.body.user).not.toHaveProperty('password'); // Password should not be returned
    });

    it('should reject invalid user data', async () => {
      const response = await request(app)
        .post('/signup')
        .send(testData.invalidUser);

      testUtils.expectError(response, 400);
    });

    it('should reject duplicate email', async () => {
      // Create first user
      await testUtils.createTestUser(testData.validUser);

      // Try to create second user with same email
      const response = await request(app)
        .post('/signup')
        .send(testData.validUser);

      testUtils.expectError(response, 400);
    });

    it('should reject weak password', async () => {
      const weakPasswordUser = {
        ...testData.validUser,
        emailId: 'weak@example.com',
        password: '123'
      };

      const response = await request(app)
        .post('/signup')
        .send(weakPasswordUser);

      testUtils.expectError(response, 400);
    });
  });

  describe('POST /login', () => {
    beforeEach(async () => {
      await testUtils.createTestUser(testData.validUser);
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          emailId: testData.validUser.emailId,
          password: testData.validUser.password
        });

      testUtils.expectSuccess(response);
      expect(response.body).toHaveProperty('firstName', testData.validUser.firstName);
      expect(response.headers['set-cookie']).toBeDefined(); // Should set auth cookie
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          emailId: 'wrong@example.com',
          password: testData.validUser.password
        });

      testUtils.expectError(response, 400);
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          emailId: testData.validUser.emailId,
          password: 'wrongpassword'
        });

      testUtils.expectError(response, 400);
    });

    it('should reject missing credentials', async () => {
      const response = await request(app)
        .post('/login')
        .send({});

      testUtils.expectError(response, 400);
    });
  });

  describe('POST /logout', () => {
    it('should logout authenticated user', async () => {
      const user = await testUtils.createTestUser(testData.validUser);
      const token = await testUtils.getAuthToken(user);

      const response = await testUtils.authenticatedRequest('POST', '/logout', null, token);

      testUtils.expectSuccess(response);
      expect(response.body).toHaveProperty('message', 'User logged out successfully');
    });
  });
});

describe('Profile Endpoints', () => {
  testUtils.setupTestDB();

  describe('GET /profile', () => {
    it('should return user profile for authenticated user', async () => {
      const user = await testUtils.createTestUser(testData.validUser);
      const token = await testUtils.getAuthToken(user);

      const response = await testUtils.authenticatedRequest('GET', '/profile', null, token);

      testUtils.expectSuccess(response);
      expect(response.body).toHaveProperty('firstName', user.firstName);
      expect(response.body).toHaveProperty('emailId', user.emailId);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should reject unauthenticated request', async () => {
      const response = await request(app)
        .get('/profile');

      testUtils.expectError(response, 401);
    });
  });

  describe('PATCH /profile/edit', () => {
    it('should update user profile with valid data', async () => {
      const user = await testUtils.createTestUser(testData.validUser);
      const token = await testUtils.getAuthToken(user);

      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        about: 'Updated about section',
        age: 35
      };

      const response = await testUtils.authenticatedRequest(
        'PATCH',
        '/profile/edit',
        updateData,
        token
      );

      testUtils.expectSuccess(response);
      expect(response.body.data).toHaveProperty('firstName', 'Updated');
      expect(response.body.data).toHaveProperty('lastName', 'Name');
    });

    it('should reject invalid update data', async () => {
      const user = await testUtils.createTestUser(testData.validUser);
      const token = await testUtils.getAuthToken(user);

      const invalidUpdate = {
        firstName: 'A', // Too short
        age: -5 // Invalid
      };

      const response = await testUtils.authenticatedRequest(
        'PATCH',
        '/profile/edit',
        invalidUpdate,
        token
      );

      testUtils.expectError(response, 400);
    });

    it('should reject unauthorized field updates', async () => {
      const user = await testUtils.createTestUser(testData.validUser);
      const token = await testUtils.getAuthToken(user);

      const unauthorizedUpdate = {
        role: 'admin', // Should not be updatable
        password: 'newpassword' // Should not be updatable this way
      };

      const response = await testUtils.authenticatedRequest(
        'PATCH',
        '/profile/edit',
        unauthorizedUpdate,
        token
      );

      testUtils.expectError(response, 400);
    });
  });
});

describe('Profile Image Upload', () => {
  testUtils.setupTestDB();

  describe('POST /api/profile/upload-image', () => {
    it('should upload profile image successfully', async () => {
      const user = await testUtils.createTestUser(testData.validUser);
      const token = await testUtils.getAuthToken(user);

      // Mock image file
      const imageBuffer = Buffer.from('fake-image-data');
      
      const response = await request(app)
        .post('/api/profile/upload-image')
        .set('Cookie', `token=${token}`)
        .attach('profileImage', imageBuffer, 'test.jpg');

      testUtils.expectSuccess(response);
      expect(response.body).toHaveProperty('imageUrl');
      expect(response.body.imageUrl).toMatch(/\/uploads\/profile\/.*\.jpg$/);
    });

    it('should reject non-image files', async () => {
      const user = await testUtils.createTestUser(testData.validUser);
      const token = await testUtils.getAuthToken(user);

      const textBuffer = Buffer.from('not-an-image');
      
      const response = await request(app)
        .post('/api/profile/upload-image')
        .set('Cookie', `token=${token}`)
        .attach('profileImage', textBuffer, 'test.txt');

      testUtils.expectError(response, 400);
    });

    it('should reject oversized files', async () => {
      const user = await testUtils.createTestUser(testData.validUser);
      const token = await testUtils.getAuthToken(user);

      // Create a large buffer (6MB - over the 5MB limit)
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024);
      
      const response = await request(app)
        .post('/api/profile/upload-image')
        .set('Cookie', `token=${token}`)
        .attach('profileImage', largeBuffer, 'large.jpg');

      testUtils.expectError(response, 400);
    });
  });

  describe('DELETE /api/profile/remove-image', () => {
    it('should remove profile image successfully', async () => {
      const user = await testUtils.createTestUser(testData.validUser);
      const token = await testUtils.getAuthToken(user);

      // First upload an image
      const imageBuffer = Buffer.from('fake-image-data');
      const uploadResponse = await request(app)
        .post('/api/profile/upload-image')
        .set('Cookie', `token=${token}`)
        .attach('profileImage', imageBuffer, 'test.jpg');

      testUtils.expectSuccess(uploadResponse);

      // Then remove it
      const removeResponse = await request(app)
        .delete('/api/profile/remove-image')
        .set('Cookie', `token=${token}`);

      testUtils.expectSuccess(removeResponse);
      expect(removeResponse.body).toHaveProperty('message', 'Profile image removed successfully');
    });
  });
});
