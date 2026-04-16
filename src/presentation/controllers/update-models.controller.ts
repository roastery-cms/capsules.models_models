import { barista } from "@roastery/barista";
import type { IControllersWithAuth } from "./types";
import { baristaAuth } from "@roastery-capsules/auth/plugins/guards";
import { Models } from "@/domain";
import { EntitySource } from "@roastery/beans/entity/symbols";
import { ModelsRepositoryPlugin } from "../plugins";
import { makeUpdateModelsUseCase } from "@/infra/factories/application/use-cases";
import { UpdateModelsDTO } from "@/application/dtos";
import { UnpackedModelsDTO } from "@/domain/dtos";
import { ModelsIdParamDTO } from "./dtos";

export function UpdateModelsController({
	cacheProvider,
	jwtSecret,
	modelsRepository,
	modelsTypeRepository,
	redisUrl,
}: IControllersWithAuth) {
	return barista()
		.use(
			baristaAuth({
				cacheProvider,
				jwtSecret,
				layerName: Models[EntitySource],
				redisUrl,
			}),
		)
		.use(ModelsRepositoryPlugin(modelsRepository, modelsTypeRepository))
		.derive({ as: "local" }, ({ modelsRepository }) => ({
			updateModels: makeUpdateModelsUseCase(modelsRepository, modelsRepository),
		}))
		.patch(
			"/:id",
			async ({ params: { id }, body, updateModels, status }) => {
				const response = await updateModels.run(id, body);
				return status(200, response as never);
			},
			{
				params: ModelsIdParamDTO,
				body: UpdateModelsDTO,
				detail: {
					summary: "Update a models entry",
					description:
						"Updates an existing models entry by its unique identifier. Requires authentication.",
				},
				response: { 200: UnpackedModelsDTO },
			},
		);
}
