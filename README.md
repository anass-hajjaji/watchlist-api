# Backend Course API

A Node.js + Express API backed by PostgreSQL with Prisma. It includes authentication, a watchlist feature, validation, and a small movie seed script.

## Features
- JWT-based auth (register, login, logout)
- Protected watchlist routes with ownership checks
- Prisma schema, migrations, and seed data
- Zod validation for request bodies

## Tech Stack
- Node.js + Express
- PostgreSQL + Prisma
- JWT + bcryptjs
- Zod validation

## Project Structure
- src/server.js: App entrypoint and server setup
- src/config/db.js: Prisma client + connect/disconnect helpers
- src/controllers/authController.js: Register/login/logout logic
- src/controllers/watchlistController.js: Watchlist CRUD logic
- src/routes/authRoutes.js: Auth routes
- src/routes/movieRoutes.js: Placeholder movie route
- src/routes/watchlistRoutes.js: Watchlist routes (protected)
- src/middleware/authmiddleware.js: JWT auth guard
- src/middleware/validateRequest.js: Zod request validation
- src/utils/generateToken.js: JWT creation + cookie settings
- src/validator/watchlistValidator.js: Zod schemas
- prisma/schema.prisma: Data models
- prisma/migrations: SQL migrations
- prisma/seed.js: Seed movies

## How It Works

### Server Boot
- Loads env vars and sets body parsers
- Mounts routes
- Connects to DB before listening
- Handles graceful shutdown and errors

### Authentication
- Register:
  - Checks for existing email
  - Hashes password with bcrypt
  - Creates user
  - Returns JWT
- Login:
  - Validates credentials
  - Returns JWT
- Logout:
  - Clears JWT cookie

### JWT Handling
- Signed with JWT_SECRET
- Returned in response and also stored as httpOnly cookie
- Cookie is secure in production and sameSite strict

### Watchlist Logic
- Add:
  - Validates request body
  - Ensures movie exists
  - Prevents duplicate user+movie entry
- Update + Delete:
  - Validates ownership of the watchlist item
  - Applies changes or removes item

### Validation
- Zod schemas enforce input shape and constraints

### Prisma Models
- User:
  - id, email, name, password, createdAt
  - relations to Movie and Watchlist
- Movie:
  - title, overview, releaseYear, genres, createdBy, etc
- Watchlist:
  - userId + movieId unique constraint
  - status enum, rating, notes

## Environment Variables
- DATABASE_URL
- JWT_SECRET
- JWT_EXPIRE_DATE (optional)
- PORT (optional)

## Scripts
- npm run dev
- npm run seed:movies

## Notes / Things To Know
- Watchlist routes use /:movieId, but the controller treats it as the watchlist item id. Consider renaming to /:watchlistId or changing query logic.
- Seed script uses a fixed creatorId. Make sure that user exists before seeding.
