import { t } from "@roastery/terroir";

export const CreateModelsDTO = t.Object(
    {
        typeId: t.String({
            format: "uuid",
            description:
                "The unique identifier of the models type that defines the schema for this models entry.",
            examples: ["550e8400-e29b-41d4-a716-446655440000"],
        }),
        data: t.String({
            format: "json",
            description:
                "Serialized JSON string with the models payload, validated against the schema defined by its type.",
            examples: [
                '{"readTime":5,"language":"pt-BR"}',
                '{"title":"Hello","body":"World"}',
            ],
            minLength: 2,
        }),
    },
    {
        description:
            "Data transfer object for creating a new models entry, containing all required fields for models creation.",
    },
);

export type CreateModelsDTO = t.Static<typeof CreateModelsDTO>;
