import request from 'supertest';
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { app } from '../src/server.js'; 
import { prisma } from '../src/config/db.js';

describe('Watchlist API - Real Database Integration', () => {
  const testUser = {
    username: 'watchlist_tester',
    email: 'watcher@example.com',
    password: 'Securepassword123!',
  };

  let authCookie; 
  let testMovieId; 

  // 1. WIPE AND SETUP (Give it 15 seconds to complete)
  beforeEach(async () => {
    await prisma.watchlist.deleteMany();
    await prisma.movie.deleteMany();
    await prisma.user.deleteMany();

    await request(app).post('/auth/register').send(testUser);
    const loginRes = await request(app).post('/auth/login').send({
      email: testUser.email,
      password: testUser.password
    });
    
    authCookie = loginRes.headers['set-cookie'];

    const savedUser = await prisma.user.findUnique({ where: { email: testUser.email } });
    const dummyMovie = await prisma.movie.create({
      data: {
        title: 'Integration Test Movie',
        overview: 'A movie created by Vitest.',
        releaseYear: 2026,
        createdBy: savedUser.id
      }
    });
    testMovieId = dummyMovie.id;
  }, 15000); // 👈 Increased timeout to 15000ms

  afterAll(async () => {
    await prisma.$disconnect();
  });

  
  // 2. THE TEST (Give it 15 seconds to complete)
  it('should allow an authenticated user to add a movie to their watchlist', async () => {
    const response = await request(app)
      .post('/watchlist')
      .set('Cookie', authCookie)
      .send({
        movieId: testMovieId,
        status: 'WATCHING',
        rating: 9
      });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.data.watchlistItem.movieId).toBe(testMovieId);

    const savedEntry = await prisma.watchlist.findFirst({
      where: { movieId: testMovieId }
    });

    expect(savedEntry).not.toBeNull();
    expect(savedEntry.status).toBe('WATCHING');
    expect(savedEntry.rating).toBe(9);
  }, 15000); // 👈 Increased timeout to 15000ms
});