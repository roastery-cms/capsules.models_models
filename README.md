# @roastery-capsules/models.models-type

Models type management capsule for the [Roastery CMS](https://github.com/roastery-cms) ecosystem.

[![Checked with Biome](https://img.shields.io/badge/Checked_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev)

## Overview

**@roastery-capsules/models.models-type** is an [Elysia](https://elysiajs.com) capsule that provides full CRUD management for models types, including TypeBox schema definition, automatic slug generation, uniqueness validation, pagination, and optional Redis caching.

It exposes `ModelsTypeRoutes`, an Elysia plugin ready to be mounted in your application, with the following endpoints:

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/models-types/` | Required | Create a new models type |
| `GET` | `/models-types/` | Public | List models types (paginated) |
| `GET` | `/models-types/:id-or-slug` | Public | Get models type by ID or slug |
| `PATCH` | `/models-types/:id-or-slug` | Required | Update a models type |
| `DELETE` | `/models-types/:id-or-slug` | Required | Delete a models type |

## Technologies

| Tool | Purpose |
|------|---------|
| [Elysia](https://elysiajs.com) | HTTP framework and plugin target |
| [@roastery/barista](https://github.com/roastery-cms) | Elysia application factory |
| [@roastery/terroir](https://github.com/roastery-cms) | Runtime schema validation and exception handling |
| [@roastery/beans](https://github.com/roastery-cms) | Domain entity base class |
| [@roastery/seedbed](https://github.com/roastery-cms) | Repository and use-case contracts |
| [@roastery-adapters/models](https://github.com/roastery-cms) | Prisma models repository adapter |
| [@roastery-adapters/cache](https://github.com/roastery-cms) | Redis caching adapter |
| [@roastery-capsules/auth](https://github.com/roastery-cms) | Authentication plugin |
| [Prisma](https://www.prisma.io) | ORM for data persistence |
| [tsup](https://tsup.egoist.dev) | Bundling to ESM + CJS with `.d.ts` generation |
| [Bun](https://bun.sh) | Runtime, test runner, and package manager |
| [Knip](https://knip.dev) | Unused exports and dependency detection |
| [Husky](https://typicode.github.io/husky) + [commitlint](https://commitlint.js.org) | Git hooks and conventional commit enforcement |

## Installation

```bash
bun add @roastery-capsules/models.models-type
```

**Peer dependencies** (install alongside):

```bash
bun add @types/bun tsup typescript
```

---

## Usage

```typescript
import { Elysia } from 'elysia';
import { ModelsTypeRoutes } from '@roastery-capsules/models.models-type/presentation';

const app = new Elysia()
  .use(ModelsTypeRoutes({ repository }))
  .listen(3000);
```

### Models type entity

Each `ModelsType` has the following properties:

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Display name (e.g. `"Review"`, `"Product"`) |
| `slug` | `string` | URL-friendly identifier (auto-generated from name) |
| `description` | `string` | Brief description of the models type |
| `schema` | `string` | Serialized TypeBox schema defining the content structure |

### Creating a models type

```http
POST /models-types/
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Review",
  "description": "A review written by a user about a product.",
  "schema": "<serialized TypeBox schema via SchemaManager>"
}
```

### Listing models types

```http
GET /models-types/?page=1
```

### Getting a models type by ID or slug

```http
GET /models-types/review
GET /models-types/<uuid>
```

### Updating a models type

```http
PATCH /models-types/review?update-slug=true
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Book Review",
  "description": "A review about a book."
}
```

### Deleting a models type

```http
DELETE /models-types/review
Authorization: Bearer <token>
```

---

## Development

```bash
# Run tests
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
