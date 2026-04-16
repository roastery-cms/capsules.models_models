import { beforeEach, describe, expect, it } from "bun:test";
import { MAX_ITEMS_PER_QUERY } from "@roastery/seedbed/constants";
import { t } from "@roastery/terroir";
import type { IModelsType } from "@roastery-capsules/models.models-type/domain/types";
import { Models } from "@/domain";
import type { IConstructorModels, IModels } from "@/domain/types";
import { ModelsRepository } from "@/infra/repositories/test/models.repository";
import { CountModelsByModelsTypeIdUseCase } from "./count-models-by-models-type-id.use-case";

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

const makeModels = (overrides?: Partial<IConstructorModels>): IModels =>
    Models.make({
        type: mockModelsType(),
        data: "{}",
        ...overrides,
    });

describe("CountModelsByModelsTypeIdUseCase", () => {
    let repository: ModelsRepository;
    let useCase: CountModelsByModelsTypeIdUseCase;

    beforeEach(() => {
        repository = new ModelsRepository();
        useCase = new CountModelsByModelsTypeIdUseCase(repository);
    });

    it("should return count and totalPages for a given models type", async () => {
        const type = mockModelsType({ id: "type-a" });
        const entities = Array.from({ length: 3 }, () => makeModels({ type }));
        repository.seed(entities);

        const result = await useCase.run("type-a");

        expect(result.count).toBe(3);
        expect(result.totalPages).toBe(1);
    });

    it("should return 0 count and 0 totalPages when no models match", async () => {
        const result = await useCase.run("non-existent");

        expect(result.count).toBe(0);
        expect(result.totalPages).toBe(0);
    });

    it("should compute totalPages based on MAX_ITEMS_PER_QUERY", async () => {
        const type = mockModelsType({ id: "type-a" });
        const entities = Array.from({ length: MAX_ITEMS_PER_QUERY + 1 }, () =>
            makeModels({ type }),
        );
        repository.seed(entities);

        const result = await useCase.run("type-a");

        expect(result.count).toBe(MAX_ITEMS_PER_QUERY + 1);
        expect(result.totalPages).toBe(2);
    });

    it("should not count models of other types", async () => {
        const typeA = mockModelsType({ id: "type-a" });
        const typeB = mockModelsType({ id: "type-b" });
        repository.seed([
            makeModels({ type: typeA }),
            makeModels({ type: typeA }),
            makeModels({ type: typeB }),
        ]);

        const result = await useCase.run("type-a");

        expect(result.count).toBe(2);
    });
});
