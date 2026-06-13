# My Blog

A personal blog built with Next.js, PostgreSQL, and Redis.

## Tech Stack

- **Frontend**: React, Next.js, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Container**: Docker (for PostgreSQL and Redis)

## Prerequisites

- Node.js 18+
- Docker Desktop

## Quick Start

Double click to run (auto starts PostgreSQL, Redis via Docker, and dev server):

```
start.bat
```

Or use the enhanced PowerShell version:

```
start-win.bat
```

## Manual Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start database services:
   ```bash
   docker compose up -d
   ```

3. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

4. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Stop Services

To stop the database containers:

```bash
docker compose down
```

To stop and remove all data:

```bash
docker compose down -v
```

## API Endpoints

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create a new post
- `GET /api/posts/[slug]` - Get a single post
- `PUT /api/posts/[slug]` - Update a post
- `DELETE /api/posts/[slug]` - Delete a post

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user

### Comments
- `GET /api/comments?postId=xxx` - Get comments for a post
- `POST /api/comments` - Create a new comment

## Pages

- `/` - Home page with blog post list
- `/posts/[slug]` - Individual post page
- `/admin` - Admin dashboard for managing posts

## Database Schema

- **User**: Users who can author posts and comments
- **Post**: Blog posts with title, content, slug, etc.
- **Tag**: Tags for categorizing posts
- **Comment**: Comments on posts

## Caching

Redis is used to cache:
- All posts (TTL: 30 minutes)
- Individual posts (TTL: 1 hour)

Cache is automatically invalidated when posts are created or updated.
