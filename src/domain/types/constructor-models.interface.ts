import type { IModelsType } from "@roastery-capsules/models.models-type/domain/types";

export interface IConstructorModels {
    readonly type: IModelsType;
    readonly content: string;
}
