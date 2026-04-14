import { describe, expect, it } from "bun:test";
import { generateUUID } from "@roastery/beans/entity/helpers";
import { Schema } from "@roastery/terroir/schema";
import { CreateModelsSchema } from "./create-models.schema";

describe("CreateModelsSchema", () => {
    it("should be an instance of Schema", () => {
        expect(CreateModelsSchema).toBeInstanceOf(Schema);
    });

    it("should match a valid create DTO", () => {
        expect(
            CreateModelsSchema.match({
                typeId: generateUUID(),
                content: '{"readTime":5,"language":"pt-BR"}',
            }),
        ).toBe(true);
    });

    it("should not match when typeId is missing", () => {
        expect(CreateModelsSchema.match({ content: "{}" })).toBe(false);
    });

    it("should not match when content is missing", () => {
        expect(CreateModelsSchema.match({ typeId: generateUUID() })).toBe(false);
    });

    it("should not match when typeId is not a valid UUID", () => {
        expect(
            CreateModelsSchema.match({
                typeId: "not-a-uuid",
                content: "{}",
            }),
        ).toBe(false);
    });

    it("should not match when content has less than 2 characters", () => {
        expect(
            CreateModelsSchema.match({
                typeId: generateUUID(),
                content: "{",
            }),
        ).toBe(false);
    });

    it("should not match non-object values", () => {
        expect(CreateModelsSchema.match(null)).toBe(false);
        expect(CreateModelsSchema.match("string")).toBe(false);
        expect(CreateModelsSchema.match(123)).toBe(false);
    });
});
