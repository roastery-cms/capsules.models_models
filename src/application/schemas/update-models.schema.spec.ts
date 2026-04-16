import { describe, expect, it } from "bun:test";
import { Schema } from "@roastery/terroir/schema";
import { UpdateModelsSchema } from "./update-models.schema";

describe("UpdateModelsSchema", () => {
    it("should be an instance of Schema", () => {
        expect(UpdateModelsSchema).toBeInstanceOf(Schema);
    });

    it("should match a valid update DTO", () => {
        expect(
            UpdateModelsSchema.match({
                data: '{"readTime":5,"language":"pt-BR"}',
            }),
        ).toBe(true);
    });

    it("should not match an empty object", () => {
        expect(UpdateModelsSchema.match({})).toBe(false);
    });

    it("should not match when data has less than 2 characters", () => {
        expect(UpdateModelsSchema.match({ data: "{" })).toBe(false);
    });

    it("should not match when data is not a string", () => {
        expect(UpdateModelsSchema.match({ data: 123 })).toBe(false);
    });

    it("should not match non-object values", () => {
        expect(UpdateModelsSchema.match(null)).toBe(false);
        expect(UpdateModelsSchema.match("string")).toBe(false);
        expect(UpdateModelsSchema.match(123)).toBe(false);
    });
});
