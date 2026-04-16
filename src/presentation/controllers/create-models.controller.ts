import { barista } from "@roastery/barista";
import type { IControllersWithAuth } from "./types";
import { baristaAuth } from "@roastery-capsules/auth/plugins/guards";
import { Models } from "@/domain";
import { EntitySource } from "@roastery/beans/entity/symbols";
import { ModelsRepositoryPlugin } from "../plugins";
import { makeCreateModelsUseCase } from "@/infra/factories/application/use-cases";
import { CreateModelsDTO } from "@/application/dtos";
import { UnpackedModelsDTO } from "@/domain/dtos";

export function CreateModelsController({
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
		.derive(
			{ as: "local" },
			({ modelsRepository, modelsTypeRepositoryForModels }) => ({
				createModels: makeCreateModelsUseCase(
					modelsRepository,
					modelsTypeRepositoryForModels,
				),
			}),
		)
		.post(
			"/",
			async ({ body, createModels, status }) => {
				const response = await createModels.run(body);
				return status(201, response as never);
			},
			{
				body: CreateModelsDTO,
				detail: {
					summary: "Create a models entry",
					description:
						"Creates a new models entry with the provided data, validated against the schema of its associated models type. Requires authentication.",
				},
				response: { 201: UnpackedModelsDTO },
			},
		);
}
