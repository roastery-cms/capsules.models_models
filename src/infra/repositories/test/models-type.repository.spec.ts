import { beforeEach, describe, expect, it } from "bun:test";
import { t } from "@roastery/terroir";
import type { IModelsType } from "@roastery-capsules/models.models-type/domain/types";
import { ModelsTypeRepository } from "./models-type.repository";

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

describe("ModelsTypeRepository", () => {
	let repository: ModelsTypeRepository;

	beforeEach(() => {
		repository = new ModelsTypeRepository();
	});

	describe("findById", () => {
		it("should return the entity when found", async () => {
			const type = mockModelsType({ id: "type-1" });
			repository.seed([type]);

			const found = await repository.findById("type-1");

			expect(found).toBe(type);
		});

		it("should return null when not found", async () => {
			const found = await repository.findById("non-existent");

			expect(found).toBeNull();
		});
	});

	describe("seed", () => {
		it("should populate the repository with types", () => {
			const types = [
				mockModelsType({ id: "type-1" }),
				mockModelsType({ id: "type-2" }),
			];

			repository.seed(types);

			expect(repository.count()).toBe(2);
		});

		it("should overwrite existing types with the same id", () => {
			const original = mockModelsType({ id: "type-1", name: "Original" });
			const updated = mockModelsType({ id: "type-1", name: "Updated" });

			repository.seed([original]);
			repository.seed([updated]);

			expect(repository.count()).toBe(1);
			expect(repository.getAll()[0]!.name).toBe("Updated");
		});
	});

	describe("clear", () => {
		it("should remove all types", () => {
			repository.seed([mockModelsType({ id: "type-1" })]);

			repository.clear();

			expect(repository.count()).toBe(0);
			expect(repository.getAll()).toEqual([]);
		});
	});

	describe("getAll", () => {
		it("should return all stored types", () => {
			const types = [
				mockModelsType({ id: "type-1" }),
				mockModelsType({ id: "type-2" }),
				mockModelsType({ id: "type-3" }),
			];
			repository.seed(types);

			const result = repository.getAll();

			expect(result).toHaveLength(3);
		});

		it("should return empty array when repository is empty", () => {
			expect(repository.getAll()).toEqual([]);
		});
	});

	describe("count", () => {
		it("should return the number of stored types", () => {
			repository.seed([
				mockModelsType({ id: "type-1" }),
				mockModelsType({ id: "type-2" }),
			]);

			expect(repository.count()).toBe(2);
		});

		it("should return 0 when empty", () => {
			expect(repository.count()).toBe(0);
		});
	});
});
