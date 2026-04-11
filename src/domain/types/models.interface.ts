import type { IEntity } from "@roastery/beans/entity/types";
import type { UnpackedModelsSchema } from "../schemas";
import type { IRawModelsType } from "@roastery-capsules/models.models-type/domain/types";

export interface IModels extends IEntity<UnpackedModelsSchema>, IRawModelsType {
    updateContent(value: string): void;
}
