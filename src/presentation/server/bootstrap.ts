import { ModelsTags } from "../tags";
import BaristaAuthTags from "@roastery-capsules/auth/plugins/tags";
import { ModelsDependenciesDTO } from "@/infra/dependencies";
import { CacheEnvDependenciesDTO } from "@roastery-adapters/cache/dtos";
import { AuthEnvDependenciesDTO } from "@roastery-capsules/auth/dtos";
import { baristaEnv } from "@roastery-capsules/env";
import { barista } from "@roastery/barista";
import { baristaErrorHandler } from "@roastery-capsules/api-error-handler";
import { baristaResponseMapper } from "@roastery-capsules/api-response-mapper";
import { cache } from "@roastery-adapters/cache";
import type {
	IModelsRepository,
	IModelsTypeRepository,
} from "@/domain/types/repositories";
import {
	makeModelsRepository,
	makeModelsTypeRepository,
} from "@/infra/factories/repositories";
import { modelsAdapter as _modelsAdapter } from "@roastery-adapters/models/plugins";
import { ModelsRepositoryPlugin } from "../plugins";
import { GetAccessController } from "@roastery-capsules/auth/plugins/controllers";
import { ModelsRoutes } from "../routes";
import { baristaApiDocs } from "@roastery-capsules/api-docs";
import { UnknownException } from "@roastery/terroir/exceptions";
import { ModelsTypeTags } from "@roastery-capsules/models.models-type/presentation/tags";
import { ModelsTypeDependenciesDTO } from "@roastery-capsules/models.models-type/infra/dependencies";
import { makeModelsTypeRepository as makeFullModelsTypeRepository } from "@roastery-capsules/models.models-type/infra/factories/repositories";
import { ModelsTypeRepositoryPlugin } from "@roastery-capsules/models.models-type/presentation/plugins";
import { ModelsTypeRoutes } from "@roastery-capsules/models.models-type/presentation/routes";
import type { IModelsTypeRepository as IFullModelsTypeRepository } from "@roastery-capsules/models.models-type/domain/types/repositories";

export async function bootstrap(open: boolean = false) {
	const app = barista({ name: "@roastery" })
		.use(
			baristaEnv(
				CacheEnvDependenciesDTO,
				AuthEnvDependenciesDTO,
				ModelsDependenciesDTO,
				ModelsTypeDependenciesDTO,
			),
		)
		.use(baristaErrorHandler)
		.use(baristaResponseMapper)
		.use((app) => {
			const { CACHE_PROVIDER, REDIS_URL } = app.decorator.env;

			return app.use(cache({ CACHE_PROVIDER, REDIS_URL }));
		});

	const { env } = app.decorator;
	const {
		AUTH_EMAIL,
		AUTH_PASSWORD,
		CACHE_PROVIDER,
		DATABASE_PROVIDER,
		DATABASE_URL,
		JWT_SECRET,
		MODELS_TYPE_BASE_URL,
		NODE_ENV,
		PORT,
		REDIS_URL,
	} = env;

	const modelsTypeRepositoryForModels: IModelsTypeRepository =
		makeModelsTypeRepository({
			baseUrl: MODELS_TYPE_BASE_URL ?? `http://localhost:${PORT}`,
			target: MODELS_TYPE_BASE_URL ? "API" : "MEMORY",
		});

	let modelsRepository: IModelsRepository;
	let modelsTypeRepository: IFullModelsTypeRepository = {} as never;

	if (DATABASE_URL && DATABASE_PROVIDER === "PRISMA") {
		const modelsAdapter = await _modelsAdapter(DATABASE_URL);

		app.use(modelsAdapter).use((app) => {
			const { modelsPrismaClient: prismaClient, cache } = app.decorator;

			modelsRepository = makeModelsRepository({
				cache,
				prismaClient,
				target: DATABASE_PROVIDER,
			});

			modelsTypeRepository = makeFullModelsTypeRepository({
				cache,
				prismaClient,
				target: DATABASE_PROVIDER,
			});

			return app
				.use(
					ModelsRepositoryPlugin(
						modelsRepository,
						modelsTypeRepositoryForModels,
					),
				)
				.use(ModelsTypeRepositoryPlugin(modelsTypeRepository));
		});
	} else {
		app.use((app) => {
			const { cache } = app.decorator;

			modelsRepository = makeModelsRepository({
				cache,
				target: "MEMORY",
			});

			modelsTypeRepository = makeFullModelsTypeRepository({
				cache,
				target: "MEMORY",
			});

			return app
				.use(
					ModelsRepositoryPlugin(
						modelsRepository,
						modelsTypeRepositoryForModels,
					),
				)
				.use(ModelsTypeRepositoryPlugin(modelsTypeRepository));
		});
	}

	if (!modelsRepository!) throw new UnknownException();

	return app
		.use(
			GetAccessController({
				AUTH_EMAIL,
				AUTH_PASSWORD,
				CACHE_PROVIDER,
				JWT_SECRET,
				REDIS_URL,
			}),
		)
		.use((app) =>
			app
				.use(
					ModelsTypeRoutes({
						cacheProvider: CACHE_PROVIDER,
						jwtSecret: JWT_SECRET,
						modelsTypeRepository,
						redisUrl: REDIS_URL,
					}),
				)
				.use(
					ModelsRoutes({
						cacheProvider: CACHE_PROVIDER,
						jwtSecret: JWT_SECRET,
						modelsRepository,
						modelsTypeRepository: modelsTypeRepositoryForModels,
						redisUrl: REDIS_URL,
					}),
				),
		)
		.use(
			baristaApiDocs(NODE_ENV === "DEVELOPMENT", `http://localhost:${PORT}`, {
				info: {
					title: "Roastery",
					version: "1.0",
					contact: {
						email: "alanreisanjo@gmail.com",
						name: "Alan Reis",
						url: "https://hoyasumii.dev",
					},
					description:
						"A RESTful API for managing Models entries and their associated ModelsType definitions within the Roastery CMS platform. This microservice exposes both the ModelsType catalog (schemas for models payloads) and the Models entries that conform to each type.",
				},
				tags: [BaristaAuthTags, ModelsTypeTags, ModelsTags],
			}),
		)
		.use((app) => {
			if (open) {
				app.listen(app.decorator.env.PORT, () => {
					console.log(
						`☕️ Server is running at: http://localhost:${app.decorator.env.PORT}`,
					);
				});
			}

			return app;
		});
}
