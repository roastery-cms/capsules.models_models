import { FindManyModelsByModelsTypeIdUseCase } from "@/application/use-cases";
import type {
    IModelsReader,
    IModelsTypeRepository,
} from "@/domain/types/repositories";
import { makeFindModelsTypeService } from "../services";
import { makeCountModelsByModelsTypeIdUseCase } from "./count-models-by-models-type-id.use-case.factory";

export function makeFindManyModelsByModelsTypeIdUseCase(
    reader: IModelsReader,
    modelsTypeRepository: IModelsTypeRepository,
): FindManyModelsByModelsTypeIdUseCase {
    return new FindManyModelsByModelsTypeIdUseCase(
        reader,
        makeFindModelsTypeService(modelsTypeRepository),
        makeCountModelsByModelsTypeIdUseCase(reader),
    );
}
