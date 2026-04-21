import type { IModelsType } from "@roastery-capsules/models.models-type/domain/types";

export interface IModelsTypeRepository {
	findById(id: string): Promise<IModelsType | null>;
}
