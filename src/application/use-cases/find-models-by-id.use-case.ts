import { Models } from "@/domain";
import type { IModels } from "@/domain/types";
import type { IModelsReader } from "@/domain/types/repositories";
import { EntitySource } from "@roastery/beans/entity/symbols";
import { ResourceNotFoundException } from "@roastery/terroir/exceptions/application";

export class FindModelsByIdUseCase {
	public constructor(private readonly reader: IModelsReader) {}

	public async run(value: string): Promise<IModels> {
		const targetModels = await this.reader.findById(value);

		if (!targetModels)
			throw new ResourceNotFoundException(Models[EntitySource]);

		return targetModels;
	}
}
