# Watchlist API

A production-ready REST API for managing movies and personal watchlists, built with an enterprise-grade architecture using Node.js, Express, serverless PostgreSQL (Neon), and a dedicated Redis caching layer. Fully containerized with Docker for seamless development and deployment.

## Features

- **Enterprise Caching**: Redis-backed cache middleware with automated cache invalidation (sweepers) for lightning-fast `GET` requests.
- **Advanced Security**: Redis-backed global rate limiting, bcrypt password hashing, and duplicate entry prevention.
- **Authentication**: Register, login, and logout with JWT stored in secure `httpOnly` + `SameSite=Strict` cookies.
- **Global Error Handling**: Centralized error interception for asynchronous routes, Prisma exceptions (e.g., P2002), and JWT validations.
- **Watchlist Management**: Add, update, and delete watchlist entries with full ownership-based access control.
- **Movie Endpoints**: List and retrieve movies with creator info, watchlist counts, and optimized parallel database querying.
- **Request Validation**: Zod schemas enforce request body shapes and UUID parameter formats.
- **Containerized Environment**: One-command local development setup utilizing Docker and Docker Compose with persistent named volumes.

## Tech Stack

- **Runtime**: Node.js (v20+)
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon)
- **Cache / Rate Limiting**: Redis
- **ORM**: Prisma
- **Infrastructure**: Docker & Docker Compose
- **Auth**: JWT + bcryptjs
- **Validation**: Zod

## Project Structure

```text
watchlist-api/
├── prisma/
│   ├── schema.prisma          # Data models (User, Movie, Watchlist)
│   ├── migrations/            # SQL migration history
│   └── seed.js                # Movie seed script
├── src/
│   ├── config/
│   │   ├── db.js              # Prisma client + connect/disconnect helpers
│   │   └── redis.js           # Redis client & connection logic
│   ├── controllers/
│   │   ├── authController.js      
│   │   ├── movieController.js     
│   │   └── watchlistController.js 
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT auth guard
│   │   ├── cacheMiddleware.js     # Redis cache interceptor
│   │   ├── rateLimiter.js         # Redis-backed global limiter
│   │   ├── validateRequest.js     # Zod validation middleware
│   │   └── errorHandler.js        # Global error interceptor
│   ├── routes/
│   │   ├── authRoutes.js          # Auth endpoints
│   │   ├── movieRoutes.js         # Movie endpoints
│   │   └── watchlistRoutes.js     # Protected watchlist endpoints
│   ├── utils/
│   │   ├── cache.js               # Cache sweeper / invalidation logic
│   │   ├── catchAsync.js          # Async wrapper for controllers
│   │   ├── appError.js            # Custom operational error class
│   │   └── generateToken.js       # JWT creation + cookie config
│   ├── validators/
│   │   └── watchlistValidator.js  # Zod schemas
│   └── server.js                  # App entrypoint & boot sequence
├── docker-compose.yml             # Container orchestration
├── .env.example
└── package.json
```

## Quick Start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- A [Neon](https://neon.tech/) PostgreSQL database URL (or local Postgres)

### Setup

1. **Clone the repository**
```bash
git clone [https://github.com/anass-hajjaji/watchlist-api](https://github.com/anass-hajjaji/watchlist-api)
cd watchlist-api
```

2. **Configure environment variables**
```bash
cp .env.example .env
```
*Fill in your `.env` values, specifically your `DATABASE_URL`.*

3. **Spin up the Docker environment**
```bash
docker compose up -d
```

4. **Install dependencies inside the container**
*(Required to sync packages past the Docker anonymous volume shield)*
```bash
docker compose exec api npm install
```

5. **Run database migrations**
```bash
docker compose exec api npx prisma migrate dev
```

6. **Seed the database**
```bash
docker compose exec api node prisma/seed.js
```

API will be available at `http://localhost:3000`

## API Reference

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Create a new account | No |
| POST | `/auth/login` | Login and receive JWT | No |
| POST | `/auth/logout` | Clear JWT cookie | No |

### Movies
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/movies` | List all movies with creator info | No *(Redis Cached)* |
| GET | `/movies/:movieId` | Get a single movie by ID | No *(Redis Cached)* |
| POST | `/movies` | Add a new movie | Yes *(Sweeps Cache)* |
| PUT | `/movies/:movieId` | Update a movie | Yes *(Sweeps Cache)* |
| DELETE | `/movies/:movieId` | Delete a movie | Yes *(Sweeps Cache)* |

### Watchlist
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/watchlist` | Add a movie to your watchlist | Yes |
| PUT | `/watchlist/:id` | Update a watchlist entry (status, rating, notes) | Yes |
| DELETE | `/watchlist/:id` | Remove a movie from your watchlist | Yes |

## How It Works

### Authentication Flow
- **Register**: Checks for duplicate email → hashes password with bcrypt → creates user → returns JWT.
- **Login**: Validates credentials → returns JWT in response body and an `httpOnly` cookie.
- **Logout**: Clears the JWT cookie.
- **JWT**: Signed with `JWT_SECRET`, returned in both the response and a `Secure`, `HttpOnly`, `SameSite=Strict` cookie.

### Caching Strategy (Redis)
- **Intercept**: Read-heavy requests (e.g., `GET /movies`) are intercepted by `cacheMiddleware`. It uses `req.originalUrl` (e.g., `/movies?genre=action&page=2`) as a unique Redis key to instantly serve stringified JSON data, bypassing PostgreSQL entirely for 1 hour.
- **Invalidation**: When a database mutation occurs (`POST`, `PUT`, `DELETE`), the `clearHashCache` utility acts as a sweeper. It finds and deletes all related Redis keys using wildcard patterns (e.g., `/movies*`) to ensure the next request pulls fresh data.

### Security & Rate Limiting
- **Global Limiter**: Restricts general API traffic to 100 requests per 15-minute window per IP.
- **Redis Store**: The limiter is powered by `rate-limit-redis`, storing IP tallies directly in the Redis container for instantaneous, low-memory tracking.

### Global Error Handling
- **catchAsync**: All controllers are wrapped in a `catchAsync` utility to eliminate repetitive `try/catch` blocks.
- **Centralized Interceptor**: The `errorHandler.js` middleware catches operational errors, and JWT errors (e.g., Expired Tokens), formatting them into clean, predictable JSON responses.

### Movie Endpoints
- `GET /movies` returns all movies including the `creator` (id + username) and `_count.watchlistItems`.
- **Optimization**: The controller uses `Promise.all` to fetch paginated movie data and total counts from Prisma simultaneously, cutting query time in half.
- `GET /movies/:movieId` validates the `movieId` format before querying — returns `400` for missing or malformed UUIDs, `404` if the movie doesn't exist.

### Watchlist Logic
- **Add**: Validates request body → checks movie exists → prevents duplicate `userId + movieId` entries.
- **Update / Delete**: Validates ownership of the watchlist item before applying changes or deleting.

### Request Validation
All request bodies are validated with Zod schemas via the `validateRequest` middleware. Critical route parameters are validated for presence and UUID format before hitting the database — avoiding unnecessary queries and returning clearer error messages.

## Database Schema

### User
| Field | Type |
|-------|------|
| id | UUID |
| email | String (unique) |
| username | String |
| password | String (hashed) |
| createdAt | DateTime |

### Movie
| Field | Type |
|-------|------|
| id | UUID |
| title | String |
| overview | String |
| releaseYear | Int |
| genres | String[] |
| posterUrl | String |
| createdBy | UUID (FK → User) |
| createdAt | DateTime |

### Watchlist
| Field | Type |
|-------|------|
| id | UUID |
| userId | UUID (FK → User) |
| movieId | UUID (FK → Movie) |
| status | Enum (WATCHING, COMPLETED, DROPPED, PLAN_TO_WATCH) |
| rating | Int (nullable) |
| notes | String (nullable) |

> `userId + movieId` is unique — a user can't add the same movie twice.

## Environment Variables

```env
DATABASE_URL=postgresql://user:password@aws-region.neon.tech/watchlist
REDIS_URL=redis://redis:6379      # Uses the Docker service name
JWT_SECRET=your_super_secret_key
JWT_EXPIRE_DATE=7d                # optional, defaults to 7d
PORT=3000                         # optional, defaults to 3000
```