import type { IModelsReader } from "@/domain/types/repositories";
import type { ICountItems } from "@roastery/seedbed/application/types";
import { GetNumberOfPagesService } from "@roastery/seedbed/application/services";

export class CountModelsByModelsTypeIdUseCase {
    public constructor(private readonly reader: IModelsReader) {}

    public async run(modelsTypeId: string): Promise<ICountItems> {
        const count = await this.reader.countByModelsTypeId(modelsTypeId);

        return { totalPages: GetNumberOfPagesService.run(count), count };
    }
}
