import { describe, expect, it } from "bun:test";
import { makeEntity } from "@roastery/beans/entity/factories";
import { t } from "@roastery/terroir";
import { InvalidPropertyException } from "@roastery/terroir/exceptions/domain";
import type { IModelsType } from "@roastery-capsules/models.models-type/domain/types";
import { Models } from "./models";
import type { IConstructorModels } from "./types";

const infoSchema = JSON.stringify(
    t.Object({
        readTime: t.Number(),
        language: t.String(),
    }),
);

const emptySchema = JSON.stringify(t.Object({}));

const mockModelsType = (overrides?: Partial<IModelsType>): IModelsType =>
    ({
        id: "type-id",
        name: "Article",
        slug: "article",
        description: "An article model",
        schema: { toString: () => emptySchema },
        createdAt: new Date().toISOString(),
        rename() {},
        reslug() {},
        changeDescription() {},
        ...overrides,
    }) as IModelsType;

const makeValidProps = (
    overrides?: Partial<IConstructorModels>,
): IConstructorModels => ({
    type: mockModelsType(),
    content: "{}",
    ...overrides,
});

describe("Models Entity", () => {
    describe("make", () => {
        it("should create a valid instance with correct properties", () => {
            const props = makeValidProps();
            const models = Models.make(props);

            expect(models).toBeInstanceOf(Models);
            expect(models.type).toBe(props.type);
            expect(models.content).toBe("{}");
            expect(models.id).toBeDefined();
            expect(models.createdAt).toBeDefined();
        });

        it("should use provided content when given", () => {
            const type = mockModelsType({
                schema: { toString: () => infoSchema } as never,
            });
            const models = Models.make(
                makeValidProps({
                    type,
                    content: '{"readTime":5,"language":"pt-BR"}',
                }),
            );

            const parsed = JSON.parse(models.content);

            expect(parsed).toEqual({ readTime: 5, language: "pt-BR" });
        });

        it("should accept custom entityProps", () => {
            const entityProps = makeEntity();
            const models = Models.make(makeValidProps(), entityProps);

            expect(models.id).toBe(entityProps.id);
            expect(models.createdAt).toBe(entityProps.createdAt);
        });

        it("should throw InvalidPropertyException for invalid content JSON", () => {
            expect(() =>
                Models.make(makeValidProps({ content: "not-json" })),
            ).toThrow(InvalidPropertyException);
        });

        it("should throw InvalidPropertyException when content does not match schema", () => {
            const type = mockModelsType({
                schema: { toString: () => infoSchema } as never,
            });

            expect(() =>
                Models.make(
                    makeValidProps({
                        type,
                        content: '{"readTime":"not-a-number"}',
                    }),
                ),
            ).toThrow(InvalidPropertyException);
        });

        it("should throw InvalidPropertyException when required fields are missing", () => {
            const type = mockModelsType({
                schema: { toString: () => infoSchema } as never,
            });

            expect(() =>
                Models.make(
                    makeValidProps({
                        type,
                        content: '{"readTime":5}',
                    }),
                ),
            ).toThrow(InvalidPropertyException);
        });
    });

    describe("updateContent", () => {
        it("should update the content", () => {
            const type = mockModelsType({
                schema: { toString: () => infoSchema } as never,
            });
            const models = Models.make(
                makeValidProps({
                    type,
                    content: '{"readTime":5,"language":"pt-BR"}',
                }),
            ) as Models;

            models.updateContent('{"readTime":10,"language":"en-US"}');

            const parsed = JSON.parse(models.content);

            expect(parsed).toEqual({ readTime: 10, language: "en-US" });
        });

        it("should set updatedAt after updateContent", () => {
            const models = Models.make(makeValidProps()) as Models;

            models.updateContent("{}");

            expect(models.updatedAt).toBeDefined();
        });

        it("should invalidate content cache after update", () => {
            const models = Models.make(
                makeValidProps({ content: '{"a":1}' }),
            ) as Models;

            // access content to populate cache
            const _cached = models.content;

            models.updateContent('{"b":2}');

            expect(JSON.parse(models.content)).toEqual({ b: 2 });
        });

        it("should throw InvalidPropertyException for invalid JSON", () => {
            const models = Models.make(makeValidProps()) as Models;

            expect(() => models.updateContent("not-json")).toThrow(
                InvalidPropertyException,
            );
        });

        it("should throw InvalidPropertyException when content does not match schema", () => {
            const type = mockModelsType({
                schema: { toString: () => infoSchema } as never,
            });
            const models = Models.make(
                makeValidProps({
                    type,
                    content: '{"readTime":5,"language":"pt-BR"}',
                }),
            ) as Models;

            expect(() =>
                models.updateContent('{"readTime":"not-a-number"}'),
            ).toThrow(InvalidPropertyException);
        });
    });

    describe("getters", () => {
        it("should return the type reference", () => {
            const type = mockModelsType();
            const models = Models.make(makeValidProps({ type }));

            expect(models.type).toBe(type);
        });

        it("should return content as serialized JSON string", () => {
            const type = mockModelsType({
                schema: { toString: () => infoSchema } as never,
            });
            const models = Models.make(
                makeValidProps({
                    type,
                    content: '{"readTime":5,"language":"pt-BR"}',
                }),
            );

            const parsed = JSON.parse(models.content);

            expect(parsed).toEqual({ readTime: 5, language: "pt-BR" });
        });
    });
});
