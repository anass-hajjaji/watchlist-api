import request from 'supertest';
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { app } from '../src/server.js'; 
import { prisma } from '../src/config/db.js';

describe('Auth API - Real Database Integration', () => {
  const testUser = {
    username: 'integration_tester',
    email: 'realtest@example.com',
    password: 'Securepassword123',
  };

  // 1. WIPE THE SLATE CLEAN
  // Delete all users before every test so Prisma's "unique email" constraint doesn't block us
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  // 2. DISCONNECT GRACEFULLY
  // Close the database connection when tests finish so the terminal doesn't hang
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should save a new user to the actual PostgreSQL database', async () => {
    // 3. FIRE THE REQUEST
    const response = await request(app)
      .post('/auth/register')
      .send(testUser);

    // 4. CHECK THE HTTP RESPONSE
    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.token).toBeDefined();

    // 5. CHECK THE ACTUAL DATABASE
    const savedUser = await prisma.user.findUnique({
      where: { email: testUser.email }
    });

    // Prove the user exists in the database
    expect(savedUser).not.toBeNull();
    expect(savedUser.username).toBe(testUser.username);
    
    // Prove the password was hashed (it shouldn't match the plain text password)
    expect(savedUser.password).not.toBe(testUser.password);
  });
  it('should login an existing user and return a JWT cookie', async () => {
    // 1. SETUP: Create the user in the database first
    await request(app).post('/auth/register').send(testUser);

    // 2. ACT: Attempt to log in with the exact same credentials
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    // 3. ASSERT: Check the HTTP response and token
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.token).toBeDefined();

    // 4. ASSERT: Verify the API attached the HttpOnly cookie
    const cookies = response.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toContain('jwt=');
  });
});