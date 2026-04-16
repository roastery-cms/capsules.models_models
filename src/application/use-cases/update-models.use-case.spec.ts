import { beforeEach, describe, expect, it } from "bun:test";
import {
    InvalidOperationException,
    ResourceNotFoundException,
} from "@roastery/terroir/exceptions/application";
import { InvalidPropertyException } from "@roastery/terroir/exceptions/domain";
import { t } from "@roastery/terroir";
import type { IModelsType } from "@roastery-capsules/models.models-type/domain/types";
import { Models } from "@/domain";
import type { IConstructorModels, IModels } from "@/domain/types";
import { ModelsRepository } from "@/infra/repositories/test/models.repository";
import { FindModelsByIdUseCase } from "./find-models-by-id.use-case";
import { UpdateModelsUseCase } from "./update-models.use-case";

const infoSchema = JSON.stringify(
    t.Object({
        readTime: t.Number(),
        language: t.String(),
    }),
);

const mockModelsType = (overrides?: Partial<IModelsType>): IModelsType =>
    ({
        id: "type-id",
        name: "Article",
        slug: "article",
        description: "An article model",
        schema: { toString: () => infoSchema },
        createdAt: new Date().toISOString(),
        rename() {},
        reslug() {},
        changeDescription() {},
        ...overrides,
    }) as IModelsType;

const makeModels = (overrides?: Partial<IConstructorModels>): IModels =>
    Models.make({
        type: mockModelsType(),
        data: '{"readTime":5,"language":"pt-BR"}',
        ...overrides,
    });

describe("UpdateModelsUseCase", () => {
    let repository: ModelsRepository;
    let useCase: UpdateModelsUseCase;

    beforeEach(() => {
        repository = new ModelsRepository();
        const findModelsById = new FindModelsByIdUseCase(repository);
        useCase = new UpdateModelsUseCase(repository, findModelsById);
    });

    it("should update the data", async () => {
        const models = makeModels();
        repository.seed([models]);

        const updated = await useCase.run(models.id, {
            data: '{"readTime":10,"language":"en-US"}',
        });

        expect(JSON.parse(updated.data)).toEqual({
            readTime: 10,
            language: "en-US",
        });
    });

    it("should set updatedAt after update", async () => {
        const models = makeModels();
        repository.seed([models]);

        const updated = await useCase.run(models.id, {
            data: '{"readTime":10,"language":"en-US"}',
        });

        expect(updated.updatedAt).toBeString();
    });

    it("should throw InvalidOperationException when no fields are provided", async () => {
        const models = makeModels();
        repository.seed([models]);

        expect(useCase.run(models.id, {})).rejects.toBeInstanceOf(
            InvalidOperationException,
        );
    });

    it("should throw InvalidOperationException when data fails schema validation", async () => {
        const models = makeModels();
        repository.seed([models]);

        expect(useCase.run(models.id, { data: "" })).rejects.toBeInstanceOf(
            InvalidOperationException,
        );
    });

    it("should throw ResourceNotFoundException when the entity does not exist", async () => {
        expect(
            useCase.run("non-existent", {
                data: '{"readTime":10,"language":"en-US"}',
            }),
        ).rejects.toBeInstanceOf(ResourceNotFoundException);
    });

    it("should throw InvalidPropertyException when data does not match the type schema", async () => {
        const models = makeModels();
        repository.seed([models]);

        expect(
            useCase.run(models.id, { data: '{"readTime":"oops"}' }),
        ).rejects.toBeInstanceOf(InvalidPropertyException);
    });
});
