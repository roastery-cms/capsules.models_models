import { beforeEach, describe, expect, it } from "bun:test";
import { ResourceNotFoundException } from "@roastery/terroir/exceptions/application";
import { t } from "@roastery/terroir";
import type { IModelsType } from "@roastery-capsules/models.models-type/domain/types";
import { ModelsTypeRepository } from "@/infra/repositories/test/models-type.repository";
import { FindModelsTypeService } from "./find-models-type.service";

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

describe("FindModelsTypeService", () => {
	let repository: ModelsTypeRepository;
	let service: FindModelsTypeService;

	beforeEach(() => {
		repository = new ModelsTypeRepository();
		service = new FindModelsTypeService(repository);
	});

	it("should return the models type when it exists", async () => {
		const type = mockModelsType({ id: "type-a" });
		repository.seed([type]);

		const result = await service.run("type-a");

		expect(result).toBe(type);
	});

	it("should throw ResourceNotFoundException when the models type does not exist", async () => {
		expect(service.run("non-existent")).rejects.toBeInstanceOf(
			ResourceNotFoundException,
		);
	});
});
