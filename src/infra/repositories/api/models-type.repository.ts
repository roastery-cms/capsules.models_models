import type { IModelsTypeRepository } from "@/domain/types/repositories";
import type { IModelsType } from "@roastery-capsules/models.models-type/domain/types";
import type { ModelsTypeRoutes } from "@roastery-capsules/models.models-type/presentation/routes";
import { treaty } from "@elysiajs/eden";
import { ModelsTypeMapper } from "./models-type.mapper";

export class ModelsTypeRepository implements IModelsTypeRepository {
    private readonly modelsTypeService: ReturnType<
        typeof treaty<ReturnType<typeof ModelsTypeRoutes>>
    >["models-types"];

    public constructor(baseUrl: string) {
        this.modelsTypeService = treaty<ReturnType<typeof ModelsTypeRoutes>>(
            baseUrl,
            {
                parseDate: false,
            },
        )["models-types"];
    }

    async findById(id: string): Promise<IModelsType | null> {
        const { status, error, data } = await this.modelsTypeService({
            "id-or-slug": id,
        }).get();

        if (error) throw error.value;
        if (status !== 200) return null;

        return ModelsTypeMapper.run(data);
    }
}
