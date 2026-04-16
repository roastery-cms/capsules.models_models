import { beforeEach, describe, expect, it } from "bun:test";
import { makeEntity } from "@roastery/beans/entity/factories";
import { EntitySource } from "@roastery/beans/entity/symbols";
import { type BaristaCacheInstance, cache } from "@roastery-adapters/cache";
import { ModelsType } from "@roastery-capsules/models.models-type/domain";
import { Models } from "@/domain";
import type { IModels } from "@/domain/types";
import { ModelsRepository as TestModelsRepository } from "../test/models.repository";
import { ModelsRepository as CachedModelsRepository } from "./models.repository";

const schemaString =
    '{"type":"object","properties":{"content":{"type":"string","minLength":1}},"required":["content"]}';

const makeModelsType = (entityProps = makeEntity()) =>
    ModelsType.make(
        {
            name: "Article",
            slug: "article",
            description: "A content type for articles",
            schema: schemaString,
        },
        entityProps,
    );

const makeModels = (entityProps = makeEntity()): IModels =>
    Models.make(
        {
            data: '{"content":"Hello world"}',
            type: makeModelsType(),
        },
        entityProps,
    );

const idKey = (id: string) => `${Models[EntitySource]}::$${id}`;

describe("CachedModelsRepository", () => {
    let cacheInstance: BaristaCacheInstance;
    let innerRepository: TestModelsRepository;
    let repository: CachedModelsRepository;

    beforeEach(async () => {
        const app = cache({ CACHE_PROVIDER: "MEMORY" });
        cacheInstance = app.decorator.cache;
        await (
            cacheInstance as unknown as { flushall(): Promise<void> }
        ).flushall();
        innerRepository = new TestModelsRepository();
        repository = new CachedModelsRepository(innerRepository, cacheInstance);
    });

    describe("create", () => {
        it("should persist in the underlying repository", async () => {
            const models = makeModels();

            await repository.create(models);

            expect(innerRepository.count()).toBe(1);
        });

        it("should cache the models after creating", async () => {
            const models = makeModels();

            await repository.create(models);

            const cached = await cacheInstance.get(idKey(models.id));
            expect(cached).not.toBeNull();
        });

        it("should allow findById to return from cache after create", async () => {
            const models = makeModels();
            await repository.create(models);

            innerRepository.clear();

            const result = await repository.findById(models.id);
            expect(result).not.toBeNull();
            expect(result!.id).toBe(models.id);
        });
    });

    describe("findById", () => {
        it("should return from repository on cache miss", async () => {
            const models = makeModels();
            innerRepository.seed([models]);

            const result = await repository.findById(models.id);

            expect(result).not.toBeNull();
            expect(result!.id).toBe(models.id);
        });

        it("should cache the result after a repository fetch", async () => {
            const models = makeModels();
            innerRepository.seed([models]);

            await repository.findById(models.id);

            const cached = await cacheInstance.get(idKey(models.id));
            expect(cached).not.toBeNull();
        });

        it("should return from cache on subsequent calls", async () => {
            const models = makeModels();
            innerRepository.seed([models]);

            await repository.findById(models.id);
            innerRepository.clear();

            const result = await repository.findById(models.id);
            expect(result).not.toBeNull();
            expect(result!.id).toBe(models.id);
        });

        it("should reconstruct the entity correctly from cache", async () => {
            const models = makeModels();
            innerRepository.seed([models]);

            await repository.findById(models.id);
            innerRepository.clear();

            const result = await repository.findById(models.id);
            expect(JSON.parse(result!.data)).toEqual({
                content: "Hello world",
            });
            expect(result!.type.name).toBe("Article");
        });

        it("should return null when not found in cache or repository", async () => {
            const result = await repository.findById("non-existent");

            expect(result).toBeNull();
        });

        it("should not cache when the result is null", async () => {
            await repository.findById("non-existent");

            const cached = await cacheInstance.get(idKey("non-existent"));
            expect(cached).toBeNull();
        });
    });

    describe("findByModelsTypeId", () => {
        it("should return from repository on cache miss", async () => {
            const models = makeModels();
            innerRepository.seed([models]);

            const result = await repository.findByModelsTypeId(
                models.type.id,
                1,
            );

            expect(result).toHaveLength(1);
            expect(result[0]!.id).toBe(models.id);
        });

        it("should cache the page ids after a repository fetch", async () => {
            const models = makeModels();
            innerRepository.seed([models]);

            await repository.findByModelsTypeId(models.type.id, 1);

            const cached = await cacheInstance.get(
                `${Models[EntitySource]}:type::$${models.type.id}:page::1`,
            );
            expect(cached).not.toBeNull();
        });

        it("should return from cache on subsequent calls", async () => {
            const models = makeModels();
            innerRepository.seed([models]);

            await repository.findByModelsTypeId(models.type.id, 1);
            innerRepository.clear();

            const result = await repository.findByModelsTypeId(
                models.type.id,
                1,
            );
            expect(result).toHaveLength(1);
        });

        it("should cache individual items after a repository fetch", async () => {
            const models = makeModels();
            innerRepository.seed([models]);

            await repository.findByModelsTypeId(models.type.id, 1);

            const cached = await cacheInstance.get(idKey(models.id));
            expect(cached).not.toBeNull();
        });

        it("should return empty array when no results", async () => {
            const result = await repository.findByModelsTypeId(
                "non-existent",
                1,
            );

            expect(result).toHaveLength(0);
        });
    });

    describe("findManyByIds", () => {
        it("should return from repository on cache miss", async () => {
            const m1 = makeModels();
            const m2 = makeModels();
            innerRepository.seed([m1, m2]);

            const result = await repository.findManyByIds([m1.id, m2.id]);

            expect(result).toHaveLength(2);
        });

        it("should cache items after a repository fetch", async () => {
            const models = makeModels();
            innerRepository.seed([models]);

            await repository.findManyByIds([models.id]);

            const cached = await cacheInstance.get(idKey(models.id));
            expect(cached).not.toBeNull();
        });

        it("should return from cache on subsequent calls", async () => {
            const models = makeModels();
            innerRepository.seed([models]);

            await repository.findManyByIds([models.id]);
            innerRepository.clear();

            const result = await repository.findManyByIds([models.id]);
            expect(result).toHaveLength(1);
            expect(result[0]!.id).toBe(models.id);
        });

        it("should handle mixed cache hits and misses", async () => {
            const m1 = makeModels();
            const m2 = makeModels();
            innerRepository.seed([m1, m2]);

            await repository.findManyByIds([m1.id]);

            const result = await repository.findManyByIds([m1.id, m2.id]);
            expect(result).toHaveLength(2);
        });

        it("should return empty array for empty ids", async () => {
            const result = await repository.findManyByIds([]);

            expect(result).toHaveLength(0);
        });

        it("should preserve order of ids in result", async () => {
            const m1 = makeModels();
            const m2 = makeModels();
            innerRepository.seed([m1, m2]);

            const result = await repository.findManyByIds([m2.id, m1.id]);

            expect(result[0]!.id).toBe(m2.id);
            expect(result[1]!.id).toBe(m1.id);
        });
    });

    describe("update", () => {
        it("should persist the update in the underlying repository", async () => {
            const entityProps = makeEntity();
            const models = makeModels(entityProps);
            innerRepository.seed([models]);

            const updated = Models.make(
                {
                    data: '{"content":"Updated"}',
                    type: models.type,
                },
                entityProps,
            );
            await repository.update(updated);

            const result = await innerRepository.findById(entityProps.id);
            expect(JSON.parse(result!.data)).toEqual({ content: "Updated" });
        });

        it("should update the cached value", async () => {
            const entityProps = makeEntity();
            const models = makeModels(entityProps);
            await repository.create(models);

            const updated = Models.make(
                {
                    data: '{"content":"Updated"}',
                    type: models.type,
                },
                entityProps,
            );
            await repository.update(updated);

            innerRepository.clear();

            const result = await repository.findById(entityProps.id);
            expect(JSON.parse(result!.data)).toEqual({ content: "Updated" });
        });

        it("should invalidate stale cache before updating", async () => {
            const entityProps = makeEntity();
            const models = makeModels(entityProps);
            await repository.create(models);

            const updated = Models.make(
                {
                    data: '{"content":"New content"}',
                    type: models.type,
                },
                entityProps,
            );
            await repository.update(updated);

            innerRepository.clear();

            const result = await repository.findById(entityProps.id);
            expect(JSON.parse(result!.data)).not.toEqual({
                content: "Hello world",
            });
            expect(JSON.parse(result!.data)).toEqual({
                content: "New content",
            });
        });
    });

    describe("delete", () => {
        it("should remove from the underlying repository", async () => {
            const models = makeModels();
            innerRepository.seed([models]);

            await repository.delete(models);

            expect(innerRepository.count()).toBe(0);
        });

        it("should remove cached entries after delete", async () => {
            const models = makeModels();
            await repository.create(models);

            await repository.delete(models);

            const cached = await cacheInstance.get(idKey(models.id));
            expect(cached).toBeNull();
        });

        it("should return null on findById after delete", async () => {
            const models = makeModels();
            await repository.create(models);

            await repository.delete(models);

            const result = await repository.findById(models.id);
            expect(result).toBeNull();
        });
    });

    describe("countByModelsTypeId", () => {
        it("should delegate to the underlying repository", async () => {
            const type = makeModelsType();
            const m1 = Models.make({ data: '{"content":"a"}', type });
            const m2 = Models.make({ data: '{"content":"b"}', type });
            innerRepository.seed([m1, m2]);

            const result = await repository.countByModelsTypeId(type.id);

            expect(result).toBe(2);
        });
    });
});
