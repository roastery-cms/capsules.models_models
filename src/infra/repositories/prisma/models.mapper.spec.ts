import { describe, expect, it } from "bun:test";
import { makeEntity } from "@roastery/beans/entity/factories";
import { Models } from "@/domain";
import { ModelsMapper } from "./models.mapper";

const modelsEntity = makeEntity();
const typeEntity = makeEntity();

const schemaString =
    '{"type":"object","properties":{"content":{"type":"string","minLength":1}},"required":["content"]}';

const makeInput = (
    overrides?: Partial<Parameters<typeof ModelsMapper.run>[0]>,
): Parameters<typeof ModelsMapper.run>[0] => ({
    id: modelsEntity.id,
    createdAt: new Date("2025-01-01T00:00:00.000Z"),
    updatedAt: null,
    data: '{"content":"Hello world"}',
    modeltype: {
        id: typeEntity.id,
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
        updatedAt: null,
        name: "Article",
        slug: "article",
        description: "A content type for articles",
        schema: schemaString,
    },
    ...overrides,
});

describe("ModelsMapper", () => {
    it("should return a Models instance", () => {
        const result = ModelsMapper.run(makeInput());

        expect(result).toBeInstanceOf(Models);
    });

    it("should map id and createdAt from prisma output", () => {
        const result = ModelsMapper.run(makeInput());

        expect(result.id).toBe(modelsEntity.id);
        expect(result.createdAt).toBe("2025-01-01T00:00:00.000Z");
    });

    it("should map updatedAt when present", () => {
        const result = ModelsMapper.run(
            makeInput({ updatedAt: new Date("2025-06-15T12:00:00.000Z") }),
        );

        expect(result.updatedAt).toBe("2025-06-15T12:00:00.000Z");
    });

    it("should map updatedAt as undefined when not present", () => {
        const result = ModelsMapper.run(makeInput());

        expect(result.updatedAt).toBeUndefined();
    });

    it("should map data correctly", () => {
        const result = ModelsMapper.run(makeInput());

        expect(JSON.parse(result.data)).toEqual({ content: "Hello world" });
    });

    it("should map type id", () => {
        const result = ModelsMapper.run(makeInput());

        expect(result.type.id).toBe(typeEntity.id);
    });

    it("should map type name correctly", () => {
        const result = ModelsMapper.run(makeInput());

        expect(result.type.name).toBe("Article");
    });

    it("should map type slug correctly", () => {
        const result = ModelsMapper.run(makeInput());

        expect(result.type.slug).toBe("article");
    });

    it("should map type description correctly", () => {
        const result = ModelsMapper.run(makeInput());

        expect(result.type.description).toBe("A content type for articles");
    });

    it("should map type schema correctly", () => {
        const result = ModelsMapper.run(makeInput());

        expect(JSON.parse(result.type.schema.toString())).toEqual({
            type: "object",
            properties: { content: { type: "string", minLength: 1 } },
            required: ["content"],
        });
    });

    it("should map nested type createdAt from prisma output", () => {
        const result = ModelsMapper.run(
            makeInput({
                modeltype: {
                    id: typeEntity.id,
                    createdAt: new Date("2025-02-01T00:00:00.000Z"),
                    updatedAt: null,
                    name: "Article",
                    slug: "article",
                    description: "A content type for articles",
                    schema: schemaString,
                },
            }),
        );

        expect(result.type.createdAt).toBe("2025-02-01T00:00:00.000Z");
    });

    it("should map nested type updatedAt when present", () => {
        const result = ModelsMapper.run(
            makeInput({
                modeltype: {
                    id: typeEntity.id,
                    createdAt: new Date("2025-01-01T00:00:00.000Z"),
                    updatedAt: new Date("2025-07-20T08:30:00.000Z"),
                    name: "Article",
                    slug: "article",
                    description: "A content type for articles",
                    schema: schemaString,
                },
            }),
        );

        expect(result.type.updatedAt).toBe("2025-07-20T08:30:00.000Z");
    });

    it("should map nested type updatedAt as undefined when not present", () => {
        const result = ModelsMapper.run(makeInput());

        expect(result.type.updatedAt).toBeUndefined();
    });
});
