import { beforeEach, describe, expect, it } from "bun:test";
import { ResourceNotFoundException } from "@roastery/terroir/exceptions/application";
import { t } from "@roastery/terroir";
import { InvalidPropertyException } from "@roastery/terroir/exceptions/domain";
import type { IModelsType } from "@roastery-capsules/models.models-type/domain/types";
import { ModelsRepository } from "@/infra/repositories/test/models.repository";
import { ModelsTypeRepository } from "@/infra/repositories/test/models-type.repository";
import { FindModelsTypeService } from "../services";
import { CreateModelsUseCase } from "./create-models.use-case";

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

describe("CreateModelsUseCase", () => {
    let modelsRepository: ModelsRepository;
    let typeRepository: ModelsTypeRepository;
    let useCase: CreateModelsUseCase;

    beforeEach(() => {
        modelsRepository = new ModelsRepository();
        typeRepository = new ModelsTypeRepository();
        const findModelsType = new FindModelsTypeService(typeRepository);
        useCase = new CreateModelsUseCase(modelsRepository, findModelsType);
    });

    it("should create a models entity and persist it", async () => {
        const type = mockModelsType({ id: "type-a" });
        typeRepository.seed([type]);

        const result = await useCase.run({ typeId: "type-a", content: "{}" });

        expect(result.type).toBe(type);
        expect(result.content).toBe("{}");
        expect(modelsRepository.count()).toBe(1);
    });

    it("should generate an id for the created entity", async () => {
        const type = mockModelsType({ id: "type-a" });
        typeRepository.seed([type]);

        const result = await useCase.run({ typeId: "type-a", content: "{}" });

        expect(result.id).toBeString();
    });

    it("should throw ResourceNotFoundException when the models type does not exist", async () => {
        expect(
            useCase.run({ typeId: "non-existent", content: "{}" }),
        ).rejects.toBeInstanceOf(ResourceNotFoundException);
    });

    it("should throw InvalidPropertyException when content is invalid JSON", async () => {
        const type = mockModelsType({ id: "type-a" });
        typeRepository.seed([type]);

        expect(
            useCase.run({ typeId: "type-a", content: "not-json" }),
        ).rejects.toBeInstanceOf(InvalidPropertyException);
    });
});
