import { describe, expect, it } from "bun:test";
import { generateUUID } from "@roastery/beans/entity/helpers";
import { Schema } from "@roastery/terroir/schema";
import { CreateModelsDTO } from "./create-models.dto";

describe("CreateModelsDTO", () => {
    const validator = new Schema(CreateModelsDTO);

    const makeValidDTO = () => ({
        typeId: generateUUID(),
        content: '{"readTime":5,"language":"pt-BR"}',
    });

    it("should validate a complete valid DTO", () => {
        expect(validator.match(makeValidDTO())).toBe(true);
    });

    it("should invalidate when typeId is missing", () => {
        const { typeId, ...rest } = makeValidDTO();
        expect(validator.match(rest)).toBe(false);
    });

    it("should invalidate when typeId is not a valid UUID", () => {
        expect(validator.match({ ...makeValidDTO(), typeId: "not-a-uuid" })).toBe(
            false,
        );
    });

    it("should invalidate when content is missing", () => {
        const { content, ...rest } = makeValidDTO();
        expect(validator.match(rest)).toBe(false);
    });

    it("should invalidate when content is empty", () => {
        expect(validator.match({ ...makeValidDTO(), content: "" })).toBe(false);
    });

    it("should invalidate when content has only one character", () => {
        expect(validator.match({ ...makeValidDTO(), content: "{" })).toBe(false);
    });

    it("should validate when content has minimum length of 2", () => {
        expect(validator.match({ ...makeValidDTO(), content: "{}" })).toBe(true);
    });

    it("should invalidate when content is not a string", () => {
        expect(validator.match({ ...makeValidDTO(), content: 123 })).toBe(false);
    });

    it("should invalidate non-object values", () => {
        expect(validator.match(null)).toBe(false);
        expect(validator.match(undefined)).toBe(false);
        expect(validator.match("string")).toBe(false);
        expect(validator.match(123)).toBe(false);
    });
});
