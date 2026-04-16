import { beforeEach, describe, expect, it } from "bun:test";
import { ResourceNotFoundException } from "@roastery/terroir/exceptions/application";
import { MAX_ITEMS_PER_QUERY } from "@roastery/seedbed/constants";
import { t } from "@roastery/terroir";
import type { IModelsType } from "@roastery-capsules/models.models-type/domain/types";
import { Models } from "@/domain";
import type { IConstructorModels, IModels } from "@/domain/types";
import { ModelsRepository } from "@/infra/repositories/test/models.repository";
import { ModelsTypeRepository } from "@/infra/repositories/test/models-type.repository";
import { FindModelsTypeService } from "../services";
import { CountModelsByModelsTypeIdUseCase } from "./count-models-by-models-type-id.use-case";
import { FindManyModelsByModelsTypeIdUseCase } from "./find-many-models-by-models-type-id.use-case";

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

describe("FindManyModelsByModelsTypeIdUseCase", () => {
    let modelsRepository: ModelsRepository;
    let typeRepository: ModelsTypeRepository;
    let useCase: FindManyModelsByModelsTypeIdUseCase;

    beforeEach(() => {
        modelsRepository = new ModelsRepository();
        typeRepository = new ModelsTypeRepository();
        const findModelsType = new FindModelsTypeService(typeRepository);
        const countModels = new CountModelsByModelsTypeIdUseCase(
            modelsRepository,
        );
        useCase = new FindManyModelsByModelsTypeIdUseCase(
            modelsRepository,
            findModelsType,
            countModels,
        );
    });

    it("should return models with count and totalPages for the given type", async () => {
        const type = mockModelsType({ id: "type-a" });
        typeRepository.seed([type]);
        const entities = Array.from({ length: 3 }, () => makeModels({ type }));
        modelsRepository.seed(entities);

        const result = await useCase.run("type-a");

        expect(result.value).toHaveLength(3);
        expect(result.count).toBe(3);
        expect(result.totalPages).toBe(1);
    });

    it("should default to page 1 when no page is provided", async () => {
        const type = mockModelsType({ id: "type-a" });
        typeRepository.seed([type]);
        const entities = Array.from({ length: MAX_ITEMS_PER_QUERY + 3 }, () =>
            makeModels({ type }),
        );
        modelsRepository.seed(entities);

        const result = await useCase.run("type-a");

        expect(result.value).toHaveLength(MAX_ITEMS_PER_QUERY);
    });

    it("should paginate to the requested page", async () => {
        const type = mockModelsType({ id: "type-a" });
        typeRepository.seed([type]);
        const entities = Array.from({ length: MAX_ITEMS_PER_QUERY + 3 }, () =>
            makeModels({ type }),
        );
        modelsRepository.seed(entities);

        const page2 = await useCase.run("type-a", 2);

        expect(page2.value).toHaveLength(3);
        expect(page2.totalPages).toBe(2);
    });

    it("should throw ResourceNotFoundException when the models type does not exist", async () => {
        expect(useCase.run("non-existent")).rejects.toBeInstanceOf(
            ResourceNotFoundException,
        );
    });

    it("should return empty value with zero counts when no models exist for the type", async () => {
        const type = mockModelsType({ id: "type-a" });
        typeRepository.seed([type]);

        const result = await useCase.run("type-a");

        expect(result.value).toEqual([]);
        expect(result.count).toBe(0);
        expect(result.totalPages).toBe(0);
    });
});
