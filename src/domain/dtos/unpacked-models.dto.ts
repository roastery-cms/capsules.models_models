import { t } from "@roastery/terroir";
import { EntityDTO } from "@roastery/beans/entity/dtos";
import { UnpackedModelsTypeDTO } from "@roastery-capsules/models.models-type/domain/dtos";

export const UnpackedModelsDTO = t.Composite(
    [
        t.Object({
            type: UnpackedModelsTypeDTO,
            content: t.String({
                format: "json",
                description: "",
                examples: "",
                minLength: 2,
            }),
        }),
        EntityDTO,
    ],
    { description: "" },
);
