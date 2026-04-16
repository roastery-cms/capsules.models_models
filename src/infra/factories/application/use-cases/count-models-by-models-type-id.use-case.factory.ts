import { CountModelsByModelsTypeIdUseCase } from "@/application/use-cases";
import type { IModelsReader } from "@/domain/types/repositories";

export function makeCountModelsByModelsTypeIdUseCase(
    reader: IModelsReader,
): CountModelsByModelsTypeIdUseCase {
    return new CountModelsByModelsTypeIdUseCase(reader);
}
