import { describe, expect, it } from "bun:test";
import { Schema } from "@roastery/terroir/schema";
import { UpdateModelsDTO } from "./update-models.dto";

describe("UpdateModelsDTO", () => {
    const validator = new Schema(UpdateModelsDTO);

    it("should validate with data", () => {
        expect(
            validator.match({ data: '{"readTime":5,"language":"pt-BR"}' }),
        ).toBe(true);
    });

    it("should invalidate an empty object since at least one field is required", () => {
        expect(validator.match({})).toBe(false);
    });

    it("should invalidate when data is empty", () => {
        expect(validator.match({ data: "" })).toBe(false);
    });

    it("should invalidate when data has only one character", () => {
        expect(validator.match({ data: "{" })).toBe(false);
    });

    it("should validate when data has minimum length of 2", () => {
        expect(validator.match({ data: "{}" })).toBe(true);
    });

    it("should invalidate when data is not a string", () => {
        expect(validator.match({ data: 123 })).toBe(false);
    });

    it("should invalidate non-object values", () => {
        expect(validator.match(null)).toBe(false);
        expect(validator.match(undefined)).toBe(false);
        expect(validator.match("string")).toBe(false);
        expect(validator.match(123)).toBe(false);
    });
});
