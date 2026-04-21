import { UpdateModelsUseCase } from "@/application/use-cases";
import type { IModelsWriter, IModelsReader } from "@/domain/types/repositories";
import { makeFindModelsByIdUseCase } from "./find-models-by-id.use-case.factory";

export function makeUpdateModelsUseCase(
	writer: IModelsWriter,
	reader: IModelsReader,
): UpdateModelsUseCase {
	return new UpdateModelsUseCase(writer, makeFindModelsByIdUseCase(reader));
}
