import { FindModelsByIdUseCase } from "@/application/use-cases";
import type { IModelsReader } from "@/domain/types/repositories";

export function makeFindModelsByIdUseCase(
    reader: IModelsReader,
): FindModelsByIdUseCase {
    return new FindModelsByIdUseCase(reader);
}
