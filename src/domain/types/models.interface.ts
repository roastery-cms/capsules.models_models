import type { IEntity } from "@roastery/beans/entity/types";
import type { UnpackedModelsSchema } from "../schemas";
import type { IRawModels } from "./raw-models.interface";

export interface IModels extends IEntity<UnpackedModelsSchema>, IRawModels {
	updateData(value: string): void;
}
