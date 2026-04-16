# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.1] - 2026-04-16

### Added

#### Domain

- `Models` entity with `type` (reference to a `ModelsType`) and `data` (JSON payload validated against `type.schema`)
- `ValidInfoVO` value object enforcing that `data` matches the schema declared by the associated models type
- `UnpackedModelsSchema` composite schema combining entity and DTO properties
- Repository interfaces: `IModelsRepository` (composite), `IModelsReader` (with `findById`, `findByModelsTypeId`, `findManyByIds`, `countByModelsTypeId`), `IModelsWriter`, and consumer-facing `IModelsTypeRepository` (only `findById`)

#### Application

- `CreateModelsDTO` with validation for `typeId` (UUID) and `data` (JSON string, `minLength: 2`)
- `UpdateModelsDTO` with optional `data` field and `minProperties: 1` for partial updates
- `FindModelsTypeService` to resolve the `ModelsType` from the remote/consumer repository before create and list operations
- `CreateModelsUseCase` orchestrating type resolution and entity creation
- `FindModelsByIdUseCase` for retrieving a single entry (throws `ResourceNotFoundException` when missing)
- `FindManyModelsByModelsTypeIdUseCase` for paginated listing scoped to a single type, including total count and page calculation
- `FindManyModelsByIdsUseCase` for batch-loading entries by a list of ids (missing ids are silently skipped)
- `CountModelsByModelsTypeIdUseCase` for internal count/page calculation (not exposed via HTTP)
- `UpdateModelsUseCase` with `InvalidOperationException` when the body is empty
- `DeleteModelsUseCase` for entity removal by id

#### Infrastructure

- Prisma repository with `@SafePrisma` decorator, supporting `create`, `update`, `delete`, `findById`, `findByModelsTypeId`, `findManyByIds`, and `countByModelsTypeId`
- Cached repository (decorator pattern) with Redis caching and automatic cache invalidation on writes
- In-memory test repositories for both `Models` and the consumer-facing `ModelsType` projection, with `seed`/`clear` utilities
- `ApiModelsTypeRepository` via Eden Treaty for consuming a remote `models.models-type` microservice
- `PrismaModelsMapper`, `CachedModelsMapper`, and `ModelsTypeMapper` (API) for data transformation across layers
- Repository factories `makeModelsRepository` (Prisma/Memory selection via `DATABASE_PROVIDER`) and `makeModelsTypeRepository` (API/Memory selection via `MODELS_TYPE_BASE_URL`)
- Application-layer factories for every use case and for `FindModelsTypeService`
- `ModelsDependenciesDTO` for environment variable validation (`DATABASE_URL`, `DATABASE_PROVIDER`, `MODELS_TYPE_BASE_URL`)
- `makeModels` domain factory helper for testing

#### Presentation

- `POST /models/` — create a models entry (authenticated)
- `GET /models/` — list entries scoped to a `typeId`, with `X-Total-Count` / `X-Total-Pages` pagination headers (public)
- `GET /models/by-ids` — batch-load entries by a comma-separated list of UUIDs (public)
- `GET /models/:id` — find a models entry by id (public)
- `PATCH /models/:id` — partial update (authenticated)
- `DELETE /models/:id` — remove a models entry (authenticated, responds `204`)
- `ModelsRepositoryPlugin` decorating `modelsRepository` and `modelsTypeRepositoryForModels` for controller dependency injection
- `ModelsRoutes` grouping all six endpoints under the `/models` prefix
- Controller-level DTOs: `ModelsIdParamDTO`, `FindManyModelsQueryDTO` (`page` + required `typeId`), `FindManyModelsResponseDTO`, and `FindManyModelsByIdsQueryDTO` (CSV of UUIDs enforced by pattern)
- Bootstrap in `src/presentation/server/bootstrap.ts` composing `CacheEnvDependenciesDTO`, `AuthEnvDependenciesDTO`, `ModelsDependenciesDTO`, and `ModelsTypeDependenciesDTO`, wiring error/response handlers, cache, Prisma/Memory repositories for both `Models` and the full `ModelsType` store, `GetAccessController`, `ModelsTypeRoutes` + `ModelsRoutes`, and Swagger (`BaristaAuthTags`, `ModelsTypeTags`, `ModelsTags`)
- Development entry point at `src/presentation/server/dev/index.mts`
- `start:dev` script launching the bootstrap with `bun --watch`
