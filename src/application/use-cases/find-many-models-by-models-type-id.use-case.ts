import type { IModelsReader } from "@/domain/types/repositories";
import type { FindModelsTypeService } from "../services";
import type { CountModelsByModelsTypeIdUseCase } from "./count-models-by-models-type-id.use-case";

export class FindManyModelsByModelsTypeIdUseCase {
	public constructor(
		private readonly reader: IModelsReader,
		private readonly findModelsType: FindModelsTypeService,
		private readonly countModels: CountModelsByModelsTypeIdUseCase,
	) {}

	public async run(modelsTypeId: string, page: number = 1) {
		const { count, totalPages } = await this.countModels.run(modelsTypeId);
		const { id } = await this.findModelsType.run(modelsTypeId);

		return {
			value: await this.reader.findByModelsTypeId(id, page),
			count,
			totalPages,
		};
	}
}
