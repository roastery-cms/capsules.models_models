import { ValueObject } from "@roastery/beans";
import type { IValueObjectMetadata } from "@roastery/beans/value-object/types";
import type { t } from "@roastery/terroir";
import { InvalidPropertyException } from "@roastery/terroir/exceptions/domain";
import { type Schema, SchemaManager } from "@roastery/terroir/schema";

export class ValidInfoVO extends ValueObject<
	Record<string, unknown>,
	t.TSchema
> {
	protected override schema: Schema<t.TSchema>;

	private constructor(
		value: Record<string, unknown>,
		info: IValueObjectMetadata,
		schema: Schema<t.TSchema>,
	) {
		super(value, info);

		this.schema = schema;
	}

	public static make(
		_value: string,
		info: IValueObjectMetadata,
		_schema: string,
	): ValidInfoVO {
		const schema = SchemaManager.build(_schema);
		let value: Record<string, unknown> = {};

		try {
			value = JSON.parse(_value);
		} catch {
			throw new InvalidPropertyException(info.name, info.source);
		}

		const newVO = new ValidInfoVO(value, info, schema);

		newVO.validate();

		return newVO;
	}
}
