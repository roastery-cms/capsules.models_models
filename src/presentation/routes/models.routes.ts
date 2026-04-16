import { barista } from "@roastery/barista";
import type { IControllersWithoutAuth } from "../controllers/types";
import type { IModelsRoutesArgs } from "./types";
import { ModelsTags } from "../tags";
import { Models } from "@/domain";
import { EntitySource } from "@roastery/beans/entity/symbols";
import {
	CreateModelsController,
	DeleteModelsController,
	FindManyModelsByIdsController,
	FindManyModelsController,
	FindModelsController,
	UpdateModelsController,
} from "../controllers";

export function ModelsRoutes(data: IModelsRoutesArgs) {
	const { modelsRepository, modelsTypeRepository } = data;
	const controllersWithAuth = data;
	const controllersWithoutAuth: IControllersWithoutAuth = {
		modelsRepository,
		modelsTypeRepository,
	};

	return barista({
		prefix: "/models",
		detail: {
			summary: ModelsTags.name,
			tags: [ModelsTags.name],
			description: ModelsTags.description,
		},
		name: Models[EntitySource],
	})
		.use(CreateModelsController(controllersWithAuth))
		.use(UpdateModelsController(controllersWithAuth))
		.use(DeleteModelsController(controllersWithAuth))
		.use(FindManyModelsByIdsController(controllersWithoutAuth))
		.use(FindManyModelsController(controllersWithoutAuth))
		.use(FindModelsController(controllersWithoutAuth));
}
