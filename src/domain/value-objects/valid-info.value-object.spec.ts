import { describe, expect, it } from "bun:test";
import type { IValueObjectMetadata } from "@roastery/beans/value-object/types";
import { t } from "@roastery/terroir";
import { InvalidPropertyException } from "@roastery/terroir/exceptions/domain";
import { Schema } from "@roastery/terroir/schema";
import { ValidInfoVO } from "./valid-info.value-object";

const info: IValueObjectMetadata = {
	name: "info",
	source: "post@post-content",
};

const schema = Schema.make(
	t.Object({
		readTime: t.Number(),
		language: t.String(),
	}),
).toString();

const emptySchema = Schema.make(t.Object({})).toString();

describe("ValidInfoVO", () => {
	it("should create a valid VO when JSON matches the schema", () => {
		const vo = ValidInfoVO.make(
			'{"readTime":5,"language":"pt-BR"}',
			info,
			schema,
		);

		expect(vo.value).toEqual({ readTime: 5, language: "pt-BR" });
	});

	it("should create a valid VO with an empty object when schema allows it", () => {
		const vo = ValidInfoVO.make("{}", info, emptySchema);

		expect(vo.value).toEqual({});
	});

	it("should throw InvalidPropertyException when JSON is invalid", () => {
		expect(() => ValidInfoVO.make("not-json", info, schema)).toThrow(
			InvalidPropertyException,
		);
	});

	it("should throw InvalidPropertyException when value does not match schema", () => {
		expect(() =>
			ValidInfoVO.make('{"readTime":"not-a-number"}', info, schema),
		).toThrow(InvalidPropertyException);
	});

	it("should throw InvalidPropertyException when required fields are missing", () => {
		expect(() => ValidInfoVO.make('{"readTime":5}', info, schema)).toThrow(
			InvalidPropertyException,
		);
	});

	it("should accept additional fields not defined in the schema", () => {
		const vo = ValidInfoVO.make(
			'{"readTime":5,"language":"pt-BR","extra":"value"}',
			info,
			schema,
		);

		expect(vo.value).toHaveProperty("extra", "value");
	});
});
