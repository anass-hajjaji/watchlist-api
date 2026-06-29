# Watchlist API

A production-ready REST API for managing movies and personal watchlists, built with Node.js, Express, PostgreSQL, and Prisma. Includes JWT authentication, ownership-based access control, request validation, and a movie seed script.

## Features

- **Authentication**: Register, login, and logout with JWT stored in secure httpOnly cookies
- **Watchlist Management**: Add, update, and delete watchlist entries with full ownership checks
- **Movie Endpoints**: List and retrieve movies with creator info and watchlist counts
- **Request Validation**: Zod schemas enforce request body shapes and UUID parameter formats
- **Security**: bcrypt password hashing, httpOnly + SameSite cookies, duplicate entry prevention
- **Database**: Prisma ORM with PostgreSQL — schema, migrations, and seed data included

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: JWT + bcryptjs
- **Validation**: Zod

## Project Structure

```
watchlist-api/
├── prisma/
│   ├── schema.prisma        # Data models (User, Movie, Watchlist)
│   ├── migrations/          # SQL migration history
│   └── seed.js              # Movie seed script
├── src/
│   ├── config/
│   │   └── db.js            # Prisma client + connect/disconnect helpers
│   ├── controllers/
│   │   ├── authController.js       # Register / login / logout
│   │   ├── movieController.js      # Movie list and detail logic
│   │   └── watchlistController.js  # Watchlist CRUD logic
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT auth guard
│   │   └── validateRequest.js      # Zod validation middleware
│   ├── routes/
│   │   ├── authRoutes.js           # Auth endpoints
│   │   ├── movieRoutes.js          # Movie endpoints
│   │   └── watchlistRoutes.js      # Protected watchlist endpoints
│   ├── utils/
│   │   └── generateToken.js        # JWT creation + cookie config
│   ├── validators/
│   │   └── watchlistValidator.js   # Zod schemas
│   └── server.js                   # App entrypoint
├── .env.example
└── package.json
```

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL running locally or via a cloud provider (e.g. Neon)
- pnpm / npm / yarn

### Setup

1. **Clone the repository**

```bash
git clone https://github.com/anass-hajjaji/watchlist-api
cd watchlist-api
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

```bash
cp .env.example .env
```

Then fill in your values (see [Environment Variables](#environment-variables)).

4. **Run database migrations**

```bash
npx prisma migrate dev
```

5. **Seed the database**

```bash
node prisma/seed.js
```

6. **Start the server**

```bash
npm run dev
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
| GET | `/movies` | List all movies with creator info and watchlist counts | No |
| GET | `/movies/:movieId` | Get a single movie by ID | No |

### Watchlist

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/watchlist` | Add a movie to your watchlist | Yes |
| PUT | `/watchlist/:id` | Update a watchlist entry (status, rating, notes) | Yes |
| DELETE | `/watchlist/:id` | Remove a movie from your watchlist | Yes |

## How It Works

### Authentication Flow

- **Register**: Checks for duplicate email → hashes password with bcrypt → creates user → returns JWT
- **Login**: Validates credentials → returns JWT in response body and httpOnly cookie
- **Logout**: Clears the JWT cookie
- **JWT**: Signed with `JWT_SECRET`, returned in both the response and a `Secure`, `HttpOnly`, `SameSite=Strict` cookie

### Movie Endpoints

- `GET /movies` returns all movies including the `creator` (id + username) and `_count.watchlistItems`
- `GET /movies/:movieId` validates the `movieId` format before querying — returns `400` for missing or malformed UUIDs, `404` if the movie doesn't exist

### Watchlist Logic

- **Add**: Validates request body → checks movie exists → prevents duplicate `userId + movieId` entries
- **Update / Delete**: Validates ownership of the watchlist item before applying changes or deleting

### Request Validation

All request bodies are validated with Zod schemas via the `validateRequest` middleware. Critical route parameters (e.g. `movieId`) are validated for presence and UUID format before hitting the database — avoiding unnecessary queries and returning clearer error messages.

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
DATABASE_URL=postgresql://user:password@localhost:5432/watchlist
JWT_SECRET=your_super_secret_key
JWT_EXPIRE_DATE=7d        # optional, defaults to 7d
PORT=3000                 # optional, defaults to 3000
```
