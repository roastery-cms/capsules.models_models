import { beforeEach, describe, expect, it } from "bun:test";
import { t } from "@roastery/terroir";
import type { IModelsType } from "@roastery-capsules/models.models-type/domain/types";
import { Models } from "@/domain";
import type { IConstructorModels, IModels } from "@/domain/types";
import { ModelsRepository } from "@/infra/repositories/test/models.repository";
import { FindManyModelsByIdsUseCase } from "./find-many-models-by-ids.use-case";

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

describe("FindManyModelsByIdsUseCase", () => {
	let repository: ModelsRepository;
	let useCase: FindManyModelsByIdsUseCase;

	beforeEach(() => {
		repository = new ModelsRepository();
		useCase = new FindManyModelsByIdsUseCase(repository);
	});

	it("should return entities matching the given ids", async () => {
		const a = makeModels();
		const b = makeModels();
		repository.seed([a, b]);

		const result = await useCase.run([a.id, b.id]);

		expect(result).toEqual([a, b]);
	});

	it("should skip ids that are not found", async () => {
		const models = makeModels();
		repository.seed([models]);

		const result = await useCase.run([models.id, "non-existent"]);

		expect(result).toEqual([models]);
	});

	it("should return an empty array when no ids match", async () => {
		repository.seed([makeModels()]);

		const result = await useCase.run(["a", "b"]);

		expect(result).toEqual([]);
	});

	it("should return an empty array when called with an empty list", async () => {
		repository.seed([makeModels()]);

		const result = await useCase.run([]);

		expect(result).toEqual([]);
	});
});
