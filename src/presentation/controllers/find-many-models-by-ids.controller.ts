import { barista } from "@roastery/barista";
import type { IControllersWithoutAuth } from "./types";
import { ModelsRepositoryPlugin } from "../plugins";
import { makeFindManyModelsByIdsUseCase } from "@/infra/factories/application/use-cases";
import { FindManyModelsByIdsQueryDTO, FindManyModelsResponseDTO } from "./dtos";

export function FindManyModelsByIdsController({
	modelsRepository,
	modelsTypeRepository,
}: IControllersWithoutAuth) {
	return barista()
		.use(ModelsRepositoryPlugin(modelsRepository, modelsTypeRepository))
		.derive({ as: "local" }, ({ modelsRepository }) => ({
			findManyModelsByIds: makeFindManyModelsByIdsUseCase(modelsRepository),
		}))
		.get(
			"/by-ids",
			async ({ query: { ids }, findManyModelsByIds, status }) => {
				const response = await findManyModelsByIds.run(ids.split(","));
				return status(200, response as never);
			},
			{
				query: FindManyModelsByIdsQueryDTO,
				detail: {
					summary: "Batch-load models entries",
					description:
						"Retrieves multiple models entries in a single request, identified by a comma-separated list of UUIDs in the `ids` query parameter.",
				},
				response: { 200: FindManyModelsResponseDTO },
			},
		);
}
