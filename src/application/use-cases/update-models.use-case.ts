import type { IModelsWriter } from "@/domain/types/repositories";
import type { FindModelsByIdUseCase } from "./find-models-by-id.use-case";
import type { IModels } from "@/domain/types";
import { InvalidOperationException } from "@roastery/terroir/exceptions/application";
import { Models } from "@/domain";
import { EntitySource } from "@roastery/beans/entity/symbols";
import { UpdateModelsSchema } from "../schemas";
import type { UpdateModelsDTO } from "../dtos";

export class UpdateModelsUseCase {
    public constructor(
        private readonly writer: IModelsWriter,
        private readonly findModelsById: FindModelsByIdUseCase,
    ) {}

    public async run(id: string, dto: UpdateModelsDTO): Promise<IModels> {
        if (!UpdateModelsSchema.match(dto))
            throw new InvalidOperationException(
                Models[EntitySource],
                "At least one field must be provided for the update operation.",
            );

        const targetModels = await this.findModelsById.run(id);

        const { data } = dto;

        if (data) targetModels.updateData(data);

        await this.writer.update(targetModels);

        return targetModels;
    }
}
