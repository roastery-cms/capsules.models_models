import { describe, expect, it } from "bun:test";
import { generateUUID } from "@roastery/beans/entity/helpers";
import { Schema } from "@roastery/terroir/schema";
import { UnpackedModelsDTO } from "./unpacked-models.dto";

describe("UnpackedModelsDTO", () => {
    const validator = new Schema(UnpackedModelsDTO);

    const makeValidModelsType = () => ({
        id: generateUUID(),
        name: "Article",
        slug: "article",
        description: "An article model",
        schema: '{"type":"object","properties":{}}',
        createdAt: new Date().toISOString(),
    });

    const makeValidDTO = () => ({
        id: generateUUID(),
        type: makeValidModelsType(),
        data: '{"readTime":5,"language":"pt-BR"}',
        createdAt: new Date().toISOString(),
    });

    it("should validate a complete valid DTO", () => {
        expect(validator.match(makeValidDTO())).toBe(true);
    });

    it("should validate with optional updatedAt", () => {
        expect(
            validator.match({
                ...makeValidDTO(),
                updatedAt: new Date().toISOString(),
            }),
        ).toBe(true);
    });

    it("should invalidate when type is missing", () => {
        const { type, ...rest } = makeValidDTO();
        expect(validator.match(rest)).toBe(false);
    });

    it("should invalidate when data is missing", () => {
        const { data, ...rest } = makeValidDTO();
        expect(validator.match(rest)).toBe(false);
    });

    it("should invalidate when data is empty", () => {
        expect(validator.match({ ...makeValidDTO(), data: "" })).toBe(false);
    });

    it("should invalidate when data has only one character", () => {
        expect(validator.match({ ...makeValidDTO(), data: "{" })).toBe(false);
    });

    it("should validate when data has minimum length of 2", () => {
        expect(validator.match({ ...makeValidDTO(), data: "{}" })).toBe(true);
    });

    it("should invalidate when data is not a string", () => {
        expect(validator.match({ ...makeValidDTO(), data: 123 })).toBe(false);
    });

    it("should invalidate when id is missing", () => {
        const { id, ...rest } = makeValidDTO();
        expect(validator.match(rest)).toBe(false);
    });

    it("should invalidate when id is not a valid UUID", () => {
        expect(validator.match({ ...makeValidDTO(), id: "not-a-uuid" })).toBe(
            false,
        );
    });

    it("should invalidate when createdAt is missing", () => {
        const { createdAt, ...rest } = makeValidDTO();
        expect(validator.match(rest)).toBe(false);
    });

    it("should invalidate when createdAt is not a valid date-time", () => {
        expect(
            validator.match({ ...makeValidDTO(), createdAt: "not-a-date" }),
        ).toBe(false);
    });

    it("should invalidate when nested type is missing required field", () => {
        const dto = makeValidDTO();
        const { name, ...brokenType } = dto.type;
        expect(validator.match({ ...dto, type: brokenType })).toBe(false);
    });

    it("should invalidate non-object values", () => {
        expect(validator.match(null)).toBe(false);
        expect(validator.match(undefined)).toBe(false);
        expect(validator.match("string")).toBe(false);
        expect(validator.match(123)).toBe(false);
        expect(validator.match({})).toBe(false);
    });
});
