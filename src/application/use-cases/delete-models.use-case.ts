import type { IModelsWriter } from "@/domain/types/repositories";
import type { FindModelsByIdUseCase } from "./find-models-by-id.use-case";

export class DeleteModelsUseCase {
    public constructor(
        private readonly writer: IModelsWriter,
        private readonly findModelsById: FindModelsByIdUseCase,
    ) {}

    public async run(id: string): Promise<void> {
        const targetModels = await this.findModelsById.run(id);

        await this.writer.delete(targetModels);
    }
}
