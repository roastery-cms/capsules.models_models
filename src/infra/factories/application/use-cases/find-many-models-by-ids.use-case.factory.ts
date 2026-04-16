import { FindManyModelsByIdsUseCase } from "@/application/use-cases";
import type { IModelsReader } from "@/domain/types/repositories";

export function makeFindManyModelsByIdsUseCase(
    reader: IModelsReader,
): FindManyModelsByIdsUseCase {
    return new FindManyModelsByIdsUseCase(reader);
}
