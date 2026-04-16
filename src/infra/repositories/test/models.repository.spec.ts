import { beforeEach, describe, expect, it } from "bun:test";
import { Models } from "@/domain";
import type { IConstructorModels, IModels } from "@/domain/types";
import { MAX_ITEMS_PER_QUERY } from "@roastery/seedbed/constants";
import { t } from "@roastery/terroir";
import {
    ConflictException,
    ResourceNotFoundException,
} from "@roastery/terroir/exceptions/infra";
import type { IModelsType } from "@roastery-capsules/models.models-type/domain/types";
import { ModelsRepository } from "./models.repository";

const emptySchema = JSON.stringify(t.Object({}));

const mockModelsType = (overrides?: Partial<IModelsType>): IModelsType =>
    ({
        id: "type-id",
        name: "Article",
        slug: "article",
        description: "An article model",
        schema: { toString: () => emptySchema },
        createdAt: new Date().toISOString(),
        rename() {},
        reslug() {},
        changeDescription() {},
        ...overrides,
    }) as IModelsType;

const makeValidProps = (
    overrides?: Partial<IConstructorModels>,
): IConstructorModels => ({
    type: mockModelsType(),
    data: "{}",
    ...overrides,
});

const makeModels = (overrides?: Partial<IConstructorModels>): IModels =>
    Models.make(makeValidProps(overrides));

describe("ModelsRepository", () => {
    let repository: ModelsRepository;

    beforeEach(() => {
        repository = new ModelsRepository();
    });

    describe("create", () => {
        it("should store a models entity", async () => {
            const models = makeModels();

            await repository.create(models);

            expect(repository.count()).toBe(1);
        });

        it("should throw ConflictException when id already exists", async () => {
            const models = makeModels();
            await repository.create(models);

            expect(repository.create(models)).rejects.toBeInstanceOf(
                ConflictException,
            );
        });
    });

    describe("findById", () => {
        it("should return the entity when found", async () => {
            const models = makeModels();
            await repository.create(models);

            const found = await repository.findById(models.id);

            expect(found).toBe(models);
        });

        it("should return null when not found", async () => {
            const found = await repository.findById("non-existent");

            expect(found).toBeNull();
        });
    });

    describe("findByModelsTypeId", () => {
        it("should return only entities matching the given models type id", async () => {
            const typeA = mockModelsType({ id: "type-a" });
            const typeB = mockModelsType({ id: "type-b" });
            const modelsA = makeModels({ type: typeA });
            const modelsB = makeModels({ type: typeB });
            await repository.create(modelsA);
            await repository.create(modelsB);

            const result = await repository.findByModelsTypeId("type-a", 1);

            expect(result).toHaveLength(1);
            expect(result[0]).toBe(modelsA);
        });

        it("should paginate results using MAX_ITEMS_PER_QUERY", async () => {
            const type = mockModelsType({ id: "type-a" });
            const total = MAX_ITEMS_PER_QUERY + 3;
            const entities = Array.from({ length: total }, () =>
                makeModels({ type }),
            );
            repository.seed(entities);

            const page1 = await repository.findByModelsTypeId("type-a", 1);
            const page2 = await repository.findByModelsTypeId("type-a", 2);

            expect(page1).toHaveLength(MAX_ITEMS_PER_QUERY);
            expect(page2).toHaveLength(3);
        });

        it("should return empty array when no entities match the type", async () => {
            await repository.create(makeModels());

            const result = await repository.findByModelsTypeId(
                "non-existent",
                1,
            );

            expect(result).toEqual([]);
        });

        it("should return empty array for pages beyond data", async () => {
            const type = mockModelsType({ id: "type-a" });
            await repository.create(makeModels({ type }));

            const result = await repository.findByModelsTypeId("type-a", 999);

            expect(result).toEqual([]);
        });
    });

    describe("findManyByIds", () => {
        it("should return entities matching the given ids", async () => {
            const modelsA = makeModels();
            const modelsB = makeModels();
            await repository.create(modelsA);
            await repository.create(modelsB);

            const result = await repository.findManyByIds([
                modelsA.id,
                modelsB.id,
            ]);

            expect(result).toEqual([modelsA, modelsB]);
        });

        it("should skip ids that are not found", async () => {
            const models = makeModels();
            await repository.create(models);

            const result = await repository.findManyByIds([
                models.id,
                "non-existent",
            ]);

            expect(result).toEqual([models]);
        });

        it("should return empty array when no ids match", async () => {
            await repository.create(makeModels());

            const result = await repository.findManyByIds(["a", "b"]);

            expect(result).toEqual([]);
        });
    });

    describe("countByModelsTypeId", () => {
        it("should return the count of entities matching the type", async () => {
            const typeA = mockModelsType({ id: "type-a" });
            const typeB = mockModelsType({ id: "type-b" });
            await repository.create(makeModels({ type: typeA }));
            await repository.create(makeModels({ type: typeA }));
            await repository.create(makeModels({ type: typeB }));

            const result = await repository.countByModelsTypeId("type-a");

            expect(result).toBe(2);
        });

        it("should return 0 when no entities match the type", async () => {
            const result = await repository.countByModelsTypeId("non-existent");

            expect(result).toBe(0);
        });
    });

    describe("update", () => {
        it("should update an existing entity", async () => {
            const models = makeModels() as Models;
            await repository.create(models);

            models.updateData("{}");
            await repository.update(models);

            const found = await repository.findById(models.id);
            expect(found).toBe(models);
            expect(found?.updatedAt).toBeDefined();
        });

        it("should throw ResourceNotFoundException when entity does not exist", async () => {
            const models = makeModels();

            expect(repository.update(models)).rejects.toBeInstanceOf(
                ResourceNotFoundException,
            );
        });
    });

    describe("delete", () => {
        it("should remove the entity", async () => {
            const models = makeModels();
            await repository.create(models);

            await repository.delete(models);

            expect(repository.count()).toBe(0);
            expect(await repository.findById(models.id)).toBeNull();
        });

        it("should throw ResourceNotFoundException when entity does not exist", async () => {
            const models = makeModels();

            expect(repository.delete(models)).rejects.toBeInstanceOf(
                ResourceNotFoundException,
            );
        });
    });

    describe("seed", () => {
        it("should bulk insert entities", () => {
            const entities = Array.from({ length: 3 }, () => makeModels());

            repository.seed(entities);

            expect(repository.count()).toBe(3);
        });

        it("should overwrite existing entities with the same id", async () => {
            const models = makeModels();
            await repository.create(models);

            repository.seed([models]);

            expect(repository.count()).toBe(1);
        });
    });

    describe("clear", () => {
        it("should remove all entities", () => {
            repository.seed([makeModels(), makeModels()]);

            repository.clear();

            expect(repository.count()).toBe(0);
            expect(repository.getAll()).toEqual([]);
        });
    });

    describe("getAll", () => {
        it("should return all stored entities", () => {
            const entities = [makeModels(), makeModels(), makeModels()];
            repository.seed(entities);

            const result = repository.getAll();

            expect(result).toHaveLength(3);
        });

        it("should return empty array when repository is empty", () => {
            expect(repository.getAll()).toEqual([]);
        });
    });

    describe("count", () => {
        it("should return 0 when empty", () => {
            expect(repository.count()).toBe(0);
        });

        it("should return the number of stored entities", () => {
            repository.seed([makeModels(), makeModels()]);

            expect(repository.count()).toBe(2);
        });
    });
});
