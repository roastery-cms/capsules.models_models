import { Models } from "@/domain";
import type { IModelsTypeRepository } from "@/domain/types/repositories";
import type { IModelsType } from "@roastery-capsules/models.models-type/domain/types";
import { EntitySource } from "@roastery/beans/entity/symbols";
import { ResourceNotFoundException } from "@roastery/terroir/exceptions/application";

export class FindModelsTypeService {
    public constructor(
        private readonly modelsTypeRepository: IModelsTypeRepository,
    ) {}

    public async run(id: string): Promise<IModelsType> {
        const response = await this.modelsTypeRepository.findById(id);

        if (!response)
            throw new ResourceNotFoundException(
                `${Models[EntitySource]}::type->${id}`,
            );

        return response;
    }
}
