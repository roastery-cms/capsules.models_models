import { CreateModelsUseCase } from "@/application/use-cases";
import type {
    IModelsWriter,
    IModelsTypeRepository,
} from "@/domain/types/repositories";
import { makeFindModelsTypeService } from "../services";

export function makeCreateModelsUseCase(
    writer: IModelsWriter,
    modelsTypeRepository: IModelsTypeRepository,
): CreateModelsUseCase {
    return new CreateModelsUseCase(
        writer,
        makeFindModelsTypeService(modelsTypeRepository),
    );
}
