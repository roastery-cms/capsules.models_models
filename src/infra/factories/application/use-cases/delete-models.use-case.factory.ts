import { DeleteModelsUseCase } from "@/application/use-cases";
import type { IModelsWriter, IModelsReader } from "@/domain/types/repositories";
import { makeFindModelsByIdUseCase } from "./find-models-by-id.use-case.factory";

export function makeDeleteModelsUseCase(
	writer: IModelsWriter,
	reader: IModelsReader,
): DeleteModelsUseCase {
	return new DeleteModelsUseCase(writer, makeFindModelsByIdUseCase(reader));
}
