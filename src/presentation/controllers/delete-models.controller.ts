import { barista } from "@roastery/barista";
import type { IControllersWithAuth } from "./types";
import { baristaAuth } from "@roastery-capsules/auth/plugins/guards";
import { Models } from "@/domain";
import { EntitySource } from "@roastery/beans/entity/symbols";
import { ModelsRepositoryPlugin } from "../plugins";
import { makeDeleteModelsUseCase } from "@/infra/factories/application/use-cases";
import { t } from "@roastery/terroir";
import { ModelsIdParamDTO } from "./dtos";

export function DeleteModelsController({
	cacheProvider,
	jwtSecret,
	modelsRepository,
	modelsTypeRepository,
	redisUrl,
}: IControllersWithAuth) {
	return barista()
		.use(
			baristaAuth({
				layerName: Models[EntitySource],
				jwtSecret,
				cacheProvider,
				redisUrl,
			}),
		)
		.use(ModelsRepositoryPlugin(modelsRepository, modelsTypeRepository))
		.derive({ as: "local" }, ({ modelsRepository }) => ({
			deleteModels: makeDeleteModelsUseCase(modelsRepository, modelsRepository),
		}))
		.delete(
			"/:id",
			async ({ params: { id }, deleteModels, set }) => {
				await deleteModels.run(id);
				set.status = 204;
				return;
			},
			{
				params: ModelsIdParamDTO,
				detail: {
					summary: "Delete a models entry",
					description:
						"Deletes a models entry by its unique identifier. Requires authentication.",
				},
				response: { 204: t.Undefined() },
			},
		);
}
