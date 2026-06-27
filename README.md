# Watchlist-api

A Node.js + Express API backed by PostgreSQL with Prisma. It includes authentication, a watchlist feature, request validation, and a small movie seed script.

## Features
- JWT-based auth (register, login, logout)
- Protected watchlist routes with ownership checks
- Prisma schema, migrations, and seed data
- Zod validation for request bodies
- Request parameter validation for important endpoints (e.g., UUID checks for `movieId`)
- Movie endpoints return related `creator` info and watchlist counts

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
- src/controllers/movieController.js: Movie list/detail logic with validation and relation includes  
- src/routes/authRoutes.js: Auth routes  
- src/routes/movieRoutes.js: Movie routes (list/detail implemented)  
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
- Loads env vars and body parsers
- Mounts routes
- Connects to DB before listening
- Handles graceful shutdown and errors

### Movie Endpoints (current behavior)
- GET `/movies` (implemented by `getAllMovies`):
  - Returns movies with `creator` (id + username) and `_count.watchlistItems`.
- GET `/movies/:movieId` (implemented by `getMovieById`):
  - Validates presence and format of `movieId` (returns `400` for missing/invalid id).
  - Uses `await` on Prisma queries and returns `404` if movie not found.
  - Includes `creator` and `_count.watchlistItems` in the response.

Notes:
- The controller validates `movieId` format before querying the DB to avoid unnecessary queries and to return clearer errors.
- A previous bug where the Prisma call lacked `await` was fixed so the existence check behaves correctly.

### Authentication
- Register:
  - Checks for existing email
  - Hashes password with bcrypt
  - Creates user and returns JWT
- Login:
  - Validates credentials and returns JWT
- Logout:
  - Clears JWT cookie

### JWT Handling
- Signed with `JWT_SECRET`
- Returned in responses and stored as httpOnly cookie
- Cookie is secure in production and sameSite strict

### Watchlist Logic
- Add:
  - Validates request body
  - Ensures movie exists
  - Prevents duplicate user+movie entries
- Update + Delete:
  - Validates ownership of the watchlist item
  - Applies changes or removes item

### Validation
- Zod schemas enforce request body shapes
- Route param validation (UUID checks) is applied for critical endpoints

### Prisma Models
- User:
  - id, email, username, password, createdAt
  - relations to Movie and Watchlist
- Movie:
  - title, overview, releaseYear, genres, createdBy, posterUrl, createdAt
- Watchlist:
  - userId + movieId unique constraint
  - status enum, rating, notes

## Environment Variables
- DATABASE_URL
- JWT_SECRET
- JWT_EXPIRE_DATE (optional)
- PORT (optional)
