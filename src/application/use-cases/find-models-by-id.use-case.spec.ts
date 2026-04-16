import { beforeEach, describe, expect, it } from "bun:test";
import { ResourceNotFoundException } from "@roastery/terroir/exceptions/application";
import { t } from "@roastery/terroir";
import type { IModelsType } from "@roastery-capsules/models.models-type/domain/types";
import { Models } from "@/domain";
import type { IConstructorModels, IModels } from "@/domain/types";
import { ModelsRepository } from "@/infra/repositories/test/models.repository";
import { FindModelsByIdUseCase } from "./find-models-by-id.use-case";

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

describe("FindModelsByIdUseCase", () => {
    let repository: ModelsRepository;
    let useCase: FindModelsByIdUseCase;

    beforeEach(() => {
        repository = new ModelsRepository();
        useCase = new FindModelsByIdUseCase(repository);
    });

    it("should find a models entity by id", async () => {
        const models = makeModels();
        repository.seed([models]);

        const result = await useCase.run(models.id);

        expect(result).toBe(models);
    });

    it("should throw ResourceNotFoundException when entity does not exist", async () => {
        expect(useCase.run("non-existent")).rejects.toBeInstanceOf(
            ResourceNotFoundException,
        );
    });
});
