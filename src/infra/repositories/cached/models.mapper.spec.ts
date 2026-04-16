import { describe, expect, it } from "bun:test";
import { Mapper } from "@roastery/beans";
import { makeEntity } from "@roastery/beans/entity/factories";
import { UnexpectedCacheValueException } from "@roastery/terroir/exceptions/infra";
import { ModelsType } from "@roastery-capsules/models.models-type/domain";
import { Models } from "@/domain";
import { ModelsMapper } from "./models.mapper";

const modelsEntity = makeEntity();
const typeEntity = makeEntity();

const schemaString =
    '{"type":"object","properties":{"content":{"type":"string","minLength":1}},"required":["content"]}';

const makeModelsType = () =>
    ModelsType.make(
        {
            name: "Article",
            slug: "article",
            description: "A content type for articles",
            schema: schemaString,
        },
        typeEntity,
    );

const makeModels = () =>
    Models.make(
        {
            data: '{"content":"Hello world"}',
            type: makeModelsType(),
        },
        modelsEntity,
    );

const serialize = (models = makeModels()): string =>
    JSON.stringify(Mapper.toDTO(models));

const cacheKey = "models@models::$test-id";

describe("CachedModelsMapper", () => {
    it("should return a Models instance from string input", () => {
        const result = ModelsMapper.run(cacheKey, serialize());

        expect(result).toBeInstanceOf(Models);
    });

    it("should map id and createdAt from cached data", () => {
        const result = ModelsMapper.run(cacheKey, serialize());

        expect(result.id).toBe(modelsEntity.id);
        expect(result.createdAt).toBe(modelsEntity.createdAt);
    });

    it("should map data correctly", () => {
        const result = ModelsMapper.run(cacheKey, serialize());

        expect(JSON.parse(result.data)).toEqual({ content: "Hello world" });
    });

    it("should map type id", () => {
        const result = ModelsMapper.run(cacheKey, serialize());

        expect(result.type.id).toBe(typeEntity.id);
    });

    it("should map type name correctly", () => {
        const result = ModelsMapper.run(cacheKey, serialize());

        expect(result.type.name).toBe("Article");
    });

    it("should map type slug correctly", () => {
        const result = ModelsMapper.run(cacheKey, serialize());

        expect(result.type.slug).toBe("article");
    });

    it("should map type description correctly", () => {
        const result = ModelsMapper.run(cacheKey, serialize());

        expect(result.type.description).toBe("A content type for articles");
    });

    it("should map type schema correctly", () => {
        const result = ModelsMapper.run(cacheKey, serialize());

        expect(JSON.parse(result.type.schema.toString())).toEqual({
            type: "object",
            properties: { content: { type: "string", minLength: 1 } },
            required: ["content"],
        });
    });

    it("should map type createdAt from cached data", () => {
        const result = ModelsMapper.run(cacheKey, serialize());

        expect(result.type.createdAt).toBe(typeEntity.createdAt);
    });

    it("should throw UnexpectedCacheValueException when data has invalid domain data", () => {
        const data = JSON.parse(serialize());
        data.data = "";

        expect(() => ModelsMapper.run(cacheKey, JSON.stringify(data))).toThrow(
            UnexpectedCacheValueException,
        );
    });

    it("should rethrow non-domain errors", () => {
        expect(() => ModelsMapper.run(cacheKey, "null")).toThrow(TypeError);
    });

    it("should throw SyntaxError when input is not valid JSON", () => {
        expect(() => ModelsMapper.run(cacheKey, "invalid-json")).toThrow(
            SyntaxError,
        );
    });
});
