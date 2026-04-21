import type { IModels, IUnpackedModels } from "@/domain/types";
import type {
	IModelsType,
	IUnpackedModelsType,
} from "@roastery-capsules/models.models-type/domain/types";
import { parsePrismaDateTimeToISOString } from "@roastery-adapters/models/helpers";
import { Mapper } from "@roastery/beans";
import { ModelsType } from "@roastery-capsules/models.models-type/domain";
import { Models } from "@/domain";

type PropertiesToOmit = "createdAt" | "updatedAt";

type DateAtEntity = {
	createdAt: Date;
	updatedAt: Date | null;
};

type Args = Omit<IUnpackedModels, PropertiesToOmit | "type"> &
	DateAtEntity & {
		modeltype: Omit<IUnpackedModelsType, PropertiesToOmit> & DateAtEntity;
	};

export class ModelsMapper {
	public static run({ modeltype: _type, ...properties }: Args): IModels {
		const type = ModelsMapper.getModelsType(_type);
		const data: IUnpackedModels = {
			type,
			...parsePrismaDateTimeToISOString(properties),
		};

		return Mapper.toDomain(data as never, Models.make as never) as IModels;
	}

	private static getModelsType(data: Args["modeltype"]): IModelsType {
		return Mapper.toDomain(
			parsePrismaDateTimeToISOString(data),
			ModelsType.make,
		) as IModelsType;
	}
}
