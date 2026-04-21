import type { IModelsWriter } from "@/domain/types/repositories";
import type { FindModelsTypeService } from "../services";
import type { IModels } from "@/domain/types";
import type { CreateModelsDTO } from "../dtos";
import { Models } from "@/domain";

export class CreateModelsUseCase {
	public constructor(
		private readonly writer: IModelsWriter,
		private readonly findModelsType: FindModelsTypeService,
	) {}

	public async run({ data, typeId }: CreateModelsDTO): Promise<IModels> {
		const type = await this.findModelsType.run(typeId);

		const targetModels = Models.make({ data, type });

		await this.writer.create(targetModels);

		return targetModels;
	}
}
