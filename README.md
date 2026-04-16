# @roastery-capsules/models.models

Models entries management capsule for the [Roastery CMS](https://github.com/roastery-cms) ecosystem — CRUD operations, type-scoped pagination, batch loading by ids, caching, and cookie-based JWT authentication.

[![Checked with Biome](https://img.shields.io/badge/Checked_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev)

## Overview

**@roastery-capsules/models.models** is an [Elysia](https://elysiajs.com) capsule that exposes the `Models` aggregate: entries whose `data` is a JSON payload validated at creation and update time against the TypeBox schema declared by their associated `ModelsType`.

The capsule can be used in two modes:

- **Standalone microservice** — `bun run start:dev` spins up a server that mounts both `/models` (this capsule) and `/models-types` (the sibling capsule `@roastery-capsules/models.models-type`) in the same process, so a single binary can serve the whole Models domain.
- **Elysia plugin** — mount only `ModelsRoutes` in a host application and wire in your own `ModelsType` service (remote or in-process).

## Architecture

```
src/
├── domain/          # Models entity, value objects, repository interfaces
├── application/     # Use cases (Create, Find, FindMany*, Update, Delete, Count) and DTOs
├── infra/           # Repository implementations (Prisma, In-memory, Cached, Api) and factories
└── presentation/    # Controllers, routes, plugins, tags, and dev bootstrap
```

## Technologies

| Tool | Purpose |
|------|---------|
| [Elysia](https://elysiajs.com) | HTTP framework (via `@roastery/barista`) |
| [Prisma](https://www.prisma.io) | ORM for PostgreSQL (via `@roastery-adapters/models`) |
| [Redis](https://redis.io) | Caching layer (via `@roastery-adapters/cache`) |
| [Eden Treaty](https://elysiajs.com/eden/treaty) | Type-safe client used by `ApiModelsTypeRepository` |
| [tsup](https://tsup.egoist.dev) | Bundling to ESM + CJS with `.d.ts` generation |
| [Bun](https://bun.sh) | Runtime, test runner, and package manager |
| [Knip](https://knip.dev) | Unused exports and dependency detection |
| [Husky](https://typicode.github.io/husky) + [commitlint](https://commitlint.js.org) | Git hooks and conventional commit enforcement |

## Installation

```bash
bun add @roastery-capsules/models.models
```

---

## API

All routes are prefixed with `/models`.

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/models/` | Create a new models entry | Yes |
| `GET` | `/models/` | List entries scoped to a models type (paginated) | No |
| `GET` | `/models/by-ids` | Batch-load entries by a CSV of UUIDs | No |
| `GET` | `/models/:id` | Find a models entry by id | No |
| `PATCH` | `/models/:id` | Update a models entry | Yes |
| `DELETE` | `/models/:id` | Delete a models entry | Yes |

When the capsule is started as a standalone microservice, the same binary also exposes the full `/models-types` CRUD from `@roastery-capsules/models.models-type`, so you can manage the schema catalog without running a second service.

### Query parameters

| Parameter | Endpoint | Type | Description |
|-----------|----------|------|-------------|
| `page` | `GET /models/` | `number` | Page number (defaults to `1`) |
| `typeId` | `GET /models/` | `uuid` | **Required** — scopes results to a single models type |
| `ids` | `GET /models/by-ids` | `string` | Comma-separated list of UUIDs (e.g. `id1,id2,id3`) |

### Response headers

| Header | Description |
|--------|-------------|
| `X-Total-Count` | Total number of entries for the requested `typeId` |
| `X-Total-Pages` | Total pages available for the requested `typeId` |

### Authentication

Protected endpoints require cookie-based JWT authentication. The login endpoint (`POST /auth/login`) sets an HTTP cookie with the JWT token — no `Authorization: Bearer` header is needed. Subsequent requests to protected routes must include this cookie.

```typescript
// Login returns Set-Cookie header
const response = await api.auth.login.post({ email, password });

// Cookies are automatically sent in subsequent requests (browser)
// or manually forwarded:
const cookies = response.headers.getSetCookie();
await api.models.post(body, {
  headers: { cookie: cookies.join("; ") },
});
```

---

## Usage

### As a standalone microservice

```bash
bun run start:dev
```

### As a plugin in another Roastery app

```typescript
import { ModelsRoutes } from "@roastery-capsules/models.models/presentation/routes";

app.use(
  ModelsRoutes({
    cacheProvider: "REDIS",
    jwtSecret: JWT_SECRET,
    modelsRepository,
    modelsTypeRepository,
    redisUrl: REDIS_URL,
  }),
);
```

`modelsTypeRepository` only needs to implement `findById(id): Promise<IModelsType | null>` — it can be a remote client (`ApiModelsTypeRepository`) or an in-memory stub.

### Models entity

Each `Models` entry has the following properties:

| Field | Type | Description |
|-------|------|-------------|
| `type` | `IModelsType` | The models type that defines the expected schema for `data` |
| `data` | `string` | JSON-serialized payload validated against `type.schema` via `ValidInfoVO` |

### Creating a models entry

```http
POST /models/
Content-Type: application/json

{
  "typeId": "550e8400-e29b-41d4-a716-446655440000",
  "data": "{\"name\":\"Alan\",\"age\":22}"
}
```

### Listing entries for a type

```http
GET /models/?page=1&typeId=550e8400-e29b-41d4-a716-446655440000
```

### Batch loading by ids

```http
GET /models/by-ids?ids=550e8400-e29b-41d4-a716-446655440000,123e4567-e89b-12d3-a456-426614174000
```

### Updating an entry

```http
PATCH /models/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{
  "data": "{\"name\":\"Alan\",\"age\":23}"
}
```

### Deleting an entry

```http
DELETE /models/550e8400-e29b-41d4-a716-446655440000
```

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `DEVELOPMENT`, `TESTING` or `PRODUCTION` |
| `PORT` | Yes | Server port |
| `JWT_SECRET` | Yes | Secret for JWT signing |
| `AUTH_EMAIL` | Yes | Admin email for authentication |
| `AUTH_PASSWORD` | Yes | Admin password for authentication |
| `DATABASE_PROVIDER` | No | `PRISMA` or `MEMORY` (default: `MEMORY`) |
| `DATABASE_URL` | No | PostgreSQL connection string (required if `PRISMA`) |
| `CACHE_PROVIDER` | No | `REDIS` or `MEMORY` (default: `MEMORY`) |
| `REDIS_URL` | No | Redis connection string (required if `REDIS`) |
| `MODELS_TYPE_BASE_URL` | No | External `models-type` service URL (when unset, falls back to an in-memory consumer repository) |

---

## Development

```bash
# Start dev server with hot reload
bun run start:dev

# Run unit tests
bun run test:unit

# Run tests with coverage
bun run test:coverage

# Build for distribution
bun run build

# Check for unused exports and dependencies
bun run knip

# Full setup (build + bun link)
bun run setup
```

## License

MIT
