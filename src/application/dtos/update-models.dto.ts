import { t } from "@roastery/terroir";

export const UpdateModelsDTO = t.Object(
    {
        content: t.Optional(
            t.String({
                format: "json",
                description:
                    "Serialized JSON string with the models payload, validated against the schema defined by its type.",
                examples: [
                    '{"readTime":5,"language":"pt-BR"}',
                    '{"title":"Hello","body":"World"}',
                ],
                minLength: 2,
            }),
        ),
    },
    {
        description:
            "Data transfer object for updating an existing models entry, containing optional fields for partial models modification.",
        minProperties: 1,
    },
);

export type UpdateModelsDTO = t.Static<typeof UpdateModelsDTO>;
