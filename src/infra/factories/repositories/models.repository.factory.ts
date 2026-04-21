import type { BaristaCacheInstance } from "@roastery-adapters/cache";
import type { ModelsRepositoryProviderDTO } from "./dtos";
import type { PrismaClient } from "@roastery-adapters/models";
import { ResourceNotFoundException } from "@roastery/terroir/exceptions/infra";
import { Models } from "@/domain";
import { EntitySource } from "@roastery/beans/entity/symbols";
import { PrismaModelsRepository } from "@/infra/repositories/prisma";
import { TestModelsRepository } from "@/infra/repositories/test";
import { CachedModelsRepository } from "@/infra/repositories/cached";

type MakeModelsRepositoryArgs = {
	target?: ModelsRepositoryProviderDTO;
	cache: BaristaCacheInstance;
	prismaClient?: PrismaClient;
};

export function makeModelsRepository({
	cache,
	target,
	prismaClient,
}: MakeModelsRepositoryArgs) {
	if (target === "PRISMA" && !prismaClient)
		throw new ResourceNotFoundException(Models[EntitySource]);

	const repository =
		target === "PRISMA" && prismaClient
			? new PrismaModelsRepository(prismaClient)
			: new TestModelsRepository();

	return new CachedModelsRepository(repository, cache);
}
