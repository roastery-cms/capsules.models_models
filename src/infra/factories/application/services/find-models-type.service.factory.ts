import { FindModelsTypeService } from "@/application/services";
import type { IModelsTypeRepository } from "@/domain/types/repositories";

export function makeFindModelsTypeService(
    modelsTypeRepository: IModelsTypeRepository,
): FindModelsTypeService {
    return new FindModelsTypeService(modelsTypeRepository);
}
