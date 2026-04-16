import { Models } from "@/domain";
import type {
	IModelsRepository,
	IModelsTypeRepository,
} from "@/domain/types/repositories";
import { barista } from "@roastery/barista";
import { EntitySource } from "@roastery/beans/entity/symbols";

export function ModelsRepositoryPlugin(
	modelsRepository: IModelsRepository,
	modelsTypeRepository: IModelsTypeRepository,
) {
	return barista({ name: Models[EntitySource] })
		.decorate("modelsRepository", modelsRepository)
		.decorate("modelsTypeRepositoryForModels", modelsTypeRepository);
}
