import { t } from "@roastery/terroir";
import { EntityDTO } from "@roastery/beans/entity/dtos";
import { UnpackedModelsTypeDTO } from "@roastery-capsules/models.models-type/domain/dtos";

export const UnpackedModelsDTO = t.Composite(
    [
        t.Object(
            {
                type: UnpackedModelsTypeDTO,
                content: t.String({
                    format: "json",
                    description:
                        "Serialized JSON string with the model payload, validated against the schema defined by its `type`.",
                    examples: [
                        '{"readTime":5,"language":"pt-BR"}',
                        '{"title":"Hello","body":"World"}',
                    ],
                    minLength: 2,
                }),
            },
            {
                description:
                    "Data transfer object representing the raw models data.",
            },
        ),
        EntityDTO,
    ],
    {
        description:
            "Data transfer object used for building a models entity.",
    },
);
