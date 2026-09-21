import request from 'supertest';
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { app } from '../src/server.js'; 
import { prisma } from '../src/config/db.js';

describe('Movie API - Real Database Integration', () => {
  const testUser = {
    username: 'movie_tester',
    email: 'movietester@example.com',
    password: 'Securepassword123!',
  };

  let authCookie;
  let savedUser;
  let testMovie;

  beforeEach(async () => {
    //bulldoze
    await prisma.watchlist.deleteMany();
    await prisma.movie.deleteMany();
    await prisma.user.deleteMany();

    // setup authenticated user
    await request(app).post('/auth/register').send(testUser);
    const loginRes = await request(app).post('/auth/login').send({
      email: testUser.email,
      password: testUser.password
    });  
    authCookie = loginRes.headers['set-cookie'];
    savedUser = await prisma.user.findUnique({ where: { email: testUser.email } });
  
    // 🎯 SEED THE DATABASE
    testMovie = await prisma.movie.create({
      data: {
        title: 'Global Seed Movie',
        overview: 'This movie is available for all tests to read.',
        releaseYear: 2025,
        genres: ['Drama'],
        runtime: 90,
        createdBy: savedUser.id
      }
    });
  }, 15000);
   
  afterAll(async () => {
    await prisma.$disconnect();
  });

  // test create movie by authenticated user
  it ('should allow an authenticated user to create a new movie', async () => {
    const newMovieData = {
      title: 'New Movie from Vitest',
      overview: 'This is a test movie created during integration testing.',
      releaseYear: 2025,
      genres: ['Action', 'Adventure'],
      runtime: 120,
      posterUrl: 'http://example.com/poster.jpg', 
      createdBy: savedUser.id
    };

    const response = await request(app)
      .post('/movies')
      .set('Cookie', authCookie)
      .send(newMovieData);

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.movie.title).toBe(newMovieData.title);
    expect(response.body.movie.releaseYear).toBe(newMovieData.releaseYear);

    // THE DOUBLE CHECK: Did it actually save to the hard drive?
    const movieInDatabase = await prisma.movie.findFirst({
      where: { title: newMovieData.title }
    });

    expect(movieInDatabase).toBeDefined();
    expect(movieInDatabase.releaseYear).toBe(newMovieData.releaseYear);
  });

  // TEST: GET ALL MOVIES
  it("it should get all movies", async () => {
    const response = await request(app).get('/movies');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.movies)).toBe(true); 

    // Prove the seed movie is in the array
    const fetchedMovie = response.body.movies.find(m => m.id === testMovie.id);
    expect(fetchedMovie).toBeDefined();
    expect(fetchedMovie.title).toBe('Global Seed Movie');
  });

  it('should get a single movie by ID', async () => {
    const response = await request(app).get(`/movies/${testMovie.id}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.movie.id).toBe(testMovie.id);
    expect(response.body.movie.title).toBe('Global Seed Movie');
  });

  // TEST PATCH MOVIE
  it('should update (PATCH) single movie by its creator' , async () => {
    const response = await request(app)
    .patch(`/movies/${testMovie.id}`)
    .set('Cookie', authCookie)
    .send({
      title: "the modified title"
    })
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.movie.title).toBe("the modified title");

    // DOUBLE CHECK: Did it actually update in the database?
    const updatedMovie = await prisma.movie.findUnique({
      where: { id: testMovie.id }
    });
    expect(updatedMovie.title).toBe("the modified title");
  });
});