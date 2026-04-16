import { describe, expect, it } from "bun:test";
import { InvalidEnvironmentException } from "@roastery/terroir/exceptions/infra";
import { ApiModelsTypeRepository } from "@/infra/repositories/api";
import { TestModelsTypeRepositoryForModels } from "@/infra/repositories/test";
import { makeModelsTypeRepository } from "./models-type.repository.factory";

describe("makeModelsTypeRepository", () => {
	it("should return a TestModelsTypeRepositoryForModels when target is not provided", () => {
		const repo = makeModelsTypeRepository({});
		expect(repo).toBeInstanceOf(TestModelsTypeRepositoryForModels);
	});

	it("should return a TestModelsTypeRepositoryForModels when target is MEMORY", () => {
		const repo = makeModelsTypeRepository({
			baseUrl: "http://localhost:3000",
			target: "MEMORY",
		});
		expect(repo).toBeInstanceOf(TestModelsTypeRepositoryForModels);
	});

	it("should return an ApiModelsTypeRepository when target is API", () => {
		const repo = makeModelsTypeRepository({
			baseUrl: "http://localhost:3000",
			target: "API",
		});
		expect(repo).toBeInstanceOf(ApiModelsTypeRepository);
	});

	it("should throw when target is provided without a baseUrl", () => {
		expect(() => makeModelsTypeRepository({ target: "API" })).toThrow(
			InvalidEnvironmentException,
		);
	});
});
