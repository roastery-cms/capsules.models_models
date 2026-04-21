import type { IModelsType } from "@roastery-capsules/models.models-type/domain/types";

export interface IRawModels {
	readonly type: IModelsType;
	readonly data: string;
}
