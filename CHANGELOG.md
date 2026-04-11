# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.1] - 2026-04-10

### Added

#### Domain

- `ModelsType` entity with `name`, `slug`, `description`, and `schema` properties
- `SchemaVO` value object for TypeBox schema serialization and validation via `SchemaManager`
- `UnpackedModelsTypeSchema` composite schema combining entity and DTO properties
- Repository interfaces: `IModelsTypeRepository` (composite), `IModelsTypeReader`, `IModelsTypeWriter`

#### Application

- `CreateModelsTypeDTO` with validation for `name` (non-empty string), `description` (string), and `schema` (JSON string)
- `UpdateModelsTypeDTO` with optional `name`, `slug`, and `description` fields for partial updates
- `SlugUniquenessCheckerService` to enforce unique slugs across models types
- `CreateModelsTypeUseCase` orchestrating slug uniqueness check and entity creation
- `FindModelsTypeUseCase` for retrieving a models type by ID or slug
- `FindManyModelsTypeUseCase` for paginated listing with total count
- `UpdateModelsTypeUseCase` for partial updates with optional slug regeneration
- `DeleteModelsTypeUseCase` for entity removal by ID or slug
- `CountModelsTypeUseCase` for total count and page calculation

#### Infrastructure

- Prisma repository with `@SafePrisma` decorator, supporting `create`, `update`, `delete`, `findById`, `findBySlug`, `findMany`, and `count`
- Cached repository (decorator pattern) with Redis caching and automatic cache invalidation on writes
- In-memory test repository for `ModelsType` with `seed`/`clear` utilities
- `PrismaModelsTypeMapper` and `CachedModelsTypeMapper` for data transformation across layers
- Repository factory (`makeModelsTypeRepository`) with strategy selection via `DATABASE_PROVIDER`
- Application factories for all use cases and services
- `ModelsTypeDependenciesDTO` for environment variable validation (`DATABASE_URL`, `DATABASE_PROVIDER`)

#### Presentation

- `POST /models-types/` — create models type (authenticated)
- `GET /models-types/` — list models types with pagination headers (public)
- `GET /models-types/:id-or-slug` — find models type by ID or slug (public)
- `PATCH /models-types/:id-or-slug` — update models type with optional slug regeneration (authenticated)
- `DELETE /models-types/:id-or-slug` — delete models type (authenticated)
- `ModelsTypeRepositoryPlugin` for dependency injection into controllers
- `ModelsTypeRoutes` grouping all endpoints under `/models-types` prefix
- Bootstrap server with environment-based repository strategy, cache adapter, auth, error handling, and Swagger docs
