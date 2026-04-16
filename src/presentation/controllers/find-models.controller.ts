import { barista } from "@roastery/barista";
import type { IControllersWithoutAuth } from "./types";
import { ModelsRepositoryPlugin } from "../plugins";
import { makeFindModelsByIdUseCase } from "@/infra/factories/application/use-cases";
import { UnpackedModelsDTO } from "@/domain/dtos";
import { ModelsIdParamDTO } from "./dtos";

export function FindModelsController({
	modelsRepository,
	modelsTypeRepository,
}: IControllersWithoutAuth) {
	return barista()
		.use(ModelsRepositoryPlugin(modelsRepository, modelsTypeRepository))
		.derive({ as: "local" }, ({ modelsRepository }) => ({
			findModels: makeFindModelsByIdUseCase(modelsRepository),
		}))
		.get(
			"/:id",
			async ({ params: { id }, findModels, status }) => {
				const response = await findModels.run(id);
				return status(200, response as never);
			},
			{
				params: ModelsIdParamDTO,
				detail: {
					summary: "Find a models entry",
					description:
						"Retrieves a single models entry by its unique identifier.",
				},
				response: { 200: UnpackedModelsDTO },
			},
		);
}
