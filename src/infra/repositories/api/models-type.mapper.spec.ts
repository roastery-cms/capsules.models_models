import { describe, expect, it } from "bun:test";
import { UuidSchema } from "@roastery/beans/collections/schemas";
import { makeEntity } from "@roastery/beans/entity/factories";
import { ModelsType } from "@roastery-capsules/models.models-type/domain";
import { ModelsTypeMapper } from "./models-type.mapper";

const typeEntity = makeEntity();
const schemaString = UuidSchema.toString();

const makeArgs = () => ({
	id: typeEntity.id,
	createdAt: typeEntity.createdAt,
	name: "Blog",
	slug: "blog",
	description: "A models type",
	schema: schemaString,
});

describe("ModelsTypeMapper", () => {
	it("should return a ModelsType instance", () => {
		expect(ModelsTypeMapper.run(makeArgs())).toBeInstanceOf(ModelsType);
	});

	it("should map id and createdAt from args", () => {
		const result = ModelsTypeMapper.run(makeArgs());

		expect(result.id).toBe(typeEntity.id);
		expect(result.createdAt).toBe(typeEntity.createdAt);
	});

	it("should map models type properties correctly", () => {
		const result = ModelsTypeMapper.run(makeArgs());

		expect(result.name).toBe("Blog");
		expect(result.slug).toBe("blog");
		expect(result.description).toBe("A models type");
		expect(result.schema.toString()).toBe(schemaString);
	});

	it("should map updatedAt when present", () => {
		const updatedAt = new Date().toISOString();
		const args = { ...makeArgs(), updatedAt };

		const result = ModelsTypeMapper.run(args);

		expect(result.updatedAt).toBe(updatedAt);
	});
});
