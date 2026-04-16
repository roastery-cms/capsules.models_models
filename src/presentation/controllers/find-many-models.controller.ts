import { barista } from "@roastery/barista";
import type { IControllersWithoutAuth } from "./types";
import { ModelsRepositoryPlugin } from "../plugins";
import { makeFindManyModelsByModelsTypeIdUseCase } from "@/infra/factories/application/use-cases";
import { FindManyModelsQueryDTO, FindManyModelsResponseDTO } from "./dtos";

export function FindManyModelsController({
	modelsRepository,
	modelsTypeRepository,
}: IControllersWithoutAuth) {
	return barista()
		.use(ModelsRepositoryPlugin(modelsRepository, modelsTypeRepository))
		.derive(
			{ as: "local" },
			({ modelsRepository, modelsTypeRepositoryForModels }) => ({
				findManyModels: makeFindManyModelsByModelsTypeIdUseCase(
					modelsRepository,
					modelsTypeRepositoryForModels,
				),
			}),
		)
		.get(
			"/",
			async ({ query: { typeId, page }, findManyModels, status, set }) => {
				const { count, totalPages, value } = await findManyModels.run(
					typeId,
					page,
				);

				set.headers["X-Total-Count"] = String(count);
				set.headers["X-Total-Pages"] = String(totalPages);

				return status(200, value as never);
			},
			{
				query: FindManyModelsQueryDTO,
				detail: {
					summary: "Find many models entries",
					description:
						"Retrieves a paginated list of models entries scoped to a single models type, identified by `typeId`.",
				},
				response: { 200: FindManyModelsResponseDTO },
			},
		);
}
