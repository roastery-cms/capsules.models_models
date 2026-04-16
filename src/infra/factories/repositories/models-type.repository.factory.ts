import type { IModelsTypeRepository } from "@/domain/types/repositories";
import type { AggregatesRepositoryProviderDTO } from "./dtos";
import { ApiModelsTypeRepository } from "@/infra/repositories/api";
import { TestModelsTypeRepositoryForModels } from "@/infra/repositories/test";
import { InvalidEnvironmentException } from "@roastery/terroir/exceptions/infra";
import { Models } from "@/domain";
import { EntitySource } from "@roastery/beans/entity/symbols";

type MakeModelsTypeRepositoryArgs = {
    target?: AggregatesRepositoryProviderDTO;
    baseUrl?: string;
};

export function makeModelsTypeRepository({
    baseUrl,
    target,
}: MakeModelsTypeRepositoryArgs): IModelsTypeRepository {
    const actions: Record<
        NonNullable<typeof target>,
        () => IModelsTypeRepository
    > = {
        API: () => new ApiModelsTypeRepository(baseUrl!),
        MEMORY: () => new TestModelsTypeRepositoryForModels(),
    };

    if (!baseUrl && target !== undefined)
        throw new InvalidEnvironmentException(
            `${Models[EntitySource]}::type-repository`,
        );

    if (!target) return actions.MEMORY();

    return actions[target]();
}
