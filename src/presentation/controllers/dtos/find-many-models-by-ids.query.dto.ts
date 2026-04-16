import { t } from "@roastery/terroir";

const UUID_CSV_PATTERN =
	"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}(,[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})*$";

export const FindManyModelsByIdsQueryDTO = t.Object(
	{
		ids: t.String({
			minLength: 36,
			pattern: UUID_CSV_PATTERN,
			description:
				"Comma-separated list of models entry UUIDs to fetch in a single request.",
			examples: [
				"550e8400-e29b-41d4-a716-446655440000,123e4567-e89b-12d3-a456-426614174000",
			],
		}),
	},
	{
		description:
			"Query parameters for batch-loading models entries by a list of ids.",
	},
);

export type FindManyModelsByIdsQueryDTO = t.Static<
	typeof FindManyModelsByIdsQueryDTO
>;
