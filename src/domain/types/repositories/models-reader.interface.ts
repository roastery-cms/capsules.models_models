import type { UnpackedModelsSchema } from "@/domain/schemas";
import type { ICanReadId } from "@roastery/seedbed/domain/types/repositories";
import type { IModels } from "../models.interface";

export interface IModelsReader extends ICanReadId<
    UnpackedModelsSchema,
    IModels
> {
    findByModelsTypeId(modelsTypeId: string, page: number): Promise<IModels[]>;
    findManyByIds(ids: string[]): Promise<IModels[]>;
    countByModelsTypeId(modelsTypeId: string): Promise<number>;
}
