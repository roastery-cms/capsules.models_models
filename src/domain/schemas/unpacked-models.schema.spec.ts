import { describe, expect, it } from "bun:test";
import { generateUUID } from "@roastery/beans/entity/helpers";
import { UnpackedModelsSchema } from "./unpacked-models.schema";

describe("UnpackedModelsSchema", () => {
	const makeValidModelsType = () => ({
		id: generateUUID(),
		name: "Article",
		slug: "article",
		description: "An article model",
		schema: '{"type":"object","properties":{}}',
		createdAt: new Date().toISOString(),
	});

	const makeValidData = () => ({
		id: generateUUID(),
		type: makeValidModelsType(),
		data: '{"readTime":5,"language":"pt-BR"}',
		createdAt: new Date().toISOString(),
	});

	it("should validate a complete valid object", () => {
		expect(UnpackedModelsSchema.match(makeValidData())).toBe(true);
	});

	it("should validate with optional updatedAt", () => {
		expect(
			UnpackedModelsSchema.match({
				...makeValidData(),
				updatedAt: new Date().toISOString(),
			}),
		).toBe(true);
	});

	it("should invalidate when type is missing", () => {
		const { type, ...rest } = makeValidData();
		expect(UnpackedModelsSchema.match(rest)).toBe(false);
	});

	it("should invalidate when data is empty", () => {
		expect(UnpackedModelsSchema.match({ ...makeValidData(), data: "" })).toBe(
			false,
		);
	});

	it("should invalidate when data has only one character", () => {
		expect(UnpackedModelsSchema.match({ ...makeValidData(), data: "{" })).toBe(
			false,
		);
	});

	it("should invalidate when id is not a valid UUID", () => {
		expect(
			UnpackedModelsSchema.match({
				...makeValidData(),
				id: "not-a-uuid",
			}),
		).toBe(false);
	});

	it("should invalidate when createdAt is not a valid date-time", () => {
		expect(
			UnpackedModelsSchema.match({
				...makeValidData(),
				createdAt: "not-a-date",
			}),
		).toBe(false);
	});

	it("should invalidate a number", () => {
		expect(UnpackedModelsSchema.match(123)).toBe(false);
	});

	it("should invalidate null", () => {
		expect(UnpackedModelsSchema.match(null)).toBe(false);
	});

	it("should invalidate an empty object", () => {
		expect(UnpackedModelsSchema.match({})).toBe(false);
	});
});
