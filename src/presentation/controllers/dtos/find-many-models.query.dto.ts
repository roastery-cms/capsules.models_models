import { UuidDTO } from "@roastery/beans/collections/dtos";
import { PaginationDTO } from "@roastery/seedbed/presentation/dtos";
import { t } from "@roastery/terroir";

export const FindManyModelsQueryDTO = t.Composite(
	[
		PaginationDTO,
		t.Object({
			typeId: UuidDTO,
		}),
	],
	{
		description:
			"Query parameters for listing models entries, paginated and scoped to a single models type.",
		examples: [{ page: 1, typeId: "550e8400-e29b-41d4-a716-446655440000" }],
	},
);

export type FindManyModelsQueryDTO = t.Static<typeof FindManyModelsQueryDTO>;
