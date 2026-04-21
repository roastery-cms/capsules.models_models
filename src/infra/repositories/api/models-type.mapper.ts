import { ModelsType } from "@roastery-capsules/models.models-type/domain";
import type {
	IModelsType,
	IUnpackedModelsType,
} from "@roastery-capsules/models.models-type/domain/types";
import { Mapper } from "@roastery/beans";

export const ModelsTypeMapper = {
	run: (data: IUnpackedModelsType): IModelsType => {
		return Mapper.toDomain(data, ModelsType.make) as IModelsType;
	},
};
