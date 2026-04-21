import { Models } from "@/domain";
import type { IModels, IUnpackedModels } from "@/domain/types";
import { ModelsType } from "@roastery-capsules/models.models-type/domain";
import type {
	IModelsType,
	IUnpackedModelsType,
} from "@roastery-capsules/models.models-type/domain/types";
import { InvalidPropertyException } from "@roastery/terroir/exceptions/domain";
import { UnexpectedCacheValueException } from "@roastery/terroir/exceptions/infra";

export class ModelsMapper {
	public static run(key: string, data: string): IModels {
		const {
			data: _data,
			type: _type,
			...entityProps
		}: IUnpackedModels & {
			type: IUnpackedModelsType;
		} = JSON.parse(data);

		const type = ModelsMapper.getType(_type);

		try {
			return Models.make({ data: _data, type }, entityProps);
		} catch (err: unknown) {
			if (err instanceof InvalidPropertyException)
				throw new UnexpectedCacheValueException(key, err.source, err.message);

			throw err;
		}
	}

	private static getType(data: IUnpackedModelsType): IModelsType {
		const { id, createdAt, updatedAt, ...properties } = data;
		return ModelsType.make(properties, { id, createdAt, updatedAt });
	}
}
